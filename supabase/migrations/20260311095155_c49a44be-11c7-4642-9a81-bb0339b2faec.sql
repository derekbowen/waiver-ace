
-- Restrict marketplace_integrations SELECT to admins only
DROP POLICY IF EXISTS "Users can view own org integrations" ON public.marketplace_integrations;
CREATE POLICY "Admins can view own org integrations"
  ON public.marketplace_integrations FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));
