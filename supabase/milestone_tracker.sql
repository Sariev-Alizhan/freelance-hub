-- ── Milestone / Progress Tracker ─────────────────────────────────────────────
-- Run this in Supabase SQL editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS progress_status text DEFAULT 'not_started';

-- Valid values: not_started | in_progress | review | done
-- Only meaningful when order.status = 'in_progress'

CREATE INDEX IF NOT EXISTS orders_progress_idx ON orders(progress_status)
  WHERE status = 'in_progress';
