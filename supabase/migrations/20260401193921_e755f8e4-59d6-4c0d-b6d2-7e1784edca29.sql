
DROP POLICY IF EXISTS "Admins can insert org roles" ON public.user_roles;
CREATE POLICY "Admins can insert org roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND org_id = get_user_org_id(auth.uid())
    AND role <> 'admin'::app_role
    AND user_id IN (
      SELECT p.user_id FROM public.profiles p
      WHERE p.org_id = get_user_org_id(auth.uid())
    )
  );
