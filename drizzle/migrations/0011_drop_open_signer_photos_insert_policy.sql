-- Remove the leftover rule that let anyone upload any file into signer-photos.
-- The remaining insert rule ("Signers can upload photo for valid envelope") already
-- requires the photo to belong to a waiver that is actually open for signing.
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;