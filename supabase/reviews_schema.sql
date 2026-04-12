-- FreelanceHub: Reviews table
-- Выполни в: Supabase Dashboard → SQL Editor

-- Таблица отзывов (работает с обоими: моковыми ID и реальными UUID)
create table if not exists public.freelancer_reviews (
  id              uuid default gen_random_uuid() primary key,
  freelancer_id   text not null,
  reviewer_id     uuid references auth.users on delete cascade not null,
  reviewer_name   text not null,
  reviewer_avatar text,
  rating          integer not null check (rating between 1 and 5),
  text            text not null,
  created_at      timestamptz not null default now(),
  unique (freelancer_id, reviewer_id)
);

-- RLS
alter table public.freelancer_reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.freelancer_reviews for select using (true);

create policy "Authenticated users can create reviews"
  on public.freelancer_reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Users can update their own reviews"
  on public.freelancer_reviews for update
  using (auth.uid() = reviewer_id);

create policy "Users can delete their own reviews"
  on public.freelancer_reviews for delete
  using (auth.uid() = reviewer_id);
