
create table if not exists media_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  media_type text,
  media_url text,
  thumbnail_url text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists stories_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  media_url text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists moderation_queue (
  id uuid primary key default gen_random_uuid(),
  media_id uuid,
  moderation_type text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table media_uploads disable row level security;
alter table stories_media disable row level security;
alter table moderation_queue disable row level security;
