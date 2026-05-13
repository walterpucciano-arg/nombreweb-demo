-- Velvet Beta 4 Mega Product Update - SQL adicional

create table if not exists webrtc_signals (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  signal_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists camera_sessions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade,
  broadcaster_id uuid references auth.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  from_user uuid references auth.users(id) on delete cascade,
  type text,
  body text,
  related_id text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text,
  provider text,
  amount numeric,
  currency text default 'ARS',
  status text default 'pending',
  created_at timestamptz default now()
);

alter table profiles add column if not exists last_active_public text;
alter table profiles add column if not exists premium_until timestamptz;
alter table profiles add column if not exists trust_score int default 0;

alter table webrtc_signals disable row level security;
alter table camera_sessions disable row level security;
alter table notifications disable row level security;
alter table payments disable row level security;

-- Realtime recomendado:
-- webrtc_signals
-- camera_sessions
-- notifications
