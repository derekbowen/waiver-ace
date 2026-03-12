
-- ============================================================
-- 1. Convert ALL restrictive RLS policies to PERMISSIVE
-- ============================================================

-- api_keys
DROP POLICY IF EXISTS "Admins can manage API keys" ON public.api_keys;
CREATE POLICY "Admins can manage API keys" ON public.api_keys FOR ALL TO authenticated
USING ((org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

-- credit_transactions
DROP POLICY IF EXISTS "Users can view own org credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can view own org transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own org transactions" ON public.credit_transactions FOR SELECT TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- email_send_log
DROP POLICY IF EXISTS "Service role can insert send log" ON public.email_send_log;
CREATE POLICY "Service role can insert send log" ON public.email_send_log FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Service role can read send log" ON public.email_send_log;
CREATE POLICY "Service role can read send log" ON public.email_send_log FOR SELECT TO public
USING (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Service role can update send log" ON public.email_send_log;
CREATE POLICY "Service role can update send log" ON public.email_send_log FOR UPDATE TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- email_send_state
DROP POLICY IF EXISTS "Service role can manage send state" ON public.email_send_state;
CREATE POLICY "Service role can manage send state" ON public.email_send_state FOR ALL TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- email_unsubscribe_tokens
DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can insert tokens" ON public.email_unsubscribe_tokens FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Service role can mark tokens as used" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can mark tokens as used" ON public.email_unsubscribe_tokens FOR UPDATE TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Service role can read tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can read tokens" ON public.email_unsubscribe_tokens FOR SELECT TO public
USING (auth.role() = 'service_role'::text);

-- envelope_events
DROP POLICY IF EXISTS "Org members can insert events" ON public.envelope_events;
CREATE POLICY "Org members can insert events" ON public.envelope_events FOR INSERT TO authenticated
WITH CHECK (envelope_id IN (SELECT envelopes.id FROM envelopes WHERE envelopes.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())));

DROP POLICY IF EXISTS "Org members can view envelope events" ON public.envelope_events;
CREATE POLICY "Org members can view envelope events" ON public.envelope_events FOR SELECT TO authenticated
USING (envelope_id IN (SELECT envelopes.id FROM envelopes WHERE envelopes.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())));

-- envelopes
DROP POLICY IF EXISTS "Admins can manage envelopes" ON public.envelopes;
CREATE POLICY "Admins can manage envelopes" ON public.envelopes FOR ALL TO authenticated
USING ((org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all org envelopes" ON public.envelopes;
CREATE POLICY "Org members can view envelopes" ON public.envelopes FOR SELECT TO authenticated
USING (org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid()));

-- group_signatures
DROP POLICY IF EXISTS "Anyone can insert group signatures" ON public.group_signatures;
CREATE POLICY "Anyone can insert group signatures" ON public.group_signatures FOR INSERT TO anon, authenticated
WITH CHECK (envelope_id IN (SELECT envelopes.id FROM envelopes WHERE envelopes.is_group_waiver = true AND envelopes.status <> ALL (ARRAY['completed'::envelope_status, 'canceled'::envelope_status, 'expired'::envelope_status])));

DROP POLICY IF EXISTS "Users can view group signatures for own org envelopes" ON public.group_signatures;
CREATE POLICY "Users can view group signatures for own org envelopes" ON public.group_signatures FOR SELECT TO authenticated
USING (envelope_id IN (SELECT envelopes.id FROM envelopes WHERE envelopes.org_id = get_user_org_id(auth.uid())));

-- marketplace_integrations
DROP POLICY IF EXISTS "Admins can insert org integrations" ON public.marketplace_integrations;
CREATE POLICY "Admins can insert org integrations" ON public.marketplace_integrations FOR INSERT TO authenticated
WITH CHECK ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update org integrations" ON public.marketplace_integrations;
CREATE POLICY "Admins can update org integrations" ON public.marketplace_integrations FOR UPDATE TO authenticated
USING ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view own org integrations" ON public.marketplace_integrations;
CREATE POLICY "Admins can view own org integrations" ON public.marketplace_integrations FOR SELECT TO authenticated
USING ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

-- organizations
DROP POLICY IF EXISTS "Admins can update their org" ON public.organizations;
CREATE POLICY "Admins can update their org" ON public.organizations FOR UPDATE TO authenticated
USING ((id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their org" ON public.organizations;
CREATE POLICY "Users can view their org" ON public.organizations FOR SELECT TO authenticated
USING (id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one" ON public.organizations FOR INSERT TO authenticated
WITH CHECK (NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.org_id IS NOT NULL));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND org_id IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND NOT (org_id IS DISTINCT FROM (SELECT p.org_id FROM profiles p WHERE p.user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can view org members" ON public.profiles;
CREATE POLICY "Users can view org members" ON public.profiles FOR SELECT TO authenticated
USING (org_id IS NOT NULL AND org_id = get_user_org_id(auth.uid()));

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- suppressed_emails
DROP POLICY IF EXISTS "Service role can insert suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails FOR INSERT TO public
WITH CHECK (auth.role() = 'service_role'::text);

DROP POLICY IF EXISTS "Service role can read suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role can read suppressed emails" ON public.suppressed_emails FOR SELECT TO public
USING (auth.role() = 'service_role'::text);

-- team_invites
DROP POLICY IF EXISTS "Admins can delete org invites" ON public.team_invites;
CREATE POLICY "Admins can delete org invites" ON public.team_invites FOR DELETE TO authenticated
USING ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert org invites" ON public.team_invites;
CREATE POLICY "Admins can insert org invites" ON public.team_invites FOR INSERT TO authenticated
WITH CHECK ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view org invites" ON public.team_invites;
CREATE POLICY "Admins can view org invites" ON public.team_invites FOR SELECT TO authenticated
USING ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

-- template_versions
DROP POLICY IF EXISTS "Admins can manage template versions" ON public.template_versions;
CREATE POLICY "Admins can manage template versions" ON public.template_versions FOR ALL TO authenticated
USING (template_id IN (SELECT templates.id FROM templates WHERE templates.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid()) AND has_role(auth.uid(), 'admin'::app_role)));

DROP POLICY IF EXISTS "Org members can view template versions" ON public.template_versions;
CREATE POLICY "Org members can view template versions" ON public.template_versions FOR SELECT TO authenticated
USING (template_id IN (SELECT templates.id FROM templates WHERE templates.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())));

-- templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
CREATE POLICY "Admins can manage templates" ON public.templates FOR ALL TO authenticated
USING ((org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Org members can view templates" ON public.templates;
CREATE POLICY "Org members can view templates" ON public.templates FOR SELECT TO authenticated
USING (org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid()));

-- wallets
DROP POLICY IF EXISTS "Admins can update own org wallet" ON public.wallets;
DROP POLICY IF EXISTS "Admins can update wallet settings" ON public.wallets;
CREATE POLICY "Admins can update own org wallet" ON public.wallets FOR UPDATE TO authenticated
USING ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((org_id = get_user_org_id(auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own org wallet" ON public.wallets;
CREATE POLICY "Users can view own org wallet" ON public.wallets FOR SELECT TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- webhook_deliveries
DROP POLICY IF EXISTS "Admins can view webhook deliveries" ON public.webhook_deliveries;
CREATE POLICY "Admins can view webhook deliveries" ON public.webhook_deliveries FOR SELECT TO authenticated
USING (webhook_endpoint_id IN (SELECT webhook_endpoints.id FROM webhook_endpoints WHERE webhook_endpoints.org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())));

-- webhook_endpoints
DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhook_endpoints;
CREATE POLICY "Admins can manage webhooks" ON public.webhook_endpoints FOR ALL TO authenticated
USING ((org_id IN (SELECT profiles.org_id FROM profiles WHERE profiles.user_id = auth.uid())) AND has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 2. Fix user_roles cross-org privilege escalation
-- ============================================================

-- Add org_id column to user_roles
ALTER TABLE public.user_roles ADD COLUMN org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill org_id from profiles
UPDATE public.user_roles ur
SET org_id = p.org_id
FROM public.profiles p
WHERE p.user_id = ur.user_id;

-- Make org_id NOT NULL after backfill
ALTER TABLE public.user_roles ALTER COLUMN org_id SET NOT NULL;

-- Replace the overly broad admin policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles in own org" ON public.user_roles FOR ALL TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Keep the self-view policy as permissive
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());
