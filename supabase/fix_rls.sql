-- FreelanceHub — RLS Fix
-- Запустить в: Supabase Dashboard → SQL Editor

-- ── Profiles: добавить INSERT политику ──────────────────────
-- (нужна если триггер не создал строку при регистрации)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'Users can insert their own profile'
  ) then
    execute $p$
      create policy "Users can insert their own profile"
        on public.profiles for insert with check (auth.uid() = id)
    $p$;
  end if;
end $$;

-- ── Profiles: убедиться что есть колонки bio и location ─────
alter table public.profiles
  add column if not exists bio      text,
  add column if not exists location text;

-- ── Freelancer profiles: явные INSERT/UPDATE политики ───────
-- Удалить старую общую политику и заменить на явные
drop policy if exists "Users can manage their freelancer profile" on public.freelancer_profiles;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'freelancer_profiles' and policyname = 'Users can insert their freelancer profile'
  ) then
    execute $p$
      create policy "Users can insert their freelancer profile"
        on public.freelancer_profiles for insert with check (auth.uid() = user_id)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'freelancer_profiles' and policyname = 'Users can update their freelancer profile'
  ) then
    execute $p$
      create policy "Users can update their freelancer profile"
        on public.freelancer_profiles for update using (auth.uid() = user_id)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'freelancer_profiles' and policyname = 'Users can delete their freelancer profile'
  ) then
    execute $p$
      create policy "Users can delete their freelancer profile"
        on public.freelancer_profiles for delete using (auth.uid() = user_id)
    $p$;
  end if;
end $$;

-- ── Portfolio items: явная INSERT политика ──────────────────
drop policy if exists "Freelancers can manage their portfolio" on public.portfolio_items;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'portfolio_items' and policyname = 'Freelancers can insert portfolio items'
  ) then
    execute $p$
      create policy "Freelancers can insert portfolio items"
        on public.portfolio_items for insert with check (
          auth.uid() = (select user_id from public.freelancer_profiles where id = freelancer_id)
        )
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'portfolio_items' and policyname = 'Freelancers can delete portfolio items'
  ) then
    execute $p$
      create policy "Freelancers can delete portfolio items"
        on public.portfolio_items for delete using (
          auth.uid() = (select user_id from public.freelancer_profiles where id = freelancer_id)
        )
    $p$;
  end if;
end $$;

-- ── Проверка результата ─────────────────────────────────────
select tablename, policyname, cmd
from pg_policies
where tablename in ('profiles', 'freelancer_profiles', 'portfolio_items')
order by tablename, cmd;
