-- ═══════════════════════════════════════════════════════════════════════════
-- FreelanceHub v6 — Pro Profile: Resume, Work Experience, Documents, Portfolio Site
-- Run in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend freelancer_profiles ─────────────────────────────────────────
ALTER TABLE freelancer_profiles
  ADD COLUMN IF NOT EXISTS portfolio_website  text,            -- https://johndoe.com
  ADD COLUMN IF NOT EXISTS resume_url         text,            -- Supabase storage URL
  ADD COLUMN IF NOT EXISTS resume_filename    text,            -- original file name
  ADD COLUMN IF NOT EXISTS headline           text,            -- "Full-stack dev × 7 yrs"
  ADD COLUMN IF NOT EXISTS tagline            text,            -- short 1-liner
  ADD COLUMN IF NOT EXISTS linkedin_url       text,
  ADD COLUMN IF NOT EXISTS github_url         text,
  ADD COLUMN IF NOT EXISTS telegram_username  text;

-- ── 2. Work experience table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_experience (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company         text         NOT NULL,
  position        text         NOT NULL,
  description     text,
  start_date      date         NOT NULL,
  end_date        date,                       -- NULL = current
  is_current      boolean      NOT NULL DEFAULT false,
  location        text,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS work_exp_user_idx ON work_experience (user_id, start_date DESC);

ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work experience is public"
  ON work_experience FOR SELECT USING (true);

CREATE POLICY "Users manage own experience"
  ON work_experience FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Attachments / documents table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile_documents (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          text        NOT NULL,           -- "Portfolio 2026.pdf"
  url           text        NOT NULL,           -- Supabase storage public URL
  file_type     text        NOT NULL,           -- 'application/pdf', 'image/png', etc.
  file_size     bigint,                         -- bytes
  doc_type      text        NOT NULL DEFAULT 'other',  -- 'resume' | 'portfolio' | 'certificate' | 'other'
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_docs_user_idx ON profile_documents (user_id, created_at DESC);

ALTER TABLE profile_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents are public"
  ON profile_documents FOR SELECT USING (true);

CREATE POLICY "Users manage own documents"
  ON profile_documents FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. Storage bucket: resumes (private, user-scoped) ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 'resumes', true,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
CREATE POLICY "Resumes are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Users upload own resume" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own resume" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── 5. Extend portfolio_items with description + tags ─────────────────────
ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS description  text,
  ADD COLUMN IF NOT EXISTS tags         text[],
  ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Run once in Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════════════════
