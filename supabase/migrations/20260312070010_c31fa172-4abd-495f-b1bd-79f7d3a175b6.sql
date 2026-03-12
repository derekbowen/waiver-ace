
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL,
  p_photo_storage_key text DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  env_record RECORD;
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
    photo_storage_key = p_photo_storage_key,
    ip_address = p_ip_address
  WHERE id = env_record.id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, p_ip_address, jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$$;
