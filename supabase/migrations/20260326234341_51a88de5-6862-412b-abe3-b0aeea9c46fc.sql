-- Step 1: Add org_id as NULLABLE first (idempotent)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS org_id uuid;

-- Step 2: Backfill org_id from profiles for all existing rows
UPDATE public.user_roles ur
SET org_id = p.org_id
FROM public.profiles p
WHERE ur.user_id = p.user_id AND ur.org_id IS NULL;

-- Step 3: Make org_id NOT NULL now that all rows are populated
ALTER TABLE public.user_roles ALTER COLUMN org_id SET NOT NULL;

-- Step 4: Add foreign key to organizations (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_org_id_fkey') THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_org_id_fkey
      FOREIGN KEY (org_id) REFERENCES public.organizations(id);
  END IF;
END $$;

-- Step 5: Drop old policies
DROP POLICY IF EXISTS "Admins can manage roles in own org" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Step 6: Create org-scoped admin policy preventing cross-org escalation
CREATE POLICY "Admins can manage roles in own org"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND org_id = get_user_org_id(auth.uid())
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND org_id = get_user_org_id(auth.uid())
  );