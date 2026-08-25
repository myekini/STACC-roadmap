-- Make Data Engineering one cumulative, production-shaped portfolio project.
-- Existing node slugs and task rows are retained so learner progress survives.

create or replace function public.apply_data_engineering_mastery_refresh()
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.paths where id = 'de') then return; end if;

  update public.paths set
    description = 'Build, deploy, and operate one reliable data platform from ingestion to decision-ready output.',
    tags = array['Docker','PostgreSQL','dbt','Airflow','Terraform','Spark','Kafka']
  where id = 'de';

  update public.nodes n set
    name=v.name, subtitle=v.subtitle, description=v.description,
    est_hours=v.hours, xp_reward=v.xp, skills=v.skills
  from (values
    ('de-etl','Local Data Platform','Docker, PostgreSQL, and ingestion','Run the project locally, then build an API-to-PostgreSQL pipeline that validates inputs and reruns without duplicate data.',10,150,array['Docker & PostgreSQL','API ingestion','Idempotency & quality']),
    ('de-modeling','Warehouse Modeling','Grain before tables','Turn raw operational data into an analytics-ready dimensional model with explicit grain, history, and performance choices.',12,150,array['Grain, facts & dimensions','Keys & slowly changing dimensions','Partitioning & clustering']),
    ('de-dbt','Analytics Engineering with dbt','Tested transformations and lineage','Build layered transformations with tested sources, documented lineage, and repeatable development and production targets.',12,200,array['Sources & layered models','Tests & documentation','Environments & deployment']),
    ('de-orchestration','Workflow Orchestration','Airflow scheduling and recovery','Operate the batch workflow with correct data intervals, safe retries, visible failures, and tested backfills.',12,200,array['DAGs & data intervals','Retries, logs & alerts','Backfills & recovery']),
    ('de-cloud','Cloud & Infrastructure as Code','GCP, Terraform, security, and cost','Deploy the platform from code with least-privilege identities, separated environments, and explicit storage and query costs.',14,200,array['Terraform & environments','IAM & secrets','Storage, warehouse & cost']),
    ('de-spark','Distributed Batch with Spark','Scale only when justified','Use PySpark for a workload that exceeds local tools, inspect its execution plan, and improve measured shuffle, skew, or partitioning.',16,250,array['DataFrames & lazy execution','Partitions, joins & shuffles','Plans, skew & tuning']),
    ('de-streaming','Event Streaming with Kafka','Ordering, replay, and recovery','Add one bounded event workload and explain its keys, partitions, consumer groups, replay, and delivery guarantees.',16,250,array['Events, topics & partitions','Consumers, offsets & replay','Delivery semantics & failure']),
    ('de-vectordb','Production Readiness Capstone','Prove the whole platform works','Release the cumulative platform with quality gates, lineage, CI, observability, recovery evidence, and documentation another engineer can use.',18,300,array['Quality, lineage & observability','Incidents, backfills & recovery','Architecture, runbook & release'])
  ) v(slug,name,subtitle,description,hours,xp,skills)
  where n.slug=v.slug;

  update public.topics t set title=v.title
  from public.nodes n, (values
    ('de-etl',1,'Docker & PostgreSQL'),('de-etl',2,'API ingestion'),('de-etl',3,'Idempotency & quality'),
    ('de-modeling',1,'Grain, facts & dimensions'),('de-modeling',2,'Keys & slowly changing dimensions'),('de-modeling',3,'Partitioning & clustering'),
    ('de-dbt',1,'Sources & layered models'),('de-dbt',2,'Tests & documentation'),('de-dbt',3,'Environments & deployment'),
    ('de-orchestration',1,'DAGs & data intervals'),('de-orchestration',2,'Retries, logs & alerts'),('de-orchestration',3,'Backfills & recovery'),
    ('de-cloud',1,'Terraform & environments'),('de-cloud',2,'IAM & secrets'),('de-cloud',3,'Storage, warehouse & cost'),
    ('de-spark',1,'DataFrames & lazy execution'),('de-spark',2,'Partitions, joins & shuffles'),('de-spark',3,'Plans, skew & tuning'),
    ('de-streaming',1,'Events, topics & partitions'),('de-streaming',2,'Consumers, offsets & replay'),('de-streaming',3,'Delivery semantics & failure'),
    ('de-vectordb',1,'Quality, lineage & observability'),('de-vectordb',2,'Incidents, backfills & recovery'),('de-vectordb',3,'Architecture, runbook & release')
  ) v(slug,ord,title)
  where n.slug=v.slug and t.node_id=n.id and t."order"=v.ord;

  -- Retarget the existing first-topic rows in place. Lesson tasks reference
  -- these resource IDs, so deleting them would null tasks.resource_id while
  -- leaving lesson metadata behind and violate tasks_lesson_resource_check.
  with curated(slug,topic_order,resource_order,name,type,platform,url) as (values
    ('de-etl',1,1,'Docker — 45-minute workshop','course','Docker','https://docs.docker.com/get-started/workshop/'),
    ('de-etl',1,2,'Docker Compose — how it works','documentation','Docker','https://docs.docker.com/compose/intro/compose-application-model/'),
    ('de-cloud',1,1,'Terraform on Google Cloud — get started','course','HashiCorp','https://developer.hashicorp.com/terraform/tutorials/gcp-get-started'),
    ('de-cloud',1,2,'Terraform language — resources','documentation','HashiCorp','https://developer.hashicorp.com/terraform/language/resources')
  ), ranked_existing as (
    select r.id, n.slug,
      row_number() over (
        partition by n.slug
        order by r."order", r.created_at, r.id
      )::integer as resource_order
    from public.resources r
    join public.nodes n on n.id=r.node_id
    join public.topics t on t.id=r.topic_id and t.node_id=n.id
    where n.slug in ('de-etl','de-cloud') and t."order"=1
  )
  update public.resources r set
    name=c.name, type=c.type, platform=c.platform, url=c.url,
    "order"=c.resource_order
  from ranked_existing existing
  join curated c on c.slug=existing.slug
    and c.resource_order=existing.resource_order
  where r.id=existing.id;

  update public.tasks task set lesson_title=r.name
  from public.resources r
  join public.nodes n on n.id=r.node_id
  join public.topics topic on topic.id=r.topic_id and topic.node_id=n.id
  where task.resource_id=r.id
    and n.slug in ('de-etl','de-cloud') and topic."order"=1;

  -- Fresh or unusually sparse databases may not have both legacy rows.
  with curated(slug,topic_order,resource_order,name,type,platform,url) as (values
    ('de-etl',1,1,'Docker — 45-minute workshop','course','Docker','https://docs.docker.com/get-started/workshop/'),
    ('de-etl',1,2,'Docker Compose — how it works','documentation','Docker','https://docs.docker.com/compose/intro/compose-application-model/'),
    ('de-cloud',1,1,'Terraform on Google Cloud — get started','course','HashiCorp','https://developer.hashicorp.com/terraform/tutorials/gcp-get-started'),
    ('de-cloud',1,2,'Terraform language — resources','documentation','HashiCorp','https://developer.hashicorp.com/terraform/language/resources')
  )
  insert into public.resources(node_id,topic_id,"order",name,type,platform,url)
  select n.id,t.id,c.resource_order,c.name,c.type,c.platform,c.url
  from curated c join public.nodes n on n.slug=c.slug
  join public.topics t on t.node_id=n.id and t."order"=c.topic_order
  where not exists(
    select 1 from public.resources existing
    where existing.topic_id=t.id and existing.url=c.url
  );

  update public.tasks t set description=v.description
  from public.nodes n, (values
    ('de-etl',1,'Learn: complete the Docker workshop, run PostgreSQL with Compose, and study paginated and cursor-based API ingestion'),
    ('de-etl',2,'Build milestone 1: initialise one cumulative repository with a containerised API-to-PostgreSQL pipeline, external configuration, pagination, schema checks, an incremental cursor, duplicate-safe reruns and automated tests'),
    ('de-modeling',2,'Build milestone 2: extend the same repository with a grain statement, bus matrix, fact table, conformed dimensions, one SCD Type 2 dimension and a partition choice justified by measured queries'),
    ('de-dbt',2,'Build milestone 3: extend the repository with dbt sources, staging/intermediate/mart layers, key and relationship tests, one business-rule test, generated docs and separate development/production targets'),
    ('de-orchestration',2,'Build milestone 4: orchestrate the existing ingestion, validation and dbt workflow with retries, failure notification, a deliberate failure test and a demonstrated seven-day backfill'),
    ('de-cloud',1,'Learn: provision a small GCP environment with Terraform, then study IAM, secrets, storage lifecycle and BigQuery cost controls'),
    ('de-cloud',2,'Build milestone 5: deploy the same platform from Terraform with raw/processed storage zones, separate identities, least privilege, budgets and a before/after query-cost comparison'),
    ('de-spark',2,'Build milestone 6: add a PySpark workload to the same repository, justify it against a local baseline, capture the explain plan and improve one measured shuffle, skew or partition problem'),
    ('de-streaming',2,'Build milestone 7: add one bounded Kafka workload with keyed events, partitions and a consumer group; demonstrate replay and document ordering, rebalancing and delivery semantics'),
    ('de-vectordb',2,'Capstone: harden and release the cumulative platform with quality checks, lineage, CI, architecture, data dictionary, cost note, failure alert, demonstrated recovery runbook and one decision-ready data product')
  ) v(slug,ord,description)
  where n.slug=v.slug and t.node_id=n.id and t."order"=v.ord;

  update public.tasks t set project_requirements =
    '{"requiredPaths":["src/ingestion.py","docker-compose.yml","tests/test_ingestion.py","README.md"],"requiredHeadings":{"README.md":["Setup","Configuration","Safe reruns","Milestones"]},"submissionMode":"commit","manualReview":["All later milestones extend this repository","Pipeline paginates, validates schema and reruns without duplicates","Secrets remain outside Git"]}'::jsonb
  from public.nodes n where n.slug='de-etl' and t.node_id=n.id and t.type='build';

  update public.tasks t set project_requirements =
    '{"requiredPaths":["README.md","docs/architecture.md","docs/data_dictionary.md","docs/runbook.md",".github/workflows/ci.yml"],"requiredHeadings":{"README.md":["Setup","Validation","Demo","Milestones"],"docs/runbook.md":["Alerts","Backfill","Recovery"]},"submissionMode":"commit","manualReview":["Commit history shows one platform growing across all seven milestones","CI validates code and data contracts","A failed run and recovery are demonstrated","The data product answers a defined user decision"]}'::jsonb
  from public.nodes n where n.slug='de-vectordb' and t.node_id=n.id and t.type='build';
end;
$$;

select public.apply_data_engineering_mastery_refresh();
revoke all on function public.apply_data_engineering_mastery_refresh() from public, anon, authenticated;
