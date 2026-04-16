-- Reply-to support for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id   uuid REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_text text;       -- denormalised quote (survives delete)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_name text;       -- sender display name
