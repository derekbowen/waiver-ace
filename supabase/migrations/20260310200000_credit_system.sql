-- ============================================================
-- Credit-Based Billing System
-- Replaces the subscription/tier model with prepaid credits
-- ============================================================

-- Credit transaction type enum
CREATE TYPE credit_transaction_type AS ENUM (
  'purchase',
  'waiver_deduction',
  'group_deduction',
  'admin_adjustment',
  'refund',
  'starter_bonus'
);

-- Wallets table (one per org)
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  credits_remaining INT NOT NULL DEFAULT 0,
  overdraft_limit INT NOT NULL DEFAULT -10,
  -- Auto-recharge settings
  auto_recharge_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_recharge_threshold INT NOT NULL DEFAULT 10,
  auto_recharge_package TEXT,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_org_id ON public.wallets(org_id);

CREATE TRIGGER set_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Credit transactions table (audit log)
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type credit_transaction_type NOT NULL,
  credits_delta INT NOT NULL,
  balance_after INT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_credit_transactions_org_id ON public.credit_transactions(org_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(type);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Org members can view their wallet
CREATE POLICY "Users can view own org wallet"
  ON public.wallets FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

-- Admins can update auto-recharge settings only
CREATE POLICY "Admins can update wallet settings"
  ON public.wallets FOR UPDATE
  USING (
    org_id = get_user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- Org members can view their credit transactions
CREATE POLICY "Users can view own org credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

-- ============================================================
-- Atomic credit deduction function
-- Called by edge functions (service role) when creating envelopes
-- ============================================================

CREATE OR REPLACE FUNCTION deduct_credit(
  p_org_id UUID,
  p_reference_id TEXT DEFAULT NULL,
  p_type credit_transaction_type DEFAULT 'waiver_deduction'
)
RETURNS TABLE(success BOOLEAN, new_balance INT, needs_recharge BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_new_balance INT;
BEGIN
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

  -- Deduct
  v_new_balance := v_wallet.credits_remaining - 1;

  UPDATE wallets
  SET credits_remaining = v_new_balance
  WHERE id = v_wallet.id;

  -- Log transaction
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, reference_id)
  VALUES (p_org_id, p_type, -1, v_new_balance, p_reference_id);

  -- Check if auto-recharge is needed
  RETURN QUERY SELECT
    true,
    v_new_balance,
    (v_wallet.auto_recharge_enabled AND v_new_balance <= v_wallet.auto_recharge_threshold),
    NULL::TEXT;
END;
$$;

-- ============================================================
-- Add credits function
-- Called after Stripe payment confirmed or admin adjustment
-- ============================================================

CREATE OR REPLACE FUNCTION add_credits(
  p_org_id UUID,
  p_amount INT,
  p_reference_id TEXT DEFAULT NULL,
  p_type credit_transaction_type DEFAULT 'purchase',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, new_balance INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  -- Lock and update
  UPDATE wallets
  SET credits_remaining = credits_remaining + p_amount
  WHERE org_id = p_org_id
  RETURNING credits_remaining INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Log transaction
  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, p_amount, v_new_balance, p_reference_id, p_notes);

  RETURN QUERY SELECT true, v_new_balance;
END;
$$;

-- ============================================================
-- Auto-create wallet when org is created
-- ============================================================

CREATE OR REPLACE FUNCTION create_wallet_for_new_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO wallets (org_id, credits_remaining)
  VALUES (NEW.id, 5);

  INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, notes)
  VALUES (NEW.id, 'starter_bonus', 5, 5, 'Welcome bonus — 5 free credits');

  RETURN NEW;
END;
$$;

CREATE TRIGGER create_wallet_on_org_insert
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_new_org();

-- ============================================================
-- Create wallets for existing orgs that don't have one
-- ============================================================

INSERT INTO wallets (org_id, credits_remaining)
SELECT id, 5 FROM organizations
WHERE id NOT IN (SELECT org_id FROM wallets)
ON CONFLICT (org_id) DO NOTHING;

-- Insert starter bonus transactions for those
INSERT INTO credit_transactions (org_id, type, credits_delta, balance_after, notes)
SELECT w.org_id, 'starter_bonus', 5, 5, 'Migration bonus — 5 free credits'
FROM wallets w
WHERE NOT EXISTS (
  SELECT 1 FROM credit_transactions ct
  WHERE ct.org_id = w.org_id
);
