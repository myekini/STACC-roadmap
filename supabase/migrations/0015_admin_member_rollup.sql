-- Paginated, server-aggregated admin member rollup + node analytics.
--
-- useAdminData.ts previously pulled the entire `profiles` and `user_progress`
-- tables into the browser unpaginated on every admin page load, then
-- aggregated per-member completion/stuck status client-side. Two production
-- problems at scale: (1) PostgREST caps unpaginated selects at 1000 rows by
-- default, so past ~1000 members or progress rows the admin panel silently
-- showed a partial, misleading picture; (2) at the 10k-user scale target
-- (docs/ARCHITECTURE.md), that's up to hundreds of thousands of progress
-- rows shipped to the browser on every load. This moves the aggregation into
-- Postgres and returns one page at a time.

create or replace function public.admin_member_rollup(
  p_total_nodes integer,
  p_search text default null,
  p_cohort text default null,
  p_stuck_only boolean default false,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  username text,
  avatar_url text,
  github_username text,
  cohort text,
  joined_at timestamptz,
  last_active_at timestamptz,
  completed_nodes jsonb,
  in_progress_nodes uuid[],
  overall_pct integer,
  is_stuck boolean,
  total_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();

  return query
  with rollup as (
    select
      p.id,
      p.username,
      p.avatar_url,
      p.github_username,
      p.cohort_label as cohort,
      p.created_at as joined_at,
      max(up.completed_at) filter (where up.status = 'complete') as last_completed_at,
      max(up.started_at) as last_started_at,
      coalesce(jsonb_object_agg(up.node_id, up.completed_at) filter (where up.status = 'complete'), '{}'::jsonb) as completed_nodes,
      coalesce(array_agg(up.node_id) filter (where up.status = 'in_progress'), '{}'::uuid[]) as in_progress_nodes,
      count(*) filter (where up.status = 'complete') as completed_count,
      (count(*) filter (where up.status = 'complete') > 0 or count(*) filter (where up.status = 'in_progress') > 0) as has_activity
    from public.profiles p
    left join public.user_progress up on up.user_id = p.id
    where (p_search is null or p.username ilike '%' || p_search || '%')
      and (p_cohort is null or p.cohort_label = p_cohort)
    group by p.id, p.username, p.avatar_url, p.github_username, p.cohort_label, p.created_at
  ),
  final as (
    select
      r.id, r.username, r.avatar_url, r.github_username, r.cohort, r.joined_at,
      greatest(r.last_completed_at, r.last_started_at) as last_active_at,
      r.completed_nodes,
      r.in_progress_nodes,
      case when p_total_nodes > 0 then round((r.completed_count::numeric / p_total_nodes) * 100)::integer else 0 end as overall_pct,
      (
        extract(epoch from (now() - coalesce(greatest(r.last_completed_at, r.last_started_at), r.joined_at))) / 86400 > 14
        and (r.has_activity or extract(epoch from (now() - r.joined_at)) / 86400 > 14)
      ) as is_stuck
    from rollup r
  )
  select f.id, f.username, f.avatar_url, f.github_username, f.cohort, f.joined_at,
         f.last_active_at, f.completed_nodes, f.in_progress_nodes, f.overall_pct, f.is_stuck,
         count(*) over() as total_count
  from final f
  where (not p_stuck_only or f.is_stuck)
  order by f.overall_pct desc, f.username asc
  limit p_limit offset p_offset;
end;
$$;

-- Node-level starts/completions — cheap aggregate, no pagination needed
-- (bounded by curriculum size, not user count).
create or replace function public.admin_node_analytics()
returns table (node_id uuid, starts bigint, completions bigint)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
  select up.node_id, count(*) as starts, count(*) filter (where up.status = 'complete') as completions
  from public.user_progress up
  group by up.node_id;
end;
$$;

-- Distinct cohort labels in use — cheap, small result set.
create or replace function public.admin_cohorts()
returns table (cohort text)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query select distinct cohort_label from public.profiles where cohort_label is not null order by 1;
end;
$$;

-- Overview stat cards — computed fully server-side so the dashboard never
-- needs the full member list in the browser just to show four numbers.
create or replace function public.admin_overview_stats(p_total_nodes integer)
returns table (
  total_members bigint,
  active_this_week bigint,
  avg_completion_pct integer,
  stuck_count bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
  with per_member as (
    select
      p.id,
      max(up.completed_at) filter (where up.status = 'complete') as last_completed_at,
      max(up.started_at) as last_started_at,
      count(*) filter (where up.status = 'complete') as completed_count,
      (count(*) filter (where up.status = 'complete') > 0 or count(*) filter (where up.status = 'in_progress') > 0) as has_activity,
      p.created_at
    from public.profiles p
    left join public.user_progress up on up.user_id = p.id
    group by p.id, p.created_at
  )
  select
    count(*) as total_members,
    count(*) filter (
      where extract(epoch from (now() - coalesce(greatest(last_completed_at, last_started_at), 'epoch'::timestamptz))) / 86400 <= 7
    ) as active_this_week,
    case when count(*) > 0 and p_total_nodes > 0
      then round(avg(completed_count::numeric / p_total_nodes) * 100)::integer
      else 0
    end as avg_completion_pct,
    count(*) filter (
      where extract(epoch from (now() - coalesce(greatest(last_completed_at, last_started_at), created_at))) / 86400 > 14
        and (has_activity or extract(epoch from (now() - created_at)) / 86400 > 14)
    ) as stuck_count
  from per_member;
end;
$$;
