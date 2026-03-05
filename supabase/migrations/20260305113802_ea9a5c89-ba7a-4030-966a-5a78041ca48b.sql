
-- Fix remaining permissive policy on envelope_events
DROP POLICY "Authenticated can insert events" ON public.envelope_events;

-- Only allow authenticated users in the org to insert events
CREATE POLICY "Org members can insert events" ON public.envelope_events
  FOR INSERT TO authenticated
  WITH CHECK (envelope_id IN (SELECT id FROM public.envelopes WHERE org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())));
