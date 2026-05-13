-- Velvet V27 - perfiles reales + likes/favoritos

alter table profiles
add column if not exists avatar_url text,
add column if not exists online boolean default false,
add column if not exists last_seen timestamp with time zone,
add column if not exists premium boolean default false,
add column if not exists verified boolean default false;

create table if not exists profile_likes (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(from_user, to_user)
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade,
  to_user uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(from_user, to_user)
);

-- Para pruebas rápidas:
alter table profile_likes disable row level security;
alter table favorites disable row level security;
