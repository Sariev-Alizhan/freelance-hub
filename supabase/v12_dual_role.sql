-- v12: Dual role (client ↔ freelancer switching)
-- Run in Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dual_role boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_mode text NOT NULL DEFAULT 'auto'
    CHECK (active_mode IN ('client', 'freelancer', 'auto'));

-- auto = determined by role column (default). Switching sets it explicitly.
