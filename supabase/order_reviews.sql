-- ── Bidirectional Order Reviews ───────────────────────────────────────────────
-- After order completion: client reviews freelancer, freelancer reviews client.
-- Linked to a specific order → prevents fake reviews, builds verified trust.

CREATE TABLE IF NOT EXISTS order_reviews (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         text        NOT NULL CHECK (role IN ('client', 'freelancer')),
  rating       integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         text        NOT NULL CHECK (char_length(text) >= 10),
  created_at   timestamptz DEFAULT now(),
  UNIQUE (order_id, reviewer_id)  -- one review per person per order
);

-- RLS
ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews visible to all"          ON order_reviews FOR SELECT USING (true);
CREATE POLICY "Auth users can review"           ON order_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS order_reviews_reviewee_idx ON order_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS order_reviews_order_idx    ON order_reviews(order_id);

-- Trigger: update freelancer_profiles.rating after each review on a freelancer
CREATE OR REPLACE FUNCTION sync_freelancer_rating_from_orders()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  avg_rating  numeric;
  review_cnt  integer;
BEGIN
  -- Only recalculate when reviewee is a freelancer (role = 'client' means client reviewed freelancer)
  IF NEW.role = 'client' THEN
    SELECT ROUND(AVG(rating)::numeric, 1), COUNT(*)
    INTO avg_rating, review_cnt
    FROM order_reviews
    WHERE reviewee_id = NEW.reviewee_id AND role = 'client';

    UPDATE freelancer_profiles
    SET rating = avg_rating, reviews_count = review_cnt
    WHERE user_id = NEW.reviewee_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_freelancer_rating ON order_reviews;
CREATE TRIGGER trg_sync_freelancer_rating
  AFTER INSERT ON order_reviews
  FOR EACH ROW EXECUTE FUNCTION sync_freelancer_rating_from_orders();
