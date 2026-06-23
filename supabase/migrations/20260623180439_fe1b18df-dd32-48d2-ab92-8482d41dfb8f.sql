-- Ensure only group waivers receive group tokens, and backfill missing group links.
ALTER TABLE public.envelopes ALTER COLUMN group_token DROP DEFAULT;

CREATE OR REPLACE FUNCTION public.ensure_group_waiver_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_group_waiver = true AND NEW.group_token IS NULL THEN
    NEW.group_token := gen_random_uuid()::text;
  ELSIF NEW.is_group_waiver = false THEN
    NEW.group_token := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_group_waiver_token_trigger ON public.envelopes;
CREATE TRIGGER ensure_group_waiver_token_trigger
BEFORE INSERT OR UPDATE OF is_group_waiver, group_token ON public.envelopes
FOR EACH ROW
EXECUTE FUNCTION public.ensure_group_waiver_token();

UPDATE public.envelopes
SET group_token = gen_random_uuid()::text
WHERE is_group_waiver = true
  AND group_token IS NULL;

UPDATE public.envelopes
SET group_token = NULL
WHERE is_group_waiver = false
  AND group_token IS NOT NULL;

-- Public group waiver loader: returns only the data required to render/sign the public group waiver page.
CREATE OR REPLACE FUNCTION public.get_group_waiver_by_token(
  p_group_token text,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  env_record record;
BEGIN
  IF p_group_token IS NULL OR length(trim(p_group_token)) < 10 THEN
    RETURN NULL;
  END IF;

  SELECT e.id, e.status, e.expires_at, e.payload, e.signer_name, e.group_token,
         e.template_version_id, tv.content, tv.variables,
         COALESCE(t.require_photo, false) AS require_photo,
         COALESCE(t.require_video, false) AS require_video,
         t.video_url
    INTO env_record
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.group_token = p_group_token
    AND e.is_group_waiver = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF env_record.status IN ('canceled', 'expired')
     OR (env_record.expires_at IS NOT NULL AND env_record.expires_at < now()) THEN
    RETURN jsonb_build_object(
      'error', 'expired',
      'message', 'This group waiver link is no longer active. Please ask the host for a new link.'
    );
  END IF;

  IF env_record.status = 'sent' THEN
    UPDATE public.envelopes
    SET status = 'viewed'
    WHERE id = env_record.id
      AND status = 'sent';

    INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, metadata)
    VALUES (env_record.id, 'envelope.viewed', p_user_agent, jsonb_build_object('source', 'group_waiver_link'));
  END IF;

  SELECT jsonb_build_object(
    'id', env_record.id,
    'status', CASE WHEN env_record.status = 'sent' THEN 'viewed' ELSE env_record.status END,
    'payload', env_record.payload,
    'signer_name', env_record.signer_name,
    'group_token', env_record.group_token,
    'expires_at', env_record.expires_at,
    'template_version_id', env_record.template_version_id,
    'template_content', env_record.content,
    'template_variables', env_record.variables,
    'require_photo', env_record.require_photo,
    'require_video', env_record.require_video,
    'video_url', env_record.video_url,
    'signatures', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', gs.id,
          'signer_name', gs.signer_name,
          'signed_at', gs.signed_at
        ) ORDER BY gs.signed_at ASC
      )
      FROM public.group_signatures gs
      WHERE gs.envelope_id = env_record.id
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- Public group signer: validates the group token server-side before recording a signature.
CREATE OR REPLACE FUNCTION public.sign_group_waiver(
  p_group_token text,
  p_signer_name text,
  p_signer_email text DEFAULT NULL,
  p_initials text DEFAULT NULL,
  p_signature_data jsonb DEFAULT '{}'::jsonb,
  p_user_agent text DEFAULT NULL,
  p_photo_storage_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  env_record record;
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

  SELECT id, status, expires_at
    INTO env_record
  FROM public.envelopes
  WHERE group_token = p_group_token
    AND is_group_waiver = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Group waiver link not found');
  END IF;

  IF env_record.status IN ('canceled', 'expired')
     OR (env_record.expires_at IS NOT NULL AND env_record.expires_at < now()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This group waiver link is no longer active');
  END IF;

  IF p_photo_storage_key IS NOT NULL
     AND p_photo_storage_key <> ''
     AND p_photo_storage_key NOT LIKE env_record.id::text || '/%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid signer photo path');
  END IF;

  INSERT INTO public.group_signatures (
    envelope_id,
    signer_name,
    signer_email,
    initials,
    signature_data,
    signed_at,
    user_agent,
    ip_address,
    photo_storage_key
  ) VALUES (
    env_record.id,
    trim(p_signer_name),
    NULLIF(lower(trim(COALESCE(p_signer_email, ''))), ''),
    trim(p_initials),
    COALESCE(p_signature_data, '{}'::jsonb),
    now(),
    p_user_agent,
    v_ip,
    NULLIF(p_photo_storage_key, '')
  )
  RETURNING id INTO v_signature_id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (
    env_record.id,
    'group.member_signed',
    p_user_agent,
    v_ip,
    jsonb_build_object('signer_name', trim(p_signer_name), 'signer_email', NULLIF(lower(trim(COALESCE(p_signer_email, ''))), ''))
  );

  RETURN jsonb_build_object(
    'success', true,
    'envelope_id', env_record.id,
    'signature_id', v_signature_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_group_waiver_token() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_group_waiver_token() TO service_role;

REVOKE ALL ON FUNCTION public.get_group_waiver_by_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_group_waiver_by_token(text, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.sign_group_waiver(text, text, text, text, jsonb, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_group_waiver(text, text, text, text, jsonb, text, text) TO anon, authenticated, service_role;