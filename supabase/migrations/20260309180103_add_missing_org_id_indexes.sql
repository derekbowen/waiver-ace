-- Add indexes on org_id columns used heavily in RLS policy subqueries.
-- Without these, every RLS check does a sequential scan on these tables.

CREATE INDEX idx_profiles_org_id ON public.profiles(org_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_templates_org_id ON public.templates(org_id);
CREATE INDEX idx_envelopes_org_id ON public.envelopes(org_id);
CREATE INDEX idx_api_keys_org_id ON public.api_keys(org_id);
CREATE INDEX idx_webhook_endpoints_org_id ON public.webhook_endpoints(org_id);
