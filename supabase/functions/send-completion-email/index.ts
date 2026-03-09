import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompletionRequest {
  envelope_id: string;
  // For group waivers, optionally include the individual signer info
  group_signer_name?: string;
  group_signer_email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { envelope_id, group_signer_name, group_signer_email } =
      (await req.json()) as CompletionRequest;

    if (!envelope_id) {
      return new Response(JSON.stringify({ error: "envelope_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get envelope + org info
    const { data: envelope, error: envErr } = await supabase
      .from("envelopes")
      .select("*")
      .eq("id", envelope_id)
      .single();

    if (envErr || !envelope) {
      return new Response(JSON.stringify({ error: "Envelope not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get org name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", envelope.org_id)
      .single();

    const orgName = org?.name || "Rental Waivers";

    // Get admin emails for notification
    const { data: admins } = await supabase
      .from("profiles")
      .select("email")
      .eq("org_id", envelope.org_id);

    const signerName = group_signer_name || envelope.signer_name || "Guest";
    const signerEmail = group_signer_email || envelope.signer_email;
    const isGroup = envelope.is_group_waiver;

    const emails: Promise<Response>[] = [];

    // 1. Send confirmation to signer (if we have their email)
    if (signerEmail && signerEmail !== "group@placeholder.local") {
      const signerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0;">${orgName}</h1>
  </div>

  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 16px;">
      <span style="font-size: 32px;">&#10004;</span>
    </div>
  </div>

  <h2 style="text-align: center; font-size: 20px; margin-bottom: 8px;">Waiver Signed Successfully</h2>

  <p style="font-size: 16px; margin-bottom: 16px;">Hi ${signerName},</p>

  <p style="font-size: 16px; margin-bottom: 24px;">
    Your waiver has been signed and recorded. Here are the details:
  </p>

  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <table style="width: 100%; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Signed by</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${signerName}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Date</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Envelope ID</td><td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 12px;">${envelope_id.slice(0, 8)}...</td></tr>
      ${envelope.booking_id ? `<tr><td style="padding: 4px 0; color: #64748b;">Booking</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${envelope.booking_id}</td></tr>` : ""}
    </table>
  </div>

  <p style="font-size: 14px; color: #64748b;">
    Please keep this email for your records. If you have questions about this waiver, contact ${orgName} directly.
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    Sent via Rental Waivers &mdash; rentalwaivers.com<br>
    This is not legal advice. Rental Waivers is a document signing tool, not a law firm.
  </p>
</body>
</html>`;

      emails.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rental Waivers <onboarding@resend.dev>",
            to: [signerEmail],
            subject: `Waiver Signed — Confirmation from ${orgName}`,
            html: signerHtml,
          }),
        })
      );
    }

    // 2. Send notification to admin(s)
    const adminEmails = (admins || [])
      .map((a: any) => a.email)
      .filter((e: string) => e);

    if (adminEmails.length > 0) {
      const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0;">${orgName}</h1>
  </div>

  <h2 style="font-size: 18px; margin-bottom: 16px;">New Waiver Signed</h2>

  <p style="font-size: 16px; margin-bottom: 24px;">
    ${isGroup ? "A guest in a group waiver" : signerName} just signed a waiver${envelope.booking_id ? ` for booking <strong>${envelope.booking_id}</strong>` : ""}.
  </p>

  <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <table style="width: 100%; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Signer</td><td style="padding: 4px 0; text-align: right; font-weight: 500;">${signerName}</td></tr>
      ${signerEmail && signerEmail !== "group@placeholder.local" ? `<tr><td style="padding: 4px 0; color: #64748b;">Email</td><td style="padding: 4px 0; text-align: right;">${signerEmail}</td></tr>` : ""}
      <tr><td style="padding: 4px 0; color: #64748b;">Type</td><td style="padding: 4px 0; text-align: right;">${isGroup ? "Group Waiver" : "Individual"}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Date</td><td style="padding: 4px 0; text-align: right;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td></tr>
      ${envelope.booking_id ? `<tr><td style="padding: 4px 0; color: #64748b;">Booking</td><td style="padding: 4px 0; text-align: right;">${envelope.booking_id}</td></tr>` : ""}
      ${isGroup && envelope.group_label ? `<tr><td style="padding: 4px 0; color: #64748b;">Group</td><td style="padding: 4px 0; text-align: right;">${envelope.group_label}</td></tr>` : ""}
    </table>
  </div>

  <div style="text-align: center; margin: 24px 0;">
    <a href="${Deno.env.get("SITE_URL") || "https://rentalwaivers.com"}/envelopes/${envelope_id}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
      View in Dashboard
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    Sent via Rental Waivers &mdash; rentalwaivers.com
  </p>
</body>
</html>`;

      emails.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rental Waivers <onboarding@resend.dev>",
            to: adminEmails,
            subject: `Waiver Signed by ${signerName}${envelope.booking_id ? ` — Booking ${envelope.booking_id}` : ""}`,
            html: adminHtml,
          }),
        })
      );
    }

    // Fire all emails in parallel
    const results = await Promise.allSettled(emails);
    const sent = results.filter((r) => r.status === "fulfilled").length;

    return new Response(
      JSON.stringify({ success: true, emails_sent: sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending completion email:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
