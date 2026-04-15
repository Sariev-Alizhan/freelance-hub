-- FreelanceHub — Security Fixes
-- Run in: Supabase Dashboard → SQL Editor
-- Fixes audit issues: notifications insert policy, profile_views RLS

-- ── Fix 7: Notifications INSERT — block direct client inserts ──────────────────
-- Any authenticated user could previously insert notifications for ANY user_id.
-- Service role (used by admin client in API routes) bypasses RLS, so inserts
-- from the server side (API routes, triggers) are unaffected.

drop policy if exists "Allow insert notifications"        on public.notifications;
drop policy if exists "service role insert notifications" on public.notifications;
drop policy if exists "block direct client inserts"       on public.notifications;

-- With check (false) blocks authenticated/anon role inserts entirely.
-- Service role skips RLS so server-side inserts still work.
create policy "block direct client inserts"
  on public.notifications for insert
  with check (false);

-- ── Fix 8: Profile views RLS — ensure it exists ───────────────────────────────
-- v1.5_migrations.sql already adds RLS, but this is a safety net in case
-- that file was not run or was run before the table existed.
alter table if exists public.profile_views enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profile_views' and policyname = 'Freelancer reads own views'
  ) then
    execute $p$
      create policy "Freelancer reads own views"
        on public.profile_views for select
        using (auth.uid() = freelancer_id)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profile_views' and policyname = 'Anyone can record a view'
  ) then
    execute $p$
      create policy "Anyone can record a view"
        on public.profile_views for insert
        with check (true)
    $p$;
  end if;
end $$;

-- ── Verify ─────────────────────────────────────────────────────────────────────
select tablename, policyname, cmd
from pg_policies
where tablename in ('notifications', 'profile_views')
order by tablename, cmd;
