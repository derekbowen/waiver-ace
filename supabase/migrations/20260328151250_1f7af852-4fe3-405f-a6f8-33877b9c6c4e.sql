
-- Contract scans table
CREATE TABLE public.contract_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  filename text,
  file_storage_key text,
  file_size_bytes integer,
  page_count integer,
  contract_type text,
  analysis_json jsonb,
  risk_score integer,
  credits_used integer NOT NULL DEFAULT 5,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.contract_scans ENABLE ROW LEVEL SECURITY;

-- Users can view their own org's scans
CREATE POLICY "Users can view own org contract scans"
  ON public.contract_scans FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()));

-- Users can insert scans for own org
CREATE POLICY "Users can insert contract scans for own org"
  ON public.contract_scans FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Service role can update scans (for edge function)
CREATE POLICY "Service role can update contract scans"
  ON public.contract_scans FOR UPDATE TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Storage bucket for contract uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contract-uploads', 'contract-uploads', false, 20971520);

-- Storage RLS: users can upload to their org folder
CREATE POLICY "Users can upload contracts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contract-uploads' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text);

CREATE POLICY "Users can read own org contracts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contract-uploads' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text);
