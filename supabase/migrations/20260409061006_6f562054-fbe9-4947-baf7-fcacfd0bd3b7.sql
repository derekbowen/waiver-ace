
-- Fix 1: Change credit_disputes default status from 'approved' to 'pending'
ALTER TABLE public.credit_disputes ALTER COLUMN status SET DEFAULT 'pending';

-- Fix 2: Drop overly broad signer-photos upload policy (if it was re-created)
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;
