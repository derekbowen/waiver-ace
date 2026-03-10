-- Store a snapshot of the template content at signing time,
-- so even if the template version is deleted, the signed content is preserved.
ALTER TABLE public.envelopes ADD COLUMN IF NOT EXISTS content_snapshot jsonb;
