-- Skill endorsements — any logged-in user can +1 another user's skill.
-- Shape mirrors follows: (endorser, user_id, skill) composite key.

CREATE TABLE IF NOT EXISTS skill_endorsements (
  endorser_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill       text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (endorser_id, user_id, skill),
  CHECK (endorser_id <> user_id),
  CHECK (char_length(skill) BETWEEN 1 AND 64)
);

CREATE INDEX IF NOT EXISTS idx_skill_endorsements_user  ON skill_endorsements(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_skill ON skill_endorsements(user_id, skill);

ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "endorsements_read"   ON skill_endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_insert" ON skill_endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "endorsements_delete" ON skill_endorsements FOR DELETE USING (auth.uid() = endorser_id);
