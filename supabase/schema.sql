-- FreelanceHub Database Schema
-- Выполнить в: Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. PROFILES (расширяет auth.users)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client' check (role in ('client', 'freelancer')),
  location    text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. FREELANCER PROFILES
-- ============================================================
create table public.freelancer_profiles (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references public.profiles on delete cascade not null unique,
  title            text not null,
  category         text not null,
  skills           text[] default '{}',
  price_from       integer not null default 0,
  price_to         integer,
  level            text not null default 'new' check (level in ('new','junior','middle','senior','top')),
  response_time    text default 'в течение дня',
  languages        text[] default '{Русский}',
  is_verified      boolean default false,
  rating           numeric(3,2) default 0,
  reviews_count    integer default 0,
  completed_orders integer default 0,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 3. PORTFOLIO ITEMS
-- ============================================================
create table public.portfolio_items (
  id              uuid default gen_random_uuid() primary key,
  freelancer_id   uuid references public.freelancer_profiles on delete cascade not null,
  title           text not null,
  image_url       text,
  category        text not null,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 4. ORDERS
-- ============================================================
create table public.orders (
  id              uuid default gen_random_uuid() primary key,
  client_id       uuid references public.profiles on delete cascade not null,
  title           text not null,
  description     text not null,
  category        text not null,
  budget_min      integer not null default 0,
  budget_max      integer not null default 0,
  budget_type     text not null default 'fixed' check (budget_type in ('fixed','hourly')),
  deadline        text not null,
  skills          text[] default '{}',
  status          text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  is_urgent       boolean default false,
  responses_count integer default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- 5. ORDER RESPONSES (отклики)
-- ============================================================
create table public.order_responses (
  id              uuid default gen_random_uuid() primary key,
  order_id        uuid references public.orders on delete cascade not null,
  freelancer_id   uuid references public.profiles on delete cascade not null,
  message         text not null,
  proposed_price  integer,
  created_at      timestamptz not null default now(),
  unique(order_id, freelancer_id)
);

-- Auto-increment responses_count
create or replace function public.increment_responses_count()
returns trigger language plpgsql as $$
begin
  update public.orders set responses_count = responses_count + 1
  where id = new.order_id;
  return new;
end;
$$;

create trigger on_response_created
  after insert on public.order_responses
  for each row execute procedure public.increment_responses_count();

-- ============================================================
-- 6. REVIEWS
-- ============================================================
create table public.reviews (
  id           uuid default gen_random_uuid() primary key,
  order_id     uuid references public.orders on delete cascade not null,
  reviewer_id  uuid references public.profiles on delete cascade not null,
  reviewee_id  uuid references public.profiles on delete cascade not null,
  rating       integer not null check (rating between 1 and 5),
  text         text not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Freelancer profiles
alter table public.freelancer_profiles enable row level security;
create policy "Freelancer profiles are viewable by everyone"
  on public.freelancer_profiles for select using (true);
create policy "Users can manage their freelancer profile"
  on public.freelancer_profiles for all using (auth.uid() = user_id);

-- Portfolio
alter table public.portfolio_items enable row level security;
create policy "Portfolio items are viewable by everyone"
  on public.portfolio_items for select using (true);
create policy "Freelancers can manage their portfolio"
  on public.portfolio_items for all using (
    auth.uid() = (select user_id from public.freelancer_profiles where id = freelancer_id)
  );

-- Orders
alter table public.orders enable row level security;
create policy "Open orders are viewable by everyone"
  on public.orders for select using (true);
create policy "Clients can create orders"
  on public.orders for insert with check (auth.uid() = client_id);
create policy "Clients can update their orders"
  on public.orders for update using (auth.uid() = client_id);

-- Order responses
alter table public.order_responses enable row level security;
create policy "Order responses viewable by order owner and respondent"
  on public.order_responses for select using (
    auth.uid() = freelancer_id or
    auth.uid() = (select client_id from public.orders where id = order_id)
  );
create policy "Freelancers can create responses"
  on public.order_responses for insert with check (auth.uid() = freelancer_id);

-- Reviews
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);
create policy "Users can create reviews for their orders"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- ============================================================
-- 8. STORAGE BUCKET (для аватаров и портфолио)
-- ============================================================
-- Выполнить в Supabase Dashboard → Storage → New Bucket:
-- Bucket name: "avatars"   (public: true)
-- Bucket name: "portfolio" (public: true)
