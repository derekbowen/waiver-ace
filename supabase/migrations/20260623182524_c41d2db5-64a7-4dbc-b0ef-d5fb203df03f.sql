UPDATE public.envelopes
SET group_token = gen_random_uuid()::text
WHERE is_group_waiver = true
  AND group_token IS NULL
  AND status IN ('draft', 'sent', 'viewed')
  AND (expires_at IS NULL OR expires_at > now());