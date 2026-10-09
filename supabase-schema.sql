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

alter table public.profiles 
  alter column first_name set not null,
  alter column last_name set not null,


  add constraint profiles_first_name_length_check
   check (char_length(btrim(first_name)) between 4 and 32),

   add constraint profiles_last_name_length_check
   check (char_length(btrim(last_name)) between 4 and 32);

  

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

create or replace function public.is_blocked()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_blocked from public.profiles where id = auth.uid()),
    false
  );
$$;

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

-- Lets administrators update any profile, for example to block a user or grant admin rights.
-- guard_profile_privileges still decides who may change is_admin and is_blocked.
create policy "Admin can update any profile"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());


-- Lets administrators search users by username, email or name.
-- Emails live in auth.users, which the browser cannot read, so the search runs here.
create or replace function public.admin_search_users(search_term text)
Returns table(
id uuid,
username text,
first_name text,
last_name text,
email text,
avatar_url text,
is_admin boolean,
is_blocked boolean,
created_at timestamp with time zone
)
language plpgsql
security definer 
stable
set search_path = public
as $$
begin
if not public.is_admin() then
raise exception 'Only administrators can search users'
using errcode = '42501';
end if;

return query
select p.id,p.username,p.first_name,p.last_name,u.email::text,
p.avatar_url,p.is_admin,p.is_blocked,p.created_at
from public.profiles p
join auth.users u on u.id = p.id
where coalesce (search_term,'') = ''
or p.username ilike '%' || search_term || '%'
or u.email ilike '%' || search_term || '%'
or concat_ws (' ',p.first_name,p.last_name) ilike '%' || search_term || '%' order by p.created_at desc
limit 50;
end;
$$;

revoke execute on function public.admin_search_users(text) from public, anon;
grant execute on function public.admin_search_users(text) to authenticated;

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

-- Without RLS the anon key, which ships in the frontend bundle, would let
-- anyone read, edit or delete any post. The policies below decide who may.
alter table public.posts enable row level security;

create policy "Posts are readable by everyone"
on public.posts for select
using (true);

create policy "Users can create posts"
on public.posts for insert
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Users can update their own posts"
on public.posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Users can delete their own posts and admins can delete posts"
on public.posts for delete
using ((auth.uid() = author_id and not public.is_blocked()) or public.is_admin());

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



-- Vote table

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating in (1, -1)),
  unique (author_id, post_id)

);

-- Row Level Security
alter table public.comments enable row level security;

alter table public.votes enable row level security;

create policy "Comments are viewable by everyone"
on public.comments for select
using (true);

create policy "Users can comment unless blocked"
on public.comments for insert
to authenticated
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Users can update their own comments unless blocked"
on public.comments for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Authors and admins can delete comments"
on public.comments for delete
to authenticated
using ((auth.uid() = author_id and not public.is_blocked()) or public.is_admin());


create policy "Votes are readable by everyone"
on public.votes for select
using (true);

create policy "Users can react to posts unless blocked"
on public.votes for insert
to authenticated
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Users can update their vote unless blocked"
on public.votes for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id and not public.is_blocked());

create policy "Users can delete their vote unless blocked"
on public.votes for delete
to authenticated
using (auth.uid() = author_id and not public.is_blocked());

-- Users may only write the text of a comment. The id and dates come from defaults and triggers.
revoke insert, update on public.comments from anon, authenticated;
grant insert (post_id, author_id, content) on public.comments to authenticated;
grant update (content) on public.comments to authenticated;

-- Profile photos. Each user may only write files inside a folder named after their own id.
insert into storage.buckets (id, name, public)
values ('profile-picture-test', 'profile-picture-test', true)
on conflict (id) do nothing;

create policy "Users can upload their own avatar"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-picture-test'
  and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can replace their own avatar"
on storage.objects for update to authenticated
using (bucket_id = 'profile-picture-test'
  and (storage.foldername(name))[1] = auth.uid()::text);

-- upsert also reads the existing file, so the owner needs a select policy too.
create policy "Users can read their own avatar"
on storage.objects for select to authenticated
using (bucket_id = 'profile-picture-test'
  and (storage.foldername(name))[1] = auth.uid()::text);

-- Usernames cannot change after registration, so users may only update their
-- names, phone and photo. is_admin and is_blocked are granted too, because the
-- admin dashboard updates them; guard_profile_privileges still allows only
-- admins to change them. Profiles are created by handle_new_user, never directly.
revoke insert, update on public.profiles from anon, authenticated;
grant update (first_name, last_name, phone, avatar_url, is_admin, is_blocked) on public.profiles to authenticated;

create or replace function public.get_user_reputation(user_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(sum(v.rating), 0)::integer
  from public.votes v
  join public.posts p on p.id = v.post_id
  where p.author_id = user_id;
$$;

-- Badges (#47). Nothing is stored: the numbers behind every badge are counted
-- on demand, so a badge can never be out of date or faked.
create or replace function public.get_badge_stats(target_user uuid)
returns table (
  post_count integer,
  comment_count integer,
  reputation integer,
  member_since timestamp with time zone
)
language sql
stable
set search_path = public
as $$
  select
    (select count(*) from posts where author_id = target_user)::integer,
    (select count(*) from comments where author_id = target_user)::integer,
    public.get_user_reputation(target_user),
    (select created_at from profiles where id = target_user);
$$;
