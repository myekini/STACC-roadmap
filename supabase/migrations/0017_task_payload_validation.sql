-- admin_upsert_task accepted quiz/challenge as raw jsonb with zero shape
-- checking — a malformed payload (empty options, correctIndex pointing past
-- the array, missing challenge fields) saved successfully in the admin
-- panel and only broke when a real learner opened QuizWorkspace/
-- ChallengeBlock. This is the single write path for task content (no
-- direct-table RLS write policies exist), so validating here closes the
-- gap for every caller, not just the current UI.

create or replace function public.validate_task_payload(p_type text, p_quiz jsonb, p_challenge jsonb)
returns void
language plpgsql
as $$
declare
  bad_question boolean;
begin
  if p_type = 'quiz' then
    if p_quiz is null or jsonb_typeof(p_quiz->'questions') is distinct from 'array'
       or jsonb_array_length(p_quiz->'questions') < 1 then
      raise exception 'Quiz must have at least one question.';
    end if;

    select true into bad_question
    from jsonb_array_elements(p_quiz->'questions') q
    where coalesce(q->>'question', '') = ''
       or jsonb_typeof(q->'options') is distinct from 'array'
       or jsonb_array_length(q->'options') < 2
       or (q->>'correctIndex') !~ '^\d+$'
       or (q->>'correctIndex')::int < 0
       or (q->>'correctIndex')::int >= jsonb_array_length(q->'options')
    limit 1;

    if bad_question then
      raise exception 'Every quiz question needs question text, at least 2 options, and a correctIndex within range.';
    end if;
  end if;

  if p_type = 'challenge' then
    if p_challenge is null
       or coalesce(p_challenge->>'prompt', '') = ''
       or coalesce(p_challenge->>'starterCode', '') = '' then
      raise exception 'Challenge needs a prompt and starter code.';
    end if;

    if p_challenge->>'language' = 'python' then
      if coalesce(p_challenge->>'testCode', '') = '' then
        raise exception 'Python challenges need test code.';
      end if;
    elsif p_challenge->>'language' = 'sql' then
      if coalesce(p_challenge->>'setupSql', '') = ''
         or jsonb_typeof(p_challenge->'expectedRows') is distinct from 'array' then
        raise exception 'SQL challenges need setup SQL and an expected-rows array.';
      end if;
    else
      raise exception 'Challenge language must be "python" or "sql".';
    end if;
  end if;
end;
$$;

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
