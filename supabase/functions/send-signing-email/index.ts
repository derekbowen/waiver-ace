import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    const { envelope_id } = await req.json();

    if (!envelope_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: envelope_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: profile } = await adminClient
      .from('profiles')
      .select('org_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: 'User has no organization' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: envelope, error: envError } = await adminClient
      .from('envelopes')
      .select('id, signer_email, signer_name, signing_token, org_id, template_versions(content)')
      .eq('id', envelope_id)
      .single();

    if (envError || !envelope) {
      return new Response(JSON.stringify({ error: 'Envelope not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (envelope.org_id !== profile.org_id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: org } = await adminClient
      .from('organizations')
      .select('name')
      .eq('id', profile.org_id)
      .single();

    const origin = req.headers.get('origin') || 'https://rentalwaivers.com';
    const signingUrl = `${origin}/sign/${envelope.signing_token}`;
    const displayName = envelope.signer_name || 'there';
    const orgName = org?.name || 'Rental Waivers';
    const templateName = (envelope.template_versions as any)?.content?.title || 'Waiver Agreement';

    const html = buildEmail({
      previewText: `${orgName} needs your signature on "${templateName}"`,
      orgName,
      greeting: `Hi ${displayName},`,
      sections: [
        {
          type: 'text',
          content: `You have a document that requires your signature: <strong>${templateName}</strong>`,
        },
        {
          type: 'text',
          content: 'Please review and sign the document by clicking the button below. It only takes a minute.',
        },
        {
          type: 'button',
          content: 'Review & Sign Document',
          href: signingUrl,
        },
        {
          type: 'small',
          content: `If the button doesn't work, copy and paste this link into your browser:<br><a href="${signingUrl}" style="color:#3b82f6;word-break:break-all;">${signingUrl}</a>`,
        },
      ],
      footerText: `This email was sent by ${orgName}. If you did not expect this email, please ignore it.`,
    });

    const result = await sendEmail({
      to: envelope.signer_email,
      subject: `Action Required: Please sign "${templateName}"`,
      html,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Failed to send email', details: result.error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update envelope status to 'sent'
    await adminClient
      .from('envelopes')
      .update({ status: 'sent' })
      .eq('id', envelope_id)
      .eq('status', 'draft');

    return new Response(JSON.stringify({ success: true, messageId: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
