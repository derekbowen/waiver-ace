-- Allow users to bootstrap their own admin role when creating their first org.
-- This fixes the chicken-and-egg problem where the "Admins can manage roles"
-- policy blocks new users from assigning themselves the initial admin role.
CREATE POLICY "Users can bootstrap own admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
  )
);
