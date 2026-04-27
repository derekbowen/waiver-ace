-- Allow service role to delete any signer photo (for cleanup, GDPR, retention jobs)
CREATE POLICY "Service role can delete signer photos"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'signer-photos');

-- Allow org admins to delete signer photos for envelopes owned by their org
CREATE POLICY "Org admins can delete signer photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'signer-photos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
  AND (storage.foldername(name))[1] IN (
    SELECT e.id::text
    FROM public.envelopes e
    WHERE e.org_id = public.get_user_org_id(auth.uid())
  )
);