-- Add require_signing flag to templates
-- When true, the marketplace integration should block booking confirmation until the waiver is signed
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS require_signing boolean NOT NULL DEFAULT false;
