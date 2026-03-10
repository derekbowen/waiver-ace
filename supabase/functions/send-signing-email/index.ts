import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  signerName: string;
  signingUrl: string;
  templateName: string;
  organizationName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    const { to, signerName, signingUrl, templateName, organizationName } = await req.json() as EmailRequest;

    if (!to || !signingUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, signingUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orgName = organizationName || 'WaiverFlow';
    const displayName = signerName || 'there';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0;">${orgName}</h1>
  </div>

  <p style="font-size: 16px; margin-bottom: 16px;">Hi ${displayName},</p>

  <p style="font-size: 16px; margin-bottom: 24px;">
    You have a document that requires your signature: <strong>${templateName || 'Waiver Agreement'}</strong>
  </p>

  <p style="font-size: 16px; margin-bottom: 24px;">
    Please review and sign the document by clicking the button below:
  </p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${signingUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;">
      Review & Sign Document
    </a>
  </div>

  <p style="font-size: 14px; color: #64748b; margin-top: 32px;">
    If the button doesn't work, copy and paste this link into your browser:
    <br>
    <a href="${signingUrl}" style="color: #3b82f6; word-break: break-all;">${signingUrl}</a>
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    This email was sent by ${orgName} via WaiverFlow.<br>
    If you did not expect this email, please ignore it.
  </p>
</body>
</html>
    `;

    if (!RESEND_API_KEY) {
      // Dev mode: log instead of sending
      console.log("EMAIL (no RESEND_API_KEY set):", { to, signingUrl });
      return new Response(
        JSON.stringify({ success: true, mode: "dev", message: "RESEND_API_KEY not configured. Email logged to console." }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WaiverFlow <onboarding@resend.dev>',
        to: [to],
        subject: `Action Required: Please sign "${templateName || 'Waiver Agreement'}"`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
