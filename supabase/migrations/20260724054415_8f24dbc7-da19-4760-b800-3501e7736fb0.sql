DROP FUNCTION IF EXISTS public.sign_envelope(uuid, text, jsonb, text);
DROP FUNCTION IF EXISTS public.sign_envelope(uuid, text, jsonb, text, text);

REVOKE ALL ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) TO anon, authenticated;

DO $check$
DECLARE
  v_overload_count integer;
  v_bad_count integer;
BEGIN
  SELECT count(*) INTO v_overload_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'sign_envelope';

  IF v_overload_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one sign_envelope function, found %', v_overload_count;
  END IF;

  SELECT count(*) INTO v_bad_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('sign_envelope', 'sign_group_waiver')
    AND p.prosrc ~* 'INTO[[:space:]]+(env_record|v_record)\.';

  IF v_bad_count <> 0 THEN
    RAISE EXCEPTION 'Signing function regression check failed';
  END IF;
END;
$check$;