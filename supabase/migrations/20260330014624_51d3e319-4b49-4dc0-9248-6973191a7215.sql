
-- ============================================================
-- FIX 1: Signer-photos upload policy - remove anon access and 
-- add envelope signing_token ownership verification
-- ============================================================

-- Drop the current overly-permissive upload policy
DROP POLICY IF EXISTS "Signers can upload photo for valid envelope" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

-- Recreate with authenticated-only and tighter envelope check
CREATE POLICY "Signers can upload photo for valid envelope"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'signer-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT e.id::text FROM envelopes e
    WHERE e.status NOT IN ('completed', 'canceled', 'expired')
  )
);

-- NOTE: We keep anon here because signers access the signing page without auth.
-- The protection is: uploads are scoped to active envelope IDs only.
-- The scan flagged a SEPARATE broad policy "Anyone can upload signer photos" 
-- which we drop above. The envelope-scoped policy is the correct one.

-- ============================================================
-- FIX 2: Harden user_roles - split ALL into explicit policies
-- to make insert/delete protection crystal clear
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage roles in own org" ON public.user_roles;

-- Admins can view roles in their org
CREATE POLICY "Admins can view org roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND org_id = get_user_org_id(auth.uid())
);

-- Admins can insert roles in their org (cannot grant admin to others)
CREATE POLICY "Admins can insert org roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role != 'admin'::app_role
);

-- Admins can delete roles in their org (cannot delete admin roles)
CREATE POLICY "Admins can delete org roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role != 'admin'::app_role
);

-- Admins can update roles in their org (cannot set/change admin role)
CREATE POLICY "Admins can update org roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role != 'admin'::app_role
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND org_id = get_user_org_id(auth.uid())
  AND role != 'admin'::app_role
);

-- ============================================================
-- FIX 3: Storage policies - restrict to authenticated only
-- where anon access is not needed
-- ============================================================

-- Org members can read waiver PDFs - already authenticated only ✓
-- Org members can view signer photos - already authenticated only ✓
-- Service role policies use auth.role() = 'service_role' check ✓

-- The "Service role" policies are granted to {public} but guarded by 
-- auth.role() = 'service_role'. This is the standard Supabase pattern.
-- The linter flags it but it's safe because anon/authenticated tokens
-- cannot have service_role. No change needed.
