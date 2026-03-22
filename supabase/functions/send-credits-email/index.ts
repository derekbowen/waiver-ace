/**
 * Sends credit-related emails:
 *  - "credits_added": Confirmation when credits are purchased
 *  - "credits_low": Warning when balance drops below threshold
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreditEmailRequest {
  type: "credits_added" | "credits_low";
  org_id: string;
  credits_added?: number;
  package_label?: string;
  new_balance?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow calls from internal edge functions using the service-role key
  const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (authToken !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: CreditEmailRequest = await req.json();
    const { type, org_id } = payload;

    if (!type || !org_id) {
      return new Response(JSON.stringify({ error: "type and org_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get org
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", org_id)
      .single();

    const orgName = org?.name || "Rental Waivers";

    // Get admin emails
    const { data: admins } = await supabase
      .from("profiles")
      .select("email")
      .eq("org_id", org_id);

    const adminEmails = (admins || []).map((a: any) => a.email).filter(Boolean);
    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "No admin emails" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get wallet for current balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("credits, auto_recharge_enabled")
      .eq("org_id", org_id)
      .single();

    const balance = wallet?.credits ?? payload.new_balance ?? 0;

    let html: string;
    let subject: string;

    if (type === "credits_added") {
      const creditsAdded = payload.credits_added || 0;
      const packageLabel = payload.package_label || `${creditsAdded} Credits`;

      subject = `✓ ${creditsAdded} credits added to your account`;
      html = buildEmail({
        previewText: `${creditsAdded} credits have been added to your ${orgName} account`,
        orgName,
        greeting: `Hey there,`,
        sections: [
          {
            type: 'callout',
            variant: 'success',
            content: `${creditsAdded.toLocaleString()} credits have been added to your account.`,
          },
          {
            type: 'table',
            rows: [
              { label: 'Package', value: packageLabel },
              { label: 'Credits added', value: `+${creditsAdded.toLocaleString()}` },
              { label: 'New balance', value: `${balance.toLocaleString()} credits` },
            ],
          },
          {
            type: 'text',
            content: 'Your credits are ready to use. Each waiver sent uses one credit.',
          },
          {
            type: 'button',
            content: 'Go to Dashboard',
            href: 'https://rentalwaivers.com/dashboard',
          },
        ],
        footerText: 'This is a purchase confirmation. Check your Stripe account for the full receipt.',
      });
    } else if (type === "credits_low") {
      const isOverdraft = balance <= 0;
      const autoRecharge = wallet?.auto_recharge_enabled;

      subject = isOverdraft
        ? '🔴 Your credit balance has run out'
        : '⚠️ Your credit balance is running low';

      html = buildEmail({
        previewText: isOverdraft
          ? 'Your credit balance is empty — add credits to keep sending waivers'
          : 'Your credit balance is low — consider topping up',
        orgName,
        greeting: 'Hey there,',
        sections: [
          {
            type: 'callout',
            variant: isOverdraft ? 'error' : 'warning',
            content: isOverdraft
              ? `Your credit balance is <strong>${balance}</strong>. Waiver sending will be paused at -10 credits.`
              : `Your credit balance is down to <strong>${balance}</strong> credits.`,
          },
          {
            type: 'text',
            content: isOverdraft
              ? 'Add credits now to keep your waivers flowing without interruption.'
              : 'Top up your credits to make sure you can keep sending waivers without interruption.',
          },
          ...(autoRecharge
            ? [{
                type: 'callout' as const,
                variant: 'info' as const,
                content: 'Auto-recharge is enabled on your account. Credits will be added automatically.',
              }]
            : [{
                type: 'text' as const,
                content: '<strong>Tip:</strong> Enable auto-recharge in your dashboard settings so you never run out.',
              }]
          ),
          {
            type: 'button',
            content: 'Add Credits Now',
            href: 'https://rentalwaivers.com/pricing',
          },
          {
            type: 'table',
            rows: [
              { label: 'Current balance', value: `${balance.toLocaleString()} credits` },
              { label: 'Auto-recharge', value: autoRecharge ? 'Enabled ✓' : 'Disabled' },
            ],
          },
        ],
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail({ to: adminEmails, subject, html });

    return new Response(JSON.stringify({ success: result.success, id: result.id }), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending credits email:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
