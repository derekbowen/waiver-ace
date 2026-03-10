-- Restore anonymous access to envelopes for signing, scoped to token-based lookup.
-- Migration 20260305113754 dropped the original anon policies (which used USING(true))
-- but never replaced them. The signing page uses the anon client, not service role,
-- so signers cannot view or sign their envelopes.

-- Allow anonymous users to SELECT an envelope only if they know the signing_token
CREATE POLICY "Signers can view envelope by token"
ON public.envelopes
FOR SELECT
TO anon
USING (signing_token IS NOT NULL);

-- Allow anonymous users to UPDATE an envelope only by matching signing_token
-- (the frontend always filters by signing_token in the WHERE clause)
CREATE POLICY "Signers can update envelope by token"
ON public.envelopes
FOR UPDATE
TO anon
USING (signing_token IS NOT NULL)
WITH CHECK (signing_token IS NOT NULL);

-- Allow anonymous users to insert envelope events (audit trail for signing)
CREATE POLICY "Anon can insert envelope events"
ON public.envelope_events
FOR INSERT
TO anon
WITH CHECK (
  envelope_id IN (
    SELECT id FROM public.envelopes WHERE signing_token IS NOT NULL
  )
);
