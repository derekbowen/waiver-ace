import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function should be invoked via a cron job (e.g., Supabase pg_cron or external scheduler)
// It handles two things:
// 1. Sends reminder emails for unsigned envelopes older than 24 hours
// 2. Expires envelopes past their expires_at date

serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  const results = { reminders_sent: 0, expired: 0, errors: [] as string[] };

  try {
    // --- Expire overdue envelopes ---
    const now = new Date().toISOString();
    const { data: overdue } = await supabase
      .from("envelopes")
      .select("id")
      .in("status", ["sent", "viewed"])
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (overdue && overdue.length > 0) {
      const ids = overdue.map((e: any) => e.id);
      await supabase.from("envelopes").update({ status: "expired" }).in("id", ids);
      for (const id of ids) {
        await supabase.from("envelope_events").insert({
          envelope_id: id,
          event_type: "envelope.expired",
          metadata: { source: "auto" },
        });
      }
      results.expired = ids.length;
    }

    // --- Send reminders for unsigned envelopes ---
    // Envelopes that are sent/viewed, created > 24h ago, and haven't had a reminder event in the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pending } = await supabase
      .from("envelopes")
      .select("id, signer_email, signer_name, signing_token, org_id")
      .in("status", ["sent", "viewed"])
      .lt("created_at", oneDayAgo)
      .limit(50);

    if (!pending || !RESEND_API_KEY) {
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

      const baseUrl = Deno.env.get("SITE_URL") || "https://waiverflow.app";
      const signingUrl = `${baseUrl}/sign/${env.signing_token}`;
      const orgName = org?.name || "Rental Waivers";
      const displayName = env.signer_name || "there";

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${orgName} <onboarding@resend.dev>`,
            to: [env.signer_email],
            subject: `Reminder: Your waiver is waiting for your signature`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h2 style="font-size: 20px;">${orgName}</h2>
                <p>Hi ${displayName},</p>
                <p>This is a friendly reminder that you have a waiver awaiting your signature.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${signingUrl}" style="display: inline-block; background-color: #0f172a; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    Review & Sign Now
                  </a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                  If you've already signed, please disregard this email.
                </p>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
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
