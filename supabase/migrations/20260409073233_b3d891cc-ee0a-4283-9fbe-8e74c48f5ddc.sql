-- Drop the overly permissive upload policy that allows anyone to upload to any path
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;
