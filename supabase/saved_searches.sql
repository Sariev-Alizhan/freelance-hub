-- FreelanceHub: Saved Searches
-- Run in: Supabase Dashboard → SQL Editor

create table if not exists public.saved_searches (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  label           text not null,           -- display name, e.g. "React developer"
  keyword         text,                    -- search string
  category        text,                    -- category slug or null = all
  urgent_only     boolean default false,
  last_checked_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists saved_searches_user_idx on public.saved_searches(user_id);

alter table public.saved_searches enable row level security;

create policy "Users manage own saved searches"
  on public.saved_searches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
