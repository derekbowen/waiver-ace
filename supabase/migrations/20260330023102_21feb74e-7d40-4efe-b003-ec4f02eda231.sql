
-- 1. Drop the overly permissive legacy signer-photos upload policy
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- 2. Tighten profiles UPDATE policy to prevent users from changing org_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      org_id IS NOT DISTINCT FROM (SELECT p.org_id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  );
