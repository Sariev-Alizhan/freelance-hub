-- Fix messages RLS v2 — nuclear approach: drop ALL policies on messages
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. Drop every policy on messages (catches any name) ───────────────────
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'messages' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages', pol.policyname);
  END LOOP;
END $$;

-- ── 2. Drop every trigger on messages ─────────────────────────────────────
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table = 'messages' AND event_object_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.messages', trig.trigger_name);
  END LOOP;
END $$;

-- ── 3. Recreate correct update_last_message trigger ───────────────────────
CREATE OR REPLACE FUNCTION public.update_last_message()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.conversations
  SET last_message = NEW.text, last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_last_message();

-- ── 4. Recreate correct RLS policies ──────────────────────────────────────

-- SELECT: conversation participants can read messages
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- INSERT: only a participant can send, sender_id must match caller
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- UPDATE: recipient can mark as read
CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() != sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

-- ── 5. Attachment columns (idempotent) ────────────────────────────────────
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url  text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE public.messages ALTER COLUMN text SET DEFAULT '';

-- ── 6. Verify ─────────────────────────────────────────────────────────────
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages';
