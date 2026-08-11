-- Project verification hardening and the first content-owned milestone checks.

create unique index if not exists project_submissions_commit_once_idx
  on public.project_submissions (project_id, commit_sha);

update public.tasks t
set project_requirements = requirements.value
from public.nodes n
join (values
  ('de-etl',           '{"requiredPaths":["src/ingestion.py"],"submissionMode":"commit","manualReview":["Pipeline is safe to rerun without duplicate rows"]}'::jsonb),
  ('de-modeling',      '{"requiredPaths":["models/schema.sql"],"submissionMode":"commit","manualReview":["Model grain and key choices are documented"]}'::jsonb),
  ('de-dbt',           '{"requiredPaths":["dbt_project.yml"],"submissionMode":"commit","manualReview":["Models include tests and documentation"]}'::jsonb),
  ('de-orchestration', '{"requiredPaths":["dags/pipeline.py"],"submissionMode":"commit","manualReview":["Workflow includes retries and a documented backfill path"]}'::jsonb),
  ('de-cloud',         '{"requiredPaths":["infra/main.tf"],"submissionMode":"commit","manualReview":["Infrastructure avoids committed credentials"]}'::jsonb),
  ('de-spark',         '{"requiredPaths":["src/spark_job.py"],"submissionMode":"commit","manualReview":["Partition and shuffle choices are explained"]}'::jsonb),
  ('de-streaming',     '{"requiredPaths":["src/streaming.py"],"submissionMode":"commit","manualReview":["Delivery and ordering assumptions are documented"]}'::jsonb),
  ('de-vectordb',      '{"requiredPaths":["src/vector_search.py"],"submissionMode":"commit","manualReview":["Retrieval quality is evaluated with examples"]}'::jsonb)
) as requirements(slug, value) on requirements.slug = n.slug
where t.node_id = n.id and t.type = 'build';
