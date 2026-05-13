
-- Velvet Beta Final 1 - SQL único consolidado

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  alias text,
  age int check (age >= 18),
  city text,
  profile_type text,
  situation text,
  orientation text,
  looking_for text,
  bio text,
  avatar_url text,
  premium boolean default false,
  verified boolean default false,
  online boolean default false,
  webcam_enabled boolean default false,
  last_seen timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table profiles add column if not exists profile_type text;
alter table profiles add column if not exists situation text;
alter table profiles add column if not exists orientation text;
alter table profiles add column if not exists looking_for text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists premium boolean default false;
alter table profiles add column if not exists verified boolean default false;
alter table profiles add column if not exists online boolean default false;
alter table profiles add column if not exists webcam_enabled boolean default false;
alter table profiles add column if not exists last_seen timestamp with time zone;

create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  room_type text default 'general',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

insert into chat_rooms (name, slug, room_type)
values ('Sala general Velvet', 'general', 'general')
on conflict (slug) do nothing;

create table if not exists room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  is_deleted boolean default false,
  is_reported boolean default false
);

create table if not exists private_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete cascade,
  user_a uuid references auth.users(id) on delete cascade,
  user_b uuid references auth.users(id) on delete cascade,
  status text default 'active',
  unique(user_a, user_b)
);

create table if not exists private_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references private_conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  is_deleted boolean default false,
  is_reported boolean default false
);

create table if not exists chat_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  private_chats_started int default 0,
  updated_at timestamp with time zone default timezone('utc', now())
);

create table if not exists camera_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  responded_at timestamp with time zone
);

create table if not exists webrtc_signals (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  signal_type text not null,
  payload jsonb not null,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  media_type text check (media_type in ('image','video')),
  file_url text not null,
  caption text,
  status text default 'pending',
  is_public boolean default false,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references auth.users(id),
  rejection_reason text
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(from_user, to_user)
);

alter table profiles disable row level security;
alter table user_roles disable row level security;
alter table chat_rooms disable row level security;
alter table room_messages disable row level security;
alter table private_conversations disable row level security;
alter table private_messages disable row level security;
alter table chat_limits disable row level security;
alter table camera_requests disable row level security;
alter table webrtc_signals disable row level security;
alter table media_items disable row level security;
alter table favorites disable row level security;

-- Crear buckets públicos en Supabase Storage:
-- avatars
-- posts
-- stories

-- Activar Realtime en Supabase para:
-- profiles
-- room_messages
-- private_messages
-- camera_requests
-- webrtc_signals
-- media_items
