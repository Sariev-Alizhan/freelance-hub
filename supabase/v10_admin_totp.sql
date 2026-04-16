-- v10: Admin TOTP secret storage
-- Run in Supabase SQL Editor

-- Add totp_secret column to profiles (only admins will use it)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS totp_secret text;

-- Restrict: only the row owner or service role can read/write the secret
-- (Row-level security already applied to profiles table)
-- Confirm RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can only update their own totp_secret
-- (existing policies cover SELECT/INSERT; this adds UPDATE for totp_secret)
DROP POLICY IF EXISTS "users_update_own_totp" ON profiles;
CREATE POLICY "users_update_own_totp"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
