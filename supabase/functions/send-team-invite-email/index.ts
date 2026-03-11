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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData.user) throw new Error("Not authenticated");

    const { email, role, org_name } = await req.json();
    if (!email) throw new Error("email is required");

    const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
    const signupUrl = `${baseUrl}/login`;

    const html = buildEmail({
      previewText: `You've been invited to join ${org_name || "a team"} on Rental Waivers`,
      orgName: org_name || "Rental Waivers",
      greeting: `Hi there,`,
      sections: [
        { type: "text", content: `You've been invited to join <strong>${org_name || "a team"}</strong> on Rental Waivers as a <strong>${role || "team member"}</strong>.` },
        { type: "text", content: "Rental Waivers helps rental hosts collect liability waivers from guests — automatically and legally. Accept the invite below to get started." },
        { type: "button", content: "Accept Invite & Sign Up", href: signupUrl },
        { type: "small", content: "If you already have an account, just sign in with this email address and you'll be added to the team automatically." },
      ],
      footerText: "If you weren't expecting this invite, you can safely ignore this email.",
    });

    const result = await sendEmail({
      to: email,
      subject: `You're invited to join ${org_name || "a team"} on Rental Waivers`,
      html,
    });

    if (!result.success) throw new Error(result.error);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
