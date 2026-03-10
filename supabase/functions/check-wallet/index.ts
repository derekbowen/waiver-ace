import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Get user's org
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({
        credits: 0,
        overdraft_limit: -10,
        status: "no_org",
        auto_recharge_enabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get wallet
    const { data: wallet } = await supabaseClient
      .from("wallets")
      .select("credits_remaining, overdraft_limit, auto_recharge_enabled, auto_recharge_threshold, auto_recharge_package")
      .eq("org_id", profile.org_id)
      .single();

    if (!wallet) {
      return new Response(JSON.stringify({
        credits: 0,
        overdraft_limit: -10,
        status: "no_wallet",
        auto_recharge_enabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate status
    const balance = wallet.credits_remaining;
    let status: string;
    if (balance > 10) status = "healthy";
    else if (balance >= 1) status = "low";
    else if (balance > wallet.overdraft_limit) status = "overdraft";
    else status = "paused";

    // Get usage stats
    const { count: totalPurchased } = await supabaseClient
      .from("credit_transactions")
      .select("id", { count: "exact", head: true })
      .eq("org_id", profile.org_id)
      .in("type", ["purchase", "starter_bonus"]);

    const { data: totalCredits } = await supabaseClient
      .rpc("get_total_credits_purchased", { p_org_id: profile.org_id })
      .single();

    return new Response(JSON.stringify({
      credits: balance,
      overdraft_limit: wallet.overdraft_limit,
      status,
      auto_recharge_enabled: wallet.auto_recharge_enabled,
      auto_recharge_threshold: wallet.auto_recharge_threshold,
      auto_recharge_package: wallet.auto_recharge_package,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
