# Data Engineering Track — Curriculum Blueprint

**Status:** Mastery refresh implemented

**Last researched:** 25 August 2026
**Audience:** Learners who completed Stacc Foundations  
**Target outcome:** Build, test, orchestrate, and explain a production-shaped batch data platform, then add one streaming workload.

## The blunt assessment

The current track is a resource directory, not yet an end-to-end curriculum. A link to a long playlist, documentation homepage, or entire external course transfers the hard work back to the learner: deciding what matters, what order to follow, and when they know enough.

Stacc should curate at the **lesson level**, not the provider level. Every lesson unit should contain:

1. one exact resource or tightly bounded chapter;
2. a reason it is included;
3. a concrete learner output;
4. an estimated duration;
5. a checkpoint that tests the stated outcome.

Long external courses remain useful source libraries, but “complete this entire playlist” should not be a Stacc task.

## Changes recommended before implementation

- Add Docker and Terraform. They are assumed by modern DE courses and jobs but absent from the current track.
- Teach ingestion by building a repeatable pipeline, not through ETL vocabulary alone.
- Put warehousing and dimensional modeling before dbt.
- Keep one orchestration tool in the required path. Use Airflow because its concepts transfer broadly; list Kestra/Prefect as optional comparisons.
- Teach one cloud deeply enough to deploy. Use GCP/BigQuery for the main path because the selected end-to-end course uses it; provide an AWS equivalence map rather than teaching both halfway.
- Add data quality and observability to required work.
- Move Vector DBs & LLM Infra to AI Engineering. It is useful, but it displaces core DE competence here.
- End with a capstone that integrates ingestion, warehouse, dbt, orchestration, tests, and documentation.

## Proposed track

### Module 1 — Local data platform and ingestion

**Outcome:** Run PostgreSQL locally in containers and ingest a paginated API safely. Terraform is deliberately deferred until the cloud node.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [Docker: 45-minute workshop](https://docs.docker.com/get-started/workshop/) | A bounded official lab covering images, containers, volumes, multi-container applications, and Compose | 45m | PostgreSQL and the ingestion service running through Compose |
| 2 | [Docker Compose application model](https://docs.docker.com/compose/intro/compose-application-model/) | Precise reference for services, networks, volumes, configuration, and secrets | 25m | Annotated Compose configuration |
| 3 | [dlt: Cursor-based incremental loading](https://dlthub.com/docs/general-usage/incremental/cursor) | Focused reference for stateful incremental API ingestion | 35m | Incremental cursor with duplicate-safe reruns |

**Practice:** Containerize a Python ingestion script and PostgreSQL.  
**Checkpoint:** Explain volumes, networks, image layers, Terraform state, and why credentials stay outside source control.

### Module 2 — Batch ingestion that can be rerun

**Outcome:** Ingest paginated API data into PostgreSQL safely and incrementally.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [DE Zoomcamp 2026: Data Ingestion Workshop](https://github.com/DataTalksClub/data-engineering-zoomcamp/blob/main/cohorts/2026/workshops/dlt.md) | Covers API ingestion, normalization, schema validation, and warehouse loading through a real pipeline | 3h | Working API-to-database pipeline |
| 2 | [dlt: Incremental loading](https://dlthub.com/docs/general-usage/incremental-loading) | Focused reference for cursor-based loads and state | 35m | Incremental cursor implemented |
| 3 | [Great Expectations: Data quality concepts](https://docs.greatexpectations.io/docs/core/introduction/) | Introduces executable expectations at the ingestion boundary | 35m | Three source-data checks |

**Practice:** Run the same date range twice without duplicating rows; quarantine malformed records.  
**Checkpoint:** Distinguish full refresh, append, upsert, CDC, idempotency, and retry safety.

### Module 3 — Warehousing and dimensional modeling

**Outcome:** Turn operational data into an analytics-ready star schema.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [Kimball: Dimensional modeling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/) — read grain, facts, dimensions, surrogate keys, and slowly changing dimensions | Canonical vocabulary and design rules | 2h | Grain statement and bus matrix |
| 2 | [DE Zoomcamp: Data Warehousing](https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/03-data-warehouse) — complete BigQuery, partitioning, clustering, and best-practice lessons | Connects modeling decisions to a real warehouse | 3h | Partitioned warehouse tables |
| 3 | [BigQuery: Introduction to partitioned tables](https://cloud.google.com/bigquery/docs/partitioned-tables) | Authoritative reference for pruning, cost, and constraints | 30m | Partition choice with justification |

**Practice:** Model trips/orders into a fact table with conformed dimensions and one SCD Type 2 dimension.  
**Checkpoint:** Defend grain, keys, SCD choice, partition key, and clustering key.

### Module 4 — Analytics engineering with dbt

**Outcome:** Build tested, documented transformations with a dependable development workflow.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [DE Zoomcamp: Analytics Engineering](https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/04-analytics-engineering) — follow setup, models, tests, documentation, and deployment | Keeps dbt attached to the same warehouse and dataset | 4h | Staging and mart models |
| 2 | [dbt: How we structure our dbt projects](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview) — complete staging, intermediate, and marts sections | Strong conventions learners can apply immediately | 1h | Project reorganized by layer |
| 3 | [dbt: Data tests](https://docs.getdbt.com/docs/build/data-tests) | Exact reference for generic and singular tests | 30m | Key, relationship, and business-rule tests |

**Practice:** Produce one documented mart and generate dbt docs.  
**Checkpoint:** Explain `ref`, lineage, materializations, sources, tests, and development vs production targets.

### Module 5 — Workflow orchestration with Airflow

**Outcome:** Schedule, retry, backfill, and observe the batch pipeline.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [Airflow 101: Build your first workflow](https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html) | Official, bounded introduction to DAGs, tasks, dependencies, schedules, and retries | 1.5h | First scheduled DAG |
| 2 | [Airflow core concept: DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) | Clarifies DAG declaration, task assignment, and stable topology | 45m | Pipeline expressed as clear task boundaries |
| 3 | [Airflow scheduler](https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/scheduler.html) | Prevents the common misunderstanding of when scheduled runs execute | 30m | Correct data-interval explanation |
| 4 | [Airflow backfill](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html) | Required operational skill for recovering historical partitions | 30m | Safe seven-day backfill |

**Practice:** Orchestrate ingestion → quality checks → dbt build, with retries and a deliberate failure test.  
**Checkpoint:** Diagnose a failed run and explain logical dates, data intervals, catchup, retries, and idempotency.

### Module 6 — Cloud and infrastructure as code

**Outcome:** Provision and deploy the batch platform with Terraform, security, cost, and operations discipline.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [Google Cloud: Introduction to Data Engineering](https://cloud.google.com/learn/training/data-engineering-and-analytics) — take the named introductory course in the Data Engineer path | Official role-oriented overview of the platform | 3h | Service selection map |
| 2 | [Cloud Storage: Introduction](https://cloud.google.com/storage/docs/introduction) | Establishes object storage as a data-lake primitive | 30m | Raw/processed bucket layout |
| 3 | [IAM overview](https://cloud.google.com/iam/docs/overview) | Security cannot be an optional final note | 45m | Least-privilege service account |
| 4 | [BigQuery: Optimize query computation](https://cloud.google.com/bigquery/docs/best-practices-performance-compute) | Links query shape to performance and cost | 45m | Before/after query-cost comparison |

**Practice:** Deploy the warehouse and pipeline using separate identities for development and scheduled runs.  
**Checkpoint:** Explain IAM roles, service accounts, secrets, storage lifecycle, warehouse cost, and environment separation.

### Module 7 — Distributed batch processing with Spark

**Outcome:** Know when Spark is justified and write PySpark that avoids obvious shuffle and partition mistakes.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [DE Zoomcamp: Batch Processing](https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/06-batch) | A bounded application of Spark to the track dataset | 4h | PySpark batch job |
| 2 | [Spark SQL getting started](https://spark.apache.org/docs/latest/sql-getting-started.html) | Official DataFrame and SQL foundation | 1h | Typed transformations and aggregation |
| 3 | [Spark performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html) | Focuses the module on partitions, joins, caching, and adaptive execution | 1h | Explain-plan and tuning note |

**Practice:** Compare a local pandas implementation with Spark, inspect the plan, and remove one avoidable shuffle.  
**Checkpoint:** Explain lazy evaluation, narrow vs wide transformations, partitions, shuffles, skew, and broadcast joins.

### Module 8 — Streaming with Kafka

**Outcome:** Build and reason about a small event pipeline with correct ordering and recovery assumptions.

| Order | Exact learning unit | Why it earns a place | Time | Learner output |
|---|---|---|---:|---|
| 1 | [Confluent Apache Kafka 101](https://developer.confluent.io/courses/apache-kafka/events/) — complete all 16 short modules in order | Free, lesson-level course covering topics, partitions, brokers, replication, producers, consumers, and exercises | 2h | Producer and consumer pair |
| 2 | [Kafka consumers](https://developer.confluent.io/courses/apache-kafka/consumers/) | Focused explanation of offsets, groups, parallelism, and recovery | 20m | Consumer-group experiment |
| 3 | [DE Zoomcamp: Stream Processing](https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/07-streaming) | Applies the concepts in an end-to-end DE context | 4h | Stream transformation pipeline |

**Practice:** Process events with keys, multiple partitions, a consumer group, and replay from an earlier offset.  
**Checkpoint:** Explain ordering scope, offsets, rebalancing, at-most/at-least/exactly-once semantics, and the effect of partition count.

### Module 9 — Reliability and capstone

**Outcome:** Ship one coherent platform rather than eight disconnected exercises.

**Required capstone:**

1. ingest a public API incrementally;
2. store raw data and load a cloud warehouse;
3. model a star schema through dbt;
4. test freshness, keys, relationships, and one business rule;
5. orchestrate the workflow with retries and a documented backfill procedure;
6. publish architecture, setup, lineage, data dictionary, and operating notes;
7. include one dashboard or query pack that proves the data is usable.

**Evidence rubric:** reproducible setup, idempotent reruns, useful tests, clear lineage, least-privilege access, cost awareness, failure recovery, and documentation another learner can follow.

## What becomes optional

- **Vector databases:** move to AI Engineering after embeddings and RAG are introduced.
- **AWS equivalents:** provide a concise mapping (GCS → S3, BigQuery → Redshift/Athena, IAM concepts remain IAM) instead of a second half-built cloud curriculum.
- **Prefect and Kestra:** comparison material after Airflow, not additional required tools.
- **Advanced Kafka internals:** optional after Kafka 101; the [Confluent architecture course](https://developer.confluent.io/courses/architecture/get-started/) is strong but beyond the entry outcome.

## How this should map into Stacc

Do not store one resource row per module. Introduce lesson-level curriculum records with:

```text
module
  lesson group
    exact resource segment
    resource kind (video, article, docs, lab)
    duration
    required/optional
    learner output
    completion rule
```

For a playlist or multi-part course, each required video/lesson becomes its own item. The UI should show a sequence such as `Learn → Practise → Check → Ship`, with progress at lesson and module levels. Links should be reviewed quarterly for availability, version drift, paywalls, and whether a better official resource now exists.

## Source-selection standard

A resource is required only when it is:

- freely accessible without a trial or credit card;
- specific enough to assign precisely;
- maintained or still technically accurate;
- from an official project, original author, university, or demonstrably excellent practitioner;
- paired with an output or checkpoint;
- not duplicating another required resource.

Popularity alone is not quality. A famous eight-hour video that cannot be assigned in meaningful sections is less useful than four precise official lessons with a coherent lab.
