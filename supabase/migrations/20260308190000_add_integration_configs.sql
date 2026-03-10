-- Integration configs for marketplace platform connections (Sharetribe, Arcadier, etc.)
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'sharetribe', 'arcadier', 'custom'
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One integration per provider per org
CREATE UNIQUE INDEX IF NOT EXISTS integration_configs_org_provider ON public.integration_configs(org_id, provider);

-- RLS
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org integrations"
  ON public.integration_configs FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their org integrations"
  ON public.integration_configs FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their org integrations"
  ON public.integration_configs FOR UPDATE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their org integrations"
  ON public.integration_configs FOR DELETE
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));
