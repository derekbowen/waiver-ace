CREATE TABLE public.agent_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  access text NOT NULL DEFAULT 'read' CHECK (access IN ('read','full')),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_keys_org_id ON public.agent_keys(org_id);
CREATE INDEX idx_agent_keys_key_hash ON public.agent_keys(key_hash);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_keys TO authenticated;
GRANT ALL ON public.agent_keys TO service_role;

ALTER TABLE public.agent_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their agent keys"
ON public.agent_keys FOR SELECT TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Org members can create agent keys"
ON public.agent_keys FOR INSERT TO authenticated
WITH CHECK (org_id = public.get_user_org_id(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Org members can update their agent keys"
ON public.agent_keys FOR UPDATE TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()))
WITH CHECK (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Org members can delete their agent keys"
ON public.agent_keys FOR DELETE TO authenticated
USING (org_id = public.get_user_org_id(auth.uid()));