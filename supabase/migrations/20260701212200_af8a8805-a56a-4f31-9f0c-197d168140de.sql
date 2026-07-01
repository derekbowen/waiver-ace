
CREATE OR REPLACE FUNCTION public.process_credit_dispute_atomic(
  p_user_id uuid,
  p_reason text,
  p_details text,
  p_credits_requested integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  v_amount integer;
  v_approved_count integer;
  v_new_balance integer;
BEGIN
  SELECT org_id INTO v_org_id FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_org');
  END IF;

  v_amount := GREATEST(1, LEAST(50, COALESCE(p_credits_requested, 0)));

  -- Lock the wallet row for this org to serialize concurrent dispute attempts
  PERFORM 1 FROM public.wallets WHERE org_id = v_org_id FOR UPDATE;

  SELECT count(*) INTO v_approved_count
  FROM public.credit_disputes
  WHERE org_id = v_org_id AND status = 'approved';

  IF v_approved_count >= 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'limit_reached');
  END IF;

  -- Insert dispute row first so the count is bumped before credits are granted
  INSERT INTO public.credit_disputes (
    org_id, user_id, reason, details, credits_requested, credits_granted, status
  ) VALUES (
    v_org_id, p_user_id,
    substring(coalesce(p_reason, '') from 1 for 200),
    NULLIF(substring(coalesce(p_details, '') from 1 for 1000), ''),
    v_amount, v_amount, 'approved'
  );

  UPDATE public.wallets SET credits = credits + v_amount, updated_at = now()
  WHERE org_id = v_org_id
  RETURNING credits INTO v_new_balance;

  INSERT INTO public.credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (v_org_id, 'refund', v_amount, v_new_balance,
          'dispute-auto-' || extract(epoch from now())::bigint::text,
          'Auto-reimbursement: ' || substring(coalesce(p_reason, '') from 1 for 100));

  RETURN jsonb_build_object(
    'success', true,
    'credits_granted', v_amount,
    'new_balance', v_new_balance,
    'remaining_disputes', 2 - (v_approved_count + 1)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_credit_dispute_atomic(uuid, text, text, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.process_credit_dispute_atomic(uuid, text, text, integer) TO service_role;
