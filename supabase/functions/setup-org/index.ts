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

  // Auth client to verify the caller
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

    const { name, retention_years } = await req.json();
    if (!name?.trim()) throw new Error("Organization name is required");

    // Admin client bypasses RLS
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
      .insert({ user_id: user.id, role: "admin" });
    if (roleErr) throw roleErr;

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
