-- LinkedIn-style recommendations.
-- Different from freelancer_reviews: no star rating, text-only testimonial
-- from a named person with their role/company. Recipient moderates
-- (pending → approved/declined) before the recommendation goes public.

CREATE TABLE IF NOT EXISTS recommendations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Snapshot of author's headline/title at time of write, so edits to
  -- their profile don't rewrite history. e.g. "Head of Growth at Yandex".
  author_title    text,
  -- How did they work together?
  relationship    text NOT NULL CHECK (relationship IN ('client','colleague','manager','report','other')),
  body            text NOT NULL CHECK (char_length(body) BETWEEN 50 AND 2000),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden','declined')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  -- One per (recipient, author) pair — author edits overwrite.
  UNIQUE (recipient_id, author_id),
  -- Can't recommend yourself.
  CHECK (recipient_id <> author_id)
);

CREATE INDEX IF NOT EXISTS idx_recs_recipient_status ON recommendations(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_recs_author           ON recommendations(author_id);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved recs.
-- Recipient can also read their own pending/hidden queue.
-- Author can read their own (to edit or check status).
CREATE POLICY "recs_read" ON recommendations FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = recipient_id
    OR auth.uid() = author_id
  );

-- Only the author can create / update their recommendation.
CREATE POLICY "recs_author_write" ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "recs_author_update" ON recommendations FOR UPDATE
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Recipient can moderate (status changes) — done server-side via service
-- role (see /api/recommendations/[id] PATCH). A second policy lets the
-- recipient update status even though they're not the author:
CREATE POLICY "recs_recipient_moderate" ON recommendations FOR UPDATE
  USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

-- Delete: author or recipient.
CREATE POLICY "recs_delete" ON recommendations FOR DELETE
  USING (auth.uid() = author_id OR auth.uid() = recipient_id);
