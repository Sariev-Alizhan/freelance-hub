-- FreelanceHub v1.4 migrations
-- Run these in Supabase SQL Editor (Settings → SQL Editor)

-- ─── 1. Chat attachment columns ──────────────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url  text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type text; -- 'image' | 'file'
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name text;

-- ─── 2. Notification trigger on new message ──────────────────────────────────
-- Inserts a notification row for the recipient whenever a new message arrives.
-- Requires the notifications table from notifications_schema.sql.

CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recipient_id uuid;
  sender_name  text;
BEGIN
  -- Find the other participant
  SELECT CASE
    WHEN participant_1 = NEW.sender_id THEN participant_2
    ELSE participant_1
  END
  INTO recipient_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Get sender display name
  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  -- Insert notification
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    recipient_id,
    'new_message',
    COALESCE(sender_name, 'Новое сообщение'),
    LEFT(COALESCE(NEW.text, NEW.attachment_name, 'Вложение'), 100),
    '/messages'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_message();

-- ─── 3. Storage bucket: chat-attachments ────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New bucket:
--   Name: chat-attachments
--   Public: YES
-- Then add this RLS policy in Storage → Policies:

-- INSERT policy (authenticated users can upload):
-- (auth.role() = 'authenticated')

-- SELECT policy (public read — bucket is public so this is automatic)

-- ─── 4. v1.3 migrations (if not already applied) ────────────────────────────
ALTER TABLE freelancer_profiles
  ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'open';

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS project_url text;
