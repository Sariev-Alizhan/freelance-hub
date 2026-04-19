-- Phase 2 — Federation Read.
-- Per-user RSA keypair for ActivityPub actor. Private key is service_role only.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS private_key_pem text;

-- Tighten RLS on profiles so the private key is never readable by anyone
-- other than service_role. Existing read policies on profiles select specific
-- columns in application code, but we add a defensive policy anyway:
-- anon/authenticated clients can read profiles, but Supabase column-level
-- privileges let us revoke SELECT on private_key_pem specifically.
REVOKE SELECT (private_key_pem) ON profiles FROM anon, authenticated;
GRANT  SELECT (private_key_pem) ON profiles TO service_role;
