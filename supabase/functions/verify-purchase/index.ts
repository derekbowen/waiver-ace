/**
 * Verifies recent Stripe checkout sessions for the caller's org
 * and adds any credits that weren't processed by the webhook.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Get user's org
    const { data: profile } = await adminClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get stripe customer ID from wallet
    const { data: wallet } = await adminClient
      .from("wallets")
      .select("stripe_customer_id")
      .eq("org_id", profile.org_id)
      .single();

    if (!wallet?.stripe_customer_id) {
      return new Response(JSON.stringify({ recovered: 0, message: "No Stripe customer on file. Complete a purchase first." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // List recent completed checkout sessions for this customer (last 48 hours)
    const sessions = await stripe.checkout.sessions.list({
      customer: wallet.stripe_customer_id,
      status: "complete",
      limit: 20,
    });

    let recovered = 0;
    const recoveredSessions: string[] = [];

    for (const session of sessions.data) {
      if (session.mode !== "payment") continue;

      const orgId = session.metadata?.org_id;
      const credits = parseInt(session.metadata?.credits || "0", 10);
      const packageId = session.metadata?.package_id;

      // Only process sessions for this org
      if (orgId !== profile.org_id || !credits) continue;

      // Check if already processed
      const { data: existing } = await adminClient
        .from("credit_transactions")
        .select("id")
        .eq("reference_id", session.id)
        .eq("type", "purchase")
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Add the missing credits
      const { error: creditErr } = await adminClient.rpc("add_credits", {
        p_org_id: orgId,
        p_amount: credits,
        p_reference_id: session.id,
        p_type: "purchase",
        p_notes: `Recovered: ${credits} credits (${packageId}) — verified by user`,
      });

      if (!creditErr) {
        recovered += credits;
        recoveredSessions.push(session.id);
      } else {
        console.error(`Failed to recover session ${session.id}:`, creditErr);
      }
    }

    return new Response(JSON.stringify({
      recovered,
      sessions_fixed: recoveredSessions.length,
      message: recovered > 0
        ? `Recovered ${recovered} credits from ${recoveredSessions.length} session(s).`
        : "All purchases are accounted for. No missing credits found.",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Verify purchase error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
