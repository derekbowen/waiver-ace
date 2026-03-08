import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  starter: 15,
  growth: 50,
  business: 150,
};

const TIER_BY_PRODUCT: Record<string, string> = {
  prod_U72HqqcrOsLCZK: "starter",
  prod_U72HGR1DW4wSdM: "growth",
  prod_U72HK4z5JuWIki: "business",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get user's org
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    const orgId = profileData?.org_id;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found");

      // Sync free tier to org
      if (orgId) {
        await supabaseClient.from("organizations").update({
          subscription_tier: "free",
          current_period_start: null,
          current_period_end: null,
        }).eq("id", orgId);
      }

      // Get usage count
      let usage = 0;
      if (orgId) {
        const { data } = await supabaseClient.rpc("get_org_monthly_usage", { p_org_id: orgId });
        usage = data ?? 0;
      }

      return new Response(JSON.stringify({
        subscribed: false,
        tier: "free",
        waiver_limit: TIER_LIMITS.free,
        usage,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let periodStart = null;
    let tier = "free";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      periodStart = new Date(subscription.current_period_start * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      tier = TIER_BY_PRODUCT[productId] ?? "free";
      logStep("Active subscription found", { productId, tier, subscriptionEnd });
    }

    // Sync to org
    if (orgId) {
      await supabaseClient.from("organizations").update({
        stripe_customer_id: customerId,
        subscription_tier: tier,
        current_period_start: periodStart,
        current_period_end: subscriptionEnd,
      }).eq("id", orgId);
    }

    // Get usage count
    let usage = 0;
    if (orgId) {
      const { data } = await supabaseClient.rpc("get_org_monthly_usage", { p_org_id: orgId });
      usage = data ?? 0;
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      tier,
      waiver_limit: TIER_LIMITS[tier] ?? 5,
      usage,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
