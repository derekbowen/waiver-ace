-- ============================================================
-- Variable Credit Pricing
-- Templates with premium features cost more credits per signing
-- Base: 1 credit | +1 branded | +1 photo | +1 video
-- ============================================================

-- Add premium feature columns to templates
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS require_video BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brand_color TEXT,
  ADD COLUMN IF NOT EXISTS brand_font TEXT;

-- organizations already has logo_url; add brand columns there too
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS brand_color TEXT,
  ADD COLUMN IF NOT EXISTS brand_font TEXT;

-- Add credits_charged to envelopes so we know what was charged
ALTER TABLE public.envelopes
  ADD COLUMN IF NOT EXISTS credits_charged INT NOT NULL DEFAULT 1;

-- Add credits_charged to group_signatures (for per-signer group deductions if needed)
-- group waivers charge once at creation, so this goes on envelopes only

-- ============================================================
-- Update deduct_credit to accept variable amount
-- ============================================================

CREATE OR REPLACE FUNCTION deduct_credit(
  p_org_id UUID,
  p_reference_id TEXT DEFAULT NULL,
  p_type credit_transaction_type DEFAULT 'waiver_deduction',
  p_amount INT DEFAULT 1,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INT, needs_recharge BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance INT;
  v_deduct INT;
BEGIN
  -- Ensure at least 1 credit deducted
  v_deduct := GREATEST(p_amount, 1);

  -- Lock wallet row
  SELECT * INTO v_wallet
  FROM wallets
  WHERE org_id = p_org_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, false, 'No wallet found for organization'::TEXT;
    RETURN;
  END IF;

  -- Check overdraft limit
  IF v_wallet.credits_remaining <= v_wallet.overdraft_limit THEN
    RETURN QUERY SELECT false, v_wallet.credits_remaining, false,
      'Waiver collection paused. Add credits to continue.'::TEXT;
    RETURN;
  END IF;

  -- Deduct variable amount
  v_new_balance := v_wallet.credits_remaining - v_deduct;

  UPDATE wallets
  SET credits_remaining = v_new_balance
  WHERE id = v_wallet.id;

  -- Log transaction with amount and notes
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, -v_deduct, v_new_balance, p_reference_id, p_notes);

  -- Check if auto-recharge is needed
  RETURN QUERY SELECT
    true,
    v_new_balance,
    (v_wallet.auto_recharge_enabled AND v_new_balance <= v_wallet.auto_recharge_threshold),
    NULL::TEXT;
END;
$$;
