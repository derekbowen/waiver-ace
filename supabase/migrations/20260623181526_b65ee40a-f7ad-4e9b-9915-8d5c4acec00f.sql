
-- 1) Tighten signer-photos INSERT policy: require envelope in active signing state, not just non-terminal
DROP POLICY IF EXISTS "Signers can upload photo for valid envelope" ON storage.objects;
CREATE POLICY "Signers can upload photo for valid envelope"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'signer-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT e.id::text FROM public.envelopes e
    WHERE e.status IN ('sent','viewed','draft')
      AND (e.expires_at IS NULL OR e.expires_at > now())
  )
);

-- 2) Restrict group_signatures SELECT to org admins only (signer_email + ip_address are PII)
DROP POLICY IF EXISTS "Users can view group signatures for own org envelopes" ON public.group_signatures;
CREATE POLICY "Admins can view group signatures for own org envelopes"
ON public.group_signatures FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND envelope_id IN (
    SELECT id FROM public.envelopes WHERE org_id = public.get_user_org_id(auth.uid())
  )
);

-- 3) Lock down SECURITY DEFINER functions: revoke PUBLIC EXECUTE, grant only what's needed
REVOKE EXECUTE ON FUNCTION public.find_waivers_by_email(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_envelope_by_token(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.view_envelope(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_org_id(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;

-- Functions that legitimately need anonymous-signer access
GRANT EXECUTE ON FUNCTION public.get_envelope_by_token(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.view_envelope(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_waiver_by_token(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_group_waiver(text, text, text, text, jsonb, text, text) TO anon, authenticated;

-- Authenticated-only helpers
GRANT EXECUTE ON FUNCTION public.find_waivers_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_signer_waivers_authenticated() TO authenticated;

-- RLS helpers - required by policies on multiple tables (called by both anon and authenticated)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_id(uuid) TO anon, authenticated;
