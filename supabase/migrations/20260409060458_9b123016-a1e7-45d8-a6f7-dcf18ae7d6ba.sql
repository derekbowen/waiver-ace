
CREATE TABLE public.listing_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  listing_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  overall_score INTEGER,
  potential_score INTEGER,
  estimated_revenue_increase TEXT,
  top_priorities JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  credits_charged INTEGER NOT NULL DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view analyses"
ON public.listing_analyses FOR SELECT TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Users can create analyses for own org"
ON public.listing_analyses FOR INSERT TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Service role can manage analyses"
ON public.listing_analyses FOR ALL TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

CREATE TRIGGER update_listing_analyses_updated_at
BEFORE UPDATE ON public.listing_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
