
-- 1. Replace add_credits with admin-only version
CREATE OR REPLACE FUNCTION public.add_credits(p_org_id uuid, p_amount integer, p_reference_id text, p_type text, p_notes text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Only admins can call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  UPDATE public.wallets
  SET credits = credits + p_amount, updated_at = now()
  WHERE org_id = p_org_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    INSERT INTO public.wallets (org_id, credits)
    VALUES (p_org_id, p_amount)
    RETURNING credits INTO new_balance;
  END IF;

  INSERT INTO public.credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, p_amount, new_balance, p_reference_id, p_notes);

  RETURN new_balance;
END;
$$;

-- 2. Create a separate service-level function for edge functions (no auth check, only callable by service role)
CREATE OR REPLACE FUNCTION public.add_credits_internal(p_org_id uuid, p_amount integer, p_reference_id text, p_type text, p_notes text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.wallets
  SET credits = credits + p_amount, updated_at = now()
  WHERE org_id = p_org_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    INSERT INTO public.wallets (org_id, credits)
    VALUES (p_org_id, p_amount)
    RETURNING credits INTO new_balance;
  END IF;

  INSERT INTO public.credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, p_amount, new_balance, p_reference_id, p_notes);

  RETURN new_balance;
END;
$$;

-- Revoke public access to internal function, only service role should use it
REVOKE ALL ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) FROM authenticated;

-- 3. Drop the overpermissive anon SELECT policy on envelopes
DROP POLICY IF EXISTS "Signers can view envelope by token" ON public.envelopes;
