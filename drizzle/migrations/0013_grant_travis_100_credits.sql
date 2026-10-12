DO $$
DECLARE
  v_org uuid := '3bfc9b7d-327d-4632-b8ed-fdd9dafc419e';
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org)
     AND NOT EXISTS (
       SELECT 1 FROM public.credit_transactions
       WHERE org_id = v_org AND reference_id = 'manual_grant_2026-10-05'
     ) THEN
    PERFORM public.add_credits(v_org, 100, 'manual_grant_2026-10-05', 'admin_adjustment'::credit_transaction_type, 'Manual 100 credit grant from support');
  END IF;
END $$;