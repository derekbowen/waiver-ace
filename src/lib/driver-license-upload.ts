import { supabase } from "@/integrations/supabase/client";
export interface LicenseAttachment { license_storage_key: string; license_upload_consent_at: string }
export async function uploadDriverLicense(file: File | null, consent: boolean, token: string, group: boolean): Promise<LicenseAttachment | undefined> {
  if (!file) return undefined;
  if (!consent) throw new Error("Please consent to private storage of your driver's license, or remove the image.");
  const form = new FormData();
  form.set("file", file); form.set("consent", "true"); form.set("token", token); form.set("group", String(group));
  const { data, error } = await supabase.functions.invoke("driver-license", { body: form });
  if (error || !data?.storage_key) throw new Error(data?.error || "License upload failed. Please try again.");
  return { license_storage_key: data.storage_key, license_upload_consent_at: data.consent_at };
}