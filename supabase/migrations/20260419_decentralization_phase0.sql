-- Phase 0 — Decentralization foundation.
-- Additive only: every column is nullable or has a default, so nothing breaks.
-- Opens doors for: DID identity, ActivityPub federation, VC badges, content addressing.

-- ─── Federation + identity on profiles ──────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS did              text UNIQUE,                         -- did:ethr / did:key / did:web
  ADD COLUMN IF NOT EXISTS actor_url        text,                                -- ActivityPub actor URL
  ADD COLUMN IF NOT EXISTS public_key_pem   text,                                -- for HTTP Signatures + DID verification
  ADD COLUMN IF NOT EXISTS origin_instance  text NOT NULL DEFAULT 'freelance-hub.kz';

CREATE INDEX IF NOT EXISTS idx_profiles_did
  ON profiles(did) WHERE did IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_actor_url
  ON profiles(actor_url) WHERE actor_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_origin
  ON profiles(origin_instance);

-- ─── Federation tracking on content tables ─────────────────────────────────
ALTER TABLE feed_posts
  ADD COLUMN IF NOT EXISTS origin_instance    text NOT NULL DEFAULT 'freelance-hub.kz',
  ADD COLUMN IF NOT EXISTS remote_activity_id text UNIQUE,                       -- AP object URL from remote instance
  ADD COLUMN IF NOT EXISTS media_cid          text;                              -- IPFS-style content hash

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS origin_instance    text NOT NULL DEFAULT 'freelance-hub.kz',
  ADD COLUMN IF NOT EXISTS remote_activity_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS media_cid          text;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS origin_instance    text NOT NULL DEFAULT 'freelance-hub.kz',
  ADD COLUMN IF NOT EXISTS remote_activity_id text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_feed_posts_origin ON feed_posts(origin_instance);
CREATE INDEX IF NOT EXISTS idx_stories_origin    ON stories(origin_instance);
CREATE INDEX IF NOT EXISTS idx_orders_origin     ON orders(origin_instance);

-- ─── Verifiable Credentials (VC) — skills, company, identity badges ─────────
CREATE TABLE IF NOT EXISTS verifications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject_did      text,
  credential_type  text NOT NULL,                          -- 'skill' | 'company' | 'identity' | 'kyc'
  credential_jwt   text NOT NULL,                          -- signed W3C Verifiable Credential as JWT
  issuer_did       text NOT NULL,
  claim            jsonb NOT NULL DEFAULT '{}'::jsonb,     -- decoded claim for querying
  issued_at        timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz,
  revoked          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_subject
  ON verifications(subject_id) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_verifications_type
  ON verifications(credential_type) WHERE revoked = false;
CREATE INDEX IF NOT EXISTS idx_verifications_did
  ON verifications(subject_did) WHERE revoked = false;

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-revoked credentials (public claims).
CREATE POLICY "verifications_read" ON verifications
  FOR SELECT USING (revoked = false);

-- Service role only for writes (issuance goes through server-side API with DID key).
CREATE POLICY "verifications_insert_service" ON verifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "verifications_update_service" ON verifications
  FOR UPDATE USING (auth.role() = 'service_role');

-- ─── ActivityPub inbox/outbox queue ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS federation_activities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction      text NOT NULL CHECK (direction IN ('inbox','outbox')),
  activity_type  text NOT NULL,                            -- 'Create' | 'Follow' | 'Like' | 'Announce' | ...
  actor_url      text NOT NULL,
  object_url     text,
  raw            jsonb NOT NULL,                           -- full AS2 payload
  processed      boolean NOT NULL DEFAULT false,
  error          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fed_activities_pending
  ON federation_activities(created_at) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_fed_activities_actor
  ON federation_activities(actor_url);

ALTER TABLE federation_activities ENABLE ROW LEVEL SECURITY;
-- No public access. Server-side code uses service role.
CREATE POLICY "fed_activities_service" ON federation_activities
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Federated followers (cross-instance follow graph) ──────────────────────
CREATE TABLE IF NOT EXISTS federated_followers (
  local_user_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  remote_actor   text NOT NULL,                            -- remote actor URL
  remote_inbox   text NOT NULL,                            -- where to deliver activities
  accepted       boolean NOT NULL DEFAULT false,           -- Follow accepted
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (local_user_id, remote_actor)
);

CREATE INDEX IF NOT EXISTS idx_fed_followers_actor
  ON federated_followers(remote_actor);

ALTER TABLE federated_followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fed_followers_read"    ON federated_followers FOR SELECT USING (true);
CREATE POLICY "fed_followers_service" ON federated_followers FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "fed_followers_delete"  ON federated_followers FOR DELETE USING (auth.role() = 'service_role');
