-- Instagram-style 24-hour Stories
CREATE TABLE IF NOT EXISTS stories (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image')),
  content    text,                          -- text content for text stories
  bg_color   text DEFAULT '#5e6ad2',        -- gradient/solid background
  media_url  text,                          -- image URL for image stories
  views      int  NOT NULL DEFAULT 0,       -- denormalised view count
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Track who viewed which story (unique per viewer per story)
CREATE TABLE IF NOT EXISTS story_views (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id   uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_exp ON stories(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_exp      ON stories(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer ON story_views(viewer_id);

-- RLS
ALTER TABLE stories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_read"   ON stories FOR SELECT USING (expires_at > now());
CREATE POLICY "stories_insert" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stories_delete" ON stories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "views_read"   ON story_views FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() IN (SELECT user_id FROM stories WHERE id = story_id));
CREATE POLICY "views_insert" ON story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);
