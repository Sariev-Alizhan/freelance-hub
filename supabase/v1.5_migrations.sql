-- FreelanceHub v1.5 migrations — Монетизация 2.0
-- Run in: Supabase Dashboard → SQL Editor

-- ─── 1. New columns on freelancer_profiles ───────────────────────────────────
ALTER TABLE freelancer_profiles
  ADD COLUMN IF NOT EXISTS is_premium               boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_until            timestamptz,
  ADD COLUMN IF NOT EXISTS verification_requested   boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz;

-- ─── 2. Profile views ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile_views (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id uuid        NOT NULL,  -- references freelancer_profiles.user_id
  viewer_id     uuid,                  -- null = anon visitor
  ip_hash       text,                  -- hashed IP for dedup (optional)
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_freelancer ON profile_views (freelancer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer     ON profile_views (viewer_id);

-- RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
-- Allow insert from server (service role bypasses RLS)
-- Allow freelancer to read their own views
CREATE POLICY "Freelancer reads own views" ON profile_views
  FOR SELECT USING (freelancer_id = auth.uid());

-- ─── 3. Payments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            text        NOT NULL CHECK (type IN ('premium', 'verification', 'promotion')),
  amount_kzt      integer     NOT NULL DEFAULT 0,
  status          text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'simulated', 'failed')),
  kaspi_order_id  text,                   -- Kaspi Pay order ID (future)
  metadata        jsonb       DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user   ON payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- ─── 4. Helper: views_per_day RPC (for analytics chart) ─────────────────────
CREATE OR REPLACE FUNCTION views_per_day(fid uuid, days_back integer DEFAULT 30)
RETURNS TABLE (day text, count bigint) LANGUAGE sql STABLE AS $$
  SELECT
    to_char(created_at AT TIME ZONE 'Asia/Almaty', 'DD.MM') AS day,
    COUNT(*)::bigint AS count
  FROM profile_views
  WHERE freelancer_id = fid
    AND created_at >= now() - (days_back || ' days')::interval
  GROUP BY 1
  ORDER BY MIN(created_at);
$$;

-- ─── 5. Auto-expire premium (runs on SELECT — lightweight) ───────────────────
-- No cron needed: the app checks premium_until < now() client-side/server-side

-- ─── 6. Response limit view ──────────────────────────────────────────────────
-- Returns how many responses this freelancer sent in the current calendar month
CREATE OR REPLACE FUNCTION responses_this_month(uid uuid)
RETURNS integer LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::integer
  FROM order_responses
  WHERE freelancer_id = uid
    AND created_at >= date_trunc('month', now());
$$;
