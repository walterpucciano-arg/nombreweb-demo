-- Velvet HOTFIX Private Chat + Camera Requests

create extension if not exists "pgcrypto";

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

create table if not exists camera_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  responded_at timestamptz
);

create table if not exists webrtc_signals (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  signal_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table profiles add column if not exists webcam_enabled boolean default false;
alter table profiles add column if not exists online boolean default false;
alter table profiles add column if not exists last_seen timestamptz;

alter table private_conversations disable row level security;
alter table private_messages disable row level security;
alter table camera_requests disable row level security;
alter table webrtc_signals disable row level security;
alter table profiles disable row level security;

-- Realtime recomendado:
-- profiles
-- private_conversations
-- private_messages
-- camera_requests
-- webrtc_signals
