import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

// This function should be invoked via a cron job (e.g., Supabase pg_cron or external scheduler)
// It handles two things:
// 1. Sends reminder emails for unsigned envelopes older than 24 hours
// 2. Expires envelopes past their expires_at date and notifies signers

serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results = { reminders_sent: 0, expired: 0, errors: [] as string[] };

  try {
    // --- Expire overdue envelopes ---
    const now = new Date().toISOString();
    const { data: overdue } = await supabase
      .from("envelopes")
      .select("id, signer_email, signer_name, org_id")
      .in("status", ["sent", "viewed"])
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (overdue && overdue.length > 0) {
      const ids = overdue.map((e: any) => e.id);
      await supabase.from("envelopes").update({ status: "expired" }).in("id", ids);
      for (const env of overdue) {
        await supabase.from("envelope_events").insert({
          envelope_id: env.id,
          event_type: "envelope.expired",
          metadata: { source: "auto" },
        });

        // Send expiration notification
        try {
          const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-envelope-notification`;
          await fetch(notifyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ envelope_id: env.id, event_type: "expired" }),
          });
        } catch (notifyErr: any) {
          results.errors.push(`expire-notify ${env.id}: ${notifyErr.message}`);
        }
      }
      results.expired = ids.length;
    }

    // --- Send reminders for unsigned envelopes ---
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pending } = await supabase
      .from("envelopes")
      .select("id, signer_email, signer_name, signing_token, org_id")
      .in("status", ["sent", "viewed"])
      .lt("created_at", oneDayAgo)
      .limit(50);

    if (!pending) {
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const env of pending) {
      // Check if we already sent a reminder in the last 24h
      const { data: recentReminder } = await supabase
        .from("envelope_events")
        .select("id")
        .eq("envelope_id", env.id)
        .eq("event_type", "envelope.reminder_sent")
        .gt("created_at", oneDayAgo)
        .limit(1);

      if (recentReminder && recentReminder.length > 0) continue;

      // Get org name
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", env.org_id)
        .single();

      const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
      const signingUrl = `${baseUrl}/sign/${env.signing_token}`;
      const orgName = org?.name || "Rental Waivers";
      const displayName = env.signer_name || "there";

      try {
        const html = buildEmail({
          previewText: `Reminder: Your waiver from ${orgName} is waiting for your signature`,
          orgName,
          greeting: `Hi ${displayName},`,
          sections: [
            { type: "text", content: "This is a friendly reminder that you have a waiver awaiting your signature." },
            { type: "button", content: "Review & Sign Now", href: signingUrl },
            { type: "small", content: "If you've already signed, please disregard this email." },
          ],
          footerText: "This is an automated reminder.",
        });

        const result = await sendEmail({
          to: env.signer_email,
          subject: `Reminder: Your waiver is waiting for your signature`,
          html,
        });

        if (result.success) {
          await supabase.from("envelope_events").insert({
            envelope_id: env.id,
            event_type: "envelope.reminder_sent",
            metadata: { source: "auto" },
          });
          results.reminders_sent++;
        }
      } catch (emailErr: any) {
        results.errors.push(`${env.id}: ${emailErr.message}`);
      }
    }
  } catch (err: any) {
    results.errors.push(err.message);
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
});
