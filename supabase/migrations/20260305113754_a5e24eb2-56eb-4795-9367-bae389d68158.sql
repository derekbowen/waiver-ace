
-- Fix overly permissive anon policies on envelopes
DROP POLICY "Signers can view their envelope" ON public.envelopes;
DROP POLICY "Signers can update their envelope" ON public.envelopes;
DROP POLICY "System can insert events" ON public.envelope_events;

-- Signers can only access envelopes via signing_token (checked in edge function)
-- Use service role in edge functions for signing operations instead of anon
-- For envelope_events, also use service role in edge functions
