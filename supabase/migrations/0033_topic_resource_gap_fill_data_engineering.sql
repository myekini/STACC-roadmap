-- Verified topic-2/topic-3 resources for every Data Engineering module.
-- Dedup keyed on (topic_id, url) — see 0032 for why a bare url check is
-- wrong here (several sources are cited across more than one topic).
--
-- One entry (de-vectordb's "Postmortem Culture at Google" video) was
-- title-confirmed by two independent searches but not content-verified by a
-- direct fetch (YouTube blocked it with a CAPTCHA during research) — worth a
-- manual spot-check before pointing members at it.

begin;

with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  -- de-etl — Incremental ingestion / Idempotency & quality
  ('de-etl', 2, 1, 'Data Ingestion From APIs to Warehouses and Data Lakes', 'video', 'DataTalksClub', 'https://www.youtube.com/watch?v=pgJWP_xqO1g'),
  ('de-etl', 2, 2, 'dlt — cursor-based incremental loading', 'documentation', 'dltHub', 'https://dlthub.com/docs/general-usage/incremental/cursor'),
  ('de-etl', 3, 1, 'Dimensional data modeling and idempotent pipelines', 'video', 'DataExpert.io (Zach Wilson)', 'https://www.youtube.com/watch?v=JeeqpK3o3LQ'),
  ('de-etl', 3, 2, 'Great Expectations — data quality use cases', 'documentation', 'Great Expectations', 'https://docs.greatexpectations.io/docs/reference/learn/data_quality_use_cases/dq_use_cases_lp/'),

  -- de-modeling — Keys & SCDs / Warehouse performance
  ('de-modeling', 2, 1, 'Dimensional data modeling and idempotent pipelines — SCDs', 'video', 'DataExpert.io (Zach Wilson)', 'https://www.youtube.com/watch?v=JeeqpK3o3LQ'),
  ('de-modeling', 2, 2, 'dbt — Add snapshots to your DAG', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/docs/build/snapshots'),
  ('de-modeling', 3, 1, 'Partitioning and Clustering in BigQuery', 'course', 'Google Cloud Codelabs', 'https://codelabs.developers.google.com/codelabs/gcp-bq-partitioning-and-clustering'),
  ('de-modeling', 3, 2, 'BigQuery — introduction to clustered tables', 'documentation', 'Google Cloud', 'https://docs.cloud.google.com/bigquery/docs/clustered-tables'),

  -- de-dbt — Tests & lineage / Environment discipline
  ('de-dbt', 2, 1, 'dbt Fundamentals — Testing and documentation', 'course', 'dbt Labs', 'https://learn.getdbt.com/courses/dbt-fundamentals'),
  ('de-dbt', 2, 2, 'dbt — About documentation (lineage graph)', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/docs/build/documentation'),
  ('de-dbt', 3, 1, 'dbt Fundamentals — Deployment', 'course', 'dbt Labs', 'https://learn.getdbt.com/courses/dbt-fundamentals'),
  ('de-dbt', 3, 2, 'dbt — About environments', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/docs/environments-in-dbt'),

  -- de-orchestration — Retries & alerts / Safe backfills
  ('de-orchestration', 2, 1, 'Monitor Your DAGs with Airflow Notifications', 'video', 'Astronomer', 'https://www.astronomer.io/events/webinars/dags-with-airflow-notifications-video/'),
  ('de-orchestration', 2, 2, 'Airflow — Callbacks', 'documentation', 'Apache Airflow', 'https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/logging-monitoring/callbacks.html'),
  ('de-orchestration', 3, 1, 'Airflow DAG Catchup and Backfill', 'video', 'Marc Lamberti', 'https://www.youtube.com/watch?v=OXOiUeHOQ-0'),
  ('de-orchestration', 3, 2, 'Rerunning DAGs and tasks', 'documentation', 'Astronomer', 'https://www.astronomer.io/docs/learn/rerunning-dags'),

  -- de-cloud — IAM & secrets / Cost & environment control
  ('de-cloud', 2, 1, 'Service Accounts and Roles: Fundamentals', 'course', 'Google Cloud Skills Boost', 'https://www.skills.google/focuses/1038?parent=catalog'),
  ('de-cloud', 2, 2, 'Secret Manager — access control with IAM', 'documentation', 'Google Cloud', 'https://docs.cloud.google.com/secret-manager/docs/access-control'),
  ('de-cloud', 3, 1, 'Setting Up Cost Control with Quota', 'course', 'Google Cloud Skills Boost', 'https://www.skills.google/focuses/7847?locale=en&parent=catalog'),
  ('de-cloud', 3, 2, 'Create, edit, or delete budgets and budget alerts', 'documentation', 'Google Cloud', 'https://docs.cloud.google.com/billing/docs/how-to/budgets'),

  -- de-spark — Partitioning & shuffles / Performance tuning
  ('de-spark', 2, 1, 'DE Zoomcamp 5.4.2 — GroupBy in Spark', 'video', 'DataTalksClub', 'https://youtu.be/9qrDsY_2COo'),
  ('de-spark', 2, 2, 'Spark — Shuffle Behavior configuration', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/configuration.html#shuffle-behavior'),
  ('de-spark', 3, 1, 'Fine Tuning and Enhancing Performance of Apache Spark Jobs', 'video', 'Databricks', 'https://www.youtube.com/watch?v=WSplTjBKijU'),
  ('de-spark', 3, 2, 'Spark — Tuning Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/tuning.html'),

  -- de-streaming — Consumer groups / Delivery semantics
  ('de-streaming', 2, 1, 'Consumer Group Protocol: Scalability and Fault Tolerance', 'video', 'Confluent Developer', 'https://developer.confluent.io/courses/architecture/consumer-group-protocol/'),
  ('de-streaming', 2, 2, 'Kafka — Consumer design', 'documentation', 'Confluent', 'https://docs.confluent.io/kafka/design/consumer-design.html'),
  ('de-streaming', 3, 1, 'Transactions (Apache Kafka Internal Architecture)', 'video', 'Confluent Developer', 'https://developer.confluent.io/courses/architecture/transactions/'),
  ('de-streaming', 3, 2, 'Message Delivery Guarantees for Apache Kafka', 'documentation', 'Confluent', 'https://docs.confluent.io/kafka/design/delivery-semantics.html'),

  -- de-vectordb — Failure recovery / Technical documentation
  ('de-vectordb', 2, 1, 'Postmortem Culture at Google', 'video', 'Conf42 SRE 2022 (Ramon Medrano Llamas, Google)', 'https://www.youtube.com/watch?v=qgHWzQ2zcqQ'),
  ('de-vectordb', 2, 2, 'SRE Workbook — Incident Response', 'documentation', 'Google SRE', 'https://sre.google/workbook/incident-response/'),
  ('de-vectordb', 3, 1, 'Technical Writing One', 'course', 'Google for Developers', 'https://developers.google.com/tech-writing/one'),
  ('de-vectordb', 3, 2, 'Google developer documentation style guide', 'documentation', 'Google', 'https://developers.google.com/style')
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, t.id, c.resource_order, c.name, c.type, c.platform, c.url
from curated c
join public.nodes n on n.slug = c.node_slug
join public.topics t on t.node_id = n.id and t."order" = c.topic_order
where not exists (
  select 1 from public.resources existing where existing.topic_id = t.id and existing.url = c.url
);

commit;
