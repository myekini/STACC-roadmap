-- Stacc Roadmap Tracker — evidence shipping + public portfolio profiles.
-- "Ship, don't watch": build tasks now carry a public evidence URL (repo /
-- live app / writeup), and a member's shipped work is readable by anyone via
-- get_public_profile() so /u/[handle] can serve as a portfolio. RLS on the
-- underlying tables stays closed; the RPC is the only public read path.

alter table public.task_completions
  add column evidence_url text;

-- complete_task gains an optional evidence argument. The old 1-arg signature
-- must be dropped first: CREATE OR REPLACE with a new signature would create
-- an overload and make PostgREST rpc calls ambiguous.
drop function public.complete_task(uuid);

create or replace function public.complete_task(p_task uuid, p_evidence text default null)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_node uuid;
  v_type text;
  v_xp integer;
  v_remaining integer;
  v_already_complete boolean;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select node_id, type into v_node, v_type from public.tasks where id = p_task;
  if v_node is null then raise exception 'unknown task'; end if;
  if not public.node_is_unlocked(auth.uid(), v_node) then
    raise exception 'node is locked';
  end if;

  -- Shipping is the product: build tasks require a public evidence link.
  if v_type = 'build' and (p_evidence is null or p_evidence !~* '^https?://') then
    raise exception 'build tasks require an evidence url (https://…)';
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

-- ─────────────────────────────────────────────────────────────
-- Public portfolio read (anon-callable, security definer).
-- Exposes ONLY: username, avatar, join date, shipped modules with their
-- evidence links, and completion-per-day counts. Never XP/rank/role/email.
-- Handle = username (case-insensitive); oldest profile wins on collisions.
-- ─────────────────────────────────────────────────────────────
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
