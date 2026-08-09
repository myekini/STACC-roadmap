-- Admin accounts can use the member experience to audit every course without
-- completing prerequisite modules first. Member gating remains unchanged.
create or replace function public.node_is_unlocked(p_user uuid, p_node uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or (
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
    )
  );
$$;
