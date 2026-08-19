-- Admin curriculum authoring RPCs (docs/PRODUCT.md admin surface).
--
-- Until now, `paths`, `nodes`, `node_prerequisites`, `resources`, and `tasks`
-- had SELECT-only RLS policies for everyone, admins included — the admin
-- Curriculum Control panel edited local React state only and had no working
-- backend write path at any layer. These RPCs are the write path: each is
-- security-definer, gated on is_admin(), and centralizes validation (e.g.
-- the "exactly 2 resources per node" editorial rule from src/config/roadmap.ts)
-- so it can't be bypassed by calling Postgres directly. No new RLS write
-- policies are added on these tables — all writes go through these RPCs,
-- consistent with how member-side writes already work (start_node,
-- complete_task, rate_resource, set_project).

create or replace function public.require_admin()
returns void
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
end;
$$;

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

  insert into public.paths (id, title, description, icon, tags, "order", requires_paths)
  values (p_id, p_title, coalesce(p_description, ''), coalesce(p_icon, 'route'), coalesce(p_tags, '{}'), coalesce(p_order, 0), coalesce(p_requires_paths, '{}'))
  on conflict (id) do update set
    title = excluded.title,
    description = excluded.description,
    icon = excluded.icon,
    tags = excluded.tags,
    "order" = excluded."order",
    requires_paths = excluded.requires_paths
  returning * into result;

  return result;
end;
$$;

create or replace function public.admin_delete_path(p_id text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  if exists (select 1 from public.nodes where path_id = p_id) then
    raise exception 'Remove every module from this track before deleting it.';
  end if;
  delete from public.paths where id = p_id;
end;
$$;

create or replace function public.admin_reorder_paths(p_ordered_ids text[])
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  update public.paths p set "order" = ordering.idx
  from unnest(p_ordered_ids) with ordinality as ordering(id, idx)
  where p.id = ordering.id;
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
    insert into public.nodes (path_id, slug, name, subtitle, description, icon, "order", est_hours, xp_reward, skills)
    values (p_path_id, p_slug, p_name, coalesce(p_subtitle, ''), coalesce(p_description, ''), coalesce(p_icon, 'database'), coalesce(p_order, 0), coalesce(p_est_hours, 8), coalesce(p_xp_reward, 100), coalesce(p_skills, '{}'))
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
      skills = coalesce(p_skills, skills)
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_node(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.nodes where id = p_id;
end;
$$;

create or replace function public.admin_reorder_nodes(p_path_id text, p_ordered_ids uuid[])
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  update public.nodes n set "order" = ordering.idx
  from unnest(p_ordered_ids) with ordinality as ordering(id, idx)
  where n.id = ordering.id and n.path_id = p_path_id;
end;
$$;

create or replace function public.admin_set_node_prerequisites(p_node_id uuid, p_prerequisite_ids uuid[])
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  if p_node_id = any(p_prerequisite_ids) then
    raise exception 'A module cannot require itself.';
  end if;
  delete from public.node_prerequisites where node_id = p_node_id;
  insert into public.node_prerequisites (node_id, prerequisite_id)
  select p_node_id, id from unnest(p_prerequisite_ids) as id
  on conflict do nothing;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Resources — enforces the "exactly 2 per node" editorial rule
-- (src/config/roadmap.ts header comment) at insert time.
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
    insert into public.resources (node_id, name, type, platform, url, cost)
    values (p_node_id, p_name, p_type, coalesce(p_platform, ''), p_url, coalesce(p_cost, 'free'))
    returning * into result;
  else
    update public.resources set
      name = p_name,
      type = p_type,
      platform = coalesce(p_platform, ''),
      url = p_url,
      cost = coalesce(p_cost, 'free')
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_resource(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.resources where id = p_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Tasks
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

  if p_id is null then
    insert into public.tasks (node_id, description, type, "order", quiz, challenge, project_requirements)
    values (p_node_id, p_description, p_type, coalesce(p_order, 0), p_quiz, p_challenge, p_project_requirements)
    returning * into result;
  else
    update public.tasks set
      description = p_description,
      type = p_type,
      "order" = coalesce(p_order, "order"),
      quiz = p_quiz,
      challenge = p_challenge,
      project_requirements = p_project_requirements
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

create or replace function public.admin_delete_task(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.tasks where id = p_id;
end;
$$;
