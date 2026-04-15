-- FreelanceHub: Web Push Subscriptions
-- Запустить в: Supabase Dashboard → SQL Editor

create table if not exists public.push_subscriptions (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles on delete cascade not null,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users see own push subs" on public.push_subscriptions;
create policy "Users see own push subs"
  on public.push_subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Users insert own push subs" on public.push_subscriptions;
create policy "Users insert own push subs"
  on public.push_subscriptions for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own push subs" on public.push_subscriptions;
create policy "Users delete own push subs"
  on public.push_subscriptions for delete using (auth.uid() = user_id);
