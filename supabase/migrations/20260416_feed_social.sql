-- Feed social interactions: likes, dislikes, saves, reposts, comments
-- item_id = external item id, e.g. 'hn-12345', 'reddit_ai-abc', 'update-v1.0.0-rc1'

CREATE TABLE IF NOT EXISTS feed_reactions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id    text NOT NULL,
  action     text NOT NULL CHECK (action IN ('like', 'dislike', 'save', 'repost')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, item_id, action)
);

CREATE TABLE IF NOT EXISTS feed_comments (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id    text NOT NULL,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast per-item lookups
CREATE INDEX IF NOT EXISTS idx_feed_reactions_item ON feed_reactions(item_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_user ON feed_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_item  ON feed_comments(item_id, created_at DESC);

-- RLS
ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments  ENABLE ROW LEVEL SECURITY;

-- Reactions: anyone can read counts, only auth users can mutate their own
CREATE POLICY "reactions_read"   ON feed_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON feed_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON feed_reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can read, only auth users can insert/delete their own
CREATE POLICY "comments_read"   ON feed_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON feed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON feed_comments FOR DELETE USING (auth.uid() = user_id);
