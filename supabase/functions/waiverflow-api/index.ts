import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

async function fireWebhooks(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  eventType: string,
  envelopeId: string,
  payload: Record<string, unknown>
) {
  const { data: endpoints } = await supabase
    .from("webhook_endpoints")
    .select("id, url, secret, events")
    .eq("org_id", orgId)
    .eq("is_active", true);

  if (!endpoints?.length) return;

  for (const ep of endpoints) {
    if (!(ep.events as string[])?.includes(eventType)) continue;

    const body = JSON.stringify({
      event: eventType,
      envelope_id: envelopeId,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    // Sign payload with HMAC-SHA256
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ep.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const signature = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let deliveredAt: string | null = null;

    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WaiverFlow-Signature": signature,
        },
        body,
      });
      responseStatus = res.status;
      responseBody = (await res.text()).slice(0, 1000);
      if (res.ok) deliveredAt = new Date().toISOString();
    } catch (err: unknown) {
      responseBody = err instanceof Error ? err.message : "Delivery failed";
    }

    await supabase.from("webhook_deliveries").insert({
      webhook_endpoint_id: ep.id,
      envelope_id: envelopeId,
      event_type: eventType,
      payload: JSON.parse(body),
      response_status: responseStatus,
      response_body: responseBody,
      delivered_at: deliveredAt,
    });
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

  const url = new URL(req.url);
  const path = url.pathname.replace("/waiverflow-api", "");
  const apiKey = req.headers.get("x-api-key");

  // Validate API key
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // SHA-256 hash for secure key comparison
  const encoded = new TextEncoder().encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

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
      const { template_id, signer_email, signer_name, booking_id, listing_id, host_id, customer_id, payload } = body;

      if (!template_id || !signer_email) {
        return new Response(JSON.stringify({ error: "template_id and signer_email are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get current template version
      const { data: version } = await supabase
        .from("template_versions")
        .select("id")
        .eq("template_id", template_id)
        .eq("is_current", true)
        .single();

      if (!version) {
        return new Response(JSON.stringify({ error: "No active template version found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      // Fire webhooks
      await fireWebhooks(supabase, orgId, "envelope.sent", envelope.id, {
        signer_email: envelope.signer_email,
        signer_name: envelope.signer_name,
        booking_id: envelope.booking_id,
        listing_id: envelope.listing_id,
      });

      const signingUrl = `${req.headers.get("origin") || "https://waiverflow.app"}/sign/${envelope.signing_token}`;

      return new Response(JSON.stringify({
        id: envelope.id,
        status: envelope.status,
        signing_url: signingUrl,
        signing_token: envelope.signing_token,
        created_at: envelope.created_at,
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

      await fireWebhooks(supabase, orgId, "envelope.canceled", envelopeId, {});

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

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
