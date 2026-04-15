-- FreelanceHub: Portfolio Storage + Table
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. portfolio_items table (if not exists) ─────────────────
create table if not exists public.portfolio_items (
  id            uuid default gen_random_uuid() primary key,
  freelancer_id uuid references auth.users on delete cascade not null,
  title         text not null,
  image_url     text,
  project_url   text,
  category      text,
  created_at    timestamptz not null default now()
);

create index if not exists portfolio_items_freelancer_idx on public.portfolio_items(freelancer_id);

-- RLS
alter table public.portfolio_items enable row level security;

drop policy if exists "Portfolio items are public" on public.portfolio_items;
create policy "Portfolio items are public"
  on public.portfolio_items for select using (true);

drop policy if exists "Users manage own portfolio" on public.portfolio_items;
create policy "Users manage own portfolio"
  on public.portfolio_items for all
  using (auth.uid() = freelancer_id)
  with check (auth.uid() = freelancer_id);

-- ── 2. Storage bucket ────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New bucket
-- Name: portfolio, Public: true
-- OR via SQL:

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS
drop policy if exists "Portfolio images are public" on storage.objects;
create policy "Portfolio images are public"
  on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "Users upload own portfolio images" on storage.objects;
create policy "Users upload own portfolio images"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own portfolio images" on storage.objects;
create policy "Users delete own portfolio images"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
