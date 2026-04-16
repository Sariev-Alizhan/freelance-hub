-- Reactions on individual messages (👍❤️😂 etc.)
CREATE TABLE IF NOT EXISTS message_reactions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji      text NOT NULL CHECK (char_length(emoji) <= 8),
  created_at timestamptz DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_msg_reactions_msg ON message_reactions(message_id);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_react_read"   ON message_reactions FOR SELECT USING (true);
CREATE POLICY "msg_react_insert" ON message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "msg_react_delete" ON message_reactions FOR DELETE USING (auth.uid() = user_id);
