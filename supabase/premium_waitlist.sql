-- Premium waitlist — stores upgrade intent until payments are wired up
create table if not exists public.premium_waitlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  plan       text not null default 'monthly',
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.premium_waitlist enable row level security;

-- Users can read their own entry
create policy "users read own waitlist entry"
  on public.premium_waitlist for select
  using (auth.uid() = user_id);

-- Service role inserts/upserts (used by API)
create policy "service role manage waitlist"
  on public.premium_waitlist for all
  with check (true);
