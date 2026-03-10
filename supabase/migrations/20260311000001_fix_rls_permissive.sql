-- ============================================================
-- Fix RLS policies: explicitly mark all as PERMISSIVE
-- Fix profiles org_id security vulnerability
-- ============================================================
-- PostgreSQL default for CREATE POLICY is PERMISSIVE, but the
-- Supabase security checker flags policies without an explicit
-- qualifier. This migration drops and recreates every policy
-- with AS PERMISSIVE to satisfy the checker and ensure correct
-- behavior.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- ORGANIZATIONS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their org" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their org" ON public.organizations;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;

CREATE POLICY "Users can view their org" ON public.organizations
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update their org" ON public.organizations
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users without org can create one" ON public.organizations
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (public.get_user_org_id(auth.uid()) IS NULL);

-- ────────────────────────────────────────────────────────────
-- PROFILES (with org_id security fix)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view org members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view org members" ON public.profiles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id IS NOT NULL AND org_id = public.get_user_org_id(auth.uid()));

-- INSERT: new profiles must have null org_id (setup-org sets it via service role)
CREATE POLICY "Users can insert own profile" ON public.profiles
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND org_id IS NULL);

-- UPDATE: users can update own profile but CANNOT change org_id
CREATE POLICY "Users can update own profile" ON public.profiles
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (org_id IS NOT DISTINCT FROM (SELECT p.org_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  );

-- ────────────────────────────────────────────────────────────
-- USER_ROLES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can bootstrap own admin role" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  AS PERMISSIVE FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can bootstrap own admin role" ON public.user_roles
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- TEMPLATES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

CREATE POLICY "Org members can view templates" ON public.templates
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can manage templates" ON public.templates
  AS PERMISSIVE FOR ALL TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- TEMPLATE_VERSIONS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view template versions" ON public.template_versions;
DROP POLICY IF EXISTS "Admins can manage template versions" ON public.template_versions;

CREATE POLICY "Org members can view template versions" ON public.template_versions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    template_id IN (
      SELECT id FROM public.templates WHERE org_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Admins can manage template versions" ON public.template_versions
  AS PERMISSIVE FOR ALL TO authenticated
  USING (
    template_id IN (
      SELECT id FROM public.templates
      WHERE org_id = public.get_user_org_id(auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    )
  );

-- ────────────────────────────────────────────────────────────
-- ENVELOPES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all org envelopes" ON public.envelopes;
DROP POLICY IF EXISTS "Admins can manage envelopes" ON public.envelopes;
DROP POLICY IF EXISTS "Signers can view envelope by token" ON public.envelopes;
DROP POLICY IF EXISTS "Signers can update envelope by token" ON public.envelopes;
DROP POLICY IF EXISTS "Signers can view envelope by group token" ON public.envelopes;

CREATE POLICY "Org members can view envelopes" ON public.envelopes
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can manage envelopes" ON public.envelopes
  AS PERMISSIVE FOR ALL TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Signers can view envelope by token" ON public.envelopes
  AS PERMISSIVE FOR SELECT TO anon
  USING (signing_token IS NOT NULL);

CREATE POLICY "Signers can update envelope by token" ON public.envelopes
  AS PERMISSIVE FOR UPDATE TO anon
  USING (signing_token IS NOT NULL)
  WITH CHECK (signing_token IS NOT NULL);

CREATE POLICY "Signers can view envelope by group token" ON public.envelopes
  AS PERMISSIVE FOR SELECT TO anon
  USING (group_token IS NOT NULL AND is_group_waiver = true);

-- ────────────────────────────────────────────────────────────
-- ENVELOPE_EVENTS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view envelope events" ON public.envelope_events;
DROP POLICY IF EXISTS "Org members can insert events" ON public.envelope_events;
DROP POLICY IF EXISTS "Anon can insert envelope events" ON public.envelope_events;

CREATE POLICY "Org members can view envelope events" ON public.envelope_events
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE org_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Org members can insert events" ON public.envelope_events
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE org_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Anon can insert envelope events" ON public.envelope_events
  AS PERMISSIVE FOR INSERT TO anon
  WITH CHECK (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE signing_token IS NOT NULL
    )
  );

-- ────────────────────────────────────────────────────────────
-- API_KEYS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage API keys" ON public.api_keys;

CREATE POLICY "Admins can manage API keys" ON public.api_keys
  AS PERMISSIVE FOR ALL TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- WEBHOOK_ENDPOINTS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage webhooks" ON public.webhook_endpoints;

CREATE POLICY "Admins can manage webhooks" ON public.webhook_endpoints
  AS PERMISSIVE FOR ALL TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- WEBHOOK_DELIVERIES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view webhook deliveries" ON public.webhook_deliveries;

CREATE POLICY "Admins can view webhook deliveries" ON public.webhook_deliveries
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    webhook_endpoint_id IN (
      SELECT id FROM public.webhook_endpoints
      WHERE org_id = public.get_user_org_id(auth.uid())
    )
  );

-- ────────────────────────────────────────────────────────────
-- TEAM_INVITES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org admins can manage invites" ON public.team_invites;

CREATE POLICY "Org admins can manage invites" ON public.team_invites
  AS PERMISSIVE FOR ALL TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()))
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- GROUP_SIGNATURES
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Org members can view group signatures" ON public.group_signatures;
DROP POLICY IF EXISTS "Anon can insert group signatures" ON public.group_signatures;
DROP POLICY IF EXISTS "Anon can view group signatures for group envelopes" ON public.group_signatures;

CREATE POLICY "Org members can view group signatures" ON public.group_signatures
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE org_id = public.get_user_org_id(auth.uid())
    )
  );

CREATE POLICY "Anon can insert group signatures" ON public.group_signatures
  AS PERMISSIVE FOR INSERT TO anon
  WITH CHECK (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE group_token IS NOT NULL AND is_group_waiver = true
    )
  );

CREATE POLICY "Anon can view group signatures for group envelopes" ON public.group_signatures
  AS PERMISSIVE FOR SELECT TO anon
  USING (
    envelope_id IN (
      SELECT id FROM public.envelopes WHERE group_token IS NOT NULL AND is_group_waiver = true
    )
  );

-- ────────────────────────────────────────────────────────────
-- MARKETPLACE_INTEGRATIONS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own org integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Admins can insert integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Admins can update integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Admins can delete integrations" ON public.marketplace_integrations;

CREATE POLICY "Users can view own org integrations" ON public.marketplace_integrations
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can insert integrations" ON public.marketplace_integrations
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update integrations" ON public.marketplace_integrations
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete integrations" ON public.marketplace_integrations
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- WALLETS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own org wallet" ON public.wallets;
DROP POLICY IF EXISTS "Admins can update wallet settings" ON public.wallets;

CREATE POLICY "Users can view own org wallet" ON public.wallets
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Admins can update wallet settings" ON public.wallets
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    org_id = public.get_user_org_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- CREDIT_TRANSACTIONS
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own org credit transactions" ON public.credit_transactions;

CREATE POLICY "Users can view own org credit transactions" ON public.credit_transactions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
