-- Returns waivers (including signing_token for pending ones) for the
-- email address of the currently authenticated user. Lets returning
-- signers continue any pending waivers from their account.
CREATE OR REPLACE FUNCTION public.get_signer_waivers_authenticated()
RETURNS TABLE (
  envelope_id uuid,
  status text,
  signer_name text,
  signer_email text,
  booking_id text,
  listing_id text,
  signed_at timestamptz,
  created_at timestamptz,
  signing_token uuid,
  payload jsonb,
  template_name text,
  org_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  -- Pull the email from the JWT
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  IF v_email = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id              AS envelope_id,
    e.status::text    AS status,
    e.signer_name,
    e.signer_email,
    e.booking_id,
    e.listing_id,
    e.signed_at,
    e.created_at,
    -- Only expose the signing token for envelopes that still need action
    CASE
      WHEN e.status IN ('sent', 'viewed', 'draft') THEN e.signing_token
      ELSE NULL
    END               AS signing_token,
    e.payload,
    t.name            AS template_name,
    o.name            AS org_name
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t          ON t.id = tv.template_id
  JOIN public.organizations o      ON o.id = e.org_id
  WHERE lower(e.signer_email) = v_email
  ORDER BY
    -- Pending first, then most recent
    CASE WHEN e.status IN ('sent', 'viewed', 'draft') THEN 0 ELSE 1 END,
    e.created_at DESC
  LIMIT 100;
END;
$$;

REVOKE ALL ON FUNCTION public.get_signer_waivers_authenticated() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signer_waivers_authenticated() TO authenticated;