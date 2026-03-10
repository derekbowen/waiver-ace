
-- Create wallets table
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits integer NOT NULL DEFAULT 0,
  stripe_customer_id text,
  stripe_payment_method_id text,
  auto_recharge_enabled boolean NOT NULL DEFAULT false,
  auto_recharge_threshold integer NOT NULL DEFAULT 10,
  auto_recharge_package text NOT NULL DEFAULT 'pkg_200',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org wallet"
  ON public.wallets FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can update own org wallet"
  ON public.wallets FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  credits_delta integer NOT NULL,
  balance_after integer NOT NULL,
  reference_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Create add_credits function
CREATE OR REPLACE FUNCTION public.add_credits(
  p_org_id uuid,
  p_amount integer,
  p_reference_id text,
  p_type text,
  p_notes text DEFAULT NULL
)
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

-- Create a trigger to auto-create wallet when org is created
CREATE OR REPLACE FUNCTION public.create_wallet_for_org()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.wallets (org_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_org_created_create_wallet
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_org();

-- Create wallets for any existing orgs
INSERT INTO public.wallets (org_id)
SELECT id FROM public.organizations
ON CONFLICT DO NOTHING;
