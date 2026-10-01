ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS storage_subscription_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS storage_plan_renews_at TIMESTAMPTZ;

COMMENT ON COLUMN public.wallets.storage_subscription_active IS 'True while the $5/month Unlimited Storage Vault subscription is active.';
COMMENT ON COLUMN public.wallets.storage_plan_renews_at IS 'Next renewal date of the Unlimited Storage Vault subscription.';