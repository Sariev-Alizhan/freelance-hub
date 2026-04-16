-- v8: Add progress_status to orders table
-- Run this in the Supabase SQL editor to enable MilestoneTracker

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS progress_status text DEFAULT 'not_started'
    CHECK (progress_status IN ('not_started', 'in_progress', 'review', 'completed'));
