-- Instagram-style follow/friend system
-- One-way follow relationship. When mutual → "friends" (computed, not stored).

CREATE TABLE IF NOT EXISTS follows (
  follower   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower, following),
  CHECK (follower <> following)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Follow graph is public (counts, lists).
DROP POLICY IF EXISTS "follows_read"   ON follows;
DROP POLICY IF EXISTS "follows_insert" ON follows;
DROP POLICY IF EXISTS "follows_delete" ON follows;

CREATE POLICY "follows_read"   ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower);

-- Allow 'new_follower' as a notification type alongside existing ones.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('new_response','new_message','order_accepted','order_completed','new_follower'));
