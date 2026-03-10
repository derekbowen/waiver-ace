DROP POLICY "Authenticated users can create orgs" ON public.organizations;

CREATE POLICY "Users without org can create one"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.org_id IS NOT NULL
  )
);