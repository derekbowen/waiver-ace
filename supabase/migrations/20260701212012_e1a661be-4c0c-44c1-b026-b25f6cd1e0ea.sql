
-- 1. Enforce require_photo server-side in sign_group_waiver
CREATE OR REPLACE FUNCTION public.sign_group_waiver(
  p_group_token text,
  p_signer_name text,
  p_signer_email text DEFAULT NULL::text,
  p_initials text DEFAULT NULL::text,
  p_signature_data jsonb DEFAULT '{}'::jsonb,
  p_user_agent text DEFAULT NULL::text,
  p_photo_storage_key text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  env_record record;
  v_require_photo boolean := false;
  v_headers jsonb;
  v_xff text;
  v_ip text;
  v_count integer;
  v_signature_id uuid;
BEGIN
  IF p_group_token IS NULL OR length(trim(p_group_token)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid group waiver link');
  END IF;
  IF p_signer_name IS NULL OR length(trim(p_signer_name)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Full legal name is required');
  END IF;
  IF p_initials IS NULL OR length(trim(p_initials)) < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Initials are required');
  END IF;

  v_count := public.bump_rate_limit('group_sign_attempts', p_group_token);
  IF v_count > 60 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many signing attempts. Please wait a minute and retry.');
  END IF;

  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN others THEN
    v_headers := NULL;
  END;
  IF v_headers IS NOT NULL THEN
    v_xff := v_headers->>'x-forwarded-for';
    IF v_xff IS NOT NULL AND length(v_xff) > 0 THEN
      v_ip := trim(split_part(v_xff, ',', 1));
    ELSE
      v_ip := v_headers->>'cf-connecting-ip';
    END IF;
  END IF;

  SELECT e.id, e.status, e.expires_at, COALESCE(t.require_photo, false)
    INTO env_record.id, env_record.status, env_record.expires_at, v_require_photo
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.group_token = p_group_token
    AND e.is_group_waiver = true
  FOR UPDATE OF e;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Group waiver link not found');
  END IF;

  IF env_record.status IN ('canceled', 'expired')
     OR (env_record.expires_at IS NOT NULL AND env_record.expires_at < now()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This group waiver link is no longer active');
  END IF;

  -- Enforce required photo server-side
  IF v_require_photo AND (p_photo_storage_key IS NULL OR length(trim(p_photo_storage_key)) = 0) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A photo is required to sign this waiver.');
  END IF;

  IF p_photo_storage_key IS NOT NULL
     AND p_photo_storage_key <> ''
     AND p_photo_storage_key NOT LIKE env_record.id::text || '/%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid signer photo path');
  END IF;

  INSERT INTO public.group_signatures (
    envelope_id, signer_name, signer_email, initials, signature_data,
    signed_at, user_agent, ip_address, photo_storage_key
  ) VALUES (
    env_record.id, trim(p_signer_name),
    NULLIF(lower(trim(COALESCE(p_signer_email, ''))), ''),
    trim(p_initials), COALESCE(p_signature_data, '{}'::jsonb),
    now(), p_user_agent, v_ip, NULLIF(p_photo_storage_key, '')
  )
  RETURNING id INTO v_signature_id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (env_record.id, 'group.member_signed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', trim(p_signer_name),
                             'signer_email', NULLIF(lower(trim(COALESCE(p_signer_email, ''))), '')));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id, 'signature_id', v_signature_id);
END;
$function$;

-- 2. Enforce require_photo server-side in sign_envelope
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL::text,
  p_photo_storage_key text DEFAULT NULL::text,
  p_ip_address text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  env_record RECORD;
  v_require_photo boolean := false;
  v_count integer;
  v_headers jsonb;
  v_xff text;
  v_ip text;
BEGIN
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
  EXCEPTION WHEN others THEN
    v_headers := NULL;
  END;
  IF v_headers IS NOT NULL THEN
    v_xff := v_headers->>'x-forwarded-for';
    IF v_xff IS NOT NULL AND length(v_xff) > 0 THEN
      v_ip := trim(split_part(v_xff, ',', 1));
    ELSE
      v_ip := v_headers->>'cf-connecting-ip';
    END IF;
  END IF;

  v_count := public.bump_rate_limit('token_sign_attempts', p_token::text);
  IF v_count > 10 THEN
    RETURN jsonb_build_object('success', false,
      'error', 'Too many sign attempts. Please wait a minute and retry.');
  END IF;

  SELECT e.id, e.status, e.template_version_id, COALESCE(t.require_photo, false)
    INTO env_record.id, env_record.status, env_record.template_version_id, v_require_photo
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.signing_token = p_token
  FOR UPDATE OF e;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope not found');
  END IF;

  IF env_record.status IN ('completed', 'signed', 'canceled', 'expired') THEN
    RETURN jsonb_build_object('success', false,
      'error', 'Envelope cannot be signed in its current state');
  END IF;

  IF v_require_photo AND (p_photo_storage_key IS NULL OR length(trim(p_photo_storage_key)) = 0) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A photo is required to sign this waiver.');
  END IF;

  UPDATE public.envelopes
  SET status = 'completed', signer_name = p_signer_name, signed_at = now(),
      user_agent = p_user_agent, signature_data = p_signature_data,
      photo_storage_key = p_photo_storage_key, ip_address = v_ip
  WHERE id = env_record.id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$function$;

-- 3. Revoke public execute from internal helper / trigger / admin-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.get_signer_waivers_authenticated() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, credit_transaction_type, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_credit(uuid, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_credit(uuid, text, credit_transaction_type, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_rate_limit(text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_envelope_rate_limits() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_wallet_for_new_org() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_wallet_for_org() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_storage_used() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_group_waiver_token() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.view_envelope(uuid, text) FROM authenticated;

-- 4. Add UPDATE policy on org-documents storage
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'org-documents'
  AND (storage.foldername(name))[1] = (get_user_org_id(auth.uid()))::text
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'org-documents'
  AND (storage.foldername(name))[1] = (get_user_org_id(auth.uid()))::text
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Ensure no unrestricted upload policy exists on signer-photos
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload signer photos" ON storage.objects;
