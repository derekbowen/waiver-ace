ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS allow_minors boolean NOT NULL DEFAULT true;

DO $$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef('public.get_envelope_by_token(text,text,text)'::regprocedure) INTO d;
  IF position('allow_minors' in d) = 0 THEN
    d := replace(d, $r$'require_photo', COALESCE(t.require_photo, false)$r$,
                    $r$'require_photo', COALESCE(t.require_photo, false), 'allow_minors', COALESCE(t.allow_minors, true)$r$);
    EXECUTE d;
  END IF;

  SELECT pg_get_functiondef('public.get_group_waiver_by_token(text,text)'::regprocedure) INTO d;
  IF position('allow_minors' in d) = 0 THEN
    d := replace(d, $r$COALESCE(t.require_photo, false) AS require_photo,$r$,
                    $r$COALESCE(t.require_photo, false) AS require_photo, COALESCE(t.allow_minors, true) AS allow_minors,$r$);
    d := replace(d, $r$'require_photo', env_record.require_photo,$r$,
                    $r$'require_photo', env_record.require_photo, 'allow_minors', env_record.allow_minors,$r$);
    EXECUTE d;
  END IF;
END $$;