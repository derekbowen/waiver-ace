
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

  -- Admin can only grant credits to their own org
  IF p_org_id != public.get_user_org_id(auth.uid()) THEN
    RAISE EXCEPTION 'permission denied: wrong org';
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
