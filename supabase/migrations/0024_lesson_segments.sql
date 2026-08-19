-- A learning task may point to one focused section of an existing resource.
-- This preserves the two-source curriculum rule and existing task completion
-- model while allowing courses/videos/docs to be broken into bounded lessons.
alter table public.tasks
  add column if not exists resource_id uuid references public.resources(id) on delete set null,
  add column if not exists lesson_title text,
  add column if not exists duration_minutes integer,
  add column if not exists start_seconds integer,
  add column if not exists end_seconds integer;

alter table public.tasks
  add constraint tasks_duration_positive_check
    check (duration_minutes is null or duration_minutes > 0),
  add constraint tasks_video_range_check
    check (
      (start_seconds is null and end_seconds is null)
      or (
        start_seconds is not null and start_seconds >= 0
        and end_seconds is not null and end_seconds > start_seconds
      )
    ),
  add constraint tasks_lesson_resource_check
    check (
      (resource_id is null and lesson_title is null and duration_minutes is null and start_seconds is null and end_seconds is null)
      or (resource_id is not null and lesson_title is not null and duration_minutes is not null and type in ('read', 'watch'))
    );

create index if not exists tasks_resource_id_idx on public.tasks(resource_id);

-- Bind each active module's existing learning task to its primary resource.
-- Task IDs remain unchanged, preserving current learner progress.
create or replace function public.apply_core_lesson_segments()
returns void
language sql
set search_path = public
as $$
update public.tasks t
set resource_id = primary_resource.id,
    lesson_title = lesson.title,
    duration_minutes = lesson.minutes
from public.nodes n
join (values
  ('found-python', 'Python essentials: values, control flow and functions', 45),
  ('found-sql', 'SQLBolt core queries and joins', 75),
  ('found-git', 'Everyday Git: commits, branches and remotes', 55),
  ('found-cli', 'The shell: navigation, pipes and automation', 50),
  ('found-stats', 'Distributions, sampling and inference', 60),
  ('found-ai', 'How LLMs work and where they fail', 60),
  ('de-etl', 'Containerised ingestion and safe reruns', 55),
  ('de-modeling', 'Grain, facts and dimensional decisions', 50),
  ('de-dbt', 'Layered dbt models and trustworthy tests', 45),
  ('de-orchestration', 'Airflow DAGs, retries and backfills', 50),
  ('de-cloud', 'Cloud identity, storage and cost controls', 45),
  ('de-spark', 'Spark execution, partitions and joins', 55),
  ('de-streaming', 'Kafka topics, partitions and consumer groups', 45),
  ('de-vectordb', 'Lineage, quality checks and recovery', 45),
  ('da-eda', 'A disciplined exploratory analysis', 45),
  ('da-visualization', 'Chart construction and accessible encoding', 40),
  ('da-dashboards', 'Decision-first dashboard design', 40),
  ('da-storytelling', 'From evidence to a decision narrative', 40),
  ('da-bi', 'Semantic models, measures and governed BI', 55),
  ('da-ai-analysis', 'Verifiable AI-assisted analysis', 40),
  ('ds-ml', 'Prediction framing and baseline models', 55),
  ('ds-features', 'Leakage-safe feature pipelines', 45),
  ('ds-evaluation', 'Evaluation beyond accuracy', 50),
  ('ds-experiments', 'Experiments that support causal decisions', 50),
  ('ds-deployment', 'Serving and versioning a model', 50),
  ('ds-deeplearning', 'Transfer learning and disciplined experiments', 90),
  ('ds-llm', 'Operate, monitor and explain an ML system', 60)
) as lesson(slug, title, minutes) on lesson.slug = n.slug
join lateral (
  select r.id
  from public.resources r
  where r.node_id = n.id
  order by r.created_at, r.id
  limit 1
) primary_resource on true
where t.node_id = n.id
  and t."order" = 1
  and t.type in ('read', 'watch');
$$;

select public.apply_core_lesson_segments();
revoke all on function public.apply_core_lesson_segments() from public, anon, authenticated;
