
-- ============================================================
-- FIX: Webhook deliveries - restrict to admins only
-- ============================================================
DROP POLICY IF EXISTS "Admins can view webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Admins can view webhook deliveries"
ON public.webhook_deliveries FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND webhook_endpoint_id IN (
    SELECT we.id FROM webhook_endpoints we
    WHERE we.org_id = get_user_org_id(auth.uid())
  )
);

-- ============================================================
-- FIX: Wallet - restrict SELECT to admins for stripe fields,
-- or simpler: restrict entire wallet view to admins
-- ============================================================
DROP POLICY IF EXISTS "Users can view own org wallet" ON public.wallets;
CREATE POLICY "Admins can view own org wallet"
ON public.wallets FOR SELECT
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Also create a limited view for non-admin users (credits only)
CREATE POLICY "Members can view own org credit balance"
ON public.wallets FOR SELECT
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
);
-- Note: Both policies are permissive so any authenticated org member 
-- can see the wallet. To truly restrict stripe fields we need a view or 
-- function approach. For now, the check-wallet edge function already 
-- returns only safe fields. The real risk is direct API queries.
-- Let's actually restrict to admin only:
DROP POLICY IF EXISTS "Members can view own org credit balance" ON public.wallets;
