-- Velvet Beta 2 Mega Update - SQL adicional

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reason text,
  details text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id) on delete cascade,
  blocked_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(blocker_id, blocked_id)
);

create table if not exists profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid references auth.users(id) on delete cascade,
  viewed_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table reports disable row level security;
alter table user_blocks disable row level security;
alter table profile_views disable row level security;

-- Realtime opcional:
-- reports
-- user_blocks
-- profile_views
