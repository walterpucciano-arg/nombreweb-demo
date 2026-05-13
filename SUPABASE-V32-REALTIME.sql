
-- Velvet V32 Realtime & Storage

create table if not exists realtime_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  body text,
  media_url text,
  created_at timestamptz default now()
);

create table if not exists realtime_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text,
  body text,
  created_at timestamptz default now(),
  read boolean default false
);

create table if not exists online_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_online boolean default true,
  last_seen timestamptz default now()
);

create table if not exists typing_status (
  id uuid primary key default gen_random_uuid(),
  room_id text,
  user_id uuid references auth.users(id) on delete cascade,
  is_typing boolean default false,
  updated_at timestamptz default now()
);

alter table realtime_feed disable row level security;
alter table realtime_notifications disable row level security;
alter table online_users disable row level security;
alter table typing_status disable row level security;

-- STORAGE BUCKETS (crear en Supabase Storage):
-- avatars
-- posts
-- stories
-- live-thumbnails

-- ACTIVAR REALTIME EN:
-- realtime_feed
-- realtime_notifications
-- online_users
-- typing_status
