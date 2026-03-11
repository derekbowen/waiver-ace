
-- 1. Add require_photo to templates
ALTER TABLE public.templates ADD COLUMN require_photo boolean NOT NULL DEFAULT false;

-- 2. Add photo_storage_key to envelopes
ALTER TABLE public.envelopes ADD COLUMN photo_storage_key text;

-- 3. Add photo_storage_key to group_signatures
ALTER TABLE public.group_signatures ADD COLUMN photo_storage_key text;

-- 4. Create signer-photos storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signer-photos', 'signer-photos', false);

-- 5. Storage RLS policies: anyone can upload during signing
CREATE POLICY "Anyone can upload signer photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'signer-photos');

-- Authenticated org members can view photos for their org's envelopes
CREATE POLICY "Org members can view signer photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'signer-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT e.id::text FROM public.envelopes e
    WHERE e.org_id = public.get_user_org_id(auth.uid())
  )
);

-- 6. Update get_envelope_by_token to include require_photo
CREATE OR REPLACE FUNCTION public.get_envelope_by_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', e.id,
    'status', e.status,
    'signer_name', e.signer_name,
    'signer_email', e.signer_email,
    'signing_token', e.signing_token,
    'payload', e.payload,
    'is_group_waiver', e.is_group_waiver,
    'group_token', e.group_token,
    'template_version_id', e.template_version_id,
    'template_content', tv.content,
    'template_variables', tv.variables,
    'require_photo', COALESCE(t.require_photo, false)
  ) INTO result
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.signing_token = p_token;

  RETURN result;
END;
$$;

-- 7. Update sign_envelope to accept p_photo_storage_key
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL,
  p_photo_storage_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  env_record RECORD;
  result jsonb;
BEGIN
  SELECT id, status, template_version_id INTO env_record
  FROM public.envelopes
  WHERE signing_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope not found');
  END IF;

  IF env_record.status IN ('completed', 'signed', 'canceled', 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope cannot be signed in its current state');
  END IF;

  UPDATE public.envelopes
  SET
    status = 'completed',
    signer_name = p_signer_name,
    signed_at = now(),
    user_agent = p_user_agent,
    signature_data = p_signature_data,
    photo_storage_key = p_photo_storage_key
  WHERE id = env_record.id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$$;
