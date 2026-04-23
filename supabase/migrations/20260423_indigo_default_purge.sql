-- Purge leftover indigo (#5e6ad2) defaults on story-related tables.
-- Landing + app UI was flipped to signal-green #27a644 in earlier commits
-- (see commit 57bbf6e, 8909c47); these DB column defaults were missed, so
-- every new story / highlight / goal bucket was seeded with indigo bg.

ALTER TABLE IF EXISTS stories
  ALTER COLUMN bg_color SET DEFAULT '#27a644';

ALTER TABLE IF EXISTS story_highlights
  ALTER COLUMN bg_color SET DEFAULT '#27a644';

ALTER TABLE IF EXISTS goals_calendar
  ALTER COLUMN color SET DEFAULT '#27a644';

-- Repaint existing rows that still carry the indigo default. Safe because
-- indigo is banned brand-wide; no user-authored story uses that exact hex.
UPDATE stories          SET bg_color = '#27a644' WHERE bg_color = '#5e6ad2';
UPDATE story_highlights SET bg_color = '#27a644' WHERE bg_color = '#5e6ad2';
UPDATE goals_calendar   SET color    = '#27a644' WHERE color    = '#7170ff';
