import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Must match create-checkout and credit-packages.ts
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

  // This function must only be called internally with the service-role key
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!token || token !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { org_id } = await req.json();
    if (!org_id) throw new Error("org_id is required");

    // Get wallet with auto-recharge config
    const { data: wallet, error: walletErr } = await supabase
      .from("wallets")
      .select("*")
      .eq("org_id", org_id)
      .single();

    if (walletErr || !wallet) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!wallet.auto_recharge_enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: "Auto-recharge not enabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!wallet.stripe_customer_id || !wallet.stripe_payment_method_id) {
      console.error(`Auto-recharge: missing payment method for org ${org_id}`);
      return new Response(JSON.stringify({ error: "No payment method on file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pkg = PACKAGES[wallet.auto_recharge_package || "pkg_200"];
    if (!pkg) {
      return new Response(JSON.stringify({ error: "Invalid auto-recharge package" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if balance is still below threshold (prevent double-recharge)
    if (wallet.credits > wallet.auto_recharge_threshold) {
      return new Response(JSON.stringify({ skipped: true, reason: "Balance above threshold" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    // Create off-session payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price,
      currency: "usd",
      customer: wallet.stripe_customer_id,
      payment_method: wallet.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      metadata: {
        org_id,
        package_id: wallet.auto_recharge_package || "pkg_200",
        credits: String(pkg.credits),
        auto_recharge: "true",
      },
    });

    if (paymentIntent.status === "succeeded") {
      // Add credits
      const { error: creditErr } = await supabase.rpc("add_credits", {
        p_org_id: org_id,
        p_amount: pkg.credits,
        p_reference_id: paymentIntent.id,
        p_type: "purchase",
        p_notes: `Auto-recharge: ${pkg.credits} credits (${wallet.auto_recharge_package})`,
      });

      if (creditErr) {
        console.error("Error adding credits after auto-recharge:", creditErr);
        throw creditErr;
      }

      console.log(`Auto-recharged ${pkg.credits} credits for org ${org_id}`);

      // Send receipt email via send-credits-email
      try {
        const creditsEmailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-credits-email`;
        await fetch(creditsEmailUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            org_id,
            type: "credits_added",
            credits: pkg.credits,
            notes: `Auto-recharge: ${pkg.label}`,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send auto-recharge receipt email:", emailErr);
      }

      return new Response(JSON.stringify({
        success: true,
        credits_added: pkg.credits,
        payment_intent_id: paymentIntent.id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      payment_status: paymentIntent.status,
    }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Auto-recharge error:", err);

    // If it's a Stripe card error, log it but don't crash
    if (err.type === "StripeCardError") {
      return new Response(JSON.stringify({
        success: false,
        error: "Payment failed",
        decline_code: err.decline_code,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
