
-- HOTFIX Velvet Beta 2 - reparar chat general

create extension if not exists "pgcrypto";

create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  room_type text default 'general',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table chat_rooms add column if not exists slug text;
alter table chat_rooms add column if not exists room_type text default 'general';
alter table chat_rooms add column if not exists is_active boolean default true;

insert into chat_rooms (name, slug, room_type, is_active)
values ('Sala general Velvet', 'general', 'general', true)
on conflict (slug) do update
set name = excluded.name,
    room_type = excluded.room_type,
    is_active = true;

create table if not exists room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  is_deleted boolean default false,
  is_reported boolean default false
);

alter table chat_rooms disable row level security;
alter table room_messages disable row level security;

-- Verificación:
select * from chat_rooms where slug = 'general';
