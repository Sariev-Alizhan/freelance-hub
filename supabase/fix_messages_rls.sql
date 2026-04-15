-- Fix messages RLS — drop policies that reference non-existent conversation_participants
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. Drop all existing message policies ──────────────────────────────────
DROP POLICY IF EXISTS "Participants can view messages"    ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages"    ON public.messages;
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.messages;
DROP POLICY IF EXISTS "Users can read their messages"     ON public.messages;
DROP POLICY IF EXISTS "Users can send messages"           ON public.messages;
DROP POLICY IF EXISTS "Users can update messages"         ON public.messages;

-- ── 2. Recreate correct policies ───────────────────────────────────────────

-- SELECT: only conversation participants can read messages
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() IN (
      SELECT participant_1 FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT participant_2 FROM public.conversations WHERE id = conversation_id
    )
  );

-- INSERT: only conversation participants can send (sender must be themselves)
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT participant_1 FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT participant_2 FROM public.conversations WHERE id = conversation_id
    )
  );

-- UPDATE: only the recipient can mark messages as read
CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() != sender_id
    AND auth.uid() IN (
      SELECT participant_1 FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT participant_2 FROM public.conversations WHERE id = conversation_id
    )
  );

-- ── 3. Also fix attachment columns (idempotent) ────────────────────────────
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url  text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE public.messages ALTER COLUMN text SET DEFAULT '';

-- ── 4. Verify ──────────────────────────────────────────────────────────────
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'messages';
