
-- PhotoSell: photo processing jobs table
CREATE TABLE public.photo_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  original_storage_key TEXT,
  original_filename TEXT,
  original_content_type TEXT,
  analysis_json JSONB,
  processed_keys JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 1,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.photo_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org photo jobs"
  ON public.photo_jobs FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins can manage photo jobs"
  ON public.photo_jobs FOR ALL TO authenticated
  USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert photo jobs for own org"
  ON public.photo_jobs FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Storage bucket for photo uploads and processed images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('photo-uploads', 'photo-uploads', false, 52428800);

-- Storage RLS: users can upload to their org folder
CREATE POLICY "Users can upload photos to own org"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photo-uploads' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text);

CREATE POLICY "Users can view own org photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photo-uploads' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text);

CREATE POLICY "Service role full access photo-uploads"
  ON storage.objects FOR ALL TO public
  USING (bucket_id = 'photo-uploads' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'photo-uploads' AND auth.role() = 'service_role');
