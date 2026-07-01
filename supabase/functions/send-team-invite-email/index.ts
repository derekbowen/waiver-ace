import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await userClient.auth.getUser(token);
    if (!authData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invite_id, email: bodyEmail } = await req.json();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller has admin role in their org
    const { data: profile } = await admin
      .from("profiles")
      .select("org_id")
      .eq("user_id", authData.user.id)
      .single();
    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: authData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up a real pending invite from team_invites; source email/role from DB, never trust caller
    let inviteQuery = admin
      .from("team_invites")
      .select("id, email, role, org_id")
      .eq("org_id", profile.org_id)
      .is("accepted_at", null);
    if (invite_id) {
      inviteQuery = inviteQuery.eq("id", invite_id);
    } else if (bodyEmail) {
      inviteQuery = inviteQuery.eq("email", String(bodyEmail).trim().toLowerCase());
    } else {
      return new Response(JSON.stringify({ error: "invite_id or email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invite } = await inviteQuery.maybeSingle();
    if (!invite) {
      return new Response(JSON.stringify({ error: "No matching pending invite" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up org name server-side
    const { data: org } = await admin
      .from("organizations")
      .select("name")
      .eq("id", invite.org_id)
      .single();
    const orgName = org?.name || "Rental Waivers";

    const baseUrl = Deno.env.get("SITE_URL") || "https://rentalwaivers.com";
    const signupUrl = `${baseUrl}/login`;

    const html = buildEmail({
      previewText: `You've been invited to join ${orgName} on Rental Waivers`,
      orgName,
      greeting: `Hi there,`,
      sections: [
        { type: "text", content: `You've been invited to join <strong>${orgName}</strong> on Rental Waivers as a <strong>${invite.role || "team member"}</strong>.` },
        { type: "text", content: "Rental Waivers helps rental hosts collect liability waivers from guests — automatically and legally. Accept the invite below to get started." },
        { type: "button", content: "Accept Invite & Sign Up", href: signupUrl },
        { type: "small", content: "If you already have an account, just sign in with this email address and you'll be added to the team automatically." },
      ],
      footerText: "If you weren't expecting this invite, you can safely ignore this email.",
    });

    const result = await sendEmail({
      to: invite.email,
      subject: `You're invited to join ${orgName} on Rental Waivers`,
      html,
    });

    if (!result.success) throw new Error(result.error);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-team-invite-email error:", err);
    return new Response(JSON.stringify({ error: "Failed to send invite" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
