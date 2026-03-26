
-- Ensure all user_roles rows have org_id populated before NOT NULL is enforced.
-- This handles the case where the column was added but backfill didn't complete.
DO $$
BEGIN
  -- If org_id column exists but has nulls, backfill them
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'org_id'
  ) THEN
    UPDATE public.user_roles ur
    SET org_id = p.org_id
    FROM public.profiles p
    WHERE ur.user_id = p.user_id AND ur.org_id IS NULL AND p.org_id IS NOT NULL;
    
    -- Delete any orphaned roles where we can't determine the org
    DELETE FROM public.user_roles WHERE org_id IS NULL;
  END IF;
END $$;
