-- b01: Performance indexes — 3-5x speedup on main listing queries
-- Run in Supabase → SQL Editor

CREATE INDEX IF NOT EXISTS idx_orders_cat_created
  ON orders (category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fp_cat_rating
  ON freelancer_profiles (category, rating DESC);

CREATE INDEX IF NOT EXISTS idx_msg_conv_created
  ON messages (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_responses_order
  ON order_responses (order_id, status);

CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles (username);
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
-- Denormalize is_verified onto profiles so feed/messages queries can read it without a join
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

-- Sync existing verified freelancers
UPDATE profiles p
SET    is_verified = true
FROM   freelancer_profiles fp
WHERE  fp.user_id = p.id
  AND  fp.is_verified = true;
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
-- Reply-to support for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id   uuid REFERENCES messages(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_text text;       -- denormalised quote (survives delete)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_name text;       -- sender display name
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
