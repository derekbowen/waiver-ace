-- Remove the legacy unrestricted signer-photos upload policy flagged by the security scan.
-- The tightened "Signers can upload photo for valid envelope" policy (folder must match an
-- envelope in an active signing state) remains the only INSERT path.
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload signer photos" ON storage.objects;