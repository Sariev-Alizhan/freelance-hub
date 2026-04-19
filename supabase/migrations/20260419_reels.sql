-- Short-form vertical video ("Reels").
-- Video files live in the existing `media` Supabase Storage bucket.
-- Likes reuse feed_reactions with item_id = 'reel:<uuid>'.

CREATE TABLE IF NOT EXISTS reels (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url         text NOT NULL,
  thumbnail_url     text,
  caption           text,
  duration_seconds  integer,          -- client-reported, for display hints
  aspect_ratio      numeric,          -- width/height, for layout (usually ~0.56)
  views             integer NOT NULL DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  CHECK (caption IS NULL OR char_length(caption) <= 500),
  CHECK (duration_seconds IS NULL OR (duration_seconds > 0 AND duration_seconds <= 300))
);

CREATE INDEX IF NOT EXISTS idx_reels_user    ON reels(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reels_created ON reels(created_at DESC);

ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reels_read"  ON reels FOR SELECT USING (true);
CREATE POLICY "reels_owner" ON reels FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
