
-- Credit disputes table for auto-reimbursement tracking
CREATE TABLE public.credit_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  credits_requested integer NOT NULL,
  credits_granted integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_disputes ENABLE ROW LEVEL SECURITY;

-- Users can view their own org's disputes
CREATE POLICY "Org members can view disputes"
  ON public.credit_disputes FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()));

-- Users can insert disputes for their own org
CREATE POLICY "Users can submit disputes"
  ON public.credit_disputes FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()) AND user_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role manages disputes"
  ON public.credit_disputes FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
