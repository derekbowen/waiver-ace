CREATE OR REPLACE FUNCTION public.get_envelope_by_token(
  p_token text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  v_caller_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_signer_email text;
  v_envelope_id  uuid;
  v_status text;
  v_source text;
  v_count integer;
BEGIN
  IF p_ip_address IS NOT NULL AND p_ip_address <> '' THEN
    v_count := public.bump_rate_limit('ip_token_loads', p_ip_address);
    IF v_count > 30 THEN
      INSERT INTO public.envelope_access_log
        (signing_token, ip_address, user_agent, caller_email, outcome)
      VALUES (p_token, p_ip_address, p_user_agent, NULLIF(v_caller_email, ''), 'rate_limited');
      RETURN jsonb_build_object('error', 'rate_limited',
        'message', 'Too many requests. Please wait a minute and try again.');
    END IF;
  END IF;

  SELECT e.id, e.signer_email, e.status::text, COALESCE(e.payload->>'source', '')
    INTO v_envelope_id, v_signer_email, v_status, v_source
  FROM public.envelopes e
  WHERE e.signing_token = p_token;

  IF v_envelope_id IS NULL THEN
    INSERT INTO public.envelope_access_log
      (signing_token, ip_address, user_agent, caller_email, outcome)
    VALUES (p_token, p_ip_address, p_user_agent, NULLIF(v_caller_email, ''), 'not_found');
    RETURN NULL;
  END IF;

  -- Skip email-match for kiosk-originated envelopes (placeholder signer email,
  -- meant to be filled in by the in-person guest after they tap "Start Signing").
  IF v_caller_email <> ''
     AND lower(v_signer_email) <> v_caller_email
     AND v_status NOT IN ('completed', 'signed', 'canceled', 'expired')
     AND v_source <> 'kiosk'
     AND v_signer_email <> 'kiosk@placeholder.local'
  THEN
    INSERT INTO public.envelope_access_log
      (envelope_id, signing_token, ip_address, user_agent, caller_email, outcome)
    VALUES (v_envelope_id, p_token, p_ip_address, p_user_agent, v_caller_email, 'email_mismatch');
    RETURN jsonb_build_object('error', 'email_mismatch',
      'message', 'This waiver was sent to a different email address. Sign in with the address it was sent to.');
  END IF;

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
  JOIN public.templates t          ON t.id = tv.template_id
  WHERE e.signing_token = p_token;

  INSERT INTO public.envelope_access_log
    (envelope_id, signing_token, ip_address, user_agent, caller_email, outcome)
  VALUES (v_envelope_id, p_token, p_ip_address, p_user_agent, NULLIF(v_caller_email, ''), 'allowed');

  RETURN result;
END;
$$;