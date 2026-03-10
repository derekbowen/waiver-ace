import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sharetribe-webhook-signature, x-webhook-secret",
};

// Default liability waiver content used when auto-generating a template
const DEFAULT_LIABILITY_WAIVER = `WAIVER AND RELEASE OF LIABILITY

This Waiver and Release of Liability ("Agreement") is entered into by the Guest identified below in connection with the booking described herein.

Guest (Responsible Party): {{customer_name}}
Guest Email: {{customer_email}}
Booking ID: {{booking_id}}
Listing: {{listing_title}}
Date of Use: {{date}}
State: {{state}}

ACKNOWLEDGMENT OF RISKS
The Guest acknowledges that use of the rented property, facilities, and any related amenities involves inherent risks including but not limited to: physical injury, property damage, drowning, slips and falls, equipment malfunction, and other hazards. These risks exist regardless of the care and precautions taken by the Host or property owner.

ASSUMPTION OF RISK
The Guest voluntarily assumes full responsibility for any risks of loss, property damage, or personal injury — including death — that may be sustained during the booking period. The Guest assumes responsibility for all members of their party, including minors.

RELEASE AND WAIVER
The Guest hereby releases, waives, discharges, and covenants not to sue the Host, the property owner, the booking platform, and their respective agents, employees, and affiliates from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury sustained during the booking period, except in cases of gross negligence or willful misconduct.

INDEMNIFICATION
The Guest agrees to indemnify, defend, and hold harmless the Host, property owner, and booking platform from any claims, damages, losses, or expenses (including attorney fees) arising from the Guest's use of the property or violation of this Agreement.

MEDICAL ACKNOWLEDGMENT
The Guest confirms they have no medical conditions that would make participation unsafe, or if such conditions exist, the Guest assumes all additional risk.

GOVERNING LAW
This Agreement shall be governed by the laws of the State of {{state}}.

By signing below, I acknowledge that I have read and understand this waiver and voluntarily agree to its terms.`;

// Generate the waiver request email HTML
function generateWaiverEmailHtml({
  customerName,
  signingUrl,
  listingTitle,
  bookingDate,
  orgName,
}: {
  customerName: string;
  signingUrl: string;
  listingTitle?: string;
  bookingDate?: string;
  orgName: string;
}): string {
  const displayName = customerName || "there";
  const listing = listingTitle || "your upcoming booking";
  const dateText = bookingDate
    ? ` on <strong>${bookingDate}</strong>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc;">
  <div style="background: white; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #0f172a;">${orgName}</h1>
    </div>

    <p style="font-size: 16px; margin-bottom: 8px;">Hi ${displayName},</p>

    <p style="font-size: 16px; margin-bottom: 24px; color: #475569;">
      Before your booking for <strong>${listing}</strong>${dateText}, we need you to sign a quick liability waiver. It only takes a minute.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${signingUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Sign My Waiver
      </a>
    </div>

    <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      Takes less than 60 seconds
    </p>
  </div>

  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
    If the button doesn't work, copy this link:<br>
    <a href="${signingUrl}" style="color: #3b82f6; word-break: break-all; font-size: 11px;">${signingUrl}</a>
  </p>

  <p style="font-size: 11px; color: #cbd5e1; text-align: center; margin-top: 16px;">
    Sent by ${orgName} via Rental Waivers
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

  try {
    const body = await req.json();
    const webhookSecret = req.headers.get("x-webhook-secret");

    // ──────────────────────────────────────────────
    // Route 1: ShareTribe / marketplace webhook
    // Triggered when a booking is made on the marketplace
    // ──────────────────────────────────────────────
    if (webhookSecret) {
      // Look up integration by webhook secret
      const { data: integration, error: intErr } = await supabase
        .from("marketplace_integrations")
        .select("*, organizations(name)")
        .eq("webhook_secret", webhookSecret)
        .eq("is_active", true)
        .single();

      if (intErr || !integration) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const orgId = integration.org_id;
      const orgName = (integration as any).organizations?.name || "Rental Waivers";

      // Extract customer info from the webhook payload
      // Supports both ShareTribe format and a generic format
      const customer = extractCustomerInfo(body, integration.platform);

      if (!customer.email) {
        return new Response(
          JSON.stringify({ error: "No customer email found in webhook payload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get or auto-create the default template for this org
      let templateVersionId: string;

      if (integration.default_template_id) {
        // Use configured template
        const { data: ver } = await supabase
          .from("template_versions")
          .select("id")
          .eq("template_id", integration.default_template_id)
          .eq("is_current", true)
          .single();

        if (!ver) {
          return new Response(
            JSON.stringify({ error: "Default template has no active version" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        templateVersionId = ver.id;
      } else {
        // Auto-create a generic liability waiver template
        templateVersionId = await getOrCreateDefaultTemplate(supabase, orgId);
      }

      // Check for duplicate (same email + booking_id)
      if (customer.bookingId) {
        const { data: existing } = await supabase
          .from("envelopes")
          .select("id, signing_token, status")
          .eq("org_id", orgId)
          .eq("signer_email", customer.email)
          .eq("booking_id", customer.bookingId)
          .not("status", "in", '("canceled","expired")')
          .limit(1);

        if (existing && existing.length > 0) {
          const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
          return new Response(
            JSON.stringify({
              message: "Waiver already exists for this booking",
              envelope_id: existing[0].id,
              status: existing[0].status,
              signing_url: `${baseUrl}/sign/${existing[0].signing_token}`,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Deduct credit from wallet
      const { data: creditResult, error: creditErr } = await supabase.rpc("deduct_credit", {
        p_org_id: orgId,
        p_reference_id: null,
        p_type: "waiver_deduction",
      });

      if (creditErr) throw creditErr;

      const credit = creditResult?.[0];
      if (!credit?.success) {
        return new Response(
          JSON.stringify({
            error: credit?.error_message || "Insufficient credits",
            credits_remaining: credit?.new_balance ?? 0,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create the envelope
      const { data: envelope, error: envErr } = await supabase
        .from("envelopes")
        .insert({
          org_id: orgId,
          template_version_id: templateVersionId,
          signer_email: customer.email,
          signer_name: customer.name || null,
          booking_id: customer.bookingId || null,
          listing_id: customer.listingId || null,
          host_id: customer.hostId || null,
          customer_id: customer.customerId || null,
          status: "sent",
          payload: {
            customer_name: customer.name || "",
            customer_email: customer.email,
            booking_id: customer.bookingId || "",
            listing_title: customer.listingTitle || "",
            date: customer.bookingDate || new Date().toLocaleDateString(),
            state: customer.state || "",
          },
        })
        .select()
        .single();

      if (envErr) throw envErr;

      // Log event
      await supabase.from("envelope_events").insert({
        envelope_id: envelope.id,
        event_type: "envelope.sent",
        metadata: { source: "marketplace_webhook", platform: integration.platform },
      });

      const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
      const signingUrl = `${baseUrl}/sign/${envelope.signing_token}`;

      // Send the email
      let emailSent = false;
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${orgName} <onboarding@resend.dev>`,
              to: [customer.email],
              subject: `Sign your waiver for ${customer.listingTitle || "your booking"}`,
              html: generateWaiverEmailHtml({
                customerName: customer.name || "",
                signingUrl,
                listingTitle: customer.listingTitle,
                bookingDate: customer.bookingDate,
                orgName,
              }),
            }),
          });
          emailSent = emailRes.ok;
          if (!emailRes.ok) {
            console.error("Email send failed:", await emailRes.text());
          }
        } catch (emailErr) {
          console.error("Email error:", emailErr);
        }
      }

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

      return new Response(
        JSON.stringify({
          success: true,
          envelope_id: envelope.id,
          signing_url: signingUrl,
          email_sent: emailSent,
          credits_remaining: credit?.new_balance,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ──────────────────────────────────────────────
    // Route 2: Check waiver status (for marketplace)
    // GET-like check via POST with booking_id or customer_email
    // ──────────────────────────────────────────────
    const apiKey = req.headers.get("x-api-key");
    if (apiKey && body.action === "check") {
      const keyHash = btoa(apiKey);
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("org_id")
        .eq("key_hash", keyHash)
        .eq("is_active", true)
        .single();

      if (!keyData) {
        return new Response(
          JSON.stringify({ error: "Invalid API key" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let query = supabase
        .from("envelopes")
        .select("id, status, signer_email, signer_name, booking_id, listing_id, signed_at, created_at")
        .eq("org_id", keyData.org_id);

      if (body.booking_id) query = query.eq("booking_id", body.booking_id);
      if (body.customer_email) query = query.eq("signer_email", body.customer_email);

      const { data: envelopes } = await query.order("created_at", { ascending: false });

      const isValid = envelopes?.some(
        (e: any) => e.status === "completed" || e.status === "signed"
      );

      return new Response(
        JSON.stringify({
          valid: !!isValid,
          envelopes: envelopes || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Missing x-webhook-secret or x-api-key header" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

interface CustomerInfo {
  name?: string;
  email: string;
  bookingId?: string;
  listingId?: string;
  listingTitle?: string;
  hostId?: string;
  customerId?: string;
  bookingDate?: string;
  state?: string;
}

function extractCustomerInfo(payload: any, platform: string): CustomerInfo {
  // ShareTribe Flex webhook format
  if (platform === "sharetribe" && payload.resource) {
    const tx = payload.resource;
    const customer = tx.relationships?.customer?.data || {};
    const listing = tx.relationships?.listing?.data || {};
    const included = payload.included || [];

    // Find customer profile in included
    const customerProfile = included.find(
      (i: any) => i.type === "user" && i.id === customer.id
    );
    const listingData = included.find(
      (i: any) => i.type === "listing" && i.id === listing.id
    );

    return {
      name: customerProfile?.attributes?.profile?.displayName ||
        `${customerProfile?.attributes?.profile?.firstName || ""} ${customerProfile?.attributes?.profile?.lastName || ""}`.trim(),
      email: customerProfile?.attributes?.email || "",
      bookingId: tx.id?.uuid || tx.id,
      listingId: listing.id?.uuid || listing.id,
      listingTitle: listingData?.attributes?.title || "",
      hostId: tx.relationships?.provider?.data?.id?.uuid || "",
      customerId: customer.id?.uuid || customer.id,
      bookingDate: tx.attributes?.start
        ? new Date(tx.attributes.start).toLocaleDateString()
        : undefined,
      state: listingData?.attributes?.publicData?.state || "",
    };
  }

  // Generic / direct API format
  return {
    name: payload.customer_name || payload.name || "",
    email: payload.customer_email || payload.email || "",
    bookingId: payload.booking_id || "",
    listingId: payload.listing_id || "",
    listingTitle: payload.listing_title || payload.listing_name || "",
    hostId: payload.host_id || "",
    customerId: payload.customer_id || "",
    bookingDate: payload.booking_date || payload.date || "",
    state: payload.state || "",
  };
}

async function getOrCreateDefaultTemplate(
  supabase: any,
  orgId: string
): Promise<string> {
  // Check if a "Default Liability Waiver" already exists
  const { data: existing } = await supabase
    .from("templates")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", "Auto-Generated Liability Waiver")
    .limit(1);

  let templateId: string;

  if (existing && existing.length > 0) {
    templateId = existing[0].id;
  } else {
    // Create template
    const { data: tmpl, error: tmplErr } = await supabase
      .from("templates")
      .insert({
        org_id: orgId,
        name: "Auto-Generated Liability Waiver",
        description:
          "Automatically created for marketplace bookings. Customize this template in your dashboard.",
        is_active: true,
      })
      .select()
      .single();

    if (tmplErr) throw tmplErr;
    templateId = tmpl.id;
  }

  // Get or create current version
  const { data: ver } = await supabase
    .from("template_versions")
    .select("id")
    .eq("template_id", templateId)
    .eq("is_current", true)
    .single();

  if (ver) return ver.id;

  // Create version 1
  const { data: newVer, error: verErr } = await supabase
    .from("template_versions")
    .insert({
      template_id: templateId,
      version: 1,
      content: { body: DEFAULT_LIABILITY_WAIVER },
      variables: [
        "customer_name",
        "customer_email",
        "booking_id",
        "listing_title",
        "date",
        "state",
      ],
      is_current: true,
    })
    .select()
    .single();

  if (verErr) throw verErr;
  return newVer.id;
}
