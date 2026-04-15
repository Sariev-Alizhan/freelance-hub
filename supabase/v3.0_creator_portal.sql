-- FreelanceHub v3.0 — Creator Portal, Escrow, Agent Builder
-- Run in: Supabase Dashboard → SQL Editor

-- ─── 1. Alter agent_jobs: add price + payment tracking ───────────────────────
ALTER TABLE public.agent_jobs
  ADD COLUMN IF NOT EXISTS creator_id      uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS price_usd       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status  text    NOT NULL DEFAULT 'free'
    CHECK (payment_status IN ('free', 'held', 'paid', 'refunded'));

-- ─── 2. Agent balances (one row per user) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_balances (
  user_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  balance       integer NOT NULL DEFAULT 1000,  -- starts with $10 demo credit (in cents)
  held          integer NOT NULL DEFAULT 0,
  total_earned  integer NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own balance" ON public.agent_balances
  FOR SELECT USING (user_id = auth.uid());

-- ─── 3. Transactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_transactions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type        text        NOT NULL CHECK (type IN ('topup', 'hold', 'payout', 'refund', 'fee')),
  amount      integer     NOT NULL,   -- cents, signed (+/-)
  job_id      uuid        REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_tx_user ON public.agent_transactions (user_id, created_at DESC);

ALTER TABLE public.agent_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.agent_transactions
  FOR SELECT USING (user_id = auth.uid());

-- ─── 4. Custom agents (Agent Builder) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.custom_agents (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id      uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name            text        NOT NULL,
  tagline         text        NOT NULL,
  description     text        NOT NULL DEFAULT '',
  category        text        NOT NULL DEFAULT 'custom',
  skills          text[]      DEFAULT '{}',
  system_prompt   text        NOT NULL,
  price_per_task  integer     NOT NULL DEFAULT 10,  -- USD
  model           text        NOT NULL DEFAULT 'claude-sonnet-4.6',
  is_published    boolean     NOT NULL DEFAULT true,
  tasks_completed integer     NOT NULL DEFAULT 0,
  rating          numeric(3,2) DEFAULT 5.0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_agents_creator    ON public.custom_agents (creator_id);
CREATE INDEX IF NOT EXISTS idx_custom_agents_published  ON public.custom_agents (is_published);

ALTER TABLE public.custom_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published agents visible to all" ON public.custom_agents
  FOR SELECT USING (is_published = true OR creator_id = auth.uid());
CREATE POLICY "Creators manage own agents" ON public.custom_agents
  FOR ALL USING (creator_id = auth.uid());

-- ─── 5. Telegram settings (per creator) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.telegram_settings (
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bot_token   text,
  channel_id  text,
  is_active   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own telegram settings" ON public.telegram_settings
  FOR ALL USING (user_id = auth.uid());
