-- ── Escrow System ─────────────────────────────────────────────────────────────
-- Client funds escrow when order starts. Platform holds. Releases on approval.
-- Platform earns 8% on every release. Refunds go back to client if cancelled.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS escrow_status  text    DEFAULT 'none',  -- none | funded | released | refunded | disputed
  ADD COLUMN IF NOT EXISTS escrow_amount  integer DEFAULT 0,        -- amount held in escrow (₸)
  ADD COLUMN IF NOT EXISTS platform_fee   integer DEFAULT 0,        -- 8% of escrow_amount
  ADD COLUMN IF NOT EXISTS funded_at      timestamptz,
  ADD COLUMN IF NOT EXISTS released_at    timestamptz;

-- Valid status values: none | funded | released | refunded | disputed
CREATE INDEX IF NOT EXISTS orders_escrow_idx ON orders(escrow_status) WHERE escrow_status != 'none';

-- Escrow transactions log (every movement of money)
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type         text        NOT NULL CHECK (type IN ('fund', 'release', 'refund', 'fee')),
  amount       integer     NOT NULL,      -- in ₸
  actor_id     uuid        REFERENCES profiles(id),
  note         text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order parties see transactions" ON escrow_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id
      AND (client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM order_responses
          WHERE order_id = orders.id AND freelancer_id = auth.uid() AND status = 'accepted'
        ))
    )
  );
