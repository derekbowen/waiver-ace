
-- Grant execute on add_credits_internal to postgres (service role uses postgres role)
GRANT EXECUTE ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.add_credits_internal(uuid, integer, text, text, text) TO service_role;
