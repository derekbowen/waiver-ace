import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { envelope_id, group_signer_name, group_signer_email } = await req.json();

    if (!envelope_id) {
      return new Response(JSON.stringify({ error: "envelope_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", envelope.org_id)
      .single();

    const orgName = org?.name || "Rental Waivers";
    const signerName = group_signer_name || envelope.signer_name || "Guest";
    const signerEmail = group_signer_email || envelope.signer_email;
    const isGroup = envelope.is_group_waiver;
    const signedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const signedDateTime = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const emails: Promise<any>[] = [];

    // 1. Confirmation to signer
    if (signerEmail && signerEmail !== "group@placeholder.local") {
      const signerHtml = buildEmail({
        previewText: `Your waiver has been signed successfully — ${orgName}`,
        orgName,
        greeting: `Hi ${signerName},`,
        sections: [
          {
            type: 'callout',
            variant: 'success',
            content: 'Your waiver has been signed and recorded successfully.',
          },
          {
            type: 'text',
            content: 'Here are the details of your signed document:',
          },
          {
            type: 'table',
            rows: [
              { label: 'Signed by', value: signerName },
              { label: 'Date', value: signedDate },
              { label: 'Envelope ID', value: `<code style="font-family:monospace;font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${envelope_id.slice(0, 8)}…</code>` },
              ...(envelope.booking_id ? [{ label: 'Booking', value: envelope.booking_id }] : []),
            ],
          },
          {
            type: 'small',
            content: 'Please keep this email for your records. If you have questions about this waiver, contact the organization directly.',
          },
        ],
        footerText: `This confirmation was sent to ${signerEmail} because a waiver was signed on behalf of ${orgName}.`,
      });

      emails.push(
        sendEmail({
          to: signerEmail,
          subject: `✓ Waiver Signed — Confirmation from ${orgName}`,
          html: signerHtml,
        })
      );
    }

    // 2. Notification to admin(s)
    const { data: admins } = await supabase
      .from("profiles")
      .select("email")
      .eq("org_id", envelope.org_id);

    const adminEmails = (admins || []).map((a: any) => a.email).filter(Boolean);
    const origin = req.headers.get("origin") || "https://rentalwaivers.com";

    if (adminEmails.length > 0) {
      const adminHtml = buildEmail({
        previewText: `${signerName} just signed a waiver`,
        orgName,
        sections: [
          {
            type: 'heading',
            content: 'New Waiver Signed',
          },
          {
            type: 'text',
            content: `${isGroup ? "A guest in a group waiver" : `<strong>${signerName}</strong>`} just signed a waiver${envelope.booking_id ? ` for booking <strong>${envelope.booking_id}</strong>` : ""}.`,
          },
          {
            type: 'table',
            rows: [
              { label: 'Signer', value: signerName },
              ...(signerEmail && signerEmail !== "group@placeholder.local" ? [{ label: 'Email', value: signerEmail }] : []),
              { label: 'Type', value: isGroup ? 'Group Waiver' : 'Individual' },
              { label: 'Date', value: signedDateTime },
              ...(envelope.booking_id ? [{ label: 'Booking', value: envelope.booking_id }] : []),
            ],
          },
          {
            type: 'button',
            content: 'View in Dashboard',
            href: `${origin}/envelopes/${envelope_id}`,
          },
        ],
      });

      emails.push(
        sendEmail({
          to: adminEmails,
          subject: `Waiver Signed by ${signerName}${envelope.booking_id ? ` — Booking ${envelope.booking_id}` : ""}`,
          html: adminHtml,
        })
      );
    }

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
