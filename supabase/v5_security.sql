-- ═══════════════════════════════════════════════════════════════════════════
-- FreelanceHub — v5 Security Hardening
-- Run in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Security event log ──────────────────────────────────────────────────
-- Stores suspicious events detected at the API layer.
-- Write-only for service_role; users cannot read.

CREATE TABLE IF NOT EXISTS security_events (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  event       text        NOT NULL,        -- 'rate_limit' | 'sql_injection' | etc.
  ip          text,
  path        text,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details     jsonb
);

-- Only service_role may insert/select — no RLS row exposure
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service only" ON security_events
  USING (false)   -- nobody reads via anon/authenticated
  WITH CHECK (false);  -- insert only via service_role (bypasses RLS)

-- Auto-purge events older than 90 days (keep table lean)
CREATE OR REPLACE FUNCTION purge_old_security_events() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM security_events WHERE created_at < now() - interval '90 days';
END;
$$;

-- ── 2. Rate-limit metadata on profiles ────────────────────────────────────
-- Persist per-user strike count for repeat offenders (in addition to in-memory RL)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS abuse_strikes   int     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS banned_until    timestamptz;

-- ── 3. Row-level security audit: ensure critical tables are locked down ────

-- orders: only owner (client) or service_role can update status
-- (Existing RLS from schema.sql — verify no gaps)
DO $$
BEGIN
  -- Verify orders RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'orders' AND rowsecurity = true
  ) THEN
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ── 4. Function: is_banned — used by API routes ───────────────────────────
CREATE OR REPLACE FUNCTION is_user_banned(uid uuid) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  banned_ts timestamptz;
BEGIN
  SELECT banned_until INTO banned_ts FROM profiles WHERE id = uid;
  RETURN banned_ts IS NOT NULL AND banned_ts > now();
END;
$$;

-- ── 5. Prevent orders with extreme prices (DB constraint) ─────────────────
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_price_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_price_check
  CHECK (budget_from >= 0 AND (budget_to IS NULL OR budget_to <= 100000000));

-- ── 6. Prevent duplicate emails in profiles (data integrity) ──────────────
-- Auth already enforces this, but belt-and-suspenders on the profiles table
-- if username is used: ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON profiles (username) WHERE username IS NOT NULL;

-- ── 7. Index for security_events queries ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events (ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events (user_id, created_at DESC);

-- ── 8. Input length constraints on text columns ───────────────────────────
-- belt-and-suspenders: even if app layer bypassed, DB rejects oversized strings

ALTER TABLE orders
  ADD CONSTRAINT IF NOT EXISTS orders_title_len CHECK (char_length(title) <= 300),
  ADD CONSTRAINT IF NOT EXISTS orders_desc_len  CHECK (char_length(description) <= 20000);

ALTER TABLE order_responses
  ADD CONSTRAINT IF NOT EXISTS responses_message_len CHECK (char_length(message) <= 3000);

-- feature_requests title cap
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_requests') THEN
    ALTER TABLE feature_requests
      ADD CONSTRAINT IF NOT EXISTS feature_title_len CHECK (char_length(title) <= 200),
      ADD CONSTRAINT IF NOT EXISTS feature_desc_len  CHECK (char_length(description) <= 1000);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Run this in Supabase SQL editor once.
-- ═══════════════════════════════════════════════════════════════════════════
