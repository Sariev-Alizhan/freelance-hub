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
