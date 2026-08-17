-- No audit trail existed on curriculum content — every admin mutation was
-- silent, with no record of who changed what or when. If more than one
-- person ever admins this, or content breaks and needs investigating,
-- there was no way to answer "who touched this last." Adds created_by/
-- updated_by/updated_at to the four content tables and threads them
-- through the admin RPCs (the only write path — no direct-table RLS write
-- policies exist, so this covers every caller).

alter table public.paths
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

alter table public.nodes
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

alter table public.resources
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

alter table public.tasks
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

-- ─────────────────────────────────────────────────────────────
-- Paths
-- ─────────────────────────────────────────────────────────────
create or replace function public.admin_upsert_path(
  p_id text,
  p_title text,
  p_description text,
  p_icon text,
  p_tags text[],
  p_order integer,
  p_requires_paths text[]
)
returns public.paths
language plpgsql security definer set search_path = public
as $$
declare
  result public.paths;
begin
  perform public.require_admin();
  if coalesce(trim(p_id), '') = '' or coalesce(trim(p_title), '') = '' then
    raise exception 'Track id and title are required.';
  end if;

  insert into public.paths (id, title, description, icon, tags, "order", requires_paths, created_by, updated_by, updated_at)
  values (p_id, p_title, coalesce(p_description, ''), coalesce(p_icon, 'route'), coalesce(p_tags, '{}'), coalesce(p_order, 0), coalesce(p_requires_paths, '{}'), auth.uid(), auth.uid(), now())
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    icon = excluded.icon,
    tags = excluded.tags,
    "order" = excluded."order",
    requires_paths = excluded.requires_paths,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at
  returning * into result;

  return result;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Nodes
-- ─────────────────────────────────────────────────────────────
create or replace function public.admin_upsert_node(
  p_id uuid,
  p_path_id text,
  p_slug text,
  p_name text,
  p_subtitle text,
  p_description text,
  p_icon text,
  p_order integer,
  p_est_hours integer,
  p_xp_reward integer,
  p_skills text[]
)
returns public.nodes
language plpgsql security definer set search_path = public
as $$
declare
  result public.nodes;
begin
  perform public.require_admin();
  if coalesce(trim(p_slug), '') = '' or coalesce(trim(p_name), '') = '' then
    raise exception 'Module slug and name are required.';
  end if;

  if p_id is null then
    insert into public.nodes (path_id, slug, name, subtitle, description, icon, "order", est_hours, xp_reward, skills, created_by, updated_by, updated_at)
    values (p_path_id, p_slug, p_name, coalesce(p_subtitle, ''), coalesce(p_description, ''), coalesce(p_icon, 'database'), coalesce(p_order, 0), coalesce(p_est_hours, 8), coalesce(p_xp_reward, 100), coalesce(p_skills, '{}'), auth.uid(), auth.uid(), now())
    returning * into result;
  else
    update public.nodes set
      path_id = p_path_id,
      slug = p_slug,
      name = p_name,
      subtitle = coalesce(p_subtitle, ''),
      description = coalesce(p_description, ''),
      icon = coalesce(p_icon, 'database'),
      "order" = coalesce(p_order, "order"),
      est_hours = coalesce(p_est_hours, est_hours),
      xp_reward = coalesce(p_xp_reward, xp_reward),
      skills = coalesce(p_skills, skills),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Resources — still enforces the "exactly 2 per node" editorial rule.
-- ─────────────────────────────────────────────────────────────
create or replace function public.admin_upsert_resource(
  p_id uuid,
  p_node_id uuid,
  p_name text,
  p_type text,
  p_platform text,
  p_url text,
  p_cost text
)
returns public.resources
language plpgsql security definer set search_path = public
as $$
declare
  result public.resources;
  existing_count integer;
begin
  perform public.require_admin();
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_url), '') = '' then
    raise exception 'Resource name and URL are required.';
  end if;

  if p_id is null then
    select count(*) into existing_count from public.resources where node_id = p_node_id;
    if existing_count >= 2 then
      raise exception 'Each module has exactly 2 curated resources — remove one before adding another.';
    end if;
    insert into public.resources (node_id, name, type, platform, url, cost, created_by, updated_by, updated_at)
    values (p_node_id, p_name, p_type, coalesce(p_platform, ''), p_url, coalesce(p_cost, 'free'), auth.uid(), auth.uid(), now())
    returning * into result;
  else
    update public.resources set
      name = p_name,
      type = p_type,
      platform = coalesce(p_platform, ''),
      url = p_url,
      cost = coalesce(p_cost, 'free'),
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Tasks — carries forward the payload validation added in 0016.
-- ─────────────────────────────────────────────────────────────
create or replace function public.admin_upsert_task(
  p_id uuid,
  p_node_id uuid,
  p_description text,
  p_type text,
  p_order integer,
  p_quiz jsonb,
  p_challenge jsonb,
  p_project_requirements jsonb
)
returns public.tasks
language plpgsql security definer set search_path = public
as $$
declare
  result public.tasks;
begin
  perform public.require_admin();
  if coalesce(trim(p_description), '') = '' then
    raise exception 'Task description is required.';
  end if;
  perform public.validate_task_payload(p_type, p_quiz, p_challenge);

  if p_id is null then
    insert into public.tasks (node_id, description, type, "order", quiz, challenge, project_requirements, created_by, updated_by, updated_at)
    values (p_node_id, p_description, p_type, coalesce(p_order, 0), p_quiz, p_challenge, p_project_requirements, auth.uid(), auth.uid(), now())
    returning * into result;
  else
    update public.tasks set
      description = p_description,
      type = p_type,
      "order" = coalesce(p_order, "order"),
      quiz = p_quiz,
      challenge = p_challenge,
      project_requirements = p_project_requirements,
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;
