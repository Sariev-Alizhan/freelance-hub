-- FreelanceHub — Chat fixes migration
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. Add attachment columns to messages (if not exist) ─────────────────────
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_url  text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_type text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachment_name text;

-- ── 2. Fix messages text column — allow empty string for attachment-only msgs ─
-- The text NOT NULL constraint blocks attachment-only messages.
-- Change it to allow empty string but not null.
-- (If already nullable, this is a no-op)
ALTER TABLE public.messages ALTER COLUMN text SET DEFAULT '';

-- ── 3. Ensure conversations UPDATE policy exists (for last_message trigger) ──
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations' AND policyname = 'Participants can update conversation'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Participants can update conversation"
        ON public.conversations FOR UPDATE
        USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
    $p$;
  END IF;
END $$;

-- ── 4. Ensure chat-attachments storage bucket exists ─────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip','text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- ── 5. Storage RLS for chat-attachments ──────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;
CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

-- ── 6. Verify ─────────────────────────────────────────────────────────────────
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
