
-- Create marketplace_integrations table
CREATE TABLE public.marketplace_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL DEFAULT 'hospitable',
  client_id text,
  client_secret text,
  api_base_url text,
  default_template_id uuid REFERENCES public.templates(id),
  webhook_secret text DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org integrations"
  ON public.marketplace_integrations FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can insert own org integrations"
  ON public.marketplace_integrations FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can update own org integrations"
  ON public.marketplace_integrations FOR UPDATE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

-- Create team_invites table
CREATE TABLE public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'host',
  invited_by uuid NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org invites"
  ON public.team_invites FOR SELECT TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can insert own org invites"
  ON public.team_invites FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Users can delete own org invites"
  ON public.team_invites FOR DELETE TO authenticated
  USING (org_id = public.get_user_org_id(auth.uid()));
