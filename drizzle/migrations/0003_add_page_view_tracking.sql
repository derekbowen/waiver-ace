-- Anonymous page-view tracking for marketing/SEO pages + signup attribution

CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_path ON public.page_views (path);
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at);

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out visitors) can record a view; nobody reads raw rows directly.
CREATE POLICY "Anyone can record a page view"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (length(path) > 0 AND length(path) <= 500);

-- Signup attribution: which marketing page first brought this user in
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_source_path text;

-- Aggregated stats for the owner dashboard, admin-only
CREATE OR REPLACE FUNCTION public.get_marketing_page_stats()
RETURNS TABLE(path text, views bigint, signups bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT COALESCE(v.path, s.path) AS path,
         COALESCE(v.views, 0) AS views,
         COALESCE(s.signups, 0) AS signups
  FROM (SELECT pv.path, count(*) AS views FROM public.page_views pv GROUP BY pv.path) v
  FULL OUTER JOIN (
    SELECT p.signup_source_path AS path, count(*) AS signups
    FROM public.profiles p
    WHERE p.signup_source_path IS NOT NULL
    GROUP BY p.signup_source_path
  ) s ON s.path = v.path
  ORDER BY views DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_marketing_page_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_marketing_page_stats() TO authenticated;