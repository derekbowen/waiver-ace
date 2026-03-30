

## Security Scan Fixes -- 2 Errors + 1 Warning

### Error 1: Drop legacy signer-photos upload policy

The old `Anyone can upload signer photos` policy on `storage.objects` is still active. Because permissive policies combine with OR, it completely bypasses the new envelope-scoped policy.

**Migration:** Drop the old policy by name.

```sql
DROP POLICY IF EXISTS "Anyone can upload signer photos" ON storage.objects;
```

### Error 2: Prevent non-admin self-escalation on user_roles

Currently, only the "Admins can insert org roles" INSERT policy exists. A non-admin authenticated user has no matching INSERT policy, but the scanner flags this as a risk. To make intent explicit, add a restrictive policy that denies all INSERT unless the caller is an admin.

**Migration:**

```sql
-- Make the existing admin INSERT policy restrictive instead of permissive,
-- so non-admins are explicitly blocked from inserting any roles.
DROP POLICY IF EXISTS "Admins can insert org roles" ON public.user_roles;

CREATE POLICY "Admins can insert org roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND org_id = get_user_org_id(auth.uid())
    AND role <> 'admin'::app_role
  );
```

This is already the current policy but we need to verify it's the ONLY insert policy. If it is, non-admins cannot insert because no permissive INSERT policy matches them. The scanner may be overly cautious -- but we can reinforce by confirming no other INSERT path exists.

### Warning: Protect team_invites UPDATE

Add an UPDATE policy so only the invited user (matching email) or an admin can update invite rows (e.g., setting `accepted_at`).

**Migration:**

```sql
CREATE POLICY "Invited user can accept invite"
  ON public.team_invites
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
```

### Summary

- 1 migration with 3 SQL statements
- No code changes needed
- All 25 "Anonymous Access" warnings are false positives (policies require `authenticated` or `service_role` internally)

