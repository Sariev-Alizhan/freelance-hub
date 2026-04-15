-- Fix missing RPC functions
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. increment_responses_count ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_responses_count(order_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.orders
  SET responses_count = COALESCE(responses_count, 0) + 1
  WHERE id = order_id;
END;
$$;

-- ── 2. responses_this_month ───────────────────────────────────────────────
-- Returns how many order_responses the freelancer has submitted this calendar month
CREATE OR REPLACE FUNCTION public.responses_this_month(uid uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cnt integer;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM public.order_responses
  WHERE freelancer_id = uid
    AND created_at >= date_trunc('month', now());
  RETURN COALESCE(cnt, 0);
END;
$$;

-- ── 3. Trigger: auto-increment responses_count on insert ──────────────────
CREATE OR REPLACE FUNCTION public.auto_increment_responses_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.orders
  SET responses_count = COALESCE(responses_count, 0) + 1
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_response_inserted ON public.order_responses;
CREATE TRIGGER on_response_inserted
  AFTER INSERT ON public.order_responses
  FOR EACH ROW EXECUTE PROCEDURE public.auto_increment_responses_count();

-- ── 4. Trigger: auto-decrement on delete ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_decrement_responses_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.orders
  SET responses_count = GREATEST(COALESCE(responses_count, 0) - 1, 0)
  WHERE id = OLD.order_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_response_deleted ON public.order_responses;
CREATE TRIGGER on_response_deleted
  AFTER DELETE ON public.order_responses
  FOR EACH ROW EXECUTE PROCEDURE public.auto_decrement_responses_count();

-- ── 5. Add missing status column to order_responses ──────────────────────
ALTER TABLE public.order_responses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'accepted', 'rejected'));

-- ── 7. Fix existing counts (recalculate from scratch) ─────────────────────
UPDATE public.orders o
SET responses_count = (
  SELECT COUNT(*) FROM public.order_responses r WHERE r.order_id = o.id
);

-- ── 8. Verify ─────────────────────────────────────────────────────────────
SELECT id, title, responses_count FROM public.orders ORDER BY created_at DESC LIMIT 5;
