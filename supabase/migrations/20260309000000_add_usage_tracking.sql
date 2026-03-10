-- Add subscription tracking to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS tier_override text,  -- set manually to bypass Stripe sync (e.g. for internal/promo accounts)
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Function to count envelopes in the current billing period for an org
CREATE OR REPLACE FUNCTION public.get_org_monthly_usage(p_org_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT count(*)::integer
  FROM public.envelopes
  WHERE org_id = p_org_id
    AND created_at >= coalesce(
      (SELECT current_period_start FROM public.organizations WHERE id = p_org_id),
      date_trunc('month', now())
    )
    AND status NOT IN ('canceled');
$$;
