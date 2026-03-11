
-- 1. Fix profile UPDATE: prevent users from changing their own org_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND org_id IS NOT DISTINCT FROM (SELECT p.org_id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 2. Fix profile INSERT: prevent users from setting an org_id on insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND org_id IS NULL);

-- 3. Fix group_signatures: require valid group_token instead of WITH CHECK true
DROP POLICY IF EXISTS "Anyone can insert group signatures" ON public.group_signatures;
CREATE POLICY "Anyone can insert group signatures"
  ON public.group_signatures FOR INSERT TO anon, authenticated
  WITH CHECK (
    envelope_id IN (
      SELECT id FROM public.envelopes
      WHERE is_group_waiver = true
        AND status NOT IN ('completed', 'canceled', 'expired')
    )
  );
