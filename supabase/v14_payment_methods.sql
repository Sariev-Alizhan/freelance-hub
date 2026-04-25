-- ═══════════════════════════════════════════════════════════════════════════
-- FreelanceHub v14 — User-managed payment methods
-- Stores how each user wants to be paid (USDT, IBAN, Wise, PayPal, etc.).
-- The platform never processes money — this is just contact info for direct deals.
-- Run in Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Shape:
-- [
--   { "type": "usdt_trc20", "value": "TRx...", "note": "preferred" },
--   { "type": "wise",       "value": "@alizhan",  "note": "USD only"   }
-- ]
-- Allowed types (validated client-side, not via CHECK to keep schema flexible):
-- usdt_trc20 | usdt_erc20 | btc | ton | wise | revolut | paypal | payoneer
-- iban | card | other
