import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require a valid JWT (user or service-role)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    // Check for service-role key first
    const isServiceRole = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!isServiceRole) {
      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { envelope_id, event_type } = await req.json();
    if (!envelope_id || !event_type) throw new Error("envelope_id and event_type are required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: envelope, error: envErr } = await supabase
      .from("envelopes")
      .select("id, signer_email, signer_name, org_id, status")
      .eq("id", envelope_id)
      .single();

    if (envErr || !envelope) throw new Error("Envelope not found");

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", envelope.org_id)
      .single();

    const orgName = org?.name || "Rental Waivers";
    const displayName = envelope.signer_name || "there";

    if (event_type === "canceled") {
      const html = buildEmail({
        previewText: `Your waiver from ${orgName} has been canceled`,
        orgName,
        greeting: `Hi ${displayName},`,
        sections: [
          { type: "text", content: `The waiver that was sent to you by <strong>${orgName}</strong> has been canceled and is no longer valid.` },
          { type: "callout", content: "No action is needed on your part. If you have questions, please contact the sender directly.", variant: "info" },
        ],
        footerText: "This is an automated notification.",
      });

      await sendEmail({
        to: envelope.signer_email,
        subject: `Your waiver from ${orgName} has been canceled`,
        html,
      });
    } else if (event_type === "expired") {
      const html = buildEmail({
        previewText: `Your waiver from ${orgName} has expired`,
        orgName,
        greeting: `Hi ${displayName},`,
        sections: [
          { type: "text", content: `The waiver that was sent to you by <strong>${orgName}</strong> has expired because it wasn't signed in time.` },
          { type: "callout", content: "If you still need to sign this waiver, please contact the sender to request a new one.", variant: "warning" },
        ],
        footerText: "This is an automated notification.",
      });

      await sendEmail({
        to: envelope.signer_email,
        subject: `Your waiver from ${orgName} has expired`,
        html,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-envelope-notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
