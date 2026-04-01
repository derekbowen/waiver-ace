
-- 1. Add default expiration days to templates
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS default_expiration_days integer;

-- 2. Create function for public waiver lookup by email
CREATE OR REPLACE FUNCTION public.find_waivers_by_email(p_email text)
RETURNS TABLE (
  envelope_id uuid,
  signer_name text,
  status text,
  signed_at timestamptz,
  created_at timestamptz,
  template_name text,
  org_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS envelope_id,
    e.signer_name,
    e.status::text,
    e.signed_at,
    e.created_at,
    t.name AS template_name,
    o.name AS org_name
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  JOIN public.organizations o ON o.id = e.org_id
  WHERE lower(e.signer_email) = lower(p_email)
    AND e.status IN ('signed', 'completed')
  ORDER BY e.signed_at DESC NULLS LAST
  LIMIT 20;
END;
$$;
