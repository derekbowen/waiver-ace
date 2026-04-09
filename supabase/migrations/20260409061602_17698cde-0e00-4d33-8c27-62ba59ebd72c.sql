
-- 1. Create the missing contract_scans table
CREATE TABLE public.contract_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  filename TEXT NOT NULL DEFAULT 'pasted-text',
  status TEXT NOT NULL DEFAULT 'pending',
  analysis_json JSONB,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view scans" ON public.contract_scans
  FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create scans for own org" ON public.contract_scans
  FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()) AND user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Service role can manage scans" ON public.contract_scans
  FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. Fix credit_disputes INSERT policy to enforce safe defaults
DROP POLICY IF EXISTS "Users can submit disputes" ON public.credit_disputes;
CREATE POLICY "Users can submit disputes" ON public.credit_disputes
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND user_id = auth.uid()
    AND status = 'pending'
    AND credits_granted = 0
  );

-- 3. Fix photo_jobs INSERT policy to enforce safe defaults
DROP POLICY IF EXISTS "Users can insert photo jobs for own org" ON public.photo_jobs;
CREATE POLICY "Users can insert photo jobs for own org" ON public.photo_jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND user_id = auth.uid()
    AND status = 'pending'
    AND credits_used >= 0
  );
