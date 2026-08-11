-- Foundations are practice modules, not portfolio projects. Their build tasks
-- can be completed without setting up or pasting a GitHub URL. Specialization
-- build tasks continue to require evidence inside the path project.

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

  if v_type = 'build' and v_path <> 'foundations' then
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

  if v_remaining > 0 then return 'in_progress'; end if;

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
