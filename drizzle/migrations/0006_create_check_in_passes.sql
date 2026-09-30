CREATE TABLE IF NOT EXISTS public.check_in_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  envelope_id uuid NOT NULL REFERENCES public.envelopes(id) ON DELETE CASCADE,
  pass_code text NOT NULL UNIQUE,
  guest_name text NOT NULL,
  covered_names text[] NOT NULL DEFAULT '{}',
  activity_name text NOT NULL DEFAULT 'Waiver & Release',
  org_name text NOT NULL DEFAULT '',
  valid_until timestamptz,
  checked_in_at timestamptz,
  check_in_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS check_in_passes_envelope_idx ON public.check_in_passes(envelope_id);

GRANT SELECT ON public.check_in_passes TO authenticated;
GRANT ALL ON public.check_in_passes TO service_role;

ALTER TABLE public.check_in_passes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view their passes" ON public.check_in_passes;
CREATE POLICY "Org members can view their passes"
ON public.check_in_passes FOR SELECT TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()));

-- Issue (or fetch) a check-in pass for a signed waiver, by its signing token
-- or its group token. Runs as definer so unauthenticated guests can call it.
CREATE OR REPLACE FUNCTION public.issue_check_in_pass(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_env public.envelopes%ROWTYPE;
  v_pass public.check_in_passes%ROWTYPE;
  v_org_name text;
  v_template_name text;
  v_exp_days integer;
  v_names text[];
  v_code text;
  v_attempt integer := 0;
BEGIN
  SELECT * INTO v_env FROM public.envelopes
  WHERE (p_token ~ '^[0-9a-fA-F-]{36}$' AND signing_token = p_token::uuid)
     OR group_token = p_token
  LIMIT 1;

  IF v_env.id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF v_env.status NOT IN ('signed', 'completed') THEN
    RETURN jsonb_build_object('error', 'not_signed');
  END IF;

  SELECT * INTO v_pass FROM public.check_in_passes WHERE envelope_id = v_env.id;
  IF v_pass.id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'pass_code', v_pass.pass_code);
  END IF;

  SELECT o.name INTO v_org_name FROM public.organizations o WHERE o.id = v_env.org_id;

  SELECT t.name, t.default_expiration_days INTO v_template_name, v_exp_days
  FROM public.template_versions tv
  JOIN public.templates t ON t.id = tv.template_id
  WHERE tv.id = v_env.template_version_id;

  v_names := ARRAY[COALESCE(v_env.signer_name, 'Guest')];

  SELECT v_names || COALESCE(array_agg(gs.signer_name), '{}')
  INTO v_names
  FROM public.group_signatures gs
  WHERE gs.envelope_id = v_env.id;

  IF v_env.signature_data ? 'minors' THEN
    SELECT v_names || COALESCE(array_agg(m->>'name'), '{}')
    INTO v_names
    FROM jsonb_array_elements(v_env.signature_data->'minors') m
    WHERE COALESCE(m->>'name', '') <> '';
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    v_code := 'WVR-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
      || '-' || substr(translate(encode(gen_random_bytes(4), 'base64'), '0123456789+/=ILO', 'ABCDEFGHJKMNPQR'), 1, 2);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.check_in_passes WHERE pass_code = v_code);
    IF v_attempt > 20 THEN
      RETURN jsonb_build_object('error', 'code_generation_failed');
    END IF;
  END LOOP;

  INSERT INTO public.check_in_passes (
    org_id, envelope_id, pass_code, guest_name, covered_names,
    activity_name, org_name, valid_until
  ) VALUES (
    v_env.org_id, v_env.id, upper(v_code),
    COALESCE(v_env.signer_name, 'Guest'),
    v_names,
    COALESCE(v_template_name, 'Waiver & Release'),
    COALESCE(v_org_name, ''),
    COALESCE(v_env.signed_at, now()) + (COALESCE(v_exp_days, 365) || ' days')::interval
  )
  RETURNING * INTO v_pass;

  RETURN jsonb_build_object('success', true, 'pass_code', v_pass.pass_code);
END;
$$;

REVOKE ALL ON FUNCTION public.issue_check_in_pass(text) FROM public;
GRANT EXECUTE ON FUNCTION public.issue_check_in_pass(text) TO anon, authenticated, service_role;

-- Public read of a pass for the guest-facing pass screen.
CREATE OR REPLACE FUNCTION public.get_check_in_pass(p_code text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
       'pass_code', p.pass_code,
       'guest_name', p.guest_name,
       'covered_names', to_jsonb(p.covered_names),
       'activity_name', p.activity_name,
       'org_name', p.org_name,
       'valid_until', p.valid_until,
       'checked_in_at', p.checked_in_at
     )
     FROM public.check_in_passes p
     WHERE upper(p.pass_code) = upper(trim(p_code))),
    jsonb_build_object('error', 'not_found')
  );
$$;

REVOKE ALL ON FUNCTION public.get_check_in_pass(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_check_in_pass(text) TO anon, authenticated, service_role;

-- Staff scan: verify a pass belongs to the caller's business and log the check-in.
CREATE OR REPLACE FUNCTION public.verify_check_in_pass(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pass public.check_in_passes%ROWTYPE;
  v_org uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'unauthorized');
  END IF;

  v_org := public.get_user_org_id(auth.uid());

  SELECT * INTO v_pass FROM public.check_in_passes
  WHERE upper(pass_code) = upper(trim(p_code));

  IF v_pass.id IS NULL OR v_pass.org_id <> v_org THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF v_pass.valid_until IS NOT NULL AND v_pass.valid_until < now() THEN
    RETURN jsonb_build_object(
      'valid', false, 'reason', 'expired',
      'guest_name', v_pass.guest_name,
      'valid_until', v_pass.valid_until
    );
  END IF;

  UPDATE public.check_in_passes
  SET checked_in_at = now(), check_in_count = check_in_count + 1
  WHERE id = v_pass.id
  RETURNING * INTO v_pass;

  RETURN jsonb_build_object(
    'valid', true,
    'pass_code', v_pass.pass_code,
    'guest_name', v_pass.guest_name,
    'covered_names', to_jsonb(v_pass.covered_names),
    'activity_name', v_pass.activity_name,
    'valid_until', v_pass.valid_until,
    'envelope_id', v_pass.envelope_id,
    'check_in_count', v_pass.check_in_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_check_in_pass(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_check_in_pass(text) TO authenticated, service_role;