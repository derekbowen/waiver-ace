import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: authData } = await anonClient.auth.getUser(token);
    const user = authData.user;
    if (!user) throw new Error("Not authenticated");

    const { name, retention_years, referral_code } = await req.json();
    if (!name?.trim()) throw new Error("Organization name is required");

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check user doesn't already have an org
    const { data: profile } = await adminClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.org_id) {
      throw new Error("You already belong to an organization");
    }

    // Create org
    const { data: org, error: orgErr } = await adminClient
      .from("organizations")
      .insert({ name: name.trim(), retention_years: retention_years ?? 7 })
      .select()
      .single();
    if (orgErr) throw orgErr;

    // Link profile to org
    const { error: profErr } = await adminClient
      .from("profiles")
      .update({ org_id: org.id })
      .eq("user_id", user.id);
    if (profErr) throw profErr;

    // Assign admin role
    const { error: roleErr } = await adminClient
      .from("user_roles")
      .insert({ user_id: user.id, role: "admin", org_id: org.id });
    if (roleErr) throw roleErr;

    // Grant 250 free welcome credits
    const { error: creditErr } = await adminClient.rpc("add_credits_internal", {
      p_org_id: org.id,
      p_amount: 250,
      p_reference_id: `welcome_${org.id}`,
      p_type: "welcome_bonus",
      p_notes: "Welcome bonus - 250 free credits on signup",
    });
    if (creditErr) {
      console.error("Failed to grant welcome credits:", creditErr);
    }

    // Track referral if a referral_code was provided
    if (referral_code?.trim()) {
      try {
        const code = referral_code.trim().toUpperCase();
        // Find the referrer by their referral code
        const { data: referrerProfile } = await adminClient
          .from("profiles")
          .select("org_id, referral_code")
          .eq("referral_code", code)
          .single();

        if (referrerProfile?.org_id && referrerProfile.org_id !== org.id) {
          await adminClient.from("referrals").insert({
            referrer_org_id: referrerProfile.org_id,
            referred_org_id: org.id,
            referred_email: user.email || "",
            referral_code: code,
            status: "pending",
          });
          console.log(`Referral tracked: ${code} -> org ${org.id}`);
        }
      } catch (refErr) {
        console.error("Non-fatal: Failed to track referral:", refErr);
      }
    }

    // Send welcome email
    try {
      const welcomeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`;
      await fetch(welcomeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          org_name: name.trim(),
        }),
      });
    } catch (welcomeErr) {
      console.error("Failed to send welcome email:", welcomeErr);
    }

    return new Response(JSON.stringify({ org }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
