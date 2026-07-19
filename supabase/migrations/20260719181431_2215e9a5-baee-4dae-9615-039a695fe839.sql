DO $test$
DECLARE
  v_individual jsonb;
  v_group jsonb;
BEGIN
  v_individual := public.sign_envelope(
    gen_random_uuid(),
    'Regression Test',
    '{}'::jsonb,
    'database-regression-check',
    NULL,
    NULL
  );
  IF v_individual->>'error' <> 'Envelope not found' THEN
    RAISE EXCEPTION 'Unexpected individual-signing result: %', v_individual;
  END IF;

  v_group := public.sign_group_waiver(
    'regression-test-token-' || gen_random_uuid()::text,
    'Regression Test',
    NULL,
    'RT',
    '{}'::jsonb,
    'database-regression-check',
    NULL
  );
  IF v_group->>'error' <> 'Group waiver link not found' THEN
    RAISE EXCEPTION 'Unexpected group-signing result: %', v_group;
  END IF;

  RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ROLLBACK_REGRESSION_TEST';
EXCEPTION
  WHEN SQLSTATE 'P0002' THEN
    IF SQLERRM <> 'ROLLBACK_REGRESSION_TEST' THEN
      RAISE;
    END IF;
END;
$test$;