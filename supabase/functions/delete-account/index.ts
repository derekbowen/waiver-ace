import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate JWT and identify the user
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const email = userData.user.email ?? "unknown";

    // Confirmation phrase check (defense in depth — UI also gates this)
    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== "DELETE MY ACCOUNT") {
      return new Response(
        JSON.stringify({ error: "Confirmation phrase missing or incorrect" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Service-role client for the actual deletion
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Look up the user's profile + org
    const { data: profile } = await admin
      .from("profiles")
      .select("user_id, org_id")
      .eq("user_id", userId)
      .maybeSingle();

    const orgId = profile?.org_id ?? null;

    // Determine whether we should also wipe the org. Rule:
    // - If the user has no org, just delete the user.
    // - If the user is the SOLE remaining member of their org, wipe the org and all its data.
    // - If there are other members, only remove this user's profile + role; org stays intact.
    let wipeOrg = false;
    if (orgId) {
      const { count: memberCount } = await admin
        .from("profiles")
        .select("user_id", { count: "exact", head: true })
        .eq("org_id", orgId);
      if ((memberCount ?? 0) <= 1) wipeOrg = true;
    }

    const summary: Record<string, number | string | boolean> = {
      user_id: userId,
      email,
      org_id: orgId ?? "none",
      wiped_org: wipeOrg,
    };

    if (wipeOrg && orgId) {
      // Delete all org-scoped data. Order matters: children first, then parents.
      // Storage objects in private buckets (waiver-pdfs, signer-photos, photo-uploads, org-documents)
      // are not auto-deleted by these row deletes — we list and remove them too.
      try {
        const buckets = ["waiver-pdfs", "signer-photos", "photo-uploads", "org-documents"];
        for (const bucket of buckets) {
          // Org files are stored under prefixes that include the org id when applicable.
          const { data: files } = await admin.storage.from(bucket).list(orgId, { limit: 1000 });
          if (files && files.length > 0) {
            const paths = files.map((f) => `${orgId}/${f.name}`);
            await admin.storage.from(bucket).remove(paths);
          }
        }
      } catch (e) {
        console.warn("Storage cleanup non-fatal error:", e);
      }

      // Envelope-related children
      const { data: envIds } = await admin
        .from("envelopes")
        .select("id")
        .eq("org_id", orgId);
      const envelopeIds = (envIds ?? []).map((e: { id: string }) => e.id);
      if (envelopeIds.length > 0) {
        await admin.from("group_signatures").delete().in("envelope_id", envelopeIds);
        await admin.from("envelope_events").delete().in("envelope_id", envelopeIds);
      }

      // Webhook deliveries → endpoints
      const { data: hookRows } = await admin
        .from("webhook_endpoints")
        .select("id")
        .eq("org_id", orgId);
      const hookIds = (hookRows ?? []).map((h: { id: string }) => h.id);
      if (hookIds.length > 0) {
        await admin.from("webhook_deliveries").delete().in("webhook_endpoint_id", hookIds);
      }

      // Template versions → templates
      const { data: tplRows } = await admin
        .from("templates")
        .select("id")
        .eq("org_id", orgId);
      const tplIds = (tplRows ?? []).map((t: { id: string }) => t.id);
      if (tplIds.length > 0) {
        await admin.from("template_versions").delete().in("template_id", tplIds);
      }

      // Org-scoped tables
      const orgScoped = [
        "documents",
        "contract_scans",
        "listing_analyses",
        "photo_jobs",
        "credit_disputes",
        "credit_transactions",
        "envelopes",
        "templates",
        "webhook_endpoints",
        "marketplace_integrations",
        "api_keys",
        "team_invites",
        "referrals",
        "wallets",
        "user_roles",
      ];
      for (const table of orgScoped) {
        const { error } = await admin.from(table).delete().eq("org_id", orgId);
        if (error) console.warn(`Cleanup ${table}:`, error.message);
      }

      // Other org members' profiles get unlinked (org_id = null) so they don't dangle
      await admin.from("profiles").update({ org_id: null }).eq("org_id", orgId);

      // Finally the org itself
      await admin.from("organizations").delete().eq("id", orgId);

      summary.org_deleted = true;
    } else if (orgId) {
      // Multi-member org: only remove this user's role and detach their profile
      await admin.from("user_roles").delete().eq("user_id", userId).eq("org_id", orgId);
    }

    // Delete the user's own profile row
    await admin.from("profiles").delete().eq("user_id", userId);

    // Finally delete the auth user — this revokes all sessions
    const { error: authDelErr } = await admin.auth.admin.deleteUser(userId);
    if (authDelErr) {
      console.error("Auth user delete failed:", authDelErr);
      return new Response(
        JSON.stringify({
          error: "Account data was removed but auth deletion failed. Contact support.",
          details: authDelErr.message,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    summary.success = true;
    console.log("Account deleted:", summary);

    return new Response(JSON.stringify({ success: true, summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("delete-account error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
