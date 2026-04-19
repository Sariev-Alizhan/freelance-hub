-- Featured work — pinned portfolio items (≤4 per freelancer).
-- Enforcement: DB allows any count; API caps at 4 with a clear error.

ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS is_featured       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_position integer,
  ADD COLUMN IF NOT EXISTS description       text;

DO $$ BEGIN
  ALTER TABLE portfolio_items
    ADD CONSTRAINT portfolio_items_desc_len
    CHECK (description IS NULL OR char_length(description) <= 400);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_portfolio_featured
  ON portfolio_items(freelancer_id, featured_position)
  WHERE is_featured = true;
