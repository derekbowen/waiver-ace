-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Org members can insert events" ON public.envelope_events;

-- Replace with a restricted policy that only allows known safe event types
CREATE POLICY "Org members can insert safe events"
ON public.envelope_events
FOR INSERT
TO authenticated
WITH CHECK (
  envelope_id IN (
    SELECT e.id FROM envelopes e
    WHERE e.org_id = get_user_org_id(auth.uid())
  )
  AND event_type IN ('reminder.sent', 'envelope.downloaded', 'envelope.resent', 'envelope.canceled')
);
