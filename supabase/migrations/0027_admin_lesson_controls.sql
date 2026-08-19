-- Persist focused-lesson fields from the admin curriculum editor.
drop function if exists public.admin_upsert_task(uuid, uuid, text, text, integer, jsonb, jsonb, jsonb);

create function public.admin_upsert_task(
  p_id uuid,
  p_node_id uuid,
  p_description text,
  p_type text,
  p_order integer,
  p_quiz jsonb,
  p_challenge jsonb,
  p_project_requirements jsonb,
  p_resource_id uuid,
  p_lesson_title text,
  p_duration_minutes integer,
  p_start_seconds integer,
  p_end_seconds integer
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

  if p_type in ('read', 'watch') then
    if p_resource_id is null or coalesce(trim(p_lesson_title), '') = '' or p_duration_minutes is null then
      raise exception 'Learning tasks require a resource, lesson title, and duration.';
    end if;
    if p_duration_minutes < 1 or p_duration_minutes > 180 then
      raise exception 'Lesson duration must be between 1 and 180 minutes.';
    end if;
    if not exists (select 1 from public.resources where id = p_resource_id and node_id = p_node_id) then
      raise exception 'The selected resource does not belong to this module.';
    end if;
    if p_type = 'watch' and ((p_start_seconds is null) <> (p_end_seconds is null) or (p_start_seconds is not null and (p_start_seconds < 0 or p_end_seconds <= p_start_seconds))) then
      raise exception 'Video timing requires a valid start and end range.';
    end if;
  else
    p_resource_id := null;
    p_lesson_title := null;
    p_duration_minutes := null;
    p_start_seconds := null;
    p_end_seconds := null;
  end if;

  if p_id is null then
    insert into public.tasks (
      node_id, description, type, "order", quiz, challenge, project_requirements,
      resource_id, lesson_title, duration_minutes, start_seconds, end_seconds,
      created_by, updated_by, updated_at
    ) values (
      p_node_id, p_description, p_type, coalesce(p_order, 0), p_quiz, p_challenge, p_project_requirements,
      p_resource_id, p_lesson_title, p_duration_minutes, p_start_seconds, p_end_seconds,
      auth.uid(), auth.uid(), now()
    ) returning * into result;
  else
    update public.tasks set
      description = p_description,
      type = p_type,
      "order" = coalesce(p_order, "order"),
      quiz = p_quiz,
      challenge = p_challenge,
      project_requirements = p_project_requirements,
      resource_id = p_resource_id,
      lesson_title = p_lesson_title,
      duration_minutes = p_duration_minutes,
      start_seconds = p_start_seconds,
      end_seconds = p_end_seconds,
      updated_by = auth.uid(),
      updated_at = now()
    where id = p_id
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_upsert_task(uuid, uuid, text, text, integer, jsonb, jsonb, jsonb, uuid, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_upsert_task(uuid, uuid, text, text, integer, jsonb, jsonb, jsonb, uuid, text, integer, integer, integer) to authenticated;
