
-- Create deduct_credit function
CREATE OR REPLACE FUNCTION public.deduct_credit(
  p_org_id uuid,
  p_reference_id text,
  p_type text DEFAULT 'waiver_deduction'
)
RETURNS TABLE(success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_credits integer;
  new_balance integer;
BEGIN
  SELECT credits INTO current_credits FROM public.wallets WHERE org_id = p_org_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'No wallet found for organization'::text;
    RETURN;
  END IF;

  IF current_credits <= -10 THEN
    RETURN QUERY SELECT false, 'Credit balance has reached overdraft limit'::text;
    RETURN;
  END IF;

  new_balance := current_credits - 1;

  UPDATE public.wallets SET credits = new_balance, updated_at = now() WHERE org_id = p_org_id;

  INSERT INTO public.credit_transactions (org_id, type, credits_delta, balance_after, reference_id, notes)
  VALUES (p_org_id, p_type, -1, new_balance, p_reference_id, 'Waiver credit deduction');

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

-- Create group_signatures table
CREATE TABLE public.group_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id uuid REFERENCES public.envelopes(id) ON DELETE CASCADE NOT NULL,
  signer_name text NOT NULL,
  signer_email text,
  initials text,
  signature_data jsonb,
  ip_address text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_signatures ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users in the same org to view group signatures
CREATE POLICY "Users can view group signatures for own org envelopes"
  ON public.group_signatures FOR SELECT TO authenticated
  USING (envelope_id IN (
    SELECT id FROM public.envelopes WHERE org_id = public.get_user_org_id(auth.uid())
  ));

-- Allow anonymous inserts for signing (public signing pages)
CREATE POLICY "Anyone can insert group signatures"
  ON public.group_signatures FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Add is_group_waiver and group_token columns to envelopes
ALTER TABLE public.envelopes ADD COLUMN IF NOT EXISTS is_group_waiver boolean NOT NULL DEFAULT false;
ALTER TABLE public.envelopes ADD COLUMN IF NOT EXISTS group_token text;
