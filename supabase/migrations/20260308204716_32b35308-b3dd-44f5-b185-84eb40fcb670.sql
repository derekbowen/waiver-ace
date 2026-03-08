-- Fix infinite recursion in profiles SELECT policy
DROP POLICY IF EXISTS "Users can view profiles in their org" ON public.profiles;

-- Security definer function to get user's org_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view other profiles in their org via security definer
CREATE POLICY "Users can view org members"
ON public.profiles
FOR SELECT
TO authenticated
USING (org_id IS NOT NULL AND org_id = public.get_user_org_id(auth.uid()));