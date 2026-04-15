-- ── Notifications table ─────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('new_response','new_message','order_accepted','order_completed')),
  title       text not null,
  body        text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

-- RLS
alter table public.notifications enable row level security;

drop policy if exists "users see own notifications"  on public.notifications;
drop policy if exists "users delete own notifications" on public.notifications;
drop policy if exists "users update own notifications" on public.notifications;

create policy "users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "users delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

create policy "users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Service role can insert (used by API routes via admin client)
create policy "service role insert notifications"
  on public.notifications for insert
  with check (true);


-- ── Trigger: notify recipient on new message ─────────────────────────────────
-- This runs server-side so it fires even from the client SDK.
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer as $$
declare
  other_participant_id uuid;
  sender_name text;
begin
  -- Find the other participant of this conversation
  select participant_id
    into other_participant_id
  from public.conversation_participants
  where conversation_id = NEW.conversation_id
    and participant_id <> NEW.sender_id
  limit 1;

  if other_participant_id is null then
    return NEW;
  end if;

  -- Get sender name
  select coalesce(full_name, username, 'Someone')
    into sender_name
  from public.profiles
  where id = NEW.sender_id;

  insert into public.notifications(user_id, type, title, body, link)
  values (
    other_participant_id,
    'new_message',
    sender_name || ' sent you a message',
    left(NEW.text, 80),
    '/messages'
  );

  return NEW;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();
