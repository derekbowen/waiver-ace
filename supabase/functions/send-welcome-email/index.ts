import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { buildEmail, sendEmail } from "../_shared/email-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Internal-only: require service-role key
  const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (authToken !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, full_name, org_name } = await req.json();
    if (!email) throw new Error("email is required");

    const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
    const displayName = full_name || "there";

    const html = buildEmail({
      previewText: `Welcome to Rental Waivers — your account is ready`,
      orgName: "Rental Waivers",
      greeting: `Hi ${displayName},`,
      sections: [
        { type: "heading", content: "Welcome to Rental Waivers! 🎉" },
        { type: "text", content: `Your organization <strong>${org_name || "your team"}</strong> is set up and ready to go. You've been granted <strong>250 free credits</strong> to get started.` },
        { type: "divider" },
        { type: "text", content: "Here's how to get started:" },
        { type: "table", rows: [
          { label: "1. Create a template", value: "Build your waiver document" },
          { label: "2. Send waivers", value: "Email them to guests" },
          { label: "3. Track signatures", value: "Monitor from your dashboard" },
        ]},
        { type: "button", content: "Go to Dashboard", href: `${baseUrl}/dashboard` },
        { type: "callout", content: "Need help? Check out our knowledge base for guides and best practices.", variant: "info" },
      ],
      footerText: "You're receiving this because you just created an account on Rental Waivers.",
    });

    const result = await sendEmail({
      to: email,
      subject: "Welcome to Rental Waivers — here's how to get started",
      html,
    });

    if (!result.success) throw new Error(result.error);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-welcome-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
