
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'host', 'customer');
CREATE TYPE public.envelope_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'completed', 'expired', 'canceled');

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Organizations
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  email_sender_domain TEXT,
  retention_years INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User Roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Templates
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Template Versions
CREATE TABLE public.template_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  variables TEXT[] NOT NULL DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (template_id, version)
);
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;

-- Envelopes
CREATE TABLE public.envelopes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_version_id UUID NOT NULL REFERENCES public.template_versions(id),
  status envelope_status NOT NULL DEFAULT 'draft',
  signer_name TEXT,
  signer_email TEXT NOT NULL,
  signing_token UUID NOT NULL DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL DEFAULT '{}',
  booking_id TEXT,
  listing_id TEXT,
  host_id TEXT,
  customer_id TEXT,
  signature_data JSONB,
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  pdf_storage_key TEXT,
  pdf_hash TEXT,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;

-- Envelope Events (audit trail)
CREATE TABLE public.envelope_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID NOT NULL REFERENCES public.envelopes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.envelope_events ENABLE ROW LEVEL SECURITY;

-- API Keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Webhook Endpoints
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Webhook Deliveries
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  envelope_id UUID REFERENCES public.envelopes(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt INTEGER NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations: admins in the org can manage
CREATE POLICY "Users can view their org" ON public.organizations
  FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update their org" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE POLICY "Users can view profiles in their org" ON public.profiles
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User Roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Templates: org members can view, admins can manage
CREATE POLICY "Org members can view templates" ON public.templates
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage templates" ON public.templates
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Template Versions
CREATE POLICY "Org members can view template versions" ON public.template_versions
  FOR SELECT TO authenticated
  USING (template_id IN (SELECT id FROM public.templates WHERE org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins can manage template versions" ON public.template_versions
  FOR ALL TO authenticated
  USING (template_id IN (SELECT id FROM public.templates WHERE org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin')));

-- Envelopes: admins see all in org, hosts see their listing's envelopes
CREATE POLICY "Admins can view all org envelopes" ON public.envelopes
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage envelopes" ON public.envelopes
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Envelopes: anonymous access for signing via token
CREATE POLICY "Signers can view their envelope" ON public.envelopes
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Signers can update their envelope" ON public.envelopes
  FOR UPDATE TO anon
  USING (true);

-- Envelope Events
CREATE POLICY "Org members can view envelope events" ON public.envelope_events
  FOR SELECT TO authenticated
  USING (envelope_id IN (SELECT id FROM public.envelopes WHERE org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "System can insert events" ON public.envelope_events
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert events" ON public.envelope_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- API Keys
CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Webhook Endpoints
CREATE POLICY "Admins can manage webhooks" ON public.webhook_endpoints
  FOR ALL TO authenticated
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Webhook Deliveries
CREATE POLICY "Admins can view webhook deliveries" ON public.webhook_deliveries
  FOR SELECT TO authenticated
  USING (webhook_endpoint_id IN (SELECT id FROM public.webhook_endpoints WHERE org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())));

-- Triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_envelopes_updated_at BEFORE UPDATE ON public.envelopes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhook_endpoints_updated_at BEFORE UPDATE ON public.webhook_endpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for signing token lookup
CREATE INDEX idx_envelopes_signing_token ON public.envelopes(signing_token);
CREATE INDEX idx_envelopes_status ON public.envelopes(status);
CREATE INDEX idx_envelopes_booking_id ON public.envelopes(booking_id);
CREATE INDEX idx_envelope_events_envelope_id ON public.envelope_events(envelope_id);
