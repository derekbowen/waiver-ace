CREATE OR REPLACE FUNCTION public.can_upload_signer_photo(_folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.envelopes e
    WHERE e.id::text = _folder
      AND e.status IN ('sent'::envelope_status, 'viewed'::envelope_status, 'draft'::envelope_status)
      AND (e.expires_at IS NULL OR e.expires_at > now())
  )
$$;

REVOKE ALL ON FUNCTION public.can_upload_signer_photo(text) FROM public;
GRANT EXECUTE ON FUNCTION public.can_upload_signer_photo(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Signers can upload photo for valid envelope" ON storage.objects;
CREATE POLICY "Signers can upload photo for valid envelope"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'signer-photos'
  AND public.can_upload_signer_photo((storage.foldername(name))[1])
);