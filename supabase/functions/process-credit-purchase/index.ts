import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Only process one-time payments (not subscriptions)
    if (session.mode !== "payment") {
      return new Response(JSON.stringify({ received: true, skipped: "not a payment session" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const packageId = session.metadata?.package_id;
    const orgId = session.metadata?.org_id;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (!orgId || !credits) {
      console.error("Missing metadata in checkout session:", session.id);
      return new Response(JSON.stringify({ error: "Missing org_id or credits in metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check: skip if this session was already processed
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("reference_id", session.id)
      .eq("type", "purchase")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`Session ${session.id} already processed, skipping`);
      return new Response(JSON.stringify({ already_processed: true, session_id: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add credits using the atomic DB function
    const { data: result, error } = await supabase.rpc("add_credits", {
      p_org_id: orgId,
      p_amount: credits,
      p_reference_id: session.id,
      p_type: "purchase",
      p_notes: `Purchased ${credits} credits (${packageId})`,
    });

    if (error) {
      console.error("Error adding credits:", error);
      throw error;
    }

    // Save payment method for auto-recharge if setup_future_usage was set
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        if (paymentIntent.payment_method) {
          await supabase
            .from("wallets")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_payment_method_id: paymentIntent.payment_method as string,
            })
            .eq("org_id", orgId);
        }
      } catch (pmErr) {
        console.error("Error saving payment method:", pmErr);
      }
    }

    console.log(`Added ${credits} credits to org ${orgId} (session: ${session.id})`);

    // Check if this is the first purchase for this org — grant referral reward
    try {
      const { data: allPurchases } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("org_id", orgId)
        .eq("type", "purchase")
        .limit(2);

      // If this is the first purchase (only 1 purchase record = the one we just created)
      if (allPurchases && allPurchases.length === 1) {
        // Find pending referral for this org
        const { data: referral } = await supabase
          .from("referrals")
          .select("id, referrer_org_id")
          .eq("referred_org_id", orgId)
          .eq("status", "pending")
          .eq("reward_credited", false)
          .single();

        if (referral) {
          // Grant 250 credits to the referrer
          const { error: rewardErr } = await supabase.rpc("add_credits_internal", {
            p_org_id: referral.referrer_org_id,
            p_amount: 250,
            p_reference_id: `referral_${referral.id}`,
            p_type: "referral_bonus",
            p_notes: "Referral reward — 250 free credits",
          });

          if (!rewardErr) {
            await supabase
              .from("referrals")
              .update({ status: "completed", reward_credited: true, completed_at: new Date().toISOString() })
              .eq("id", referral.id);
            console.log(`Referral reward granted to org ${referral.referrer_org_id}`);
          } else {
            console.error("Failed to grant referral reward:", rewardErr);
          }
        }
      }
    } catch (refErr) {
      console.error("Non-fatal: Referral reward check failed:", refErr);
    }

    // Send credit purchase confirmation email
    try {
      const emailUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-credits-email`;
      await fetch(emailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          type: "credits_added",
          org_id: orgId,
          credits_added: credits,
          package_label: packageId ? `${credits.toLocaleString()} Credits (${packageId})` : `${credits} Credits`,
          new_balance: result,
        }),
      });
    } catch (emailErr) {
      console.error("Non-fatal: Failed to send credits email:", emailErr);
    }

    return new Response(JSON.stringify({
      success: true,
      credits_added: credits,
      org_id: orgId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
