-- Fix: Restrict signer-photos uploads to active envelopes only
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;

CREATE POLICY "Signers can upload photo for valid envelope"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'signer-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.envelopes
    WHERE status NOT IN ('completed', 'canceled', 'expired')
  )
);