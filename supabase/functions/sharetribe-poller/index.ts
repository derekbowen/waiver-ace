import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Sharetribe Integration Poller
 *
 * This edge function polls Sharetribe's Integration API for new transaction
 * events and automatically creates WaiverFlow envelopes + sends signing emails
 * when a new booking is initiated.
 *
 * Designed to be called on a cron schedule (e.g., every 60 seconds via
 * Supabase pg_cron or an external scheduler like cron-job.org).
 *
 * Required env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automatic in Supabase)
 *
 * Required per-org config stored in `integration_configs` table:
 *   - sharetribe_client_id
 *   - sharetribe_client_secret
 *   - sharetribe_template_id (which WaiverFlow template to use)
 *   - sharetribe_base_url (default: https://flex-api.sharetribe.com)
 *   - last_event_sequence_id (for polling cursor)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SharetribeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SharetribeEvent {
  id: { uuid: string };
  type: string;
  attributes: {
    eventType: string;
    sequenceId: number;
    createdAt: string;
    resourceId: { uuid: string };
    resource: {
      id: { uuid: string };
      type: string;
      attributes: Record<string, unknown>;
      relationships?: {
        customer?: { data: { id: { uuid: string } } };
        provider?: { data: { id: { uuid: string } } };
        listing?: { data: { id: { uuid: string } } };
      };
    };
  };
}

async function getSharetribeToken(
  baseUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/v1/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "integration",
    }),
  });

  if (!res.ok) {
    throw new Error(`Sharetribe auth failed: ${res.status} ${await res.text()}`);
  }

  const data: SharetribeTokenResponse = await res.json();
  return data.access_token;
}

async function fetchSharetribeEvents(
  baseUrl: string,
  token: string,
  afterSequenceId: number | null
): Promise<SharetribeEvent[]> {
  const params = new URLSearchParams({
    "eventTypes": "transaction/initiated",
  });
  if (afterSequenceId) {
    params.set("startAfterSequenceId", String(afterSequenceId));
  }

  const res = await fetch(
    `${baseUrl}/v1/integration_api/events/query?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Sharetribe events query failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data || [];
}

async function fetchSharetribeUser(
  baseUrl: string,
  token: string,
  userId: string
): Promise<{ email: string; displayName: string }> {
  const res = await fetch(
    `${baseUrl}/v1/integration_api/users/show?id=${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Sharetribe user fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const attrs = data.data.attributes;
  const profile = attrs.profile || {};
  return {
    email: attrs.email,
    displayName: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || attrs.email,
  };
}

async function fetchSharetribeListing(
  baseUrl: string,
  token: string,
  listingId: string
): Promise<{ title: string }> {
  const res = await fetch(
    `${baseUrl}/v1/integration_api/listings/show?id=${listingId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return { title: "Unknown listing" };

  const data = await res.json();
  return { title: data.data.attributes.title || "Unknown listing" };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Get all orgs with Sharetribe integration configured
    const { data: configs } = await supabase
      .from("integration_configs")
      .select("*")
      .eq("provider", "sharetribe")
      .eq("is_active", true);

    if (!configs?.length) {
      return new Response(JSON.stringify({ message: "No active Sharetribe integrations" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, unknown>[] = [];

    for (const config of configs) {
      const baseUrl = config.settings.base_url || "https://flex-api.sharetribe.com";
      const clientId = config.settings.client_id;
      const clientSecret = config.settings.client_secret;
      const templateId = config.settings.template_id;

      if (!clientId || !clientSecret || !templateId) {
        results.push({ org_id: config.org_id, error: "Missing config" });
        continue;
      }

      // Authenticate with Sharetribe
      const token = await getSharetribeToken(baseUrl, clientId, clientSecret);

      // Poll events since last sequence ID
      const events = await fetchSharetribeEvents(
        baseUrl,
        token,
        config.settings.last_sequence_id || null
      );

      if (!events.length) {
        results.push({ org_id: config.org_id, events_processed: 0 });
        continue;
      }

      let lastSequenceId = config.settings.last_sequence_id || 0;

      for (const event of events) {
        const attrs = event.attributes;
        lastSequenceId = Math.max(lastSequenceId, attrs.sequenceId);

        if (attrs.eventType !== "transaction/initiated") continue;

        const txn = attrs.resource;
        const customerId = txn.relationships?.customer?.data?.id?.uuid;
        const providerId = txn.relationships?.provider?.data?.id?.uuid;
        const listingId = txn.relationships?.listing?.data?.id?.uuid;
        const transactionId = txn.id.uuid;

        if (!customerId) continue;

        // Fetch customer details from Sharetribe
        const customer = await fetchSharetribeUser(baseUrl, token, customerId);
        const listing = listingId
          ? await fetchSharetribeListing(baseUrl, token, listingId)
          : { title: "N/A" };
        const provider = providerId
          ? await fetchSharetribeUser(baseUrl, token, providerId)
          : { email: "", displayName: "Provider" };

        // Get current template version
        const { data: version } = await supabase
          .from("template_versions")
          .select("id")
          .eq("template_id", templateId)
          .eq("is_current", true)
          .single();

        if (!version) continue;

        // Create WaiverFlow envelope
        const { data: envelope, error: envError } = await supabase
          .from("envelopes")
          .insert({
            org_id: config.org_id,
            template_version_id: version.id,
            signer_email: customer.email,
            signer_name: customer.displayName,
            booking_id: transactionId,
            listing_id: listingId || null,
            host_id: providerId || null,
            customer_id: customerId,
            status: "sent",
            payload: {
              customer_name: customer.displayName,
              provider_name: provider.displayName,
              booking_id: transactionId,
              listing_id: listingId || "",
              activity_type: listing.title,
              date: new Date().toLocaleDateString(),
              source: "sharetribe",
            },
          })
          .select()
          .single();

        if (envError) {
          results.push({ transaction_id: transactionId, error: envError.message });
          continue;
        }

        // Log event
        await supabase.from("envelope_events").insert({
          envelope_id: envelope.id,
          event_type: "envelope.sent",
          metadata: { source: "sharetribe", transaction_id: transactionId },
        });

        // Send signing email via the send-signing-email function
        const signingUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://waiverflow.app"}/sign/${envelope.signing_token}`;

        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-signing-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: customer.email,
            signer_name: customer.displayName,
            signing_url: signingUrl,
            listing_title: listing.title,
            provider_name: provider.displayName,
          }),
        });

        results.push({
          transaction_id: transactionId,
          envelope_id: envelope.id,
          signer: customer.email,
        });
      }

      // Update cursor so we don't re-process events
      await supabase
        .from("integration_configs")
        .update({
          settings: { ...config.settings, last_sequence_id: lastSequenceId },
        })
        .eq("id", config.id);
    }

    return new Response(JSON.stringify({ processed: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
