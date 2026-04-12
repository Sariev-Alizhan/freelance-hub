-- FreelanceHub — Notifications Schema
-- Запустить в: Supabase Dashboard → SQL Editor

-- ── 1. Таблица уведомлений ──────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles on delete cascade not null,
  type       text not null check (type in ('new_response','new_message','order_accepted','order_completed')),
  title      text not null,
  body       text,
  link       text,
  is_read    boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(user_id, is_read);

-- ── 2. RLS ──────────────────────────────────────────────────
alter table public.notifications enable row level security;

drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Insert разрешён всем (триггеры используют security definer)
drop policy if exists "Allow insert notifications" on public.notifications;
create policy "Allow insert notifications"
  on public.notifications for insert with check (true);

-- ── 3. Trigger: уведомление при новом отклике ───────────────
create or replace function public.notify_on_response()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_client_id   uuid;
  v_order_title text;
begin
  select client_id, title into v_client_id, v_order_title
  from public.orders where id = new.order_id;

  -- Не уведомлять если заказчик откликнулся на свой же заказ
  if v_client_id is not null and v_client_id <> new.freelancer_id then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_client_id,
      'new_response',
      'Новый отклик на заказ',
      v_order_title,
      '/orders/' || new.order_id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_response on public.order_responses;
create trigger trg_notify_response
  after insert on public.order_responses
  for each row execute procedure public.notify_on_response();

-- ── 4. Trigger: уведомление при новом сообщении ─────────────
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_recipient_id uuid;
  v_sender_name  text;
begin
  select
    case when participant_1 = new.sender_id then participant_2 else participant_1 end
  into v_recipient_id
  from public.conversations where id = new.conversation_id;

  select coalesce(full_name, 'Пользователь') into v_sender_name
  from public.profiles where id = new.sender_id;

  if v_recipient_id is not null then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_recipient_id,
      'new_message',
      v_sender_name,
      left(new.text, 80),
      '/messages'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_message on public.messages;
create trigger trg_notify_message
  after insert on public.messages
  for each row execute procedure public.notify_on_message();

-- ── 5. Realtime ─────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
