import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function generateSigningEmailHtml({ signerName, signingUrl, templateName, organizationName }: {
  signerName?: string;
  signingUrl: string;
  templateName?: string;
  organizationName?: string;
}): string {
  const orgName = escapeHtml(organizationName || "Rental Waivers");
  const displayName = escapeHtml(signerName || "there");
  const docName = escapeHtml(templateName || "Waiver Agreement");

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

async function dispatchWebhooks(
  supabase: any,
  orgId: string,
  eventType: string,
  payload: Record<string, any>
) {
  try {
    const { data: endpoints } = await supabase
      .from("webhook_endpoints")
      .select("id, url, secret, events")
      .eq("org_id", orgId);

    if (!endpoints?.length) return;

    const body = JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() });

    for (const ep of endpoints) {
      if (!(ep.events as string[])?.includes(eventType)) continue;

      // HMAC-SHA256 signature using the stored secret hash as the signing key
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(ep.secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

      try {
        const res = await fetch(ep.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": `sha256=${signature}`,
            "X-Webhook-Event": eventType,
          },
          body,
        });

        await supabase.from("webhook_deliveries").insert({
          endpoint_id: ep.id,
          event_type: eventType,
          payload,
          response_status: res.status,
          success: res.ok,
        });
      } catch (err: any) {
        await supabase.from("webhook_deliveries").insert({
          endpoint_id: ep.id,
          event_type: eventType,
          payload,
          response_status: 0,
          success: false,
          error_message: err.message,
        });
      }
    }
  } catch (e) {
    console.error("Webhook dispatch error:", e);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Handle kiosk actions (no API key required - public facing)
  if (req.method === "POST") {
    try {
      const bodyClone = req.clone();
      const body = await bodyClone.json();
      
      if (body.action === "kiosk_info" && body.template_id) {
        const { data: template } = await supabase
          .from("templates")
          .select("id, name, org_id, is_active")
          .eq("id", body.template_id)
          .eq("is_active", true)
          .single();

        if (!template) {
          return new Response(JSON.stringify({ error: "Template not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", template.org_id)
          .single();

        return new Response(JSON.stringify({
          template_name: template.name,
          org_name: org?.name || "",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (body.action === "kiosk_create" && body.template_id) {
        const { data: template } = await supabase
          .from("templates")
          .select("id, org_id, is_active")
          .eq("id", body.template_id)
          .eq("is_active", true)
          .single();

        if (!template) {
          return new Response(JSON.stringify({ error: "Template not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: version } = await supabase
          .from("template_versions")
          .select("id")
          .eq("template_id", template.id)
          .eq("is_current", true)
          .single();

        if (!version) {
          return new Response(JSON.stringify({ error: "No active version" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Deduct credit
        const { data: creditResult } = await supabase.rpc("deduct_credit", {
          p_org_id: template.org_id,
          p_reference_id: `kiosk_${Date.now()}`,
          p_type: "waiver_deduction",
        });

        if (!creditResult?.[0]?.success) {
          return new Response(JSON.stringify({ error: "Organization has no credits remaining" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: envelope, error } = await supabase
          .from("envelopes")
          .insert({
            org_id: template.org_id,
            template_version_id: version.id,
            signer_email: "kiosk@placeholder.local",
            signer_name: "Kiosk Guest",
            status: "sent",
            payload: { source: "kiosk" },
          })
          .select("signing_token")
          .single();

        if (error) throw error;

        await supabase.from("envelope_events").insert({
          envelope_id: envelope.signing_token, // will be looked up
          event_type: "envelope.sent",
          metadata: { source: "kiosk" },
        });

        return new Response(JSON.stringify({ signing_token: envelope.signing_token }), {
          status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (kioskErr) {
      // Not a kiosk request, fall through to API key validation
    }
  }

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

      // Deduct credit from wallet (after successful envelope creation)
      const { data: creditResult, error: creditErr } = await supabase.rpc("deduct_credit", {
        p_org_id: orgId,
        p_reference_id: envelope.id,
        p_type: "waiver_deduction",
      });

      if (creditErr || !creditResult?.[0]?.success) {
        // Credit deduction failed — cancel the envelope to avoid untracked usage
        await supabase.from("envelopes").update({ status: "canceled" }).eq("id", envelope.id);
        const credit = creditResult?.[0];
        return new Response(JSON.stringify({
          error: credit?.error_message || "Insufficient credits. Purchase more to continue.",
          credits_remaining: credit?.new_balance ?? 0,
        }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const credit = creditResult[0];

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

      // Dispatch webhook
      await dispatchWebhooks(supabase, orgId, "envelope.sent", {
        id: envelope.id, status: "sent", signer_email, signing_url: signingUrl,
      });

      // Trigger auto-recharge if needed
      if (credit?.needs_recharge) {
        try {
          const autoRechargeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/auto-recharge`;
          fetch(autoRechargeUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ org_id: orgId }),
          }).catch(err => console.error("Auto-recharge trigger failed:", err));
        } catch (e) {
          console.error("Auto-recharge trigger error:", e);
        }
      }

      return new Response(JSON.stringify({
        id: envelope.id,
        status: envelope.status,
        signing_url: signingUrl,
        signing_token: envelope.signing_token,
        created_at: envelope.created_at,
        email_sent: emailSent,
        credits_remaining: credit?.new_balance,
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

      await dispatchWebhooks(supabase, orgId, "envelope.canceled", { id: envelopeId });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /envelopes - List envelopes with pagination
    if (req.method === "GET" && (path === "/envelopes" || path === "/envelopes/")) {
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
      const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("page_size") || "20")));
      const status = url.searchParams.get("status");
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("envelopes")
        .select("id, status, signer_email, signer_name, booking_id, listing_id, signed_at, created_at", { count: "exact" })
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (status) query = query.eq("status", status);

      const { data, count, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({
        data: data || [],
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /templates - List templates with pagination
    if (req.method === "GET" && (path === "/templates" || path === "/templates/")) {
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
      const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("page_size") || "20")));
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: templates, count } = await supabase
        .from("templates")
        .select("id, name, description, is_active, created_at", { count: "exact" })
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .range(from, to);

      return new Response(JSON.stringify({
        data: templates || [],
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("waiverflow-api error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
