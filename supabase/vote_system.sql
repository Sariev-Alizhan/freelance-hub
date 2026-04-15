-- ── Democratic Feature Voting System (The Parliament) ────────────────────────
-- People propose and vote on what gets built next.

CREATE TABLE IF NOT EXISTS feature_requests (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  category     text DEFAULT 'general',  -- general | ai | payments | ux | mobile | api
  votes_count  integer NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'proposed',  -- proposed | planned | in_progress | done | rejected
  admin_note   text,  -- Admin comment on status
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_votes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id   uuid NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, request_id)
);

-- RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads feature requests"   ON feature_requests FOR SELECT USING (true);
CREATE POLICY "Auth users create requests"      ON feature_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin updates status"            ON feature_requests FOR UPDATE USING (true);

ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own votes"  ON feature_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can vote"        ON feature_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unvote"      ON feature_votes FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS feature_requests_votes_idx ON feature_requests(votes_count DESC);
CREATE INDEX IF NOT EXISTS feature_requests_status_idx ON feature_requests(status);
CREATE INDEX IF NOT EXISTS feature_votes_request_idx ON feature_votes(request_id);
CREATE INDEX IF NOT EXISTS feature_votes_user_idx ON feature_votes(user_id);

-- Trigger: keep votes_count in sync
CREATE OR REPLACE FUNCTION sync_votes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feature_requests SET votes_count = votes_count + 1 WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feature_requests SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_votes ON feature_votes;
CREATE TRIGGER trg_sync_votes
  AFTER INSERT OR DELETE ON feature_votes
  FOR EACH ROW EXECUTE FUNCTION sync_votes_count();

-- Seed: initial feature ideas from the team
INSERT INTO feature_requests (title, description, category, votes_count, status) VALUES
  ('Reviews & Ratings', 'After order completion, both sides rate each other. Builds trust for new users.', 'general', 47, 'in_progress'),
  ('Escrow Payments', 'Budget locked on order creation, released on milestone approval. Safe for everyone.', 'payments', 89, 'planned'),
  ('AI Freelancer Profiles', 'AI agents as full freelancers with ratings, reviews, and portfolios.', 'ai', 63, 'planned'),
  ('Mobile App', 'Native iOS and Android app. Push notifications, quick apply, chat.', 'mobile', 112, 'proposed'),
  ('Team Accounts', 'One company account managing multiple freelancers. Useful for agencies.', 'general', 38, 'proposed'),
  ('Skill Verification Tests', 'Short AI-generated tests to verify claimed skills. Verified badge on profile.', 'general', 55, 'proposed'),
  ('Public API', 'API access for businesses to search freelancers and post orders programmatically.', 'api', 29, 'proposed'),
  ('Dispute Resolution', '72-hour arbitration by a random community jury. Fair outcomes for both sides.', 'general', 71, 'planned'),
  ('Crypto Payments', 'Pay and receive in USDT, BTC. For international freelancers.', 'payments', 44, 'proposed'),
  ('AI Order Writer', 'Describe your project in 2 sentences, AI writes the full order brief.', 'ai', 58, 'proposed')
ON CONFLICT DO NOTHING;
