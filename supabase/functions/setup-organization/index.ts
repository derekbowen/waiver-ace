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

  // Use service role to bypass RLS — needed to insert org, update profile, and assign admin role
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user already has an org
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.org_id) {
      throw new Error("User already belongs to an organization");
    }

    const { name, retention_years } = await req.json();
    if (!name || !name.trim()) throw new Error("Organization name is required");

    // 1. Create the organization
    const { data: org, error: orgErr } = await supabaseClient
      .from("organizations")
      .insert({ name: name.trim(), retention_years: retention_years ?? 7 })
      .select()
      .single();
    if (orgErr) throw new Error(`Failed to create organization: ${orgErr.message}`);

    // 2. Link the user's profile to the new org
    const { error: profErr } = await supabaseClient
      .from("profiles")
      .update({ org_id: org.id })
      .eq("user_id", user.id);
    if (profErr) {
      // Rollback: delete the org we just created
      await supabaseClient.from("organizations").delete().eq("id", org.id);
      throw new Error(`Failed to update profile: ${profErr.message}`);
    }

    // 3. Assign admin role
    const { error: roleErr } = await supabaseClient
      .from("user_roles")
      .insert({ user_id: user.id, role: "admin" });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      // Rollback: unlink profile and delete org
      await supabaseClient.from("profiles").update({ org_id: null }).eq("user_id", user.id);
      await supabaseClient.from("organizations").delete().eq("id", org.id);
      throw new Error(`Failed to assign admin role: ${roleErr.message}`);
    }

    return new Response(JSON.stringify({ org_id: org.id, name: org.name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
