-- FreelanceHub — Messages Schema
-- Запустить в: Supabase Dashboard → SQL Editor

-- ── 1. Conversations ────────────────────────────────────────
create table if not exists public.conversations (
  id               uuid default gen_random_uuid() primary key,
  participant_1    uuid references public.profiles on delete cascade not null,
  participant_2    uuid references public.profiles on delete cascade not null,
  last_message     text,
  last_message_at  timestamptz default now(),
  created_at       timestamptz not null default now(),
  -- participant_1 всегда меньше participant_2 (UUID), исключает дубли
  constraint participants_ordered check (participant_1 < participant_2),
  unique(participant_1, participant_2)
);

-- ── 2. Messages ─────────────────────────────────────────────
create table if not exists public.messages (
  id               uuid default gen_random_uuid() primary key,
  conversation_id  uuid references public.conversations on delete cascade not null,
  sender_id        uuid references public.profiles on delete cascade not null,
  text             text not null,
  is_read          boolean default false,
  created_at       timestamptz not null default now()
);

-- ── 3. Trigger: обновить last_message ───────────────────────
create or replace function public.update_last_message()
returns trigger language plpgsql as $$
begin
  update public.conversations
  set last_message = new.text, last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_sent on public.messages;
create trigger on_message_sent
  after insert on public.messages
  for each row execute procedure public.update_last_message();

-- ── 4. RLS ──────────────────────────────────────────────────
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations: видят только участники
drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = participant_1 or auth.uid() = participant_2);

drop policy if exists "Users can create conversations" on public.conversations;
create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages: видят только участники беседы
drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() in (
      select participant_1 from public.conversations where id = conversation_id
      union
      select participant_2 from public.conversations where id = conversation_id
    )
  );

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    auth.uid() in (
      select participant_1 from public.conversations where id = conversation_id
      union
      select participant_2 from public.conversations where id = conversation_id
    )
  );

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update
  using (auth.uid() != sender_id);

-- ── 5. Realtime ─────────────────────────────────────────────
-- Включить Realtime для таблиц (если не включено)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;
