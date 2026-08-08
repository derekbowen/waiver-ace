-- envelope_events is an append-only audit log for app users.
-- Only the backend service role may update/delete (corrections, retention purges).
DROP POLICY IF EXISTS "Service role can manage envelope events" ON public.envelope_events;
CREATE POLICY "Service role can manage envelope events"
ON public.envelope_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

GRANT ALL ON public.envelope_events TO service_role;

COMMENT ON TABLE public.envelope_events IS 'Append-only audit log. Org members may insert/select only; no UPDATE/DELETE policies exist for anon/authenticated by design. Only service_role may modify or purge rows.';