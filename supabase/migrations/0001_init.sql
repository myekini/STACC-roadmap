-- Stacc Roadmap Tracker — initial schema (docs/PRODUCT.md §6)
-- Deviation from spec: prerequisites use a node_prerequisites join table instead of
-- nodes.parent_id, because real content has fan-in (a node can require several nodes).

-- ─────────────────────────────────────────────────────────────
-- Profiles (extends auth.users; role + cohort for admin views)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null default 'Scholar',
  avatar_url   text not null default '',
  xp           integer not null default 0 check (xp >= 0),
  rank         text not null default 'Bronze',
  role         text not null default 'member' check (role in ('member', 'admin')),
  cohort_label text,
  created_at   timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Content: paths, nodes, prerequisites, resources, tasks
-- ─────────────────────────────────────────────────────────────
create table public.paths (
  id             text primary key,                -- slug, e.g. 'de'
  title          text not null,
  description    text not null default '',
  icon           text not null default 'route',
  tags           text[] not null default '{}',
  "order"        integer not null default 0,
  requires_paths text[] not null default '{}'     -- e.g. ai-engineering requires {de,ds}
);

create table public.nodes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,               -- e.g. 'de-etl'
  path_id     text not null references public.paths (id) on delete cascade,
  name        text not null,
  subtitle    text not null default '',
  description text not null default '',
  icon        text not null default 'database',
  "order"     integer not null,
  est_hours   integer not null default 8,
  xp_reward   integer not null default 100,
  skills      text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.node_prerequisites (
  node_id         uuid not null references public.nodes (id) on delete cascade,
  prerequisite_id uuid not null references public.nodes (id) on delete cascade,
  primary key (node_id, prerequisite_id),
  check (node_id <> prerequisite_id)
);

create table public.resources (
  id           uuid primary key default gen_random_uuid(),
  node_id      uuid not null references public.nodes (id) on delete cascade,
  name         text not null,
  type         text not null check (type in ('article', 'video', 'course', 'project', 'documentation')),
  platform     text not null default '',
  url          text not null,
  cost         text not null default 'free' check (cost in ('free', 'paid')),
  avg_rating   double precision not null default 0,
  rating_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  node_id     uuid not null references public.nodes (id) on delete cascade,
  description text not null,
  type        text not null check (type in ('read', 'watch', 'build', 'quiz')),
  "order"     integer not null,
  quiz        jsonb                                -- {question, options[], correctIndex, explanation} for type='quiz'
);

-- ─────────────────────────────────────────────────────────────
-- Member state
-- ─────────────────────────────────────────────────────────────
create table public.user_paths (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  path_id     text not null references public.paths (id) on delete cascade,
  selected_at timestamptz not null default now(),
  primary key (user_id, path_id)
);

create table public.user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  node_id      uuid not null references public.nodes (id) on delete cascade,
  status       text not null default 'in_progress' check (status in ('in_progress', 'complete')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, node_id)
);
-- 'locked' / 'available' are derived client/query-side from prerequisites; only
-- states that carry user data are stored.

create table public.task_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  task_id      uuid not null references public.tasks (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create table public.resource_ratings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  unique (user_id, resource_id)
);

create index idx_nodes_path on public.nodes (path_id, "order");
create index idx_resources_node on public.resources (node_id);
create index idx_tasks_node on public.tasks (node_id, "order");
create index idx_progress_user on public.user_progress (user_id);
create index idx_completions_user on public.task_completions (user_id, completed_at);
create index idx_ratings_resource on public.resource_ratings (resource_id);

-- ─────────────────────────────────────────────────────────────
-- Helpers
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.calc_rank(xp integer)
returns text
language sql immutable
as $$
  select case
    when xp < 500 then 'Bronze'
    when xp < 1500 then 'Silver'
    when xp < 3000 then 'Gold'
    when xp < 6000 then 'Platinum'
    else 'Diamond'
  end;
$$;

-- Auto-create a profile on signup (Discord metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'custom_claims.global_name',
      new.raw_user_meta_data ->> 'full_name',
      'Scholar'
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- XP and rank are server-owned: clients may not write them directly.
-- The complete_task RPC sets the transaction-local 'stacc.allow_xp' flag to
-- pass this gate; direct client updates never have it.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null
     and current_setting('stacc.allow_xp', true) is distinct from 'true'
     and not public.is_admin() then
    new.xp := old.xp;
    new.rank := old.rank;
    new.role := old.role;
    new.cohort_label := old.cohort_label;
  end if;
  new.last_active_at := now();
  return new;
end;
$$;

create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ─────────────────────────────────────────────────────────────
-- RPCs (security definer): the only write paths for progress/XP
-- ─────────────────────────────────────────────────────────────

-- A node is unlocked when every prerequisite is complete AND its path's
-- required paths (spec §1.5: AI-Eng/MLOps need DE + DS) are fully complete.
create or replace function public.node_is_unlocked(p_user uuid, p_node uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    not exists (
      select 1 from public.node_prerequisites np
      where np.node_id = p_node
        and not exists (
          select 1 from public.user_progress up
          where up.user_id = p_user and up.node_id = np.prerequisite_id and up.status = 'complete'
        )
    )
    and not exists (
      select 1
      from public.nodes n
      join public.paths p on p.id = n.path_id
      cross join lateral unnest(p.requires_paths) as req(path_id)
      where n.id = p_node
        and exists (
          select 1 from public.nodes rn
          where rn.path_id = req.path_id
            and not exists (
              select 1 from public.user_progress rup
              where rup.user_id = p_user and rup.node_id = rn.id and rup.status = 'complete'
            )
        )
    );
$$;

create or replace function public.start_node(p_node_slug text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_node uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_node from public.nodes where slug = p_node_slug;
  if v_node is null then raise exception 'unknown node %', p_node_slug; end if;
  if not public.node_is_unlocked(auth.uid(), v_node) then
    raise exception 'node % is locked', p_node_slug;
  end if;
  insert into public.user_progress (user_id, node_id, status)
  values (auth.uid(), v_node, 'in_progress')
  on conflict (user_id, node_id) do nothing;
end;
$$;

-- Marks a task complete; when all of the node's tasks are done, completes the
-- node and awards its XP exactly once. Returns the node status.
create or replace function public.complete_task(p_task uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_node uuid;
  v_xp integer;
  v_remaining integer;
  v_already_complete boolean;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select node_id into v_node from public.tasks where id = p_task;
  if v_node is null then raise exception 'unknown task'; end if;
  if not public.node_is_unlocked(auth.uid(), v_node) then
    raise exception 'node is locked';
  end if;

  insert into public.task_completions (user_id, task_id)
  values (auth.uid(), p_task)
  on conflict (user_id, task_id) do nothing;

  insert into public.user_progress (user_id, node_id, status)
  values (auth.uid(), v_node, 'in_progress')
  on conflict (user_id, node_id) do nothing;

  select count(*) into v_remaining
  from public.tasks t
  where t.node_id = v_node
    and not exists (
      select 1 from public.task_completions tc
      where tc.user_id = auth.uid() and tc.task_id = t.id
    );

  if v_remaining > 0 then
    return 'in_progress';
  end if;

  select (status = 'complete') into v_already_complete
  from public.user_progress
  where user_id = auth.uid() and node_id = v_node;

  if not coalesce(v_already_complete, false) then
    update public.user_progress
    set status = 'complete', completed_at = now()
    where user_id = auth.uid() and node_id = v_node;

    select xp_reward into v_xp from public.nodes where id = v_node;
    perform set_config('stacc.allow_xp', 'true', true);
    update public.profiles
    set xp = xp + v_xp, rank = public.calc_rank(xp + v_xp)
    where id = auth.uid();
  end if;

  return 'complete';
end;
$$;

create or replace function public.rate_resource(p_resource uuid, p_rating integer)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_rating not between 1 and 5 then raise exception 'rating must be 1-5'; end if;

  insert into public.resource_ratings (user_id, resource_id, rating)
  values (auth.uid(), p_resource, p_rating)
  on conflict (user_id, resource_id) do update set rating = excluded.rating, created_at = now();

  update public.resources r
  set avg_rating = s.avg, rating_count = s.cnt
  from (
    select avg(rating)::double precision as avg, count(*)::integer as cnt
    from public.resource_ratings where resource_id = p_resource
  ) s
  where r.id = p_resource;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (spec §1.9)
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.paths enable row level security;
alter table public.nodes enable row level security;
alter table public.node_prerequisites enable row level security;
alter table public.resources enable row level security;
alter table public.tasks enable row level security;
alter table public.user_paths enable row level security;
alter table public.user_progress enable row level security;
alter table public.task_completions enable row level security;
alter table public.resource_ratings enable row level security;

-- Tree structure is public (SEO); details require auth.
create policy "paths are public" on public.paths for select using (true);
create policy "nodes are public" on public.nodes for select using (true);
create policy "prereqs are public" on public.node_prerequisites for select using (true);
create policy "resources require auth" on public.resources for select using (auth.uid() is not null);
create policy "tasks require auth" on public.tasks for select using (auth.uid() is not null);

-- Profiles: own row; admins read all.
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Member state: own rows only; admins can read for the admin panel.
create policy "own user_paths" on public.user_paths for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin read user_paths" on public.user_paths for select using (public.is_admin());
create policy "read own progress" on public.user_progress for select using (user_id = auth.uid() or public.is_admin());
create policy "read own completions" on public.task_completions for select using (user_id = auth.uid() or public.is_admin());
create policy "read own ratings" on public.resource_ratings for select using (user_id = auth.uid() or public.is_admin());
-- Writes to progress/completions/ratings/xp happen ONLY through the RPCs above
-- (security definer); no insert/update policies are granted on purpose.
