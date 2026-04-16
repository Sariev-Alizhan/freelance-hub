-- Friends / follow system
CREATE TABLE IF NOT EXISTS friendships (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status     text NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (requester, addressee),
  CHECK (requester <> addressee)
);

CREATE INDEX IF NOT EXISTS idx_friendships_req ON friendships(requester);
CREATE INDEX IF NOT EXISTS idx_friendships_adr ON friendships(addressee);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
-- Both parties (and public for accepted) can read
CREATE POLICY "friends_read"   ON friendships FOR SELECT USING (
  auth.uid() IN (requester, addressee) OR status = 'accepted'
);
CREATE POLICY "friends_insert" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester);
CREATE POLICY "friends_update" ON friendships FOR UPDATE USING (auth.uid() IN (requester, addressee));
CREATE POLICY "friends_delete" ON friendships FOR DELETE USING (auth.uid() IN (requester, addressee));
