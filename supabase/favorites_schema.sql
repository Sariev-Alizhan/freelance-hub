-- FreelanceHub — Favorites Schema
-- Запустить в: Supabase Dashboard → SQL Editor

-- ── 1. Таблица избранного ────────────────────────────────────
create table if not exists public.favorites (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  target_type text not null check (target_type in ('order', 'freelancer')),
  target_id   text not null,
  created_at  timestamptz not null default now(),
  constraint  favorites_unique unique (user_id, target_type, target_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

-- ── 2. RLS ──────────────────────────────────────────────────
alter table public.favorites enable row level security;

drop policy if exists "Users see own favorites" on public.favorites;
create policy "Users see own favorites"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);
