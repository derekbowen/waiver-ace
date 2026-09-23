-- 1. QR code signage records (one unique code per generated sign)
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT 'Waiver QR code',
  location_note text,
  is_active boolean NOT NULL DEFAULT true,
  credits_charged integer NOT NULL DEFAULT 0,
  scan_count integer NOT NULL DEFAULT 0,
  last_scanned_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qr_codes_org_idx ON public.qr_codes(org_id);
CREATE INDEX IF NOT EXISTS qr_codes_template_idx ON public.qr_codes(template_id);

GRANT SELECT, UPDATE ON public.qr_codes TO authenticated;
GRANT ALL ON public.qr_codes TO service_role;

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their QR codes"
  ON public.qr_codes FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Org members can update their QR codes"
  ON public.qr_codes FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()))
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Service role manages QR codes"
  ON public.qr_codes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Let kiosk signers record their real email at signing time.
-- Signature payload may carry signer_email; if the envelope still holds the
-- kiosk placeholder address we promote the guest's real email onto it so the
-- host's archive and the completion email both use it.
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
  v_current_email text;
  v_new_email text;
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

  SELECT e.id, e.status, e.template_version_id, COALESCE(t.require_photo, false), e.signer_email
    INTO v_envelope_id, v_status, v_template_version_id, v_require_photo, v_current_email
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

  -- Kiosk/QR envelopes start with a placeholder address. Only then may the
  -- signer supply their own email; normal envelopes keep the host's address.
  IF v_current_email = 'kiosk@placeholder.local' THEN
    v_new_email := lower(trim(COALESCE(p_signature_data->>'signer_email', '')));
    IF v_new_email = '' OR position('@' in v_new_email) < 2 THEN
      RETURN jsonb_build_object('success', false,
        'error', 'Please enter a valid email address so we can send your signed copy.');
    END IF;
  END IF;

  UPDATE public.envelopes
  SET status = 'completed',
      signer_name = p_signer_name,
      signer_email = COALESCE(v_new_email, signer_email),
      signed_at = now(),
      user_agent = p_user_agent,
      signature_data = p_signature_data,
      photo_storage_key = p_photo_storage_key,
      ip_address = v_ip
  WHERE id = v_envelope_id;

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, ip_address, metadata)
  VALUES (v_envelope_id, 'envelope.completed', p_user_agent, v_ip,
          jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', v_envelope_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) TO anon, authenticated;