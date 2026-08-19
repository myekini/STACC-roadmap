-- Stacc Roadmap Tracker — replace Discord sign-in with GitHub sign-in.
-- Discord is no longer a supported provider; GitHub is now the only OAuth
-- sign-in method (admin accounts still use email/password, unchanged).
--
-- profiles.discord_id is left in place (not dropped) — it's just no longer
-- written to. Members who signed up via the old Discord flow keep their row;
-- they'll need to re-auth via GitHub, which (being a different auth.users
-- identity) creates a new profile rather than reusing the old one. That's an
-- inherent consequence of swapping providers, not something this migration
-- can paper over — flagged here rather than silently glossed.

alter table public.profiles
  add column if not exists github_id text,
  add column if not exists github_username text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_base_name text;
  v_username text;
  v_github_id text;
  v_github_username text;
  v_suffix text;
  v_collision boolean;
begin
  v_github_id := coalesce(
    new.raw_user_meta_data ->> 'provider_id',
    new.raw_user_meta_data ->> 'sub'
  );
  v_github_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'preferred_username'
  );

  v_base_name := coalesce(
    v_github_username,
    new.raw_user_meta_data ->> 'full_name',
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

  insert into public.profiles (id, username, avatar_url, github_id, github_username)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    v_github_id,
    v_github_username
  )
  on conflict (id) do update set
    github_id = excluded.github_id,
    github_username = excluded.github_username,
    avatar_url = case when excluded.avatar_url <> '' then excluded.avatar_url else public.profiles.avatar_url end;

  return new;
end;
$$;
