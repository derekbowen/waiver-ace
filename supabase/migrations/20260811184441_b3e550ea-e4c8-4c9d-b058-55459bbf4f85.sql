CREATE OR REPLACE FUNCTION public.schema_fingerprint()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'generated_at', now(),
    'columns', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT c.table_name || '.' || c.column_name AS k,
               c.data_type || '|' || c.is_nullable || '|' || COALESCE(c.column_default, '-') AS v
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON t.table_schema = c.table_schema AND t.table_name = c.table_name
         AND t.table_type = 'BASE TABLE'
        WHERE c.table_schema = 'public'
      ) s
    ), '{}'::jsonb),
    'functions', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS k,
               md5(pg_get_functiondef(p.oid)) AS v
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.prokind = 'f'
      ) s
    ), '{}'::jsonb),
    'triggers', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT c.relname || '.' || tg.tgname AS k,
               md5(pg_get_triggerdef(tg.oid)) AS v
        FROM pg_trigger tg
        JOIN pg_class c ON c.oid = tg.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND NOT tg.tgisinternal
      ) s
    ), '{}'::jsonb),
    'policies', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT pol.tablename || '.' || pol.policyname AS k,
               md5(pol.cmd || '|' || COALESCE(pol.roles::text, '') || '|' ||
                   COALESCE(pol.qual, '') || '|' || COALESCE(pol.with_check, '')) AS v
        FROM pg_policies pol
        WHERE pol.schemaname = 'public'
      ) s
    ), '{}'::jsonb),
    'rls_enabled', COALESCE((
      SELECT jsonb_object_agg(c.relname, c.relrowsecurity)
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    ), '{}'::jsonb),
    'enums', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT t.typname AS k, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS v
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
      ) s
    ), '{}'::jsonb),
    'grants', COALESCE((
      SELECT jsonb_object_agg(k, v) FROM (
        SELECT g.table_name || '.' || g.grantee AS k,
               string_agg(DISTINCT g.privilege_type, ',' ORDER BY g.privilege_type) AS v
        FROM information_schema.role_table_grants g
        WHERE g.table_schema = 'public'
          AND g.grantee IN ('anon', 'authenticated', 'service_role')
        GROUP BY g.table_name, g.grantee
      ) s
    ), '{}'::jsonb),
    'seed_state', jsonb_build_object(
      'email_send_state', (SELECT count(*) FROM public.email_send_state),
      'organizations', (SELECT count(*) FROM public.organizations),
      'templates', (SELECT count(*) FROM public.templates),
      'template_versions', (SELECT count(*) FROM public.template_versions),
      'profiles', (SELECT count(*) FROM public.profiles),
      'user_roles', (SELECT count(*) FROM public.user_roles),
      'wallets', (SELECT count(*) FROM public.wallets)
    )
  );
$$;

REVOKE ALL ON FUNCTION public.schema_fingerprint() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.schema_fingerprint() TO service_role;