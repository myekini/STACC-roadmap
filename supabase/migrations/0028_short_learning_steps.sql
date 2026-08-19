-- Make small, manually-completable practice exercises distinct from repository-
-- verified build milestones, then split each available module into bounded
-- resource steps. Existing task IDs are retained and completed modules receive
-- completions for the additive tasks so a deploy never reopens finished work.

alter table public.tasks drop constraint if exists tasks_type_check;
alter table public.tasks add constraint tasks_type_check
  check (type in ('read', 'watch', 'practice', 'build', 'quiz', 'challenge'));

-- Replace the only playlist-level resource with its bounded capstone brief.
update public.resources r
set name = 'MLOps Zoomcamp — platform capstone',
    type = 'course',
    platform = 'DataTalksClub',
    url = 'https://github.com/DataTalksClub/mlops-zoomcamp/tree/main/07-project'
from public.nodes n
where r.node_id = n.id
  and n.slug = 'ml-platform'
  and r.url like '%youtube.com/playlist%';

-- The earlier lesson migration deliberately covered the core paths only. Bind
-- the first MLOps resource now; AI Engineering remains paused and untouched.
with ranked_resources as (
  select r.id, r.node_id, row_number() over (partition by r.node_id order by r.created_at, r.id) as position
  from public.resources r
), first_tasks as (
  select distinct on (t.node_id) t.id, t.node_id
  from public.tasks t
  join public.nodes n on n.id = t.node_id
  where n.path_id = 'mlops' and t.type in ('read', 'watch')
  order by t.node_id, t."order", t.id
)
update public.tasks t
set resource_id = r.id,
    lesson_title = rsrc.name,
    duration_minutes = 45
from first_tasks ft
join ranked_resources r on r.node_id = ft.node_id and r.position = 1
join public.resources rsrc on rsrc.id = r.id
where t.id = ft.id and t.resource_id is null;

-- Turn the other curated source into one short reference lesson. The type is
-- derived from the resource, but implementation guides remain reads.
insert into public.tasks (
  node_id, description, type, "order", resource_id, lesson_title, duration_minutes
)
select n.id,
       case when r.type = 'video' then 'Watch: ' else 'Read: ' end || r.name,
       case when r.type = 'video' then 'watch' else 'read' end,
       2,
       r.id,
       r.name,
       15
from public.nodes n
join public.resources r on r.node_id = n.id
where n.path_id <> 'ai-engineering'
  and not exists (select 1 from public.tasks linked where linked.resource_id = r.id)
  and not exists (
    select 1 from public.tasks existing
    where existing.node_id = n.id and existing."order" = 2 and existing.lesson_title = r.name
  );

-- Shift original applied work/checkpoints after the new reference lesson.
update public.tasks t
set "order" = t."order" + case when n.path_id = 'foundations' then 1 else 2 end
from public.nodes n
where t.node_id = n.id
  and n.path_id <> 'ai-engineering'
  and t.resource_id is null
  and t.type <> 'practice'
  and t."order" >= 2;

insert into public.tasks (node_id, description, type, "order")
select n.id,
       'Practise: reproduce a small ' || lower(n.name) || ' example, then record the result and one decision you made.',
       'practice',
       3
from public.nodes n
where n.path_id not in ('foundations', 'ai-engineering')
  and not exists (
    select 1 from public.tasks t where t.node_id = n.id and t.type = 'practice'
  );

-- Preserve the completed state of members who finished before these additive
-- learning steps were published.
insert into public.task_completions (user_id, task_id)
select up.user_id, t.id
from public.user_progress up
join public.tasks t on t.node_id = up.node_id
where up.status = 'complete'
  and (t.type = 'practice' or t."order" = 2)
on conflict (user_id, task_id) do nothing;
