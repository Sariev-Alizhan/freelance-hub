-- v7: Add social link columns to freelancer_profiles
-- Run this in the Supabase SQL editor to enable the social links feature

ALTER TABLE freelancer_profiles
  ADD COLUMN IF NOT EXISTS telegram_url   text,
  ADD COLUMN IF NOT EXISTS instagram_url  text,
  ADD COLUMN IF NOT EXISTS twitter_url    text,
  ADD COLUMN IF NOT EXISTS youtube_url    text,
  ADD COLUMN IF NOT EXISTS tiktok_url     text;
