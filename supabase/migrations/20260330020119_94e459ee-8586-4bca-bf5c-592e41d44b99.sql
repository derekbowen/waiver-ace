-- Error 1: Drop legacy permissive signer-photos upload policy
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- Error 2: Recreate user_roles INSERT policy (same logic, ensures it's the only one)
DROP POLICY IF EXISTS "Admins can insert org roles" ON public.user_roles;
CREATE POLICY "Admins can insert org roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND org_id = get_user_org_id(auth.uid())
    AND role <> 'admin'::app_role
  );

-- Warning: Protect team_invites UPDATE so only the invited user can accept
CREATE POLICY "Invited user can accept invite"
  ON public.team_invites
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));