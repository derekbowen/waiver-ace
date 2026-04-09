-- 1. Drop the overly broad signer-photos INSERT policy
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- 2. Prevent admin self-modification on user_roles
-- Drop and recreate INSERT policy with user_id <> auth.uid() guard
DROP POLICY IF EXISTS "Admins can insert org roles" ON public.user_roles;
CREATE POLICY "Admins can insert org roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role <> 'admin'::app_role
  AND user_id <> auth.uid()
  AND user_id IN (SELECT p.user_id FROM profiles p WHERE p.org_id = get_user_org_id(auth.uid()))
);

-- Drop and recreate UPDATE policy with user_id <> auth.uid() guard
DROP POLICY IF EXISTS "Admins can update org roles" ON public.user_roles;
CREATE POLICY "Admins can update org roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role <> 'admin'::app_role
  AND user_id <> auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role <> 'admin'::app_role
  AND user_id <> auth.uid()
);

-- Drop and recreate DELETE policy with user_id <> auth.uid() guard
DROP POLICY IF EXISTS "Admins can delete org roles" ON public.user_roles;
CREATE POLICY "Admins can delete org roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role <> 'admin'::app_role
  AND user_id <> auth.uid()
);