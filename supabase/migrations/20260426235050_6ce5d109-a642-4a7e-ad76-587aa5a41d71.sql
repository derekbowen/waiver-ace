-- ============================================================
-- 1. Audit log for every envelope load (token-based)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.envelope_access_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid,
  signing_token uuid,
  ip_address  text,
  user_agent  text,
  caller_email text,
  outcome     text NOT NULL,           -- 'allowed' | 'rate_limited' | 'email_mismatch' | 'not_found'
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_envelope_access_log_token_time
  ON public.envelope_access_log (signing_token, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_envelope_access_log_ip_time
  ON public.envelope_access_log (ip_address, created_at DESC);

ALTER TABLE public.envelope_access_log ENABLE ROW LEVEL SECURITY;

-- Only service role can read or write the log; signers/orgs never see raw rows.
CREATE POLICY "Service role manages access log"
  ON public.envelope_access_log
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 2. Rate-limit counters (1-minute sliding windows)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.envelope_rate_limits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text NOT NULL,           -- 'ip_token_loads' | 'token_sign_attempts'
  key         text NOT NULL,           -- ip address or signing_token uuid
  window_start timestamptz NOT NULL,
  count       integer NOT NULL DEFAULT 0,
  UNIQUE (scope, key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_envelope_rate_limits_lookup
  ON public.envelope_rate_limits (scope, key, window_start DESC);

ALTER TABLE public.envelope_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
  ON public.envelope_rate_limits
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 3. Internal helper — bump a counter, return new value
-- ============================================================
CREATE OR REPLACE FUNCTION public.bump_rate_limit(
  p_scope text,
  p_key text
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window timestamptz := date_trunc('minute', now());
  v_count integer;
BEGIN
  INSERT INTO public.envelope_rate_limits (scope, key, window_start, count)
  VALUES (p_scope, p_key, v_window, 1)
  ON CONFLICT (scope, key, window_start)
  DO UPDATE SET count = envelope_rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- ============================================================
-- 4. Hardened get_envelope_by_token
--    - records every attempt
--    - rejects IPs over 30 distinct loads/min
--    - if caller is signed-in, requires email match for non-completed envelopes
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_envelope_by_token(
  p_token uuid,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS jsonb
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
  v_count integer;
BEGIN
  -- Per-IP rate limit (only when an IP is supplied)
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

  -- Lookup envelope
  SELECT e.id, e.signer_email, e.status::text
    INTO v_envelope_id, v_signer_email, v_status
  FROM public.envelopes e
  WHERE e.signing_token = p_token;

  IF v_envelope_id IS NULL THEN
    INSERT INTO public.envelope_access_log
      (signing_token, ip_address, user_agent, caller_email, outcome)
    VALUES (p_token, p_ip_address, p_user_agent, NULLIF(v_caller_email, ''), 'not_found');
    RETURN NULL;
  END IF;

  -- If a signed-in user is trying to "resume" an envelope, the email must match.
  -- Anonymous (token-only) access is still allowed — emailed signing links work.
  -- Completed/canceled envelopes can be loaded by anyone with the token (read-only).
  IF v_caller_email <> ''
     AND lower(v_signer_email) <> v_caller_email
     AND v_status NOT IN ('completed', 'signed', 'canceled', 'expired')
  THEN
    INSERT INTO public.envelope_access_log
      (envelope_id, signing_token, ip_address, user_agent, caller_email, outcome)
    VALUES (v_envelope_id, p_token, p_ip_address, p_user_agent, v_caller_email, 'email_mismatch');
    RETURN jsonb_build_object('error', 'email_mismatch',
      'message', 'This waiver was sent to a different email address. Sign in with the address it was sent to.');
  END IF;

  -- Build the standard payload (mirrors the previous version)
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

-- ============================================================
-- 5. Hardened sign_envelope (latest 6-arg overload only)
--    - per-token attempt cap (10/min)
-- ============================================================
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL,
  p_photo_storage_key text DEFAULT NULL,
  p_ip_address text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  env_record RECORD;
  v_count integer;
BEGIN
  -- Per-token attempt limit
  v_count := public.bump_rate_limit('token_sign_attempts', p_token::text);
  IF v_count > 10 THEN
    RETURN jsonb_build_object('success', false,
      'error', 'Too many sign attempts. Please wait a minute and retry.');
  END IF;

  SELECT id, status, template_version_id INTO env_record
  FROM public.envelopes
  WHERE signing_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope not found');
  END IF;

  IF env_record.status IN ('completed', 'signed', 'canceled', 'expired') THEN
    RETURN jsonb_build_object('success', false,
      'error', 'Envelope cannot be signed in its current state');
  END IF;

  UPDATE public.envelopes
  SET
    status = 'completed',
    signer_name = p_signer_name,
    signed_at = now(),
    user_agent = p_user_agent,
    signature_data = p_signature_data,
    photo_storage_key = p_photo_storage_key,
    ip_address = p_ip_address
  WHERE id = env_record.id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, p_ip_address,
          jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$$;

-- ============================================================
-- 6. Cleanup helper (safe to call from cron later)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_envelope_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.envelope_rate_limits
  WHERE window_start < now() - interval '10 minutes';
$$;