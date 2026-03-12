
-- Referral system tables
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  referred_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  referred_email text NOT NULL,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_credited boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Add referral_code to profiles for easy lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)) WHERE referral_code IS NULL;

-- Create index on referral_code for fast lookups
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_referred_org_id ON public.referrals(referred_org_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Service role can manage referrals"
  ON public.referrals FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to auto-generate referral code on new profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();
