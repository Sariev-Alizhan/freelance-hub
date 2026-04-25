-- v15: drop unused social-network features (stories, story_highlights, reels)
--
-- Production data after 9 days of having these features (15 users):
--   stories:                1 row, 0 views
--   story_views:            0
--   story_highlights:       0
--   story_highlight_items:  0
--   reels:                  0
--
-- Compared to actual usage (orders 12, responses 3, messages 15) the social
-- features are unused. They duplicate Instagram-style engagement loops on a
-- transactional platform. Dropping schema, related code already removed.
-- Reversible via git history if direction changes.

DROP TABLE IF EXISTS story_views          CASCADE;
DROP TABLE IF EXISTS story_highlight_items CASCADE;
DROP TABLE IF EXISTS story_highlights     CASCADE;
DROP TABLE IF EXISTS stories              CASCADE;
DROP TABLE IF EXISTS reels                CASCADE;
