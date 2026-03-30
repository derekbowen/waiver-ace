
-- ============================================================
-- FIX: has_role() - add org_id scoping to prevent cross-org escalation
-- ============================================================

-- Create a new org-scoped version of has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND org_id = get_user_org_id(_user_id)
  )
$$;

-- ============================================================
-- Dismiss scanner false positive: the "Anyone can upload signer photos" 
-- policy was already removed. Only the envelope-scoped policy exists.
-- ============================================================
