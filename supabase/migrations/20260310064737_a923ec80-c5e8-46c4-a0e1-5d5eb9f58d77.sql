
-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own org wallet" ON public.wallets;

-- Create a restrictive UPDATE policy requiring admin role
CREATE POLICY "Admins can update own org wallet"
ON public.wallets
FOR UPDATE
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);
