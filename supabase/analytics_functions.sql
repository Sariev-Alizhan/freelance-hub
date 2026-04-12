-- FreelanceHub — Analytics SQL Functions
-- Запустить в: Supabase Dashboard → SQL Editor

-- ── 1. Заказы по дням ──────────────────────────────────────
create or replace function public.orders_per_day(days_back int default 14)
returns table(day text, count bigint)
language sql security definer set search_path = public as $$
  select
    to_char(gs.day, 'DD.MM') as day,
    count(o.id) as count
  from generate_series(
    current_date - (days_back - 1) * interval '1 day',
    current_date,
    interval '1 day'
  ) as gs(day)
  left join public.orders o
    on date_trunc('day', o.created_at at time zone 'UTC') = gs.day
  group by gs.day
  order by gs.day;
$$;

-- ── 2. Пользователи по дням ────────────────────────────────
create or replace function public.users_per_day(days_back int default 14)
returns table(day text, count bigint)
language sql security definer set search_path = public as $$
  select
    to_char(gs.day, 'DD.MM') as day,
    count(p.id) as count
  from generate_series(
    current_date - (days_back - 1) * interval '1 day',
    current_date,
    interval '1 day'
  ) as gs(day)
  left join public.profiles p
    on date_trunc('day', p.created_at at time zone 'UTC') = gs.day
  group by gs.day
  order by gs.day;
$$;

-- Grant execute to anon/authenticated (called with security definer = service role sees all)
grant execute on function public.orders_per_day(int) to anon, authenticated;
grant execute on function public.users_per_day(int)  to anon, authenticated;
