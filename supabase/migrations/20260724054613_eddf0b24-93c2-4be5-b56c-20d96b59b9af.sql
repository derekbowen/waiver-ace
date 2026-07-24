
-- Revoke SECURITY DEFINER helpers that don't need public/auth execute
REVOKE EXECUTE ON FUNCTION public.view_envelope(uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_org_id(uuid) FROM anon, authenticated, PUBLIC;

-- Defense-in-depth: explicitly deny UPDATE/DELETE on group_signatures for all app roles.
-- Service role bypasses RLS and remains the only path to modify signed records.
CREATE POLICY "No updates to group signatures"
  ON public.group_signatures
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No deletes of group signatures"
  ON public.group_signatures
  FOR DELETE
  TO anon, authenticated
  USING (false);
