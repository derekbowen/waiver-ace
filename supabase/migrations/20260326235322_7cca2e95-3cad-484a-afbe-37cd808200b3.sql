
CREATE OR REPLACE FUNCTION public.add_credits(p_org_id uuid, p_amount integer, p_reference_id text DEFAULT NULL::text, p_type credit_transaction_type DEFAULT 'purchase'::credit_transaction_type, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, new_balance integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_new_balance INT;
BEGIN
  UPDATE wallets SET credits = credits + p_amount
  WHERE org_id = p_org_id RETURNING credits INTO v_new_balance;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 0; RETURN; END IF;
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, p_amount, v_new_balance, p_reference_id, p_notes);
  RETURN QUERY SELECT true, v_new_balance;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_credit(p_org_id uuid, p_reference_id text DEFAULT NULL::text, p_type credit_transaction_type DEFAULT 'waiver_deduction'::credit_transaction_type, p_amount integer DEFAULT 1, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, new_balance integer, needs_recharge boolean, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance INT;
  v_deduct INT;
BEGIN
  v_deduct := GREATEST(p_amount, 1);
  SELECT * INTO v_wallet FROM wallets WHERE org_id = p_org_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, false, 'No wallet found for organization'::TEXT; RETURN;
  END IF;
  IF v_wallet.credits <= 0 THEN
    RETURN QUERY SELECT false, v_wallet.credits, false,
      'Waiver collection paused. Add credits to continue.'::TEXT; RETURN;
  END IF;
  v_new_balance := v_wallet.credits - v_deduct;
  UPDATE wallets SET credits = v_new_balance WHERE id = v_wallet.id;
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, -v_deduct, v_new_balance, p_reference_id, p_notes);
  RETURN QUERY SELECT true, v_new_balance,
    (v_wallet.auto_recharge_enabled AND v_new_balance <= v_wallet.auto_recharge_threshold), NULL::TEXT;
END;
$function$;
