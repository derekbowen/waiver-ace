import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reason, details, credits_requested } = await req.json();

    // Validate inputs
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Reason is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amount = Math.min(Math.max(Math.floor(Number(credits_requested) || 0), 1), 50);

    const admin = createClient(supabaseUrl, serviceKey);

    // Get user's org
    const { data: orgId } = await admin.rpc("get_user_org_id", { _user_id: user.id });
    if (!orgId) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check how many approved disputes this org already has
    const { count } = await admin
      .from("credit_disputes")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "approved");

    if ((count ?? 0) >= 2) {
      return new Response(
        JSON.stringify({
          error: "You've already used your 2 automatic reimbursements. Please contact support for further assistance.",
          limit_reached: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grant credits
    const { data: addResult } = await admin.rpc("add_credits_internal", {
      p_org_id: orgId,
      p_amount: amount,
      p_reference_id: `dispute-auto`,
      p_type: "refund",
      p_notes: `Auto-reimbursement: ${reason.trim().substring(0, 100)}`,
    });

    // Record the dispute
    await admin.from("credit_disputes").insert({
      org_id: orgId,
      user_id: user.id,
      reason: reason.trim().substring(0, 200),
      details: details ? String(details).trim().substring(0, 1000) : null,
      credits_requested: amount,
      credits_granted: amount,
      status: "approved",
    });

    return new Response(
      JSON.stringify({
        success: true,
        credits_granted: amount,
        new_balance: addResult,
        remaining_disputes: 2 - ((count ?? 0) + 1),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
