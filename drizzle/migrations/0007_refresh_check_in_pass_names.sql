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

  SELECT * INTO v_pass FROM public.check_in_passes WHERE envelope_id = v_env.id;
  IF v_pass.id IS NOT NULL THEN
    UPDATE public.check_in_passes
    SET covered_names = v_names
    WHERE id = v_pass.id;
    RETURN jsonb_build_object('success', true, 'pass_code', v_pass.pass_code);
  END IF;

  SELECT o.name INTO v_org_name FROM public.organizations o WHERE o.id = v_env.org_id;

  SELECT t.name, t.default_expiration_days INTO v_template_name, v_exp_days
  FROM public.template_versions tv
  JOIN public.templates t ON t.id = tv.template_id
  WHERE tv.id = v_env.template_version_id;

  LOOP
    v_attempt := v_attempt + 1;
    v_code := 'WVR-' || lpad((floor(random() * 9000) + 1000)::int::text, 4, '0')
      || '-' || substr(translate(encode(gen_random_bytes(4), 'base64'), '0123456789+/=ILO', 'ABCDEFGHJKMNPQR'), 1, 2);
    v_code := upper(v_code);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.check_in_passes WHERE pass_code = v_code);
    IF v_attempt > 20 THEN
      RETURN jsonb_build_object('error', 'code_generation_failed');
    END IF;
  END LOOP;

  INSERT INTO public.check_in_passes (
    org_id, envelope_id, pass_code, guest_name, covered_names,
    activity_name, org_name, valid_until
  ) VALUES (
    v_env.org_id, v_env.id, v_code,
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