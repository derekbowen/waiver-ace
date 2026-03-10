import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    // Require envelope_id instead of arbitrary recipient/URL
    const { envelope_id } = await req.json();
    if (!envelope_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: envelope_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to fetch envelope and validate ownership
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get the caller's org_id
    const { data: profile } = await adminClient
      .from('profiles')
      .select('org_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.org_id) {
      return new Response(
        JSON.stringify({ error: 'User has no organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch envelope and verify it belongs to the caller's org
    const { data: envelope, error: envError } = await adminClient
      .from('envelopes')
      .select('id, signer_email, signer_name, signing_token, org_id, template_versions(content)')
      .eq('id', envelope_id)
      .single();

    if (envError || !envelope) {
      return new Response(
        JSON.stringify({ error: 'Envelope not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (envelope.org_id !== profile.org_id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get org name for branding
    const { data: org } = await adminClient
      .from('organizations')
      .select('name')
      .eq('id', profile.org_id)
      .single();

    // Build signing URL from our own domain — never accept from client
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || '';
    // Use the origin from the request for the signing URL
    const origin = req.headers.get('origin') || 'https://rentalwaivers.lovable.app';
    const signingUrl = `${origin}/sign/${envelope.signing_token}`;

    const to = envelope.signer_email;
    const displayName = envelope.signer_name || 'there';
    const orgName = org?.name || 'WaiverFlow';
    const templateName = (envelope.template_versions as any)?.content?.title || 'Waiver Agreement';

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
    You have a document that requires your signature: <strong>${templateName}</strong>
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'WaiverFlow <onboarding@resend.dev>',
        to: [to],
        subject: `Action Required: Please sign "${templateName}"`,
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
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
