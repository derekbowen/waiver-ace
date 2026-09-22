-- get_user_org_id() is referenced by RLS policies on profiles, templates, envelopes,
-- wallets and others. RLS expressions execute as the calling role, so authenticated
-- users must be able to execute it or every org-scoped query fails with
-- "permission denied for function get_user_org_id". anon stays revoked.
GRANT EXECUTE ON FUNCTION public.get_user_org_id(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_org_id(uuid) FROM anon, PUBLIC;