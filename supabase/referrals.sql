-- ── Referral system ──────────────────────────────────────────────────────────
-- Run this in Supabase SQL editor

-- 1. Add referral_code column to profiles (unique short code, defaults to username)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles(referral_code);

-- Auto-populate referral_code from username for existing users
UPDATE profiles SET referral_code = username WHERE referral_code IS NULL AND username IS NOT NULL;

-- 2. Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending',  -- pending | rewarded
  created_at   timestamptz DEFAULT now(),
  rewarded_at  timestamptz,
  UNIQUE (referred_id)  -- each user can only be referred once
);

-- 3. RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Referrer can see their own referrals
CREATE POLICY "referrer_select" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Service role (admin) can do everything
CREATE POLICY "admin_all" ON referrals
  USING (true)
  WITH CHECK (true);

-- 4. Index for fast lookup
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx ON referrals(referred_id);

-- 5. Helper: mark referral as rewarded (admin calls this after granting Premium)
-- UPDATE referrals SET status = 'rewarded', rewarded_at = now() WHERE id = '<referral_id>';
