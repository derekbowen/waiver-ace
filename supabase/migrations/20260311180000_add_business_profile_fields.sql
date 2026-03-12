-- Add business profile fields to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_url TEXT;
