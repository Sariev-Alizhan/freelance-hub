-- FreelanceHub v2.0 — AI Agent Jobs & Logs
-- Run in: Supabase Dashboard → SQL Editor

-- ─── 1. agent_jobs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_jobs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_type  text        NOT NULL CHECK (agent_type IN ('smm', 'landing')),
  status      text        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'running', 'awaiting_approval', 'approved', 'rejected', 'failed')),
  input       jsonb       NOT NULL DEFAULT '{}',
  output      jsonb,
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_jobs_user   ON public.agent_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_jobs_status ON public.agent_jobs (status);

-- ─── 2. agent_logs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id      uuid        REFERENCES public.agent_jobs(id) ON DELETE CASCADE NOT NULL,
  step        text        NOT NULL,
  message     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_job ON public.agent_logs (job_id, created_at ASC);

-- ─── 3. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.agent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own jobs"
  ON public.agent_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users create own jobs"
  ON public.agent_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view logs of own jobs"
  ON public.agent_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_jobs j
      WHERE j.id = job_id AND j.user_id = auth.uid()
    )
  );
