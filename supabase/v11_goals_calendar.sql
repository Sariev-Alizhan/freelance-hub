-- v11: Freelancer Goals, Progress & Calendar
-- Run in Supabase SQL Editor

-- ── Goals ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS freelancer_goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('income', 'orders', 'hours')),
  target       numeric NOT NULL,          -- amount in ₸, count, or hours
  currency     text NOT NULL DEFAULT 'KZT',
  period_type  text NOT NULL CHECK (period_type IN ('week', 'month', 'custom')),
  start_date   date NOT NULL,
  end_date     date NOT NULL,
  category     text,                      -- optional: goal tied to a category
  title        text,                      -- user's custom label e.g. "Заработать на MacBook"
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE freelancer_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "goals_own" ON freelancer_goals;
CREATE POLICY "goals_own" ON freelancer_goals
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Goal progress (daily snapshots) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS goal_progress (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id          uuid NOT NULL REFERENCES freelancer_goals(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date             date NOT NULL,
  amount_earned    numeric NOT NULL DEFAULT 0,
  orders_completed int    NOT NULL DEFAULT 0,
  hours_logged     numeric NOT NULL DEFAULT 0,
  UNIQUE (goal_id, date)
);

ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "progress_own" ON goal_progress;
CREATE POLICY "progress_own" ON goal_progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Work schedule / calendar blocks ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS freelancer_schedule (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date       date NOT NULL,
  start_time time,
  end_time   time,
  label      text NOT NULL DEFAULT 'Work',
  color      text NOT NULL DEFAULT '#7170ff',  -- hex color
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE freelancer_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "schedule_own" ON freelancer_schedule;
CREATE POLICY "schedule_own" ON freelancer_schedule
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Streak helper view ─────────────────────────────────────────────────────
-- Returns how many consecutive days user had activity (orders_completed > 0 OR hours_logged > 0)
CREATE OR REPLACE VIEW user_streaks AS
SELECT
  user_id,
  COUNT(*)::int AS streak_days
FROM (
  SELECT
    user_id,
    date,
    -- streak group: date minus row_number gives same value for consecutive days
    date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date))::int AS grp
  FROM goal_progress
  WHERE (orders_completed > 0 OR hours_logged > 0)
    AND date >= CURRENT_DATE - 90
) t
WHERE grp = (
  SELECT MAX(grp) FROM (
    SELECT
      user_id AS uid,
      date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date))::int AS grp
    FROM goal_progress
    WHERE (orders_completed > 0 OR hours_logged > 0)
      AND date >= CURRENT_DATE - 90
  ) t2 WHERE t2.uid = t.user_id
)
GROUP BY user_id;
