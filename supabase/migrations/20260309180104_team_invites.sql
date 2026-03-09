-- Team invite system
CREATE TABLE public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'host',
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Admins in the same org can view/manage invites
CREATE POLICY "Org admins can manage invites"
  ON public.team_invites FOR ALL
  USING (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE INDEX idx_team_invites_org_id ON public.team_invites(org_id);
CREATE INDEX idx_team_invites_token ON public.team_invites(token);
