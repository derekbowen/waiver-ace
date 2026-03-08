import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Send Signing Email
 *
 * Sends a signing link email to the signer using Resend (or any SMTP provider).
 * Called by the Sharetribe poller or directly via the API.
 *
 * Required env var:
 *   RESEND_API_KEY - API key from resend.com (free tier: 100 emails/day)
 *
 * If RESEND_API_KEY is not set, the function logs the email instead of sending,
 * so the system still works during development.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  signer_name: string;
  signing_url: string;
  listing_title?: string;
  provider_name?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, signer_name, signing_url, listing_title, provider_name } = body;

    if (!to || !signing_url) {
      return new Response(JSON.stringify({ error: "to and signing_url are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = listing_title
      ? `Action Required: Sign your waiver for ${listing_title}`
      : "Action Required: Please sign your waiver";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: #6366f1; border-radius: 8px; padding: 8px 12px;">
      <span style="color: white; font-weight: 700; font-size: 14px;">WaiverFlow</span>
    </div>
  </div>

  <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">
    Waiver Signature Required
  </h1>

  <p style="color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
    Hi ${signer_name || "there"},
    ${provider_name ? `<br><strong>${provider_name}</strong> has` : "You have"} a liability waiver
    that needs your signature${listing_title ? ` for <strong>${listing_title}</strong>` : ""}.
    Please review and sign it before your booking can be confirmed.
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${signing_url}"
       style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
      Review & Sign Waiver
    </a>
  </div>

  <p style="color: #999; font-size: 13px; line-height: 1.5;">
    This link is unique to you. Do not share it with others.
    If you did not request this, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="color: #bbb; font-size: 12px; text-align: center;">
    Powered by WaiverFlow — Automated waivers for marketplaces
  </p>
</body>
</html>`.trim();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      // Dev mode: log instead of sending
      console.log("EMAIL (no RESEND_API_KEY set):", { to, subject, signing_url });
      return new Response(JSON.stringify({
        sent: false,
        mode: "dev",
        message: "RESEND_API_KEY not configured. Email logged to console.",
        to,
        signing_url,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "WaiverFlow <waivers@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${res.status} ${errText}`);
    }

    const result = await res.json();

    return new Response(JSON.stringify({ sent: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
