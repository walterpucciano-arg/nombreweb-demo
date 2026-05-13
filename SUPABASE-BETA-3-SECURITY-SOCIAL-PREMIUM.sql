-- Velvet Clean Build SQL completo
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
  last_seen timestamptz,
  created_at timestamptz default now()
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
alter table profiles add column if not exists last_seen timestamptz;

drop table if exists room_messages cascade;
drop table if exists chat_rooms cascade;

create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  room_type text default 'general',
  created_at timestamptz default now()
);

create table room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

insert into chat_rooms (name, slug, room_type)
values ('Sala general Velvet', 'general', 'general')
on conflict (slug) do nothing;

create table if not exists private_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
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
  created_at timestamptz default now()
);

create table if not exists chat_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  private_chats_started int default 0
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(from_user, to_user)
);

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  media_type text,
  file_url text not null,
  caption text,
  status text default 'pending',
  is_public boolean default false
);

alter table profiles disable row level security;
alter table chat_rooms disable row level security;
alter table room_messages disable row level security;
alter table private_conversations disable row level security;
alter table private_messages disable row level security;
alter table chat_limits disable row level security;
alter table favorites disable row level security;
alter table media_items disable row level security;

select * from chat_rooms where slug='general';


-- Beta 3 additions

alter table profiles add column if not exists accepted_terms boolean default false;
alter table profiles add column if not exists accepted_terms_at timestamptz;
alter table profiles add column if not exists is_blocked boolean default false;
alter table profiles add column if not exists premium_plan text default 'free';

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  media_type text,
  file_url text not null,
  caption text,
  status text default 'pending',
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  note text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists premium_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reason text,
  details text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id) on delete cascade,
  blocked_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table stories disable row level security;
alter table verification_requests disable row level security;
alter table premium_requests disable row level security;
alter table reports disable row level security;
alter table user_blocks disable row level security;

-- Crear bucket público adicional si querés separar stories:
-- stories
