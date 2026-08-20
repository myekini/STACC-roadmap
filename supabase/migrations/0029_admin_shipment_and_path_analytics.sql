-- Two admin analytics RPCs the product spec already names as success metrics
-- (docs/PRODUCT.md §9) but nothing computed until now:
--
--  - admin_shipment_stats: how many *verified* GitHub milestones have actually
--    been shipped, and by how many distinct members. This is the number that
--    tells the founder whether the product's actual differentiator — curated
--    path + prerequisite gates + GitHub-verified evidence, not just another
--    course tracker — is being used at all. A 'build' task_completions row
--    only carries an evidence_url once /api/github/verify (or, for
--    Foundations, complete_task with a manual URL) has actually stamped one;
--    Foundations build/practice tasks never require evidence (§4), so they
--    fall out of this count on their own.
--
--  - admin_path_analytics: per-path (per specialization) started vs. fully
--    completed member counts — the §9 "path completion rate" target. Mirrors
--    the exact 'every node in the path is complete' definition useUserData's
--    pathFullyComplete() already uses client-side, so the number an admin
--    sees here matches what unlocks a member's next path in the product.

create or replace function public.admin_shipment_stats()
returns table (
  total_verified_shipments bigint,
  members_shipped bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
  select
    count(*) as total_verified_shipments,
    count(distinct tc.user_id) as members_shipped
  from public.task_completions tc
  join public.tasks t on t.id = tc.task_id
  where t.type = 'build' and tc.evidence_url is not null;
end;
$$;

create or replace function public.admin_path_analytics()
returns table (
  path_id text,
  total_nodes bigint,
  members_started bigint,
  members_completed bigint
)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
  with node_counts as (
    select path_id, count(*) as total_nodes
    from public.nodes
    group by path_id
  ),
  member_progress as (
    select up.user_id, n.path_id, count(*) filter (where up.status = 'complete') as completed_count
    from public.user_progress up
    join public.nodes n on n.id = up.node_id
    group by up.user_id, n.path_id
  )
  select
    nc.path_id,
    nc.total_nodes,
    count(mp.user_id) as members_started,
    count(mp.user_id) filter (where mp.completed_count = nc.total_nodes) as members_completed
  from node_counts nc
  left join member_progress mp on mp.path_id = nc.path_id
  group by nc.path_id, nc.total_nodes;
end;
$$;
