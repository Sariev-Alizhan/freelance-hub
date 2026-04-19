-- Phase 4 — On-chain escrow.
-- Adds chain-tracking fields to orders so on-chain escrow state can sync with
-- the existing off-chain escrow workflow. Coexists with fiat escrow — the
-- `escrow_kind` discriminates which path an order is using.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS escrow_kind           text DEFAULT 'fiat'    -- 'fiat' | 'onchain'
    CHECK (escrow_kind IN ('fiat','onchain')),
  ADD COLUMN IF NOT EXISTS chain_id              integer,                -- 8453 mainnet, 84532 sepolia
  ADD COLUMN IF NOT EXISTS chain_escrow_id       text,                   -- bytes32 hex string
  ADD COLUMN IF NOT EXISTS chain_fund_tx         text,                   -- tx hash for fund()
  ADD COLUMN IF NOT EXISTS chain_release_tx      text,                   -- tx hash for release()
  ADD COLUMN IF NOT EXISTS chain_refund_tx       text,                   -- tx hash for refund()
  ADD COLUMN IF NOT EXISTS chain_client_address  text,                   -- 0x... who funded
  ADD COLUMN IF NOT EXISTS chain_freelancer_addr text,                   -- 0x... payout destination
  ADD COLUMN IF NOT EXISTS chain_amount_usdc     numeric(20,6);          -- USDC (6 decimals) for readable reporting

CREATE INDEX IF NOT EXISTS idx_orders_chain_escrow
  ON orders(chain_escrow_id) WHERE chain_escrow_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_escrow_kind
  ON orders(escrow_kind);
