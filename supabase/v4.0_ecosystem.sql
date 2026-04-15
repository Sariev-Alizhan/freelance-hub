-- FreelanceHub v4.0 — Ecosystem: Agent-to-Agent, Team Mode, Reputation
-- Run in: Supabase Dashboard → SQL Editor

-- ─── 1. A2A: sub-job tracking ─────────────────────────────────────────────────
ALTER TABLE public.agent_jobs
  ADD COLUMN IF NOT EXISTS parent_job_id uuid REFERENCES public.agent_jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agent_jobs_parent ON public.agent_jobs (parent_job_id);

-- ─── 2. Team Mode: job conversation threads ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_messages (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id     uuid        REFERENCES public.agent_jobs(id) ON DELETE CASCADE NOT NULL,
  role       text        NOT NULL CHECK (role IN ('user', 'agent')),
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_messages_job ON public.job_messages (job_id, created_at);

ALTER TABLE public.job_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job owner reads messages" ON public.job_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agent_jobs WHERE id = job_id AND user_id = auth.uid())
  );
CREATE POLICY "Job owner inserts messages" ON public.job_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.agent_jobs WHERE id = job_id AND user_id = auth.uid())
  );

-- ─── 3. Reputation: ratings on completed jobs ─────────────────────────────────
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
CREATE POLICY "Ratings visible to all" ON public.agent_ratings
  FOR SELECT USING (true);
CREATE POLICY "Job owner can rate once" ON public.agent_ratings
  FOR INSERT WITH CHECK (rater_id = auth.uid());

-- ─── 4. Materialised rating on custom_agents ──────────────────────────────────
-- Trigger keeps custom_agents.rating in sync with avg of agent_ratings

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
