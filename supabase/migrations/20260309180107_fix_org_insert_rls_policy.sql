-- Fix: "new row violates row-level security policy for table organizations"
--
-- The existing "Users without org can create one" policy has a subquery on the
-- profiles table that is subject to profiles RLS, creating a fragile cross-table
-- dependency. Replace it with a check using the SECURITY DEFINER function
-- get_user_org_id() which bypasses profiles RLS and directly reads the user's
-- org_id.

DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON public.organizations;

CREATE POLICY "Users without org can create one"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_org_id(auth.uid()) IS NULL
);
