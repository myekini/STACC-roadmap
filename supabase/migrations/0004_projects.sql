-- Stacc Roadmap Tracker — per-path projects: build-task evidence accumulates
-- into one running project repo instead of disconnected links, so a
-- specialization reads as one project built piece by piece (docs/PRODUCT.md §4).

create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  path_id    text not null references public.paths (id) on delete cascade,
  repo_url   text not null,
  created_at timestamptz not null default now(),
  unique (user_id, path_id)
);

create index idx_projects_user on public.projects (user_id);

alter table public.projects enable row level security;
create policy "read own projects" on public.projects for select using (user_id = auth.uid() or public.is_admin());
-- Writes happen only through set_project (security definer); no insert/update
-- policy is granted on purpose, same pattern as progress/completions/ratings.

-- Sets a path's project repo. One-time: the first repo a member sets for a
-- path is immutable afterwards, since every later build task's evidence gets
-- validated against it (see complete_task below) — changing it after the
-- fact would silently invalidate prior evidence links.
create or replace function public.set_project(p_path text, p_repo_url text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_clean text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  v_clean := regexp_replace(trim(p_repo_url), '/+$', '');
  if v_clean !~* '^https?://' then
    raise exception 'project repo must be a URL (https://…)';
  end if;
  if not exists (select 1 from public.paths where id = p_path) then
    raise exception 'unknown path %', p_path;
  end if;

  insert into public.projects (user_id, path_id, repo_url)
  values (auth.uid(), p_path, v_clean)
  on conflict (user_id, path_id) do nothing;
end;
$$;

-- complete_task: once a path has a project repo, build-task evidence must
-- link into it (a specific commit/PR/tree URL under the repo still passes —
-- prefix match, not equality) instead of an unrelated one-off link.
create or replace function public.complete_task(p_task uuid, p_evidence text default null)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_node uuid;
  v_path text;
  v_type text;
  v_xp integer;
  v_remaining integer;
  v_already_complete boolean;
  v_project_url text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select t.node_id, t.type, n.path_id into v_node, v_type, v_path
  from public.tasks t join public.nodes n on n.id = t.node_id
  where t.id = p_task;
  if v_node is null then raise exception 'unknown task'; end if;
  if not public.node_is_unlocked(auth.uid(), v_node) then
    raise exception 'node is locked';
  end if;

  if v_type = 'build' then
    if p_evidence is null or p_evidence !~* '^https?://' then
      raise exception 'build tasks require an evidence url (https://…)';
    end if;

    select repo_url into v_project_url
    from public.projects where user_id = auth.uid() and path_id = v_path;

    if v_project_url is not null and not starts_with(p_evidence, v_project_url) then
      raise exception 'evidence must link into this path''s project repo (%)', v_project_url;
    end if;
  end if;

  insert into public.task_completions (user_id, task_id, evidence_url)
  values (auth.uid(), p_task, p_evidence)
  on conflict (user_id, task_id)
  do update set evidence_url = coalesce(excluded.evidence_url, public.task_completions.evidence_url);

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

-- get_public_profile: expose each shipped path's project repo alongside its
-- evidence so /u/[handle] can render a build-log timeline per project.
create or replace function public.get_public_profile(p_handle text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'username', pr.username,
      'avatar_url', pr.avatar_url,
      'joined_at', pr.created_at
    ),
    'shipped', coalesce((
      select jsonb_agg(shipped_node order by (shipped_node ->> 'completed_at') desc)
      from (
        select jsonb_build_object(
          'slug', n.slug,
          'name', n.name,
          'subtitle', n.subtitle,
          'icon', n.icon,
          'path_id', n.path_id,
          'path_title', p.title,
          'est_hours', n.est_hours,
          'completed_at', up.completed_at,
          'evidence', coalesce((
            select jsonb_agg(jsonb_build_object('description', t.description, 'url', tc.evidence_url) order by tc.completed_at)
            from public.task_completions tc
            join public.tasks t on t.id = tc.task_id
            where tc.user_id = pr.id and t.node_id = n.id and tc.evidence_url is not null
          ), '[]'::jsonb)
        ) as shipped_node
        from public.user_progress up
        join public.nodes n on n.id = up.node_id
        join public.paths p on p.id = n.path_id
        where up.user_id = pr.id and up.status = 'complete'
      ) s
    ), '[]'::jsonb),
    'projects', coalesce((
      select jsonb_object_agg(path_id, repo_url)
      from public.projects
      where user_id = pr.id
    ), '{}'::jsonb),
    'activity', coalesce((
      select jsonb_object_agg(day, cnt)
      from (
        select to_char(completed_at, 'YYYY-MM-DD') as day, count(*) as cnt
        from public.user_progress
        where user_id = pr.id and status = 'complete' and completed_at is not null
        group by 1
      ) a
    ), '{}'::jsonb)
  )
  from public.profiles pr
  where lower(pr.username) = lower(p_handle)
  order by pr.created_at
  limit 1;
$$;
