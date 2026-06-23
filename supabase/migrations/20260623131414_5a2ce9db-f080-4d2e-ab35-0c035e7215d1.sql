
-- 1. Drop the legacy permissive signer-photos upload policy. The restrictive
-- "Signers can upload photo for valid envelope" policy remains in force.
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- 2. Capture signer IP server-side in sign_envelope. The new function ignores
-- any client-supplied p_ip_address and reads x-forwarded-for from the
-- PostgREST request headers, which the browser cannot forge.
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL,
  p_photo_storage_key text DEFAULT NULL,
  p_ip_address text DEFAULT NULL  -- ignored; kept for backward compatibility
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  env_record RECORD;
  v_count integer;
  v_headers jsonb;
  v_xff text;
  v_ip text;
BEGIN
  -- Pull client IP from PostgREST-forwarded request headers (not from caller args)
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
    ip_address = v_ip
  WHERE id = env_record.id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$$;

-- 3. Lock down SECURITY DEFINER functions that should not be callable
-- directly by anon or authenticated roles. We REVOKE EXECUTE rather than
-- recreate the functions so existing behaviour is preserved.
DO $$
DECLARE
  fn record;
  internal_names text[] := ARRAY[
    'add_credits',
    'add_credits_internal',
    'deduct_credit',
    'move_to_dlq',
    'enqueue_email',
    'read_email_batch',
    'delete_email',
    'bump_rate_limit',
    'cleanup_envelope_rate_limits',
    'update_storage_used',
    'update_updated_at_column',
    'handle_new_user',
    'create_wallet_for_new_org',
    'create_wallet_for_org',
    'generate_referral_code'
  ];
BEGIN
  FOR fn IN
    SELECT n.nspname AS schema_name,
           p.proname  AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY (internal_names)
  LOOP
    EXECUTE format(
      'REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated;',
      fn.func_name, fn.args
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role;',
      fn.func_name, fn.args
    );
  END LOOP;
END
$$;
