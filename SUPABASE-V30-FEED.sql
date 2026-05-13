
create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  body text,
  media_url text,
  post_type text default 'post',
  created_at timestamptz default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  media_url text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists profile_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references auth.users(id),
  visited_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table feed_posts disable row level security;
alter table stories disable row level security;
alter table profile_visits disable row level security;
