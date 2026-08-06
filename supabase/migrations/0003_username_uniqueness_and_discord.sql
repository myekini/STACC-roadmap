-- Stacc Roadmap Tracker — username uniqueness, discord_id capture & rename RPC.

-- 1. Add discord_id column to profiles if not exists
alter table public.profiles
  add column if not exists discord_id text;

-- 2. Create unique index on lower(username) after deduplicating any existing collisions
do $$
declare
  r record;
  v_count integer := 1;
begin
  for r in
    select id, username
    from public.profiles p1
    where exists (
      select 1 from public.profiles p2
      where lower(p2.username) = lower(p1.username) and p2.created_at < p1.created_at
    )
  loop
    update public.profiles
    set username = r.username || '_' || v_count
    where id = r.id;
    v_count := v_count + 1;
  end loop;
end;
$$;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- 3. Update handle_new_user trigger to capture discord_id and guarantee unique username
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_base_name text;
  v_username text;
  v_discord_id text;
  v_suffix text;
  v_collision boolean;
begin
  v_discord_id := coalesce(
    new.raw_user_meta_data ->> 'sub',
    new.raw_user_meta_data ->> 'provider_id'
  );

  v_base_name := coalesce(
    new.raw_user_meta_data ->> 'custom_claims.global_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'preferred_username',
    new.raw_user_meta_data ->> 'name',
    'Scholar'
  );

  -- Sanitize base name (strip invalid chars, clamp length)
  v_base_name := regexp_replace(v_base_name, '[^a-zA-Z0-9_-]', '', 'g');
  if v_base_name = '' or length(v_base_name) < 2 then
    v_base_name := 'Scholar';
  end if;
  v_base_name := substring(v_base_name from 1 for 16);

  v_username := v_base_name;
  select exists (
    select 1 from public.profiles where lower(username) = lower(v_username)
  ) into v_collision;

  if v_collision then
    v_suffix := encode(gen_random_bytes(2), 'hex'); -- 4 hex chars
    v_username := v_base_name || '_' || v_suffix;
  end if;

  insert into public.profiles (id, username, avatar_url, discord_id)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    v_discord_id
  )
  on conflict (id) do update set
    discord_id = excluded.discord_id,
    avatar_url = case when excluded.avatar_url <> '' then excluded.avatar_url else public.profiles.avatar_url end;

  return new;
end;
$$;

-- 4. RPC for user handle renaming
create or replace function public.rename_username(p_new_username text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_clean text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_clean := trim(p_new_username);

  if length(v_clean) < 3 or length(v_clean) > 20 then
    raise exception 'Username must be between 3 and 20 characters';
  end if;

  if v_clean !~ '^[a-zA-Z0-9_-]+$' then
    raise exception 'Username may only contain letters, numbers, underscores, and hyphens';
  end if;

  if exists (
    select 1 from public.profiles
    where lower(username) = lower(v_clean) and id <> auth.uid()
  ) then
    raise exception 'Username "%" is already taken', v_clean;
  end if;

  update public.profiles
  set username = v_clean
  where id = auth.uid();
end;
$$;
