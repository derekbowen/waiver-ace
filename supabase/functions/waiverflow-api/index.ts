import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

function generateSigningEmailHtml({ signerName, signingUrl, templateName, organizationName }: {
  signerName?: string;
  signingUrl: string;
  templateName?: string;
  organizationName?: string;
}): string {
  const orgName = organizationName || "Rental Waivers";
  const displayName = signerName || "there";
  const docName = templateName || "Waiver Agreement";

  return `
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
    You have a document that requires your signature: <strong>${docName}</strong>
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
    This email was sent by ${orgName} via Rental Waivers.<br>
    If you did not expect this email, please ignore it.
  </p>
</body>
</html>
  `;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const path = url.pathname.replace("/waiverflow-api", "");
  const apiKey = req.headers.get("x-api-key");

  // Validate API key
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const keyHash = btoa(apiKey);
  const { data: keyData } = await supabase
    .from("api_keys")
    .select("org_id, is_active")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (!keyData) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orgId = keyData.org_id;

  // Update last_used_at
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash);

  try {
    // POST /envelopes - Create envelope
    if (req.method === "POST" && (path === "/envelopes" || path === "/envelopes/")) {
      const body = await req.json();
      const { template_id, signer_email, signer_name, booking_id, listing_id, host_id, customer_id, payload, send_email = true } = body;

      if (!template_id || !signer_email) {
        return new Response(JSON.stringify({ error: "template_id and signer_email are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get current template version with template name
      const { data: version } = await supabase
        .from("template_versions")
        .select("id, template_id")
        .eq("template_id", template_id)
        .eq("is_current", true)
        .single();

      if (!version) {
        return new Response(JSON.stringify({ error: "No active template version found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get template name
      const { data: template } = await supabase
        .from("templates")
        .select("name")
        .eq("id", template_id)
        .single();

      // Get organization name
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .single();

      const { data: envelope, error } = await supabase
        .from("envelopes")
        .insert({
          org_id: orgId,
          template_version_id: version.id,
          signer_email,
          signer_name: signer_name || null,
          booking_id: booking_id || null,
          listing_id: listing_id || null,
          host_id: host_id || null,
          customer_id: customer_id || null,
          status: "sent",
          payload: payload || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Log event
      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.sent",
        metadata: { source: "api" },
      });

      const baseUrl = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://waiverflow.app";
      const signingUrl = `${baseUrl}/sign/${envelope.signing_token}`;

      // Send email if requested
      let emailSent = false;
      if (send_email) {
        try {
          const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
          if (RESEND_API_KEY) {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "WaiverFlow <onboarding@resend.dev>",
                to: [signer_email],
                subject: `Action Required: Please sign "${template?.name || 'Waiver Agreement'}"`,
                html: generateSigningEmailHtml({
                  signerName: signer_name,
                  signingUrl,
                  templateName: template?.name,
                  organizationName: org?.name,
                }),
              }),
            });
            const emailData = await emailResponse.json();
            emailSent = emailResponse.ok;
            if (!emailResponse.ok) {
              console.error("Failed to send email:", emailData);
            }
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }

      return new Response(JSON.stringify({
        id: envelope.id,
        status: envelope.status,
        signing_url: signingUrl,
        signing_token: envelope.signing_token,
        created_at: envelope.created_at,
        email_sent: emailSent,
      }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /envelopes/:id - Get envelope status
    if (req.method === "GET" && path.match(/^\/envelopes\/[^/]+$/)) {
      const envelopeId = path.split("/")[2];
      const { data: envelope, error } = await supabase
        .from("envelopes")
        .select("id, status, signer_email, signer_name, booking_id, listing_id, signed_at, created_at")
        .eq("id", envelopeId)
        .eq("org_id", orgId)
        .single();

      if (error || !envelope) {
        return new Response(JSON.stringify({ error: "Envelope not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(envelope), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /envelopes/:id/cancel - Cancel envelope
    if (req.method === "POST" && path.match(/^\/envelopes\/[^/]+\/cancel$/)) {
      const envelopeId = path.split("/")[2];
      const { error } = await supabase
        .from("envelopes")
        .update({ status: "canceled" })
        .eq("id", envelopeId)
        .eq("org_id", orgId);

      if (error) throw error;

      await supabase.from("envelope_events").insert({
        envelope_id: envelopeId,
        event_type: "envelope.canceled",
        metadata: { source: "api" },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /templates - List templates
    if (req.method === "GET" && (path === "/templates" || path === "/templates/")) {
      const { data: templates } = await supabase
        .from("templates")
        .select("id, name, description, is_active, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify(templates || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
