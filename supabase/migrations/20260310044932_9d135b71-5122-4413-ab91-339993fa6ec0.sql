
-- ============================================================
-- FIX 1: Lock down anonymous envelope RLS
-- Remove overly broad anon SELECT/UPDATE policies, replace with
-- SECURITY DEFINER RPCs for signing operations
-- ============================================================

-- Drop the overly broad anon policies
DROP POLICY IF EXISTS "Anyone can view envelopes by signing token" ON public.envelopes;
DROP POLICY IF EXISTS "Anyone can update envelopes by signing token" ON public.envelopes;
DROP POLICY IF EXISTS "Anon can view envelope by signing token" ON public.envelopes;
DROP POLICY IF EXISTS "Anon can update envelope by signing token" ON public.envelopes;

-- Create a SECURITY DEFINER function to fetch envelope by signing token
CREATE OR REPLACE FUNCTION public.get_envelope_by_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', e.id,
    'status', e.status,
    'signer_name', e.signer_name,
    'signer_email', e.signer_email,
    'signing_token', e.signing_token,
    'payload', e.payload,
    'is_group_waiver', e.is_group_waiver,
    'group_token', e.group_token,
    'template_version_id', e.template_version_id,
    'template_content', tv.content,
    'template_variables', tv.variables
  ) INTO result
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  WHERE e.signing_token = p_token;

  RETURN result;
END;
$$;

-- Create a SECURITY DEFINER function to sign an envelope
CREATE OR REPLACE FUNCTION public.sign_envelope(
  p_token uuid,
  p_signer_name text,
  p_signature_data jsonb,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  env_record RECORD;
  result jsonb;
BEGIN
  -- Lock the row
  SELECT id, status, template_version_id INTO env_record
  FROM public.envelopes
  WHERE signing_token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope not found');
  END IF;

  IF env_record.status IN ('completed', 'signed', 'canceled', 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Envelope cannot be signed in its current state');
  END IF;

  UPDATE public.envelopes
  SET
    status = 'completed',
    signer_name = p_signer_name,
    signed_at = now(),
    user_agent = p_user_agent,
    signature_data = p_signature_data
  WHERE id = env_record.id;

  -- Log the event
  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent, metadata)
  VALUES (env_record.id, 'envelope.completed', p_user_agent, jsonb_build_object('signer_name', p_signer_name));

  RETURN jsonb_build_object('success', true, 'envelope_id', env_record.id);
END;
$$;

-- Create a SECURITY DEFINER function to mark envelope as viewed
CREATE OR REPLACE FUNCTION public.view_envelope(p_token uuid, p_user_agent text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.envelopes
  SET status = 'viewed'
  WHERE signing_token = p_token AND status = 'sent';

  INSERT INTO public.envelope_events (envelope_id, event_type, user_agent)
  SELECT id, 'envelope.viewed', p_user_agent
  FROM public.envelopes WHERE signing_token = p_token;
END;
$$;

-- Grant anon and authenticated access to these RPCs
GRANT EXECUTE ON FUNCTION public.get_envelope_by_token(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sign_envelope(uuid, text, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.view_envelope(uuid, text) TO anon, authenticated;

-- ============================================================
-- FIX 2: Restrict team invites to admins only
-- ============================================================

-- Drop all existing team_invites policies and recreate with admin check
DROP POLICY IF EXISTS "Org admins can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can view own org invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can insert own org invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can delete own org invites" ON public.team_invites;

CREATE POLICY "Admins can view org invites"
  ON public.team_invites FOR SELECT
  TO authenticated
  USING (
    org_id = get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can insert org invites"
  ON public.team_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete org invites"
  ON public.team_invites FOR DELETE
  TO authenticated
  USING (
    org_id = get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );
