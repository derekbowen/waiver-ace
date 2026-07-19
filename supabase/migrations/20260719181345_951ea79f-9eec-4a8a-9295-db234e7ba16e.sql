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
  v_envelope_id uuid;
  v_status text;
  v_expires_at timestamptz;
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
    INTO v_envelope_id, v_status, v_expires_at, v_require_photo
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.group_token = p_group_token
    AND e.is_group_waiver = true
  FOR UPDATE OF e;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Group waiver link not found');
  END IF;

  IF v_status IN ('canceled', 'expired')
     OR (v_expires_at IS NOT NULL AND v_expires_at < now()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This group waiver link is no longer active');
  END IF;

  IF v_require_photo AND (p_photo_storage_key IS NULL OR length(trim(p_photo_storage_key)) = 0) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A photo is required to sign this waiver.');
  END IF;

  IF p_photo_storage_key IS NOT NULL
     AND p_photo_storage_key <> ''
     AND p_photo_storage_key NOT LIKE v_envelope_id::text || '/%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid signer photo path');
  END IF;

  INSERT INTO public.group_signatures (
    envelope_id, signer_name, signer_email, initials, signature_data,
    signed_at, user_agent, ip_address, photo_storage_key
  ) VALUES (
    v_envelope_id, trim(p_signer_name),
    NULLIF(lower(trim(COALESCE(p_signer_email, ''))), ''),
    trim(p_initials), COALESCE(p_signature_data, '{}'::jsonb),
    now(), p_user_agent, v_ip, NULLIF(p_photo_storage_key, '')
  )
  RETURNING id INTO v_signature_id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (v_envelope_id, 'group.member_signed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', trim(p_signer_name),
                             'signer_email', NULLIF(lower(trim(COALESCE(p_signer_email, ''))), '')));

  RETURN jsonb_build_object('success', true, 'envelope_id', v_envelope_id, 'signature_id', v_signature_id);
END;
$function$;

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
  v_envelope_id uuid;
  v_status text;
  v_template_version_id uuid;
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
    INTO v_envelope_id, v_status, v_template_version_id, v_require_photo
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.signing_token = p_token
  FOR UPDATE OF e;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope not found');
  END IF;

  IF v_status IN ('completed', 'signed', 'canceled', 'expired') THEN
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
  WHERE id = v_envelope_id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (v_envelope_id, 'envelope.completed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', v_envelope_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.sign_group_waiver(text, text, text, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_group_waiver(text, text, text, text, jsonb, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) TO anon, authenticated;