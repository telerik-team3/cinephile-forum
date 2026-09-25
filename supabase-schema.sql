-- Database schema for Cinephile Forum

-- Profiles table
-- ВАЖНО: Да не забравим да сложим контрола за username, first_name, last_name - not null

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  is_admin boolean default false,
  is_blocked boolean default false,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Auto create a profile row when a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin authorization model

-- Returns whether the current user is an administrator.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Blocks ordinary users from granting themselves admin rights or unblocking themselves.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Requests from the SQL editor or service_role have no signed-in user.
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
    new.is_blocked := false;
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin
     or new.is_blocked is distinct from old.is_blocked then
    raise exception 'Only administrators can change admin or blocked status';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_privileges on public.profiles;

create trigger guard_profile_privileges
  before insert or update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- Posts table

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 16 and 64),
  content text not null check (char_length(content) between 32 and 8192),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- author_id points at profiles rather than auth.users, so PostgREST can embed
-- the author in one request: posts?select=*,author:profiles(username,avatar_url)

create index posts_author_id_idx on public.posts (author_id);
create index posts_created_at_idx on public.posts (created_at desc);

-- Keeps updated_at honest no matter which code path performs the update.
-- Named generally because the comments table will reuse it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Enabled with no policies, which denies everything until the post RLS work
-- adds them. Without this the anon key, which ships in the frontend bundle,
-- would let anyone read, edit or delete any post.
alter table public.posts enable row level security;

-- Comments table

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 8192),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index comments_post_id_created_at_idx on public.comments (post_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

drop trigger if exists comments_set_updated_at on public.comments;

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Enabled with no policies until the comment RLS work (#30) adds them.
alter table public.comments enable row level security;
