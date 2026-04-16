-- User-authored feed posts
CREATE TABLE IF NOT EXISTS feed_posts (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  tags       text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_user    ON feed_posts(user_id);

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read"   ON feed_posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON feed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON feed_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "posts_update" ON feed_posts FOR UPDATE USING (auth.uid() = user_id);
