-- ── Telegram integration ─────────────────────────────────────────────────────
-- Run this in Supabase SQL editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id   bigint,
  ADD COLUMN IF NOT EXISTS telegram_link_code text;

-- Unique index so codes can't collide
CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_link_code_idx
  ON profiles(telegram_link_code) WHERE telegram_link_code IS NOT NULL;

-- Fast lookup for sending notifications
CREATE INDEX IF NOT EXISTS profiles_telegram_chat_id_idx
  ON profiles(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
