-- ── Featured Boost (promoted orders) ─────────────────────────────────────────
-- Run this in Supabase SQL editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_promoted   boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS promoted_until timestamptz;

-- Index so promoted + open orders are served fast
CREATE INDEX IF NOT EXISTS orders_promoted_idx ON orders (is_promoted, status)
  WHERE is_promoted = true AND status = 'open';

-- Admin: promote an order for N days
-- UPDATE orders
--   SET is_promoted = true, promoted_until = now() + interval '7 days'
-- WHERE id = '<order_id>';
