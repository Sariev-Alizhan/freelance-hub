-- ============================================================
-- FreelanceHub: Combined Migration v2.0 → v4.0
-- Run ONCE in: Supabase Dashboard → SQL Editor
-- Safe to run even if some tables already exist.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- STEP 1: agent_jobs — create or patch
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agent_jobs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_type     text        NOT NULL DEFAULT 'custom',
  status         text        NOT NULL DEFAULT 'pending',
  input          jsonb       NOT NULL DEFAULT '{}',
  output         jsonb,
  error          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Drop old restrictive CHECK constraints (ignore error if they don't exist)
ALTER TABLE public.agent_jobs DROP CONSTRAINT IF EXISTS agent_jobs_agent_type_check;
ALTER TABLE public.agent_jobs DROP CONSTRAINT IF EXISTS agent_jobs_status_check;

-- Re-add with full set of values
ALTER TABLE public.agent_jobs
  ADD CONSTRAINT agent_jobs_agent_type_check
  CHECK (agent_type IN ('smm', 'landing', 'custom', 'orchestrator'));

ALTER TABLE public.agent_jobs
  ADD CONSTRAINT agent_jobs_status_check
  CHECK (status IN ('pending', 'running', 'awaiting_approval', 'approved', 'rejected', 'failed'));

-- v3.0 columns
ALTER TABLE public.agent_jobs
  ADD COLUMN IF NOT EXISTS creator_id     uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS price_usd      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text    NOT NULL DEFAULT 'free';

ALTER TABLE public.agent_jobs DROP CONSTRAINT IF EXISTS agent_jobs_payment_status_check;
ALTER TABLE public.agent_jobs
  ADD CONSTRAINT agent_jobs_payment_status_check
  CHECK (payment_status IN ('free', 'held', 'paid', 'refunded'));

-- v4.0 column
ALTER TABLE public.agent_jobs
  ADD COLUMN IF NOT EXISTS parent_job_id uuid REFERENCES public.agent_jobs(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_jobs_user   ON public.agent_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON public.agent_jobs (status);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_parent ON public.agent_jobs (parent_job_id);

-- RLS
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own jobs"   ON public.agent_jobs;
DROP POLICY IF EXISTS "Users create own jobs" ON public.agent_jobs;
CREATE POLICY "Users view own jobs"   ON public.agent_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create own jobs" ON public.agent_jobs FOR INSERT WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- STEP 2: agent_logs
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agent_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     uuid        REFERENCES public.agent_jobs(id) ON DELETE CASCADE NOT NULL,
  step       text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_job ON public.agent_logs (job_id, created_at ASC);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view logs of own jobs" ON public.agent_logs;
CREATE POLICY "Users view logs of own jobs" ON public.agent_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agent_jobs j WHERE j.id = job_id AND j.user_id = auth.uid())
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 3: custom_agents (Agent Builder)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.custom_agents (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id      uuid         REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name            text         NOT NULL,
  tagline         text         NOT NULL,
  description     text         NOT NULL DEFAULT '',
  category        text         NOT NULL DEFAULT 'custom',
  skills          text[]       DEFAULT '{}',
  system_prompt   text         NOT NULL,
  price_per_task  integer      NOT NULL DEFAULT 10,
  model           text         NOT NULL DEFAULT 'claude-sonnet-4.6',
  is_published    boolean      NOT NULL DEFAULT true,
  tasks_completed integer      NOT NULL DEFAULT 0,
  rating          numeric(3,2) DEFAULT 5.0,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_agents_creator   ON public.custom_agents (creator_id);
CREATE INDEX IF NOT EXISTS idx_custom_agents_published ON public.custom_agents (is_published);

ALTER TABLE public.custom_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published agents visible to all" ON public.custom_agents;
DROP POLICY IF EXISTS "Creators manage own agents"      ON public.custom_agents;
CREATE POLICY "Published agents visible to all" ON public.custom_agents
  FOR SELECT USING (is_published = true OR creator_id = auth.uid());
CREATE POLICY "Creators manage own agents" ON public.custom_agents
  FOR ALL USING (creator_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- STEP 4: agent_balances
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agent_balances (
  user_id      uuid        REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  balance      integer     NOT NULL DEFAULT 1000,
  held         integer     NOT NULL DEFAULT 0,
  total_earned integer     NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_balances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own balance" ON public.agent_balances;
CREATE POLICY "Users view own balance" ON public.agent_balances
  FOR SELECT USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- STEP 5: agent_transactions
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agent_transactions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type       text        NOT NULL,
  amount     integer     NOT NULL,
  job_id     uuid        REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_transactions DROP CONSTRAINT IF EXISTS agent_transactions_type_check;
ALTER TABLE public.agent_transactions
  ADD CONSTRAINT agent_transactions_type_check
  CHECK (type IN ('topup', 'hold', 'payout', 'refund', 'fee'));

CREATE INDEX IF NOT EXISTS idx_agent_tx_user ON public.agent_transactions (user_id, created_at DESC);

ALTER TABLE public.agent_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own transactions" ON public.agent_transactions;
CREATE POLICY "Users view own transactions" ON public.agent_transactions
  FOR SELECT USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- STEP 6: telegram_settings
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.telegram_settings (
  user_id    uuid        REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bot_token  text,
  channel_id text,
  is_active  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own telegram settings" ON public.telegram_settings;
CREATE POLICY "Users manage own telegram settings" ON public.telegram_settings
  FOR ALL USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- STEP 7: job_messages (Team Mode)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_messages (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     uuid        REFERENCES public.agent_jobs(id) ON DELETE CASCADE NOT NULL,
  role       text        NOT NULL CHECK (role IN ('user', 'agent')),
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_messages_job ON public.job_messages (job_id, created_at);

ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Job owner reads messages"   ON public.job_messages;
DROP POLICY IF EXISTS "Job owner inserts messages" ON public.job_messages;
CREATE POLICY "Job owner reads messages" ON public.job_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agent_jobs WHERE id = job_id AND user_id = auth.uid())
  );
CREATE POLICY "Job owner inserts messages" ON public.job_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.agent_jobs WHERE id = job_id AND user_id = auth.uid())
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 8: agent_ratings + trigger
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agent_ratings (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     uuid        REFERENCES public.agent_jobs(id) ON DELETE SET NULL UNIQUE,
  agent_id   uuid        REFERENCES public.custom_agents(id) ON DELETE CASCADE,
  rater_id   uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score      integer     NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_ratings_agent ON public.agent_ratings (agent_id);

ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ratings visible to all"  ON public.agent_ratings;
DROP POLICY IF EXISTS "Job owner can rate once" ON public.agent_ratings;
CREATE POLICY "Ratings visible to all"  ON public.agent_ratings FOR SELECT USING (true);
CREATE POLICY "Job owner can rate once" ON public.agent_ratings FOR INSERT WITH CHECK (rater_id = auth.uid());

-- Trigger: keep custom_agents.rating in sync
CREATE OR REPLACE FUNCTION public.update_agent_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.custom_agents
  SET rating = (
    SELECT ROUND(AVG(score)::numeric, 2)
    FROM public.agent_ratings
    WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
  )
  WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_agent_rating ON public.agent_ratings;
CREATE TRIGGER trg_update_agent_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_agent_rating();


-- ─────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────
-- Tables created / patched:
--   agent_jobs (+ creator_id, price_usd, payment_status, parent_job_id)
--   agent_logs
--   custom_agents
--   agent_balances
--   agent_transactions
--   telegram_settings
--   job_messages
--   agent_ratings
-- ─────────────────────────────────────────────────────────────
