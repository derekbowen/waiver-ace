
-- Change default retention from 7 to 2 years
ALTER TABLE public.organizations ALTER COLUMN retention_years SET DEFAULT 2;

-- Create a dedicated private bucket for waiver PDFs if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('waiver-pdfs', 'waiver-pdfs', false) ON CONFLICT (id) DO NOTHING;

-- RLS: Only authenticated users in the same org can read their waiver PDFs
CREATE POLICY "Org members can read waiver PDFs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'waiver-pdfs'
    AND (storage.foldername(name))[1] = 'waivers'
    AND (storage.foldername(name))[2] IN (
      SELECT org_id::text FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Service role can upload PDFs (edge functions use service role)
CREATE POLICY "Service role can upload waiver PDFs"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (
    bucket_id = 'waiver-pdfs'
    AND auth.role() = 'service_role'
  );

CREATE POLICY "Service role can update waiver PDFs"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'waiver-pdfs' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'waiver-pdfs' AND auth.role() = 'service_role');
