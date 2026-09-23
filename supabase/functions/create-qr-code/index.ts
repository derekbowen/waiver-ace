import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-time charge for generating a printable QR sign.
const QR_SIGN_CREDIT_COST = 5;

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alike chars

function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes).map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Not signed in" }, 401);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: "Not signed in" }, 401);

    const body = await req.json().catch(() => ({}));
    const templateId = String(body.template_id || "");
    const label = String(body.label || "").trim().slice(0, 80) || "Waiver QR code";
    const locationNote = String(body.location_note || "").trim().slice(0, 120) || null;

    if (!templateId) return json({ error: "Missing template" }, 400);

    // Caller's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const orgId = profile?.org_id;
    if (!orgId) return json({ error: "No organization found for this account" }, 403);

    // The template must belong to the caller's organization and be active.
    const { data: template } = await supabase
      .from("templates")
      .select("id, org_id, is_active, name")
      .eq("id", templateId)
      .maybeSingle();

    if (!template || template.org_id !== orgId) {
      return json({ error: "Template not found" }, 404);
    }
    if (!template.is_active) {
      return json({ error: "Activate this waiver template before printing a QR sign." }, 400);
    }

    // Unique code, retried in the unlikely event of a collision.
    let inserted: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const { data, error } = await supabase
        .from("qr_codes")
        .insert({
          org_id: orgId,
          template_id: templateId,
          code: newCode(),
          label,
          location_note: locationNote,
          credits_charged: QR_SIGN_CREDIT_COST,
          created_by: user.id,
        })
        .select("id, code, label, location_note, template_id, created_at")
        .single();
      if (data) inserted = data;
      else lastError = error;
    }

    if (!inserted) {
      console.error("qr insert failed:", lastError);
      return json({ error: "Could not create the QR code. Please try again." }, 500);
    }

    // Charge the one-time fee. If the org is out of credits, undo the record.
    const { data: creditResult, error: creditErr } = await supabase.rpc("deduct_credit", {
      p_org_id: orgId,
      p_reference_id: inserted.id,
      p_type: "waiver_deduction",
      p_amount: QR_SIGN_CREDIT_COST,
      p_notes: `QR sign generated for "${template.name}"`,
    });

    const ok = !creditErr && creditResult?.[0]?.success;
    if (!ok) {
      await supabase.from("qr_codes").delete().eq("id", inserted.id);
      return json(
        {
          error:
            creditResult?.[0]?.error_message ||
            `You need ${QR_SIGN_CREDIT_COST} credits to generate a QR sign.`,
        },
        402
      );
    }

    return json({
      qr_code: inserted,
      credits_charged: QR_SIGN_CREDIT_COST,
      new_balance: creditResult?.[0]?.new_balance ?? null,
    }, 201);
  } catch (err) {
    console.error("create-qr-code error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
