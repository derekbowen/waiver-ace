
-- 1. Drop overly broad anon policies on envelopes (if they exist)
DROP POLICY IF EXISTS "Anon can select envelopes by signing token" ON public.envelopes;
DROP POLICY IF EXISTS "Anon can update envelopes by signing token" ON public.envelopes;
DROP POLICY IF EXISTS "anon_select_envelopes" ON public.envelopes;
DROP POLICY IF EXISTS "anon_update_envelopes" ON public.envelopes;

-- 2. Fix marketplace_integrations: restrict write operations to admins only
DROP POLICY IF EXISTS "Users can insert own org integrations" ON public.marketplace_integrations;
DROP POLICY IF EXISTS "Users can update own org integrations" ON public.marketplace_integrations;

CREATE POLICY "Admins can insert org integrations" ON public.marketplace_integrations
  FOR INSERT TO authenticated
  WITH CHECK (org_id = get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update org integrations" ON public.marketplace_integrations
  FOR UPDATE TO authenticated
  USING (org_id = get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Make email-assets bucket private
UPDATE storage.buckets SET public = false WHERE id = 'email-assets';
