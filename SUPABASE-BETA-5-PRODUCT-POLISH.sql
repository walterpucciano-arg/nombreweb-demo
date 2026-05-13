-- Velvet Beta 5 Product Polish - SQL adicional

create table if not exists post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid,
  user_id uuid references auth.users(id) on delete cascade,
  body text,
  created_at timestamptz default now()
);

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  show_online boolean default true,
  allow_camera_requests boolean default true,
  allow_private_messages boolean default true,
  updated_at timestamptz default now()
);

alter table post_likes disable row level security;
alter table post_comments disable row level security;
alter table user_settings disable row level security;

-- Realtime opcional:
-- post_likes
-- post_comments
