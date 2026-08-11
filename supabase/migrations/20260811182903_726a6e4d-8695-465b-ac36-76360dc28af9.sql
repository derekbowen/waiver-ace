CREATE OR REPLACE FUNCTION public.email_queue_wake()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue') THEN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'email_queue_project_url';
    SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key';
    IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
      PERFORM cron.schedule(
        'process-email-queue',
        '5 seconds',
        format(
          $cron$select net.http_post(url:=%L, headers:=%L::jsonb, body:='{}'::jsonb)$cron$,
          v_url || '/functions/v1/process-email-queue',
          json_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key)::text
        )
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'pgmq' AND c.relname = 'q_auth_emails') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS email_queue_wake_auth ON pgmq.q_auth_emails';
    EXECUTE 'CREATE TRIGGER email_queue_wake_auth AFTER INSERT ON pgmq.q_auth_emails FOR EACH STATEMENT EXECUTE FUNCTION public.email_queue_wake()';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'pgmq' AND c.relname = 'q_transactional_emails') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS email_queue_wake_transactional ON pgmq.q_transactional_emails';
    EXECUTE 'CREATE TRIGGER email_queue_wake_transactional AFTER INSERT ON pgmq.q_transactional_emails FOR EACH STATEMENT EXECUTE FUNCTION public.email_queue_wake()';
  END IF;
END
$do$;