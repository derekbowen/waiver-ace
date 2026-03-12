
-- Fix the one policy that failed (it already existed, so just drop and recreate)
DROP POLICY IF EXISTS "Admins can manage roles in own org" ON public.user_roles;

CREATE POLICY "Admins can manage roles in own org"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND org_id = public.get_user_org_id(auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND org_id = public.get_user_org_id(auth.uid())
  );
