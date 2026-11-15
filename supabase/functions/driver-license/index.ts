import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { licenseImageType, LICENSE_MAX_BYTES, validLicenseUpload } from "../_shared/licenseValidation.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async req => {
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(503, { error: "License storage is unavailable" });
  const db = createClient(url, key);
  try {
    if (req.headers.get("Content-Type")?.includes("application/json")) {
      const { envelope_id, storage_key } = await req.json();
      const bearer = req.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
      const { data: auth, error: authError } = await db.auth.getUser(bearer);
      if (authError || !auth.user) return reply(401, { error: "Sign in to view driver licenses" });
      const { data: profile } = await db.from("profiles").select("org_id").eq("user_id", auth.user.id).single();
      const { data: env } = await db.from("envelopes").select("id,org_id,signature_data").eq("id", envelope_id).single();
      if (!env || !profile?.org_id || env.org_id !== profile.org_id) return reply(403, { error: "Access denied" });
      const { data: role } = await db.from("user_roles").select("id").eq("user_id", auth.user.id).eq("org_id", env.org_id).eq("role", "admin").limit(1);
      if (!role?.length) return reply(403, { error: "Only organization admins can view driver licenses" });
      if (typeof storage_key !== "string" || !storage_key.startsWith(`${env.org_id}/${env.id}/`)) return reply(403, { error: "Access denied" });
      const { data: sigs, error: sigError } = await db.from("group_signatures").select("signature_data").eq("envelope_id", env.id);
      if (sigError) throw sigError;
      const attached = [env.signature_data, ...(sigs || []).map(s => s.signature_data)].some(s => s?.driver_verification?.license_storage_key === storage_key);
      if (!attached) return reply(403, { error: "License is not attached to this waiver" });
      const { data, error } = await db.storage.from("driver-licenses").createSignedUrl(storage_key, 60);
      if (error) throw error;
      return reply(200, { url: data.signedUrl });
    }

    const length = Number(req.headers.get("Content-Length") || 0);
    if (length > LICENSE_MAX_BYTES + 65536) return reply(413, { error: "License image must be 5 MB or smaller" });
    const form = await req.formData();
    const token = form.get("token"), group = form.get("group") === "true", file = form.get("file");
    if (typeof token !== "string" || token.length > 100 || !(file instanceof File) || !validLicenseUpload(file.size, form.get("consent") === "true")) return reply(400, { error: "Consent and a license image up to 5 MB are required" });
    const { data: env, error: envError } = await db.from("envelopes")
      .select("id,org_id,status,expires_at,is_group_waiver,template_versions(content)")
      .eq(group ? "group_token" : "signing_token", token).single();
    if (envError || !env || (group && !env.is_group_waiver)) return reply(403, { error: "Invalid signing link" });
    if (["canceled", "expired"].includes(env.status) || (!group && ["completed", "signed"].includes(env.status)) || (env.expires_at && Date.parse(env.expires_at) <= Date.now())) return reply(403, { error: "This signing link is no longer active" });
    const version = env.template_versions as unknown as { content?: { body?: string } };
    if (!version?.content?.body?.includes("GOLF CART RENTAL AGREEMENT & LIABILITY WAIVER")) return reply(403, { error: "License uploads are only available for golf cart waivers" });
    const { data: count, error: limitError } = await db.rpc("bump_rate_limit", { p_scope: "driver_license_upload", p_key: env.id });
    if (limitError) throw limitError;
    if (Number(count) > 10) return reply(429, { error: "Too many uploads. Please wait a minute" });
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = licenseImageType(bytes);
    if (!type) return reply(400, { error: "Upload a JPEG, PNG or WebP license image" });
    const extension = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
    const path = `${env.org_id}/${env.id}/${crypto.randomUUID()}.${extension}`;
    const consentAt = new Date().toISOString();
    const { error } = await db.storage.from("driver-licenses").upload(path, bytes, { contentType: type, upsert: false, metadata: { consent_at: consentAt } });
    if (error) throw error;
    // Never return image bytes or a download URL to a public signer.
    return reply(200, { storage_key: path, consent_at: consentAt });
  } catch {
    return reply(400, { error: "Unable to process this license request. Please try again" });
  }
});