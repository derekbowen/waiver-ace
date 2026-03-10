import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Credit packages matching src/lib/credit-packages.ts
const PACKAGES: Record<string, { credits: number; price: number; label: string }> = {
  pkg_200:  { credits: 200,  price: 2000,  label: "200 Credits" },
  pkg_550:  { credits: 550,  price: 5000,  label: "550 Credits" },
  pkg_1250: { credits: 1250, price: 10000, label: "1,250 Credits" },
  pkg_3500: { credits: 3500, price: 25000, label: "3,500 Credits" },
  pkg_8000: { credits: 8000, price: 50000, label: "8,000 Credits" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { packageId, setupAutoRecharge } = await req.json();
    if (!packageId) throw new Error("packageId is required");

    const pkg = PACKAGES[packageId];
    if (!pkg) throw new Error(`Invalid package: ${packageId}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email: user.email });
      customerId = newCustomer.id;
    }

    // Get org_id for metadata
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data: profile } = await adminClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.org_id) throw new Error("No organization found for user");

    // Store stripe_customer_id on wallet if not already set
    await adminClient
      .from("wallets")
      .update({ stripe_customer_id: customerId })
      .eq("org_id", profile.org_id)
      .is("stripe_customer_id", null);

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const sessionParams: any = {
      customer: customerId,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: pkg.label },
          unit_amount: pkg.price,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        package_id: packageId,
        org_id: profile.org_id,
        credits: String(pkg.credits),
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
    };

    // If setting up auto-recharge, collect payment method for future use
    if (setupAutoRecharge) {
      sessionParams.payment_intent_data = {
        setup_future_usage: "off_session",
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-checkout error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
