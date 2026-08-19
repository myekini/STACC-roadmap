-- Strengthen Data Engineering in place. Existing node, resource, and task IDs
-- are retained so learner progress, ratings, and evidence remain attached.

update public.nodes n set
  name = v.name, subtitle = v.subtitle, description = v.description,
  icon = v.icon, est_hours = v.est_hours, skills = v.skills
from (values
  ('de-etl','Reproducible Ingestion','Docker, APIs, and safe reruns','Containerise an API-to-PostgreSQL pipeline that validates inputs and can be rerun without duplicating data.','transform',10,array['Docker & environments','Incremental ingestion','Idempotency & quality']),
  ('de-modeling','Data Modeling','Dimensional modeling','Design an analytics-ready star schema with declared grain, dependable keys, and a justified history strategy.','schema',12,array['Grain & dimensional models','Keys & SCDs','Warehouse performance']),
  ('de-dbt','dbt','Data build tool','Build layered dbt transformations with tested sources, documented lineage, and separate development and production targets.','code_blocks',12,array['Layered dbt models','Tests & lineage','Environment discipline']),
  ('de-orchestration','Workflow Orchestration','Airflow operations','Schedule the platform as an observable Airflow DAG that retries safely, backfills correctly, and exposes failures.','published_with_changes',12,array['DAGs & data intervals','Retries & alerts','Safe backfills']),
  ('de-cloud','Cloud Platforms','AWS / GCP','Deploy the batch platform with least-privilege identities, separated environments, and documented storage and query costs.','deployed_code',14,array['Object storage & warehouse','IAM & secrets','Cost & environment control']),
  ('de-spark','Spark — Advanced','Distributed compute','Use PySpark for a justified large-data workload, inspect its execution plan, and remove avoidable shuffle or skew.','memory',16,array['PySpark','Partitioning & shuffles','Performance tuning']),
  ('de-streaming','Real-time Streaming','Kafka','Build a recoverable Kafka event flow and explain its ordering, replay, consumer-group, and delivery guarantees.','electric_bolt',16,array['Topics','Consumer groups','Delivery semantics']),
  ('de-vectordb','Reliability & Capstone','Operate the whole platform','Ship the cumulative data platform with quality gates, lineage, observability, recovery procedures, and documentation another engineer can use.','verified',16,array['Data observability','Failure recovery','Technical documentation'])
) as v(slug,name,subtitle,description,icon,est_hours,skills)
where n.slug = v.slug;

update public.resources r set
  name = v.new_name, type = v.new_type, platform = v.platform, url = v.url
from public.nodes n, (values
  ('de-etl','Data Engineering Zoomcamp — Lecture Playlist','DE Zoomcamp — Docker and Terraform','course','DataTalksClub','https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/01-docker-terraform'),
  ('de-etl','The Data Engineering Cookbook','dlt — incremental loading','documentation','dltHub','https://dlthub.com/docs/general-usage/incremental-loading'),
  ('de-modeling','Kimball Dimensional Modeling Resources','Kimball dimensional modelling techniques','documentation','Kimball Group','https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/'),
  ('de-modeling','dbt: How We Structure Our dbt Projects','BigQuery — partitioned tables','documentation','Google Cloud','https://cloud.google.com/bigquery/docs/partitioned-tables'),
  ('de-dbt','dbt Fundamentals Course','dbt — structure a project','documentation','dbt Labs','https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview'),
  ('de-dbt','Official dbt Docs','dbt data tests','documentation','dbt Labs','https://docs.getdbt.com/docs/build/data-tests'),
  ('de-orchestration','Astronomer Airflow Academy','Airflow — first workflow','documentation','Apache Airflow','https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html'),
  ('de-orchestration','Airflow Documentation: Core Concepts','Airflow — backfill','documentation','Apache Airflow','https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html'),
  ('de-cloud','AWS Skill Builder: Data Analytics','Google Cloud IAM overview','documentation','Google Cloud','https://cloud.google.com/iam/docs/overview'),
  ('de-cloud','Google Cloud Architecture Center','BigQuery — optimise query computation','documentation','Google Cloud','https://cloud.google.com/bigquery/docs/best-practices-performance-compute'),
  ('de-spark','Spark SQL Programming Guide','Spark SQL getting started','documentation','Apache Spark','https://spark.apache.org/docs/latest/sql-getting-started.html'),
  ('de-spark','Spark Tuning Guide','Spark SQL performance tuning','documentation','Apache Spark','https://spark.apache.org/docs/latest/sql-performance-tuning.html'),
  ('de-streaming','Kafka 101','Apache Kafka 101','course','Confluent Developer','https://developer.confluent.io/courses/apache-kafka/events/'),
  ('de-streaming','Apache Kafka Documentation','Kafka consumers','course','Confluent Developer','https://developer.confluent.io/courses/apache-kafka/consumers/'),
  ('de-vectordb','Vector Databases Explained','OpenLineage — getting started','documentation','OpenLineage','https://openlineage.io/docs/guides/'),
  ('de-vectordb','Faiss Wiki','Great Expectations — introduction','documentation','Great Expectations','https://docs.greatexpectations.io/docs/core/introduction/')
) as v(slug,old_name,new_name,new_type,platform,url)
where r.node_id = n.id and n.slug = v.slug and r.name = v.old_name;

update public.tasks t set description = v.description, type = v.task_type
from public.nodes n, (values
  ('de-etl',1,'Learn: complete the Docker, PostgreSQL and Terraform sections, then study cursor-based incremental loading','read'),
  ('de-etl',2,'Build: add a containerised API-to-PostgreSQL pipeline with configuration outside source control, pagination, schema checks, an incremental cursor, duplicate-safe reruns and a documented local setup','build'),
  ('de-modeling',1,'Learn: study grain, facts, dimensions, surrogate keys, SCDs, partitioning and clustering','read'),
  ('de-modeling',2,'Build: add a grain statement, bus matrix, fact table, conformed dimensions, one SCD Type 2 dimension and a partition choice with cost/query justification','build'),
  ('de-dbt',1,'Learn: complete the staging, intermediate, marts and data-tests guidance','read'),
  ('de-dbt',2,'Build: add sources, staging/intermediate/mart layers, key and relationship tests, one business-rule test, generated docs and separate development/production targets','build'),
  ('de-orchestration',1,'Learn: complete the Airflow fundamentals tutorial and backfill guide','read'),
  ('de-orchestration',2,'Build: orchestrate ingestion, validation and dbt as separate tasks with retries, failure notification, a deliberate failure test and a documented seven-day backfill procedure','build'),
  ('de-cloud',1,'Learn: study IAM identities/policies and BigQuery computation-cost guidance','read'),
  ('de-cloud',2,'Build: deploy the platform with raw/processed storage zones, separate developer and scheduler identities, secrets outside code, least-privilege roles and a before/after query-cost comparison','build'),
  ('de-spark',1,'Learn: complete Spark SQL getting started and the partitioning, join and adaptive-execution tuning sections','read'),
  ('de-spark',2,'Build: add a PySpark batch job, compare it with a local baseline, capture the explain plan, demonstrate partition choices and remove one measured shuffle or skew problem','build'),
  ('de-streaming',1,'Learn: complete Kafka 101 and the consumers lesson','read'),
  ('de-streaming',2,'Build: add keyed events, multiple partitions and a consumer group, then demonstrate replay from an earlier offset and document ordering scope, rebalancing and chosen delivery semantics','build'),
  ('de-vectordb',1,'Learn: study lineage events and executable data-quality expectations','read'),
  ('de-vectordb',2,'Build: finish the cumulative platform with freshness/key/business-rule checks, lineage, architecture diagram, data dictionary, setup guide, cost note, failure alert, backfill runbook and one dashboard or query pack proving the data is usable','build')
) as v(slug,task_order,description,task_type)
where t.node_id = n.id and n.slug = v.slug and t."order" = v.task_order;
