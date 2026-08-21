-- Stacc Roadmap Tracker — content seed (docs/PRODUCT.md §5)
-- Foundations gate every path; AI-Engineering and MLOps additionally require DE + DS complete.
-- Mirrors src/config/roadmap.ts exactly — keep both in lockstep on every content change.

begin;

-- ── Paths ──────────────────────────────────────────────────
insert into public.paths (id, title, description, icon, tags, "order", requires_paths) values
  ('foundations', 'Foundations', 'The baseline every data role requires. Complete this before branching into a specialization.', 'terminal', '{Python,SQL,Git,Statistics,AI Literacy}', 0, '{}'),
  ('de', 'Data Engineering', 'Build the infrastructure. Design robust pipelines, manage massive datasets, and ensure data quality and accessibility.', 'database', '{ETL,dbt,Airflow,Cloud,Spark,Kafka}', 1, '{}'),
  ('da', 'Data Analysis', 'Turn messy data into decisions. Master exploration, visualization, dashboards, and data storytelling.', 'bar_chart', '{EDA,Visualization,BI Tools,Storytelling}', 2, '{}'),
  ('ds', 'Data Science', 'Model, test, and explain predictions. From ML fundamentals through deployment and LLM fine-tuning.', 'model_training', '{ML,Experimentation,Deployment,Deep Learning}', 3, '{}'),
  ('ai-engineering', 'AI Engineering', 'Build useful AI products. LLM orchestration, RAG systems, agents, and production AI architecture.', 'smart_toy', '{LLM APIs,RAG,Agents,LLMOps}', 4, '{de,ds}'),
  ('mlops', 'MLOps', 'Ship and run models in production. Containers, CI/CD for ML, monitoring, and platform design.', 'settings_suggest', '{Docker,CI/CD,Monitoring,Platforms}', 5, '{de,ds}');

-- ── Nodes ──────────────────────────────────────────────────
insert into public.nodes (slug, path_id, name, subtitle, description, icon, "order", est_hours, xp_reward, skills) values
  -- FOUNDATIONS (§1.5: required before any path)
  ('found-python',   'foundations', 'Python Basics', 'Variables to pandas', 'Write a readable Python program that loads, validates, cleans, and exports a tabular dataset.', 'code', 1, 12, 100, '{Functions & errors,Pandas transformations,Data validation}'),
  ('found-sql',      'foundations', 'SQL Basics', 'Query like you mean it', 'Answer business questions with correct joins, aggregations, CTEs, and window functions, then validate the result.', 'database', 2, 10, 100, '{Joins & CTEs,Aggregation & windows,Query validation}'),
  ('found-git',      'foundations', 'Git & GitHub', 'Version everything', 'Create a focused branch, review its changes, resolve a conflict, and merge it through a clear pull request.', 'account_tree', 3, 6, 75, '{Focused commits,Pull-request review,Conflict recovery}'),
  ('found-cli',      'foundations', 'Command Line', 'Live in the terminal', 'Inspect files and processes, combine commands with pipes, and automate a repeatable file-processing task safely.', 'terminal', 4, 5, 75, '{Pipes & redirection,Processes & permissions,Safe shell scripts}'),
  ('found-stats',    'foundations', 'Statistics Basics', 'Think in distributions', 'Describe uncertainty in a dataset, choose an appropriate comparison, and communicate what the evidence cannot prove.', 'insights', 5, 10, 100, '{Sampling & uncertainty,Effect size & testing,Causal limits}'),
  ('found-ai',       'foundations', 'AI Literacy', 'Work with the machines', 'Use an AI assistant on a bounded data task while protecting sensitive data, testing its output, and documenting its contribution.', 'auto_awesome', 6, 6, 75, '{Model limitations,Output verification,Safe AI-assisted work}'),

  -- DATA ENGINEERING
  ('de-etl','de','Reproducible Ingestion','Docker, APIs, and safe reruns','Containerise an API-to-PostgreSQL pipeline that validates inputs and can be rerun without duplicating data.','transform',1,10,150,'{Docker & environments,Incremental ingestion,Idempotency & quality}'),
  ('de-modeling','de','Data Modeling','Dimensional modeling','Design an analytics-ready star schema with declared grain, dependable keys, and a justified history strategy.','schema',2,12,150,'{Grain & dimensional models,Keys & SCDs,Warehouse performance}'),
  ('de-dbt','de','dbt','Data build tool','Build layered dbt transformations with tested sources, documented lineage, and separate development and production targets.','code_blocks',3,12,200,'{Layered dbt models,Tests & lineage,Environment discipline}'),
  ('de-orchestration','de','Workflow Orchestration','Airflow operations','Schedule the platform as an observable Airflow DAG that retries safely, backfills correctly, and exposes failures.','published_with_changes',4,12,200,'{DAGs & data intervals,Retries & alerts,Safe backfills}'),
  ('de-cloud','de','Cloud Platforms','AWS / GCP','Deploy the batch platform with least-privilege identities, separated environments, and documented storage and query costs.','deployed_code',5,14,200,'{Object storage & warehouse,IAM & secrets,Cost & environment control}'),
  ('de-spark','de','Spark — Advanced','Distributed compute','Use PySpark for a justified large-data workload, inspect its execution plan, and remove avoidable shuffle or skew.','memory',6,16,250,'{PySpark,Partitioning & shuffles,Performance tuning}'),
  ('de-streaming','de','Real-time Streaming','Kafka','Build a recoverable Kafka event flow and explain its ordering, replay, consumer-group, and delivery guarantees.','electric_bolt',7,16,250,'{Topics,Consumer groups,Delivery semantics}'),
  ('de-vectordb','de','Reliability & Capstone','Operate the whole platform','Ship the cumulative data platform with quality gates, lineage, observability, recovery procedures, and documentation another engineer can use.','verified',8,16,250,'{Data observability,Failure recovery,Technical documentation}'),

  -- DATA ANALYSIS
  ('da-eda',           'da', 'Exploratory Data Analysis', 'Interrogate the data', 'Translate a stakeholder question into defined metrics, profile the data, and produce a reproducible analysis plan.', 'find_in_page', 1, 10, 150, '{Question & metric framing,Data profiling,Analysis planning}'),
  ('da-visualization', 'da', 'Data Visualization', 'Matplotlib, Seaborn', 'Choose honest visual encodings and produce accessible charts that make the comparison and uncertainty clear.', 'bar_chart', 2, 10, 150, '{Chart selection,Honest encoding,Accessible visualisation}'),
  ('da-dashboards',    'da', 'Dashboard Design', 'Interfaces for decisions', 'Build a focused dashboard that answers three defined questions on desktop and mobile without hiding context or accessibility.', 'dashboard', 3, 10, 150, '{Decision-led layout,KPI definitions,Accessible interaction}'),
  ('da-storytelling',  'da', 'Data Storytelling', 'Insight to action', 'Turn analysis into a concise recommendation that separates evidence, uncertainty, limitations, and the decision required.', 'edit_note', 4, 8, 150, '{Executive synthesis,Evidence & uncertainty,Recommendation delivery}'),
  ('da-bi',            'da', 'BI Tools', 'Looker, Power BI, Metabase', 'Prepare data with Power Query, model facts and dimensions, write dependable DAX measures, and publish a governed report.', 'query_stats', 5, 12, 200, '{Power Query,Semantic models & DAX,Security & refresh}'),
  ('da-ai-analysis',   'da', 'AI-Assisted Analysis', 'Analyst + LLM', 'Use AI to accelerate an analysis while preserving reproducibility, privacy, source traceability, and human accountability.', 'auto_awesome', 6, 8, 200, '{AI-assisted workflow,Claim verification,Audit trail}'),

  -- DATA SCIENCE
  ('ds-ml','ds','ML Fundamentals','Supervised learning core','Frame a prediction problem, define its target and cost of error, and build a reproducible baseline before tuning models.','model_training',1,14,200,'{Problem & target framing,Baselines,Reproducible pipelines}'),
  ('ds-features','ds','Feature Engineering','Signal from raw data','Create leakage-safe feature transformations and prove that each retained feature improves a cross-validated baseline.','settings_input_component',2,10,150,'{Encodings & scaling,Leakage traps,Feature selection}'),
  ('ds-evaluation','ds','Model Building & Evaluation','Beyond accuracy','Evaluate errors with business-aligned metrics, calibration, subgroup analysis, and an untouched final test set.','verified',3,12,200,'{Metrics & thresholds,Calibration,Error & subgroup analysis}'),
  ('ds-experiments','ds','Experimentation & A/B Testing','Causal by design','Design a powered experiment with a decision rule, guardrail metrics, validity checks, and an honest interpretation of uncertainty.','biotech',4,12,200,'{Experiment design,Power & effect size,Validity & decision rules}'),
  ('ds-deployment','ds','Model Deployment','Models as services','Package the chosen model behind a tested API with versioned artifacts, input validation, latency measurement, and rollback instructions.','publish',5,12,200,'{Validated inference API,Artifact versioning,Latency & rollback}'),
  ('ds-deeplearning','ds','Deep Learning — Advanced','Neural networks','Fine-tune a pretrained neural network only when it beats the simpler baseline enough to justify its added cost and risk.','psychology',6,18,250,'{Transfer learning,Training discipline,Complexity trade-offs}'),
  ('ds-llm','ds','Responsible Production Capstone','From model to decision system','Ship the cumulative project with reproducible training, a model card, monitored inference, responsible-use checks, and a stakeholder decision memo.','verified',7,16,250,'{Model documentation,Monitoring contract,Responsible release}'),

  -- AI ENGINEERING (unlocks after DE + DS)
  ('ai-llm-apis',      'ai-engineering', 'LLM APIs & Orchestration', 'OpenAI, Anthropic, Gemini', 'Structured outputs, tool use, streaming, and orchestrating multi-step LLM calls.', 'smart_toy', 1, 12, 250, '{Tool use,Structured outputs,Streaming responses}'),
  ('ai-rag',           'ai-engineering', 'RAG System Design', 'Retrieval done right', 'Chunking, hybrid search, reranking, and grounding answers in your own data.', 'find_in_page', 2, 14, 250, '{Chunking strategies,Hybrid search,Reranking}'),
  ('ai-agents',        'ai-engineering', 'AI Agents & Tool Use', 'Systems that act', 'Agent loops, tool design, guardrails, and when not to build an agent.', 'smart_toy', 3, 14, 250, '{Agent loops,Tool design,Guardrails}'),
  ('ai-multimodal',    'ai-engineering', 'Multimodal Systems', 'Beyond text', 'Vision, audio, and document understanding in production workflows.', 'smart_display', 4, 12, 250, '{Vision,Audio,Document AI}'),
  ('ai-llmops',        'ai-engineering', 'LLMOps & Evaluation', 'Measure or guess', 'Eval suites, regression testing prompts, observability, and cost control.', 'analytics', 5, 12, 250, '{Eval suites,Prompt regression,Cost & observability}'),
  ('ai-product',       'ai-engineering', 'AI Product Design', 'Architecture end-to-end', 'Design a full AI product: latency budgets, fallbacks, UX for uncertainty.', 'explore', 6, 14, 300, '{Latency budgets,Fallback design,UX for uncertainty}'),

  -- MLOPS (unlocks after DE + DS)
  ('ml-docker',        'mlops', 'Docker & Containerization', 'Reproducible everything', 'Images, layers, and packaging ML workloads that run the same everywhere.', 'deployed_code', 1, 10, 200, '{Dockerfiles & layers,Compose,Registries}'),
  ('ml-cicd',          'mlops', 'CI/CD for ML', 'Automate the path to prod', 'Pipelines that test data, code, and models before anything ships.', 'published_with_changes', 2, 12, 200, '{GitHub Actions,Model & data tests,Artifacts}'),
  ('ml-monitoring',    'mlops', 'Monitoring & Drift', 'Know when models rot', 'Data drift, concept drift, and alerting on the metrics that predict failure.', 'analytics', 3, 12, 250, '{Data drift,Concept drift,Alerting}'),
  ('ml-production',    'mlops', 'Production ML Systems', 'Serving at scale', 'Batch vs online serving, feature stores, and latency/throughput tradeoffs.', 'memory', 4, 14, 250, '{Serving patterns,Feature stores,Scaling & caching}'),
  ('ml-platform',      'mlops', 'ML Platform Design', 'End-to-end ownership', 'Design the platform: from experiment tracking to deployment paths for a whole team.', 'schema', 5, 16, 300, '{Experiment tracking,Model registries,Platform architecture}');

-- ── Prerequisites ──────────────────────────────────────────
-- Foundations is sequential-ish: python/sql/git/cli independent, stats after python, ai after python.
-- Each specialization's first node requires ALL Foundations nodes (§1.5: required before any path).
with n as (select slug, id from public.nodes)
insert into public.node_prerequisites (node_id, prerequisite_id)
select child.id, parent.id
from (values
  -- foundations internal
  ('found-stats', 'found-python'),
  ('found-ai',    'found-python'),
  -- path entry nodes require all foundations
  ('de-etl', 'found-python'), ('de-etl', 'found-sql'), ('de-etl', 'found-git'), ('de-etl', 'found-cli'), ('de-etl', 'found-stats'), ('de-etl', 'found-ai'),
  ('da-eda', 'found-python'), ('da-eda', 'found-sql'), ('da-eda', 'found-git'), ('da-eda', 'found-cli'), ('da-eda', 'found-stats'), ('da-eda', 'found-ai'),
  ('ds-ml',  'found-python'), ('ds-ml',  'found-sql'), ('ds-ml',  'found-git'), ('ds-ml',  'found-cli'), ('ds-ml',  'found-stats'), ('ds-ml',  'found-ai'),
  -- DE chain
  ('de-modeling', 'de-etl'), ('de-dbt', 'de-modeling'), ('de-orchestration', 'de-dbt'),
  ('de-cloud', 'de-orchestration'), ('de-spark', 'de-cloud'), ('de-streaming', 'de-spark'), ('de-vectordb', 'de-streaming'),
  -- DA chain
  ('da-visualization', 'da-eda'), ('da-dashboards', 'da-visualization'), ('da-storytelling', 'da-dashboards'),
  ('da-bi', 'da-storytelling'), ('da-ai-analysis', 'da-bi'),
  -- DS chain
  ('ds-features', 'ds-ml'), ('ds-evaluation', 'ds-features'), ('ds-experiments', 'ds-evaluation'),
  ('ds-deployment', 'ds-experiments'), ('ds-deeplearning', 'ds-deployment'), ('ds-llm', 'ds-deeplearning'),
  -- AI-Eng chain (path-level DE+DS gate comes from paths.requires_paths)
  ('ai-rag', 'ai-llm-apis'), ('ai-agents', 'ai-rag'), ('ai-multimodal', 'ai-agents'),
  ('ai-llmops', 'ai-multimodal'), ('ai-product', 'ai-llmops'),
  -- MLOps chain
  ('ml-cicd', 'ml-docker'), ('ml-monitoring', 'ml-cicd'), ('ml-production', 'ml-monitoring'), ('ml-platform', 'ml-production')
) as edges(child_slug, parent_slug)
join n as child on child.slug = edges.child_slug
join n as parent on parent.slug = edges.parent_slug;

-- ── Topics ─────────────────────────────────────────────────
-- Migrations create topics for existing nodes, but a fresh reset runs the
-- migrations before this seed. Create the three authored topics per node here
-- so the required resources.topic_id can always be populated.
insert into public.topics (node_id, title, "order")
select n.id, s.skill, s.ordinality
from public.nodes n, unnest(n.skills) with ordinality as s(skill, ordinality);

-- ── Resources ──────────────────────────────────────────────
with n as (select slug, id from public.nodes),
resource_rows as (
  select values_list.*, row_number() over () as source_order
  from (values
  ('found-python', 'Python Tutorial — sections 3–5', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/introduction.html'),
  ('found-python', '10 minutes to pandas', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/10min.html'),
  ('found-sql', 'SQLBolt — lessons 1–18', 'course', 'SQLBolt', 'https://sqlbolt.com/'),
  ('found-sql', 'PostgreSQL Window Functions Tutorial', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/tutorial-window.html'),
  ('found-git', 'Pro Git — Git Basics and Branching', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'),
  ('found-git', 'Review pull requests', 'course', 'GitHub Skills', 'https://github.com/skills/review-pull-requests'),
  ('found-cli', 'The Missing Semester — The Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2020/course-shell/'),
  ('found-cli', 'The Linux command line for beginners', 'article', 'Ubuntu', 'https://ubuntu.com/tutorials/command-line-for-beginners'),
  ('found-stats', 'Seeing Theory — distributions and inference', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'),
  ('found-stats', 'OpenIntro Statistics — chapters 2, 4 and 5', 'documentation', 'OpenIntro', 'https://www.openintro.org/book/os/'),
  ('found-ai', 'Intro to Large Language Models', 'video', 'YouTube (Andrej Karpathy)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'),
  ('found-ai', 'OWASP Top 10 for LLM Applications — prompt injection', 'documentation', 'OWASP', 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'),

  ('de-etl','DE Zoomcamp — Docker and Terraform','course','DataTalksClub','https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/01-docker-terraform'),
  ('de-etl','dlt — incremental loading','documentation','dltHub','https://dlthub.com/docs/general-usage/incremental-loading'),
  ('de-modeling','Kimball dimensional modelling techniques','documentation','Kimball Group','https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/'),
  ('de-modeling','BigQuery — partitioned tables','documentation','Google Cloud','https://cloud.google.com/bigquery/docs/partitioned-tables'),
  ('de-dbt','dbt — structure a project','documentation','dbt Labs','https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview'),
  ('de-dbt','dbt data tests','documentation','dbt Labs','https://docs.getdbt.com/docs/build/data-tests'),
  ('de-orchestration','Airflow — first workflow','documentation','Apache Airflow','https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html'),
  ('de-orchestration','Airflow — backfill','documentation','Apache Airflow','https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html'),
  ('de-cloud','Google Cloud IAM overview','documentation','Google Cloud','https://cloud.google.com/iam/docs/overview'),
  ('de-cloud','BigQuery — optimise query computation','documentation','Google Cloud','https://cloud.google.com/bigquery/docs/best-practices-performance-compute'),
  ('de-spark','Spark SQL getting started','documentation','Apache Spark','https://spark.apache.org/docs/latest/sql-getting-started.html'),
  ('de-spark','Spark SQL performance tuning','documentation','Apache Spark','https://spark.apache.org/docs/latest/sql-performance-tuning.html'),
  ('de-streaming','Apache Kafka 101','course','Confluent Developer','https://developer.confluent.io/courses/apache-kafka/events/'),
  ('de-streaming','Kafka consumers','course','Confluent Developer','https://developer.confluent.io/courses/apache-kafka/consumers/'),
  ('de-vectordb','OpenLineage — getting started','documentation','OpenLineage','https://openlineage.io/docs/guides/'),
  ('de-vectordb','Great Expectations — introduction','documentation','Great Expectations','https://docs.greatexpectations.io/docs/core/introduction/'),

  ('da-eda', 'Pandas — working with missing data', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/missing_data.html'),
  ('da-eda', 'The Aqua Book — analysis design, quality and uncertainty (chapters 6–8)', 'documentation', 'UK Government', 'https://www.gov.uk/guidance/the-aqua-book'),
  ('da-visualization', 'Matplotlib — the lifecycle of a plot', 'documentation', 'Matplotlib', 'https://matplotlib.org/stable/tutorials/lifecycle.html'),
  ('da-visualization', 'Accessible data visualisation guidance', 'article', 'UK Analysis Function', 'https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/'),
  ('da-dashboards', 'Power BI report design tips', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips'),
  ('da-storytelling', 'Storytelling with Data exercises', 'article', 'Storytelling with Data', 'https://community.storytellingwithdata.com/exercises'),
  ('da-storytelling', 'Communicating quality, uncertainty and change', 'documentation', 'UK Analysis Function', 'https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/'),
  ('da-bi', 'PL-300 Data Analyst study guide', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300'),
  ('da-bi', 'Learn DAX basics in Power BI Desktop', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics'),
  ('da-ai-analysis', 'NIST AI RMF Generative AI Profile', 'documentation', 'NIST', 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence'),
  ('da-ai-analysis', 'Generative AI Framework for government', 'documentation', 'UK Government', 'https://www.gov.uk/government/publications/generative-ai-framework-for-hmg/generative-ai-framework-for-hmg-html'),

  ('ds-ml','Machine Learning Crash Course — linear and logistic regression','course','Google for Developers','https://developers.google.com/machine-learning/crash-course'),
  ('ds-ml','scikit-learn — pipelines and composite estimators','documentation','scikit-learn','https://scikit-learn.org/stable/modules/compose.html'),
  ('ds-features','scikit-learn — preprocessing data','documentation','scikit-learn','https://scikit-learn.org/stable/modules/preprocessing.html'),
  ('ds-features','scikit-learn — common pitfalls and recommended practices','documentation','scikit-learn','https://scikit-learn.org/stable/common_pitfalls.html'),
  ('ds-evaluation','scikit-learn — model evaluation','documentation','scikit-learn','https://scikit-learn.org/stable/modules/model_evaluation.html'),
  ('ds-evaluation','scikit-learn — probability calibration','documentation','scikit-learn','https://scikit-learn.org/stable/modules/calibration.html'),
  ('ds-experiments','Online controlled experiments — key concepts','article','Microsoft Research','https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/'),
  ('ds-experiments','statsmodels — power and sample size','documentation','statsmodels','https://www.statsmodels.org/stable/stats.html#power-and-sample-size-calculations'),
  ('ds-deployment','FastAPI — first steps','documentation','FastAPI','https://fastapi.tiangolo.com/tutorial/first-steps/'),
  ('ds-deployment','MLflow Model Registry','documentation','MLflow','https://mlflow.org/docs/latest/ml/model-registry/'),
  ('ds-deeplearning','Practical Deep Learning — lessons 1–3','course','fast.ai','https://course.fast.ai/'),
  ('ds-deeplearning','PyTorch transfer learning tutorial','documentation','PyTorch','https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html'),
  ('ds-llm','Production ML systems','course','Google for Developers','https://developers.google.com/machine-learning/crash-course/production-ml-systems'),
  ('ds-llm','Model Card Toolkit','documentation','Google Research','https://github.com/tensorflow/model-card-toolkit'),

  ('ai-llm-apis', 'Anthropic API Docs', 'documentation', 'Anthropic', 'https://docs.anthropic.com/'),
  ('ai-llm-apis', 'OpenAI: Function Calling Guide', 'documentation', 'OpenAI', 'https://platform.openai.com/docs/guides/function-calling'),
  ('ai-rag', 'Retrieval-Augmented Generation Guide', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/retrieval-augmented-generation/'),
  ('ai-rag', 'LangChain: RAG Tutorial', 'documentation', 'LangChain', 'https://python.langchain.com/docs/tutorials/rag/'),
  ('ai-agents', 'Building Effective Agents', 'article', 'Anthropic', 'https://www.anthropic.com/research/building-effective-agents'),
  ('ai-agents', 'Anthropic Cookbook', 'documentation', 'Anthropic', 'https://github.com/anthropics/anthropic-cookbook'),
  ('ai-multimodal', 'Vision API Cookbooks', 'documentation', 'Anthropic', 'https://docs.anthropic.com/en/docs/build-with-claude/vision'),
  ('ai-multimodal', 'OpenAI Cookbook', 'documentation', 'OpenAI', 'https://github.com/openai/openai-cookbook'),
  ('ai-llmops', 'Your Guide to LLM Evals', 'article', 'Eugene Yan', 'https://eugeneyan.com/writing/llm-evaluators/'),
  ('ai-llmops', 'OpenAI Evals', 'documentation', 'OpenAI', 'https://github.com/openai/evals'),
  ('ai-product', 'AI Engineering (book notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/blog/'),
  ('ai-product', 'Patterns for Building LLM-based Systems & Products', 'article', 'Eugene Yan', 'https://eugeneyan.com/writing/llm-patterns/'),

  ('ml-docker', 'Docker Getting Started', 'documentation', 'Docker', 'https://docs.docker.com/get-started/'),
  ('ml-docker', 'Docker Compose Documentation', 'documentation', 'Docker', 'https://docs.docker.com/compose/'),
  ('ml-cicd', 'GitHub Actions Docs', 'documentation', 'GitHub', 'https://docs.github.com/en/actions'),
  ('ml-cicd', 'Made With ML', 'course', 'Made With ML', 'https://madewithml.com/'),
  ('ml-monitoring', 'Evidently AI: ML Monitoring Guides', 'article', 'Evidently', 'https://www.evidentlyai.com/ml-in-production/model-monitoring'),
  ('ml-monitoring', 'Evidently AI Documentation', 'documentation', 'Evidently', 'https://docs.evidentlyai.com/'),
  ('ml-production', 'Designing Machine Learning Systems (notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/machine-learning-systems-design/toc.html'),
  ('ml-production', 'Feast Documentation', 'documentation', 'Feast', 'https://docs.feast.dev/'),
  ('ml-platform', 'MLOps Zoomcamp — platform capstone', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/mlops-zoomcamp/tree/main/07-project'),
  ('ml-platform', 'MLflow Documentation', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/index.html')
) as values_list(node_slug, name, type, platform, url)
),
ranked_resources as (
  select resource_rows.*,
    row_number() over (partition by node_slug order by source_order)::integer as resource_order
  from resource_rows
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, first_topic.id, r.resource_order, r.name, r.type, r.platform, r.url
from ranked_resources r
join n on n.slug = r.node_slug
join lateral (
  select t.id from public.topics t
  where t.node_id = n.id
  order by t."order"
  limit 1
) first_topic on true;

-- Topic-specific material fills only verified gaps. SQL query validation is
-- deliberately enforced by SQLBolt plus Stacc's executable checkpoint rather
-- than a duplicated or lower-quality format-filler resource.
with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  ('found-python', 3, 1, 'Validate pandas data with Pandera', 'video', 'ArjanCodes', 'https://www.youtube.com/watch?v=-tU7fuUiq7w'),
  ('found-python', 3, 2, 'Pandera DataFrame schemas', 'documentation', 'Pandera', 'https://pandera.readthedocs.io/en/stable/dataframe_schemas.html'),
  ('da-dashboards', 3, 1, 'Design effective reports in Power BI — first 3 modules', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/power-bi-effective/'),
  ('da-dashboards', 3, 2, 'Design Power BI reports for accessibility', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports'),
  ('da-bi', 3, 1, 'Manage and secure Power BI — semantic models and data access', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/manage-secure-power-bi/'),
  ('da-bi', 3, 2, 'Configure scheduled refresh', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-scheduled-refresh')
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, t.id, c.resource_order, c.name, c.type, c.platform, c.url
from curated c
join public.nodes n on n.slug = c.node_slug
join public.topics t on t.node_id = n.id and t."order" = c.topic_order;

-- The analysis-planning reference belongs to the third EDA topic, not the
-- missing-data topic where legacy resources were initially grouped.
update public.resources r
set topic_id = t.id, "order" = 1
from public.nodes n
join public.topics t on t.node_id = n.id and t."order" = 3
where n.slug = 'da-eda'
  and r.node_id = n.id
  and r.url = 'https://www.gov.uk/guidance/the-aqua-book';

-- ── Tasks ──────────────────────────────────────────────────
-- Every node gets a study task, a build task, and a checkpoint (quiz or, where
-- the topic is genuinely testable in-browser, a challenge). Node completes
-- when all its tasks are done (complete_task RPC), which awards the node's XP.
with n as (select slug, id from public.nodes)
insert into public.tasks (node_id, description, type, "order", quiz, challenge)
select n.id, t.description, t.type, t."order", t.quiz::jsonb, t.challenge::jsonb
from (values
  ('found-python', 'Learn: complete Python Tutorial sections 3–5 and reproduce the examples locally', 'read', 1, null, null),
  ('found-python', 'Build: create clean_data.py that validates required columns, handles missing values and duplicates, exports a tidy CSV, and documents how to run it', 'build', 2, null, null),
  ('found-python', 'Checkpoint challenge: clean_scores(values)', 'challenge', 3, null, '{"language":"python","prompt":"Write clean_scores(values): drop every None entry and duplicate value, then return what remains sorted ascending. This exact shape — strip the junk, dedupe, sort — is what you do to real data constantly.","starterCode":"def clean_scores(values):\n    \"\"\"Remove None entries and duplicates, then return the list sorted ascending.\"\"\"\n    # your code here\n    pass\n","testCode":"assert clean_scores([3, 1, None, 2, 3, None, 1]) == [1, 2, 3]\nassert clean_scores([]) == []\nassert clean_scores([5, 5, 5]) == [5]\nassert clean_scores([None, None]) == []\nassert clean_scores([-1, 0, None, -1, 2]) == [-1, 0, 2]\n"}'),
  ('found-sql', 'Learn: complete SQLBolt lessons 1–18 and the PostgreSQL window-functions tutorial', 'read', 1, null, null),
  ('found-sql', 'Build: submit five labelled business queries using joins, aggregation, a CTE and a window function, with row-count or total checks for every answer', 'build', 2, null, null),
  ('found-sql', 'Checkpoint challenge: paying customers over $50', 'challenge', 3, null, '{"language":"sql","prompt":"Table orders(id, customer, amount, status). Write a query that returns each customer''s total spend from status = ''paid'' orders only, as columns customer and total — only customers with total > 50, ordered by total descending.","starterCode":"-- orders(id, customer, amount, status)\n-- customer, total (sum of paid amounts) where total > 50, ordered by total desc\nSELECT\n","setupSql":"CREATE TABLE orders (id INTEGER, customer TEXT, amount REAL, status TEXT);\nINSERT INTO orders VALUES\n  (1, ''Ada'', 120.0, ''paid''),\n  (2, ''Grace'', 45.5, ''paid''),\n  (3, ''Ada'', 60.0, ''refunded''),\n  (4, ''Linus'', 200.0, ''paid''),\n  (5, ''Grace'', 15.0, ''paid''),\n  (6, ''Zoe'', 10.0, ''paid'');","expectedRows":[{"customer":"Linus","total":200},{"customer":"Ada","total":120},{"customer":"Grace","total":60.5}]}'),
  ('found-git', 'Learn: read Pro Git chapters 2–3 and complete GitHub Skills: Review pull requests', 'read', 1, null, null),
  ('found-git', 'Build: create a branch with focused commits, open a pull request that explains the change and test evidence, resolve one deliberate conflict, and merge it', 'build', 2, null, null),
  ('found-git', 'Checkpoint quiz', 'quiz', 3, '{"question":"What does git rebase do compared to merge?","options":["Deletes the branch","Replays commits onto a new base for linear history","Creates a merge commit","Pushes to remote"],"correctIndex":1,"explanation":"Rebase replays your commits on top of another base commit, producing a linear history; merge preserves both histories with a merge commit."}', null),
  ('found-cli', 'Learn: complete The Missing Semester shell lecture and Ubuntu tutorial sections 1–6', 'watch', 1, null, null),
  ('found-cli', 'Build: write an idempotent shell script that validates its input directory, organises files by extension, logs its actions, and handles spaces in filenames', 'build', 2, null, null),
  ('found-cli', 'Checkpoint quiz', 'quiz', 3, '{"question":"Which operator sends the output of one command into another?","options":[">",">>","|","&"],"correctIndex":2,"explanation":"The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files."}', null),
  ('found-stats', 'Learn: complete Seeing Theory distributions/inference and OpenIntro chapters 2, 4 and 5', 'read', 1, null, null),
  ('found-stats', 'Build: analyse one comparison with distribution plots, confidence interval, effect size, assumptions, and a plain-language statement of what cannot be concluded', 'build', 2, null, null),
  ('found-stats', 'Checkpoint challenge: describe(values)', 'challenge', 3, null, '{"language":"python","prompt":"Write describe(values): return a (mean, median, population-stdev) tuple. These three numbers are the first thing you compute on any new dataset — mean and median tell you if it is skewed, stdev tells you how spread out it is.","starterCode":"from statistics import mean, median, pstdev\n\ndef describe(values):\n    \"\"\"Return (mean, median, population-stdev) as a tuple of floats.\"\"\"\n    # your code here\n    pass\n","testCode":"assert describe([2, 4, 4, 4, 5, 5, 7, 9]) == (5.0, 4.5, 2.0)\nassert describe([10, 10, 10]) == (10.0, 10.0, 0.0)\nimport math\nm, md, sd = describe([1, 2, 3, 4])\nassert m == 2.5 and md == 2.5 and math.isclose(sd, 1.1180339887498949, rel_tol=1e-9)\n"}'),
  ('found-ai', 'Learn: watch Intro to LLMs and read the OWASP prompt-injection guidance', 'watch', 1, null, null),
  ('found-ai', 'Build: complete one bounded data task with AI assistance, remove sensitive inputs, test every generated claim or code path, and add an AI_USE.md log of prompts, changes, failures, and verification', 'build', 2, null, null),
  ('found-ai', 'Checkpoint quiz', 'quiz', 3, '{"question":"LLMs generate text by…","options":["Querying a database of answers","Predicting the next token","Running rule-based grammar","Searching the web"],"correctIndex":1,"explanation":"LLMs are next-token predictors trained on large corpora; they do not look up answers in a database."}', null),

  ('de-etl','Learn: complete the Docker, PostgreSQL and Terraform sections, then study cursor-based incremental loading','read',1,null,null),
  ('de-etl','Build: add a containerised API-to-PostgreSQL pipeline with configuration outside source control, pagination, schema checks, an incremental cursor, duplicate-safe reruns and a documented local setup','build',2,null,null),
  ('de-modeling','Learn: study grain, facts, dimensions, surrogate keys, SCDs, partitioning and clustering','read',1,null,null),
  ('de-modeling','Build: add a grain statement, bus matrix, fact table, conformed dimensions, one SCD Type 2 dimension and a partition choice with cost/query justification','build',2,null,null),
  ('de-dbt','Learn: complete the staging, intermediate, marts and data-tests guidance','read',1,null,null),
  ('de-dbt','Build: add sources, staging/intermediate/mart layers, key and relationship tests, one business-rule test, generated docs and separate development/production targets','build',2,null,null),
  ('de-orchestration','Learn: complete the Airflow fundamentals tutorial and backfill guide','read',1,null,null),
  ('de-orchestration','Build: orchestrate ingestion, validation and dbt as separate tasks with retries, failure notification, a deliberate failure test and a documented seven-day backfill procedure','build',2,null,null),
  ('de-cloud','Learn: study IAM identities/policies and BigQuery computation-cost guidance','read',1,null,null),
  ('de-cloud','Build: deploy the platform with raw/processed storage zones, separate developer and scheduler identities, secrets outside code, least-privilege roles and a before/after query-cost comparison','build',2,null,null),
  ('de-spark','Learn: complete Spark SQL getting started and the partitioning, join and adaptive-execution tuning sections','read',1,null,null),
  ('de-spark','Build: add a PySpark batch job, compare it with a local baseline, capture the explain plan, demonstrate partition choices and remove one measured shuffle or skew problem','build',2,null,null),
  ('de-streaming','Learn: complete Kafka 101 and the consumers lesson','read',1,null,null),
  ('de-streaming','Build: add keyed events, multiple partitions and a consumer group, then demonstrate replay from an earlier offset and document ordering scope, rebalancing and chosen delivery semantics','build',2,null,null),
  ('de-vectordb','Learn: study lineage events and executable data-quality expectations','read',1,null,null),
  ('de-vectordb','Build: finish the cumulative platform with freshness/key/business-rule checks, lineage, architecture diagram, data dictionary, setup guide, cost note, failure alert, backfill runbook and one dashboard or query pack proving the data is usable','build',2,null,null),

  ('da-eda', 'Learn: study pandas missing-data handling and use the Aqua Book chapters 6–8 to frame the analysis plan, quality checks and uncertainty', 'read', 1, null, null),
  ('da-eda', 'Build: add brief.md and analysis.ipynb that define the stakeholder, decision, metrics and assumptions, then profile missingness, duplicates, distributions, segments and anomalies with reproducible code', 'build', 2, null, null),
  ('da-visualization', 'Learn: complete the Matplotlib lifecycle tutorial and accessibility guidance', 'read', 1, null, null),
  ('da-visualization', 'Build: remake three misleading charts with justified chart choices, direct labels, colour-safe palettes, alt text and a written note explaining every correction', 'build', 2, null, null),
  ('da-dashboards', 'Learn: study Microsoft report-design and accessibility guidance', 'read', 1, null, null),
  ('da-dashboards', 'Build: produce desktop and mobile dashboard views for three stakeholder questions, with metric definitions, useful defaults, keyboard order, alt text and a five-person usability checklist', 'build', 2, null, null),
  ('da-storytelling', 'Learn: complete one Storytelling with Data exercise and study the uncertainty guidance', 'read', 1, null, null),
  ('da-storytelling', 'Build: create a five-slide decision narrative and one-page executive memo covering context, evidence, recommendation, uncertainty, limitations and next action', 'build', 2, null, null),
  ('da-bi', 'Learn: cover the PL-300 prepare/model/manage objectives and complete the DAX basics tutorial', 'read', 1, null, null),
  ('da-bi', 'Build: publish a star-schema report with documented Power Query steps, a date table, explicit DAX measures, row-level security, scheduled refresh notes and a shared metric dictionary', 'build', 2, null, null),
  ('da-ai-analysis', 'Learn: review the NIST generative-AI risk profile and one documented AI analysis workflow', 'read', 1, null, null),
  ('da-ai-analysis', 'Build: repeat one prior analysis with AI assistance, preserve prompts and generated code, remove sensitive data, independently verify every number and citation, and compare time saved against new risks', 'build', 2, null, null),

  ('ds-ml','Learn: complete the Google linear/logistic regression modules and scikit-learn pipeline guide','read',1,null,null),
  ('ds-ml','Build: add problem_statement.md with user, target, prediction time, cost of errors and naive baseline, then train two reproducible pipeline-based models without touching the test set','build',2,null,null),
  ('ds-features','Learn: study preprocessing pipelines, inconsistent transformation and leakage pitfalls','read',1,null,null),
  ('ds-features','Build: add typed preprocessing inside the training pipeline, a leakage audit and an ablation table showing which features improve cross-validation and by how much','build',2,null,null),
  ('ds-evaluation','Learn: study scoring, cross-validation, threshold metrics and probability calibration','read',1,null,null),
  ('ds-evaluation','Build: add evaluation.md with baseline comparison, cross-validation uncertainty, chosen metric and threshold, calibration plot, error slices, subgroup results and one final test-set evaluation','build',2,null,null),
  ('ds-experiments','Learn: study experiment validity, guardrails, power and sample-size calculations','read',1,null,null),
  ('ds-experiments','Build: add experiment_plan.md with hypothesis, randomisation unit, primary and guardrail metrics, minimum detectable effect, sample size, duration, stopping rule, validity threats and ship/no-ship decision rule','build',2,null,null),
  ('ds-deployment','Learn: complete FastAPI first steps and the MLflow registry workflow','read',1,null,null),
  ('ds-deployment','Build: add a container-ready prediction API with schema validation, health endpoint, unit/integration tests, versioned model artifact, latency measurement and documented rollback','build',2,null,null),
  ('ds-deeplearning','Learn: complete fast.ai lessons 1–3 and the PyTorch transfer-learning tutorial','watch',1,null,null),
  ('ds-deeplearning','Build: fine-tune a pretrained model with fixed seeds, tracked runs and error analysis, then compare quality, latency and cost against the simpler baseline and justify whether it should ship','build',2,null,null),
  ('ds-llm','Learn: complete Production ML Systems and study the Model Card Toolkit','read',1,null,null),
  ('ds-llm','Build: finish the cumulative project with reproducible training, data/version lineage, model card, API or batch inference, service/data/model/business monitoring plan, alert thresholds, privacy/fairness review and a plain-language decision memo','build',2,null,null),

  ('ai-llm-apis', 'Study tool use, structured outputs, and streaming in the API docs', 'read', 1, null, null),
  ('ai-llm-apis', 'Build: a CLI app using tool calls and streamed responses', 'build', 2, null, null),
  ('ai-rag', 'Study chunking, hybrid retrieval, and reranking', 'read', 1, null, null),
  ('ai-rag', 'Build: a RAG system over your own documents with cited answers', 'build', 2, null, null),
  ('ai-agents', 'Read Building Effective Agents', 'read', 1, null, null),
  ('ai-agents', 'Build: an agent with 2–3 tools, guardrails, and a stop condition', 'build', 2, null, null),
  ('ai-multimodal', 'Study vision/document understanding patterns', 'read', 1, null, null),
  ('ai-multimodal', 'Build: an app that extracts structured data from images or PDFs', 'build', 2, null, null),
  ('ai-llmops', 'Study LLM evaluation approaches', 'read', 1, null, null),
  ('ai-llmops', 'Build: an eval suite that gates a prompt change in CI', 'build', 2, null, null),
  ('ai-product', 'Study AI product architecture patterns', 'read', 1, null, null),
  ('ai-product', 'Build: design doc + prototype for an AI product with fallbacks and latency budget', 'build', 2, null, null),

  ('ml-docker', 'Work through Docker getting started', 'read', 1, null, null),
  ('ml-docker', 'Build: containerize a model service with a slim, reproducible image', 'build', 2, null, null),
  ('ml-cicd', 'Study GitHub Actions pipelines', 'read', 1, null, null),
  ('ml-cicd', 'Build: a CI pipeline that tests data, code, and model quality before deploy', 'build', 2, null, null),
  ('ml-monitoring', 'Study drift detection and ML monitoring', 'read', 1, null, null),
  ('ml-monitoring', 'Build: a monitoring dashboard that alerts on input drift', 'build', 2, null, null),
  ('ml-production', 'Study serving patterns and feature stores', 'read', 1, null, null),
  ('ml-production', 'Build: an online + batch serving path for the same model', 'build', 2, null, null),
  ('ml-platform', 'Read the bounded MLOps Zoomcamp capstone brief', 'read', 1, null, null),
  ('ml-platform', 'Build: an end-to-end platform design doc — tracking, registry, deploy paths', 'build', 2, null, null)
) as t(node_slug, description, type, "order", quiz, challenge)
join n on n.slug = t.node_slug;

-- Migrations run before seed data during a local reset. Reapply the idempotent
-- curriculum enrichments now that the seeded tasks and resources exist.
select public.apply_core_lesson_segments();
select public.apply_core_project_milestones();

-- Bind the advanced MLOps primary lessons, then add one bounded reference and
-- one small practice step. AI Engineering stays authored but paused.
with ranked_resources as (
  select r.id, r.node_id, r.name,
         row_number() over (partition by r.node_id order by r.created_at, r.id) as position
  from public.resources r
), first_tasks as (
  select distinct on (t.node_id) t.id, t.node_id
  from public.tasks t join public.nodes n on n.id = t.node_id
  where n.path_id = 'mlops' and t.type in ('read', 'watch')
  order by t.node_id, t."order", t.id
)
update public.tasks t
set resource_id = r.id, lesson_title = r.name, duration_minutes = 45
from first_tasks ft join ranked_resources r on r.node_id = ft.node_id and r.position = 1
where t.id = ft.id;

insert into public.tasks (node_id, description, type, "order", resource_id, lesson_title, duration_minutes)
select n.id,
       case when r.type = 'video' then 'Watch: ' else 'Read: ' end || r.name,
       case when r.type = 'video' then 'watch' else 'read' end,
       2, r.id, r.name, 15
from public.nodes n join public.resources r on r.node_id = n.id
where n.path_id <> 'ai-engineering'
  and not exists (select 1 from public.tasks linked where linked.resource_id = r.id);

update public.tasks t
set "order" = t."order" + case when n.path_id = 'foundations' then 1 else 2 end
from public.nodes n
where t.node_id = n.id and n.path_id <> 'ai-engineering'
  and t.resource_id is null and t."order" >= 2;

insert into public.tasks (node_id, description, type, "order")
select n.id,
       'Practise: reproduce a small ' || lower(n.name) || ' example, then record the result and one decision you made.',
       'practice', 3
from public.nodes n
where n.path_id not in ('foundations', 'ai-engineering');

commit;
