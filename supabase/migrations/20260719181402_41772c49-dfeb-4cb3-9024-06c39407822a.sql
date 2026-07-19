DO $check$
DECLARE
  v_bad_count integer;
BEGIN
  SELECT count(*)
    INTO v_bad_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.prokind = 'f'
    AND n.nspname = 'public'
    AND p.proname IN ('sign_envelope', 'sign_group_waiver')
    AND p.prosrc ~* 'INTO[[:space:]]+(env_record|v_record)\.';

  IF v_bad_count <> 0 THEN
    RAISE EXCEPTION 'Uninitialized record-field assignment remains in an active signing function';
  END IF;
END;
$check$;