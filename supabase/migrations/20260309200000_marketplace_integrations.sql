-- Marketplace integrations table (stores ShareTribe/other platform credentials per org)
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'sharetribe',
  client_id TEXT,
  client_secret TEXT,
  webhook_secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  api_base_url TEXT,
  default_template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One integration per org per platform
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_integrations_org_platform
  ON public.marketplace_integrations(org_id, platform);

CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_webhook_secret
  ON public.marketplace_integrations(webhook_secret);

-- Trigger for updated_at
CREATE TRIGGER set_marketplace_integrations_updated_at
  BEFORE UPDATE ON public.marketplace_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

-- Org members can read their integrations
CREATE POLICY "Users can view own org integrations"
  ON public.marketplace_integrations FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

-- Admins can manage integrations
CREATE POLICY "Admins can insert integrations"
  ON public.marketplace_integrations FOR INSERT
  WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update integrations"
  ON public.marketplace_integrations FOR UPDATE
  USING (
    org_id = get_user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete integrations"
  ON public.marketplace_integrations FOR DELETE
  USING (
    org_id = get_user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );
