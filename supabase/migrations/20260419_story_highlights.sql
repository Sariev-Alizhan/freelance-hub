-- Instagram-style Story Highlights
-- Stories expire after 24h. Freelancers curate them into permanent
-- "highlights" (like Instagram) by snapshotting the content — so the
-- original story expiring/being deleted doesn't affect the highlight.

CREATE TABLE IF NOT EXISTS story_highlights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 30),
  cover_url   text,                  -- optional; falls back to first item's media/bg
  position    integer DEFAULT 0,     -- manual ordering
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_highlights_user ON story_highlights(user_id, position);

CREATE TABLE IF NOT EXISTS story_highlight_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id  uuid REFERENCES story_highlights(id) ON DELETE CASCADE NOT NULL,
  -- Snapshot of the story at the time of pinning. We do NOT keep an FK to
  -- stories because the original expires/may be deleted.
  type          text NOT NULL DEFAULT 'text' CHECK (type IN ('text','image')),
  content       text,
  bg_color      text DEFAULT '#5e6ad2',
  media_url     text,
  position      integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_highlight_items_h ON story_highlight_items(highlight_id, position);

ALTER TABLE story_highlights       ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_highlight_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "highlights_read"   ON story_highlights      FOR SELECT USING (true);
CREATE POLICY "highlights_owner"  ON story_highlights      FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "highlight_items_read"  ON story_highlight_items FOR SELECT USING (true);
CREATE POLICY "highlight_items_owner" ON story_highlight_items FOR ALL
  USING (EXISTS (SELECT 1 FROM story_highlights h WHERE h.id = story_highlight_items.highlight_id AND h.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM story_highlights h WHERE h.id = story_highlight_items.highlight_id AND h.user_id = auth.uid()));
