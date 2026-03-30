
-- 1. Create documents table
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  filename text NOT NULL,
  storage_key text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  content_type text NOT NULL,
  source text NOT NULL DEFAULT 'user_upload',
  envelope_id uuid REFERENCES public.envelopes(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS: Org members can view documents
CREATE POLICY "Org members can view documents"
  ON public.documents FOR SELECT TO authenticated
  USING (org_id = get_user_org_id(auth.uid()));

-- RLS: Admins can insert documents
CREATE POLICY "Admins can insert documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- RLS: Admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- RLS: Service role full access for edge functions
CREATE POLICY "Service role can manage documents"
  ON public.documents FOR ALL TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- 2. Add storage tracking to wallets
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS storage_used_bytes bigint NOT NULL DEFAULT 0;

-- 3. Create org-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('org-documents', 'org-documents', false);

-- 4. Storage RLS: Org members can read their org's files
CREATE POLICY "Org members can read documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'org-documents' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text);

-- 5. Storage RLS: Admins can upload to their org folder
CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'org-documents' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND has_role(auth.uid(), 'admin'::app_role));

-- 6. Storage RLS: Admins can delete from their org folder
CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'org-documents' AND (storage.foldername(name))[1] = get_user_org_id(auth.uid())::text AND has_role(auth.uid(), 'admin'::app_role));

-- 7. Trigger to track storage usage
CREATE OR REPLACE FUNCTION public.update_storage_used()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wallets SET storage_used_bytes = storage_used_bytes + NEW.file_size WHERE org_id = NEW.org_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wallets SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size) WHERE org_id = OLD.org_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_storage_used
  AFTER INSERT OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_storage_used();
