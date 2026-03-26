
-- Fix 1: Drop the public-role wallet update policy and ensure only authenticated role
DROP POLICY IF EXISTS "Admins can update wallet settings" ON public.wallets;

-- Fix 2: Fix function search_path for functions missing it
CREATE OR REPLACE FUNCTION public.create_wallet_for_new_org()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO wallets (org_id, credits) VALUES (NEW.id, 5);
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, notes)
  VALUES (NEW.id, 'starter_bonus', 5, 5, 'Welcome bonus — 5 free credits');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT pgmq.send(queue_name, payload); $function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $function$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT pgmq.delete(queue_name, message_id); $function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$function$;

-- Fix 3: Update storage policy to use authenticated role instead of allowing anon
DROP POLICY IF EXISTS "Org members can view signer photos" ON storage.objects;
CREATE POLICY "Org members can view signer photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signer-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT e.id::text FROM public.envelopes e
      WHERE e.org_id = public.get_user_org_id(auth.uid())
    )
  );
