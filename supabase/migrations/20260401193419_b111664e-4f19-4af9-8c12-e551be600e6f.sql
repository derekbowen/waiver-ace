
-- 1. Drop the legacy permissive signer-photos upload policy (again, ensuring it's gone)
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- 2. Ensure RLS is enabled on api_keys and webhook_endpoints
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- 3. Fix privilege escalation: tighten user_roles INSERT to verify target user belongs to admin's org
DROP POLICY IF EXISTS "Admins can insert org roles" ON public.user_roles;
CREATE POLICY "Admins can insert org roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND org_id = public.get_user_org_id(auth.uid())
    AND user_id IN (SELECT p.user_id FROM public.profiles p WHERE p.org_id = org_id)
  );
