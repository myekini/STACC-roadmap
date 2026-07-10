-- Stacc Roadmap Tracker — content seed (spec 03_products.md §1.5)
-- Foundations gate every path; AI-Engineering and MLOps additionally require DE + DS complete.
-- Curated resources carried over from src/config/roadmapData.ts where they existed.

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
  ('found-python',   'foundations', 'Python Basics', 'Variables to pandas', 'Write scripts that load, clean, and reshape data. The working language of every path that follows.', 'code', 1, 12, 100, '{Python syntax,Functions,Pandas intro}'),
  ('found-sql',      'foundations', 'SQL Basics', 'Query like you mean it', 'SELECT, JOIN, GROUP BY, and window-function fundamentals against a real database.', 'database', 2, 10, 100, '{SELECT & joins,Aggregation,Window functions}'),
  ('found-git',      'foundations', 'Git & GitHub', 'Version everything', 'Branch, commit, merge, and collaborate through pull requests without fear.', 'account_tree', 3, 6, 75, '{Commits & branching,Pull requests,Merge conflicts}'),
  ('found-cli',      'foundations', 'Command Line', 'Live in the terminal', 'Navigate, inspect, and automate with the shell — the environment every data tool assumes.', 'terminal', 4, 5, 75, '{Navigation & pipes,Permissions,Shell scripts}'),
  ('found-stats',    'foundations', 'Statistics Basics', 'Think in distributions', 'Descriptive stats, distributions, sampling, and the difference between correlation and causation.', 'insights', 5, 10, 100, '{Distributions & sampling,Hypothesis testing,Correlation vs causation}'),
  ('found-ai',       'foundations', 'AI Literacy', 'Work with the machines', 'Prompt engineering fundamentals, how LLMs work conceptually, and AI tool fluency for dev work.', 'auto_awesome', 6, 6, 75, '{Prompt engineering,How LLMs work,Cursor/Copilot fluency}'),

  -- DATA ENGINEERING
  ('de-etl',           'de', 'ETL Concepts', 'Extract, Transform, Load', 'Design batch pipelines: ingestion patterns, idempotency, and data quality checks.', 'transform', 1, 10, 150, '{Batch vs streaming,Idempotency,Data quality}'),
  ('de-modeling',      'de', 'Data Modeling', 'Dimensional modeling', 'Star schemas, slowly changing dimensions, and the tradeoffs of normalization.', 'schema', 2, 12, 150, '{Star schema,SCDs,Normalization tradeoffs}'),
  ('de-dbt',           'de', 'dbt', 'Data build tool', 'Transformations as code: models, tests, docs, and environments with dbt.', 'code_blocks', 3, 12, 200, '{Models & tests,Jinja macros,Environments}'),
  ('de-orchestration', 'de', 'Workflow Orchestration', 'Airflow / Prefect', 'Schedule, retry, and monitor DAGs of work that run production pipelines.', 'published_with_changes', 4, 12, 200, '{DAGs & scheduling,Retries,Backfills}'),
  ('de-cloud',         'de', 'Cloud Platforms', 'AWS / GCP', 'Object storage, warehouses, IAM, and the managed services data teams actually use.', 'deployed_code', 5, 14, 200, '{Object storage,Cloud warehouses,IAM & cost basics}'),
  ('de-spark',         'de', 'Spark — Advanced', 'Distributed compute', 'Partitioning, shuffles, and writing PySpark that scales past a single machine.', 'memory', 6, 16, 250, '{PySpark,Partitioning & shuffles,Performance tuning}'),
  ('de-streaming',     'de', 'Real-time Streaming', 'Kafka', 'Topics, consumer groups, and exactly-once thinking for event-driven pipelines.', 'electric_bolt', 7, 16, 250, '{Topics,Consumer groups,Delivery semantics}'),
  ('de-vectordb',      'de', 'Vector DBs & LLM Infra', 'Data for AI systems', 'Embeddings, vector stores, and the infrastructure that feeds LLM applications.', 'biotech', 8, 12, 250, '{Embeddings,Vector search,Chunking & indexing}'),

  -- DATA ANALYSIS
  ('da-eda',           'da', 'Exploratory Data Analysis', 'Interrogate the data', 'Profile datasets, find outliers and patterns, and form hypotheses worth testing.', 'find_in_page', 1, 10, 150, '{Profiling,Outlier detection,Univariate/bivariate analysis}'),
  ('da-visualization', 'da', 'Data Visualization', 'Matplotlib, Seaborn', 'Choose the right chart, encode honestly, and build plots people actually read.', 'bar_chart', 2, 10, 150, '{Chart selection,Matplotlib & Seaborn,Perception principles}'),
  ('da-dashboards',    'da', 'Dashboard Design', 'Interfaces for decisions', 'Layout, hierarchy, and interactivity for dashboards that answer questions at a glance.', 'dashboard', 3, 10, 150, '{Layout & hierarchy,KPI design,Filters & interactivity}'),
  ('da-storytelling',  'da', 'Data Storytelling', 'Insight to action', 'Structure findings as narratives that move stakeholders to a decision.', 'edit_note', 4, 8, 150, '{Narrative structure,Executive summaries,Presenting to stakeholders}'),
  ('da-bi',            'da', 'BI Tools', 'Looker, Power BI, Metabase', 'Model metrics once, serve them everywhere: semantic layers and governed self-serve BI.', 'query_stats', 5, 12, 200, '{Semantic models,Power BI / Metabase,Governance}'),
  ('da-ai-analysis',   'da', 'AI-Assisted Analysis', 'Analyst + LLM', 'Use LLMs to speed up cleaning, coding, and interpretation without losing rigor.', 'auto_awesome', 6, 8, 200, '{Prompting for analysis,Validation,Automation}'),

  -- DATA SCIENCE
  ('ds-ml',            'ds', 'ML Fundamentals', 'Supervised learning core', 'Regression, classification, overfitting, and the bias-variance tradeoff in practice.', 'model_training', 1, 14, 200, '{Regression & classification,Bias-variance tradeoff,scikit-learn}'),
  ('ds-features',      'ds', 'Feature Engineering', 'Signal from raw data', 'Encodings, scaling, leakage traps, and features that actually move metrics.', 'settings_input_component', 2, 10, 150, '{Encodings & scaling,Leakage traps,Feature selection}'),
  ('ds-evaluation',    'ds', 'Model Building & Evaluation', 'Beyond accuracy', 'Cross-validation, metrics that match the business problem, and honest baselines.', 'verified', 3, 12, 200, '{Cross-validation,Metrics & baselines,Calibration}'),
  ('ds-experiments',   'ds', 'Experimentation & A/B Testing', 'Causal by design', 'Design experiments, size samples, and read results without fooling yourself.', 'biotech', 4, 12, 200, '{Experiment design,Power & significance,Common pitfalls}'),
  ('ds-deployment',    'ds', 'Model Deployment', 'Models as services', 'Package and serve models behind APIs with versioning and rollback.', 'publish', 5, 12, 200, '{FastAPI serving,Serialization,Versioning & rollback}'),
  ('ds-deeplearning',  'ds', 'Deep Learning — Advanced', 'Neural networks', 'Backprop intuition, CNNs/transformers, and training discipline with PyTorch.', 'psychology', 6, 18, 250, '{PyTorch,CNNs & Transformers,Training loops}'),
  ('ds-llm',           'ds', 'LLM Fine-tuning & RAG', 'Adapt foundation models', 'Fine-tuning versus retrieval, dataset curation, and evaluating LLM output.', 'smart_toy', 7, 16, 250, '{Fine-tuning vs RAG,Dataset curation,Evals}'),

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

-- ── Resources ──────────────────────────────────────────────
with n as (select slug, id from public.nodes)
insert into public.resources (node_id, name, type, platform, url)
select n.id, r.name, r.type, r.platform, r.url
from (values
  ('found-python', 'Python for Everybody', 'course', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/python-for-everybody/'),
  ('found-python', 'Pandas Getting Started Guide', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/getting_started/index.html'),
  ('found-sql', 'Kaggle: Intro to SQL', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-sql'),
  ('found-sql', 'SQLBolt Interactive Lessons', 'article', 'SQLBolt', 'https://sqlbolt.com/'),
  ('found-git', 'Pro Git Book (ch. 1–3)', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'),
  ('found-git', 'GitHub Skills', 'course', 'GitHub', 'https://skills.github.com/'),
  ('found-cli', 'The Missing Semester: Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2020/course-shell/'),
  ('found-cli', 'Linux Command Line Basics', 'article', 'Ubuntu', 'https://ubuntu.com/tutorials/command-line-for-beginners'),
  ('found-stats', 'Seeing Theory (Visual Probability)', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'),
  ('found-stats', 'Khan Academy: Statistics', 'course', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability'),
  ('found-ai', 'Prompt Engineering Guide', 'documentation', 'promptingguide.ai', 'https://www.promptingguide.ai/'),
  ('found-ai', 'Intro to Large Language Models', 'video', 'YouTube (Karpathy)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'),

  ('de-etl', 'Data Engineering Zoomcamp', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/data-engineering-zoomcamp'),
  ('de-etl', 'The Data Engineering Cookbook', 'documentation', 'Andreas Kretz (GitHub)', 'https://github.com/andkret/Cookbook'),
  ('de-modeling', 'Kimball Dimensional Modeling Resources', 'documentation', 'Kimball Group', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/'),
  ('de-modeling', 'dbt: How We Structure Our dbt Projects', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview'),
  ('de-dbt', 'dbt Fundamentals Course', 'course', 'dbt Labs', 'https://courses.getdbt.com/courses/fundamentals'),
  ('de-dbt', 'Official dbt Docs', 'documentation', 'getdbt.com', 'https://docs.getdbt.com/'),
  ('de-orchestration', 'Astronomer Airflow Academy', 'course', 'Astronomer', 'https://academy.astronomer.io/'),
  ('de-orchestration', 'Airflow Documentation: Core Concepts', 'documentation', 'Apache Airflow', 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html'),
  ('de-cloud', 'AWS Skill Builder: Data Analytics', 'course', 'AWS', 'https://skillbuilder.aws/'),
  ('de-cloud', 'Google Cloud Architecture Center', 'documentation', 'Google Cloud', 'https://cloud.google.com/architecture'),
  ('de-spark', 'Spark SQL Programming Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/sql-programming-guide.html'),
  ('de-spark', 'Spark Tuning Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/tuning.html'),
  ('de-streaming', 'Kafka 101', 'course', 'Confluent', 'https://developer.confluent.io/courses/apache-kafka/events/'),
  ('de-streaming', 'Apache Kafka Documentation', 'documentation', 'Apache Kafka', 'https://kafka.apache.org/documentation/'),
  ('de-vectordb', 'Vector Databases Explained', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/vector-database/'),
  ('de-vectordb', 'Faiss Wiki', 'documentation', 'Meta AI Research', 'https://github.com/facebookresearch/faiss/wiki'),

  ('da-eda', 'Kaggle: Data Cleaning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/data-cleaning'),
  ('da-eda', 'ydata-profiling Documentation', 'documentation', 'ydata-profiling', 'https://docs.profiling.ydata.ai/'),
  ('da-visualization', 'Storytelling with Data (blog)', 'article', 'SWD', 'https://www.storytellingwithdata.com/'),
  ('da-visualization', 'Matplotlib Tutorials', 'documentation', 'Matplotlib', 'https://matplotlib.org/stable/tutorials/index.html'),
  ('da-dashboards', 'Metabase: Dashboard Best Practices', 'article', 'Metabase Learn', 'https://www.metabase.com/learn/dashboards'),
  ('da-dashboards', 'Looker Studio Help Center', 'documentation', 'Google', 'https://support.google.com/looker-studio/'),
  ('da-storytelling', 'SWD Podcast & Exercises', 'article', 'SWD', 'https://community.storytellingwithdata.com/exercises'),
  ('da-storytelling', 'Nightingale — The Journal of the Data Visualization Society', 'article', 'Data Visualization Society', 'https://nightingaledvs.com/'),
  ('da-bi', 'Microsoft Learn: Power BI', 'course', 'Microsoft', 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi'),
  ('da-bi', 'Metabase Documentation', 'documentation', 'Metabase', 'https://www.metabase.com/docs/latest/'),
  ('da-ai-analysis', 'Prompt Engineering Guide', 'documentation', 'promptingguide.ai', 'https://www.promptingguide.ai/'),
  ('da-ai-analysis', 'Anthropic Cookbook', 'documentation', 'Anthropic', 'https://github.com/anthropics/anthropic-cookbook'),

  ('ds-ml', 'Kaggle: Intro to Machine Learning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-machine-learning'),
  ('ds-ml', 'scikit-learn User Guide', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/user_guide.html'),
  ('ds-features', 'Kaggle: Feature Engineering', 'course', 'Kaggle', 'https://www.kaggle.com/learn/feature-engineering'),
  ('ds-features', 'scikit-learn: Preprocessing & Feature Engineering', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/preprocessing.html'),
  ('ds-evaluation', 'scikit-learn: Model Evaluation', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/model_evaluation.html'),
  ('ds-evaluation', 'Google: Machine Learning Crash Course', 'course', 'Google', 'https://developers.google.com/machine-learning/crash-course'),
  ('ds-experiments', 'Trustworthy Online Controlled Experiments (notes)', 'article', 'exp-platform.com', 'https://exp-platform.com/'),
  ('ds-experiments', 'How Not To Run An A/B Test', 'article', 'Evan Miller', 'https://www.evanmiller.org/how-not-to-run-an-ab-test.html'),
  ('ds-deployment', 'FastAPI Docs', 'documentation', 'fastapi.tiangolo.com', 'https://fastapi.tiangolo.com/'),
  ('ds-deployment', 'ONNX Runtime Documentation', 'documentation', 'ONNX', 'https://onnxruntime.ai/docs/'),
  ('ds-deeplearning', 'Practical Deep Learning for Coders', 'course', 'fast.ai', 'https://course.fast.ai/'),
  ('ds-deeplearning', 'PyTorch Tutorials', 'documentation', 'PyTorch', 'https://pytorch.org/tutorials/'),
  ('ds-llm', 'Hugging Face NLP Course', 'course', 'Hugging Face', 'https://huggingface.co/learn/nlp-course'),
  ('ds-llm', 'LlamaIndex Documentation', 'documentation', 'LlamaIndex', 'https://docs.llamaindex.ai/en/stable/'),

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
  ('ml-platform', 'MLOps Zoomcamp', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/mlops-zoomcamp'),
  ('ml-platform', 'MLflow Documentation', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/index.html')
) as r(node_slug, name, type, platform, url)
join n on n.slug = r.node_slug;

-- ── Tasks ──────────────────────────────────────────────────
-- Every node gets a study task, a build task, and a quiz. Node completes when
-- all its tasks are done (complete_task RPC), which awards the node's XP.
with n as (select slug, id from public.nodes)
insert into public.tasks (node_id, description, type, "order", quiz)
select n.id, t.description, t.type, t."order", t.quiz::jsonb
from (values
  ('found-python', 'Work through the core Python course modules', 'watch', 1, null),
  ('found-python', 'Build: clean a messy CSV with pandas and export a tidy dataset', 'build', 2, null),
  ('found-python', 'Checkpoint quiz', 'quiz', 3, '{"question":"Which pandas method returns the first 5 rows of a DataFrame?","options":["df.first()","df.head()","df.top()","df.preview()"],"correctIndex":1,"explanation":"df.head() returns the first n rows (default 5). There is no first()/top()/preview() in pandas."}'),
  ('found-sql', 'Complete the interactive SQL lessons', 'read', 1, null),
  ('found-sql', 'Build: answer 5 business questions against a sample database', 'build', 2, null),
  ('found-sql', 'Checkpoint quiz', 'quiz', 3, '{"question":"Which SQL clause filters results after aggregation?","options":["WHERE","HAVING","GROUP BY","ORDER BY"],"correctIndex":1,"explanation":"HAVING filters after GROUP BY has aggregated rows; WHERE filters rows before aggregation."}'),
  ('found-git', 'Read Pro Git chapters 1–3', 'read', 1, null),
  ('found-git', 'Build: open a pull request with a reviewed change on your own repo', 'build', 2, null),
  ('found-git', 'Checkpoint quiz', 'quiz', 3, '{"question":"What does git rebase do compared to merge?","options":["Deletes the branch","Replays commits onto a new base for linear history","Creates a merge commit","Pushes to remote"],"correctIndex":1,"explanation":"Rebase replays your commits on top of another base commit, producing a linear history; merge preserves both histories with a merge commit."}'),
  ('found-cli', 'Watch the Missing Semester shell lecture', 'watch', 1, null),
  ('found-cli', 'Build: write a shell script that organizes files by extension', 'build', 2, null),
  ('found-cli', 'Checkpoint quiz', 'quiz', 3, '{"question":"Which operator sends the output of one command into another?","options":[">",">>","|","&"],"correctIndex":2,"explanation":"The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files."}'),
  ('found-stats', 'Explore distributions and inference on Seeing Theory', 'read', 1, null),
  ('found-stats', 'Build: analyze a dataset and report mean/median skew with plots', 'build', 2, null),
  ('found-stats', 'Checkpoint quiz', 'quiz', 3, '{"question":"Correlation between X and Y means…","options":["X causes Y","Y causes X","X and Y move together","X and Y are independent"],"correctIndex":2,"explanation":"Correlation measures co-movement only; causation needs experimental or quasi-experimental evidence."}'),
  ('found-ai', 'Read the prompt engineering fundamentals guide', 'read', 1, null),
  ('found-ai', 'Build: solve a coding task end-to-end with an AI assistant, documenting prompts', 'build', 2, null),
  ('found-ai', 'Checkpoint quiz', 'quiz', 3, '{"question":"LLMs generate text by…","options":["Querying a database of answers","Predicting the next token","Running rule-based grammar","Searching the web"],"correctIndex":1,"explanation":"LLMs are next-token predictors trained on large corpora; they do not look up answers in a database."}'),

  ('de-etl', 'Study the ingestion + ETL weeks of the DE Zoomcamp', 'watch', 1, null),
  ('de-etl', 'Build: a pipeline that ingests a public API into a database daily', 'build', 2, null),
  ('de-etl', 'Checkpoint quiz', 'quiz', 3, '{"question":"An idempotent pipeline run…","options":["Runs faster each time","Produces the same result if re-run","Never fails","Requires no scheduler"],"correctIndex":1,"explanation":"Idempotency means re-running the same load does not duplicate or corrupt data — key for safe retries and backfills."}'),
  ('de-modeling', 'Read Kimball''s dimensional modeling essentials', 'read', 1, null),
  ('de-modeling', 'Build: design a star schema for an e-commerce domain', 'build', 2, null),
  ('de-modeling', 'Checkpoint quiz', 'quiz', 3, '{"question":"In a star schema, facts are…","options":["Descriptive attributes","Measurable events at a declared grain","Lookup tables","Slowly changing dimensions"],"correctIndex":1,"explanation":"Fact tables hold measurable events at a specific grain; dimensions carry the descriptive context."}'),
  ('de-dbt', 'Complete dbt Fundamentals', 'watch', 1, null),
  ('de-dbt', 'Build: a dbt project with staging/marts models and tests', 'build', 2, null),
  ('de-dbt', 'Checkpoint quiz', 'quiz', 3, '{"question":"dbt primarily handles which part of ELT?","options":["Extract","Load","Transform","Orchestration"],"correctIndex":2,"explanation":"dbt transforms data already loaded in the warehouse using SQL models with testing and docs."}'),
  ('de-orchestration', 'Work through Airflow fundamentals', 'watch', 1, null),
  ('de-orchestration', 'Build: schedule your ETL pipeline as a DAG with retries and alerts', 'build', 2, null),
  ('de-orchestration', 'Checkpoint quiz', 'quiz', 3, '{"question":"A DAG in orchestration is…","options":["A database table","A directed acyclic graph of tasks","A deployment artifact","A data quality rule"],"correctIndex":1,"explanation":"Workflows are modeled as directed acyclic graphs so dependencies run in order without cycles."}'),
  ('de-cloud', 'Study object storage, warehouse, and IAM basics on one cloud', 'watch', 1, null),
  ('de-cloud', 'Build: deploy your pipeline to run on cloud infrastructure', 'build', 2, null),
  ('de-cloud', 'Checkpoint quiz', 'quiz', 3, '{"question":"Object storage (S3/GCS) is best suited for…","options":["Low-latency transactions","Files and immutable data at scale","Relational joins","In-memory caching"],"correctIndex":1,"explanation":"Object stores are cheap, durable homes for files and raw/lake data — not transactional workloads."}'),
  ('de-spark', 'Study the Spark SQL programming guide', 'read', 1, null),
  ('de-spark', 'Build: process a dataset too large for pandas with PySpark', 'build', 2, null),
  ('de-spark', 'Checkpoint quiz', 'quiz', 3, '{"question":"A shuffle in Spark is expensive because…","options":["It uses GPUs","Data moves across the network between partitions","It recompiles the job","It writes to the driver"],"correctIndex":1,"explanation":"Shuffles repartition data across executors over the network — the main cost to minimize in Spark jobs."}'),
  ('de-streaming', 'Complete Kafka 101', 'watch', 1, null),
  ('de-streaming', 'Build: a producer/consumer pair processing events in real time', 'build', 2, null),
  ('de-streaming', 'Checkpoint quiz', 'quiz', 3, '{"question":"Consumer groups in Kafka enable…","options":["Message encryption","Parallel consumption with each partition read by one member","Schema validation","Exactly-once storage"],"correctIndex":1,"explanation":"Partitions are divided among group members, giving horizontal scale while preserving per-partition order."}'),
  ('de-vectordb', 'Read the vector database fundamentals guide', 'read', 1, null),
  ('de-vectordb', 'Build: embed a document set and serve similarity search', 'build', 2, null),
  ('de-vectordb', 'Checkpoint quiz', 'quiz', 3, '{"question":"Embeddings are…","options":["Compressed files","Dense vectors capturing semantic meaning","Database indexes","Encrypted tokens"],"correctIndex":1,"explanation":"Embeddings map text/images into dense vectors where semantic similarity becomes geometric closeness."}'),

  ('da-eda', 'Complete the data cleaning course', 'watch', 1, null),
  ('da-eda', 'Build: a full EDA notebook on a dataset you have never seen', 'build', 2, null),
  ('da-eda', 'Checkpoint quiz', 'quiz', 3, '{"question":"The first thing to check in a new dataset is…","options":["Model accuracy","Missing values, types, and distributions","Dashboard colors","Feature importance"],"correctIndex":1,"explanation":"Profiling — completeness, types, ranges, distributions — comes before any analysis or modeling."}'),
  ('da-visualization', 'Study chart-choice and perception principles', 'read', 1, null),
  ('da-visualization', 'Build: remake three bad charts into honest, readable ones', 'build', 2, null),
  ('da-visualization', 'Checkpoint quiz', 'quiz', 3, '{"question":"For comparing quantities across categories, prefer…","options":["Pie chart","Bar chart","3D surface","Word cloud"],"correctIndex":1,"explanation":"Length on a common baseline (bars) is the most accurately perceived encoding for comparisons."}'),
  ('da-dashboards', 'Read dashboard design best practices', 'read', 1, null),
  ('da-dashboards', 'Build: a KPI dashboard answering three stakeholder questions', 'build', 2, null),
  ('da-dashboards', 'Checkpoint quiz', 'quiz', 3, '{"question":"A good dashboard leads with…","options":["Every available metric","The most decision-relevant KPIs","Raw tables","Filters"],"correctIndex":1,"explanation":"Hierarchy matters: the questions users came to answer belong at the top, detail below."}'),
  ('da-storytelling', 'Work through storytelling-with-data exercises', 'read', 1, null),
  ('da-storytelling', 'Build: a 5-slide narrative from one of your analyses', 'build', 2, null),
  ('da-storytelling', 'Checkpoint quiz', 'quiz', 3, '{"question":"A data story should end with…","options":["The methodology","A recommended action","All caveats","The raw data"],"correctIndex":1,"explanation":"Analyses drive decisions: close with the action the evidence supports, then back it up."}'),
  ('da-bi', 'Complete a Power BI (or Metabase) learning path', 'watch', 1, null),
  ('da-bi', 'Build: publish a governed dashboard with a shared metric definition', 'build', 2, null),
  ('da-bi', 'Checkpoint quiz', 'quiz', 3, '{"question":"A semantic layer exists to…","options":["Speed up SQL","Define metrics once and reuse everywhere","Replace the warehouse","Encrypt data"],"correctIndex":1,"explanation":"Semantic layers centralize metric definitions so every tool and team reports the same numbers."}'),
  ('da-ai-analysis', 'Study prompting patterns for analysis work', 'read', 1, null),
  ('da-ai-analysis', 'Build: run an analysis with an LLM assistant and validate every claim', 'build', 2, null),
  ('da-ai-analysis', 'Checkpoint quiz', 'quiz', 3, '{"question":"When an LLM produces an analysis claim, you should…","options":["Ship it","Verify it against the data before using it","Ask it to be confident","Lower the temperature"],"correctIndex":1,"explanation":"LLMs speed up analysis but hallucinate; every number and claim must be validated against the source data."}'),

  ('ds-ml', 'Complete the intro ML course', 'watch', 1, null),
  ('ds-ml', 'Build: train and compare two models on a tabular dataset', 'build', 2, null),
  ('ds-ml', 'Checkpoint quiz', 'quiz', 3, '{"question":"High training accuracy but poor test accuracy indicates…","options":["Underfitting","Overfitting","Data leakage is impossible","A perfect model"],"correctIndex":1,"explanation":"The model memorized training data instead of generalizing — the classic overfitting signature."}'),
  ('ds-features', 'Complete the feature engineering course', 'watch', 1, null),
  ('ds-features', 'Build: engineer features that measurably beat the raw baseline', 'build', 2, null),
  ('ds-features', 'Checkpoint quiz', 'quiz', 3, '{"question":"Data leakage means…","options":["Missing values","Information from the target/future leaking into features","Slow training","Too many features"],"correctIndex":1,"explanation":"Leakage lets the model peek at information unavailable at prediction time, inflating offline metrics."}'),
  ('ds-evaluation', 'Study evaluation metrics and cross-validation', 'read', 1, null),
  ('ds-evaluation', 'Build: an evaluation report with CV, baselines, and the right metric', 'build', 2, null),
  ('ds-evaluation', 'Checkpoint quiz', 'quiz', 3, '{"question":"For imbalanced classification, accuracy is misleading because…","options":["It is slow","Predicting the majority class scores high","It needs GPUs","It requires calibration"],"correctIndex":1,"explanation":"With 99/1 class balance, always predicting the majority hits 99% accuracy while catching nothing."}'),
  ('ds-experiments', 'Study experiment design and statistical power', 'read', 1, null),
  ('ds-experiments', 'Build: design an A/B test plan with hypothesis, sample size, and decision rule', 'build', 2, null),
  ('ds-experiments', 'Checkpoint quiz', 'quiz', 3, '{"question":"Peeking at A/B results daily and stopping early…","options":["Is best practice","Inflates false positives","Reduces variance","Has no effect"],"correctIndex":1,"explanation":"Repeated significance checks without correction dramatically inflate the false-positive rate."}'),
  ('ds-deployment', 'Study FastAPI model-serving patterns', 'read', 1, null),
  ('ds-deployment', 'Build: serve a trained model behind a versioned REST endpoint', 'build', 2, null),
  ('ds-deployment', 'Checkpoint quiz', 'quiz', 3, '{"question":"Model artifacts should be…","options":["Retrained per request","Versioned and loaded at startup","Stored in the client","Hardcoded"],"correctIndex":1,"explanation":"Versioned artifacts loaded at startup give reproducible, fast inference and clean rollbacks."}'),
  ('ds-deeplearning', 'Work through fast.ai practical deep learning', 'watch', 1, null),
  ('ds-deeplearning', 'Build: fine-tune a pretrained network on your own image/text data', 'build', 2, null),
  ('ds-deeplearning', 'Checkpoint quiz', 'quiz', 3, '{"question":"Transfer learning works because…","options":["Small data trains from scratch","Early layers learn reusable general features","GPUs are fast","Labels are optional"],"correctIndex":1,"explanation":"Pretrained networks capture general features; fine-tuning adapts them to your task with little data."}'),
  ('ds-llm', 'Complete the Hugging Face NLP course core chapters', 'watch', 1, null),
  ('ds-llm', 'Build: compare a RAG baseline vs fine-tuning on one task, with evals', 'build', 2, null),
  ('ds-llm', 'Checkpoint quiz', 'quiz', 3, '{"question":"Prefer RAG over fine-tuning when…","options":["Knowledge changes frequently","You need a new output style","Latency must be minimal","You have no documents"],"correctIndex":0,"explanation":"RAG serves fresh, updatable knowledge at query time; fine-tuning bakes behavior/style into weights."}'),

  ('ai-llm-apis', 'Study tool use, structured outputs, and streaming in the API docs', 'read', 1, null),
  ('ai-llm-apis', 'Build: a CLI app using tool calls and streamed responses', 'build', 2, null),
  ('ai-llm-apis', 'Checkpoint quiz', 'quiz', 3, '{"question":"Tool use lets an LLM…","options":["Train itself","Call functions you define and use the results","Access weights","Skip safety"],"correctIndex":1,"explanation":"You declare tools; the model requests calls with arguments and incorporates your returned results."}'),
  ('ai-rag', 'Study chunking, hybrid retrieval, and reranking', 'read', 1, null),
  ('ai-rag', 'Build: a RAG system over your own documents with cited answers', 'build', 2, null),
  ('ai-rag', 'Checkpoint quiz', 'quiz', 3, '{"question":"Reranking improves RAG by…","options":["Making embeddings smaller","Reordering retrieved candidates by relevance before generation","Caching responses","Increasing chunk size"],"correctIndex":1,"explanation":"A reranker scores query-document pairs precisely, promoting the truly relevant chunks into context."}'),
  ('ai-agents', 'Read Building Effective Agents', 'read', 1, null),
  ('ai-agents', 'Build: an agent with 2–3 tools, guardrails, and a stop condition', 'build', 2, null),
  ('ai-agents', 'Checkpoint quiz', 'quiz', 3, '{"question":"Per Anthropic''s guidance, you should reach for an agent when…","options":["Always","A workflow''s steps cannot be predetermined","Latency is critical","Costs must be fixed"],"correctIndex":1,"explanation":"If the path is predictable, a fixed workflow is cheaper and more reliable; agents earn their cost on open-ended tasks."}'),
  ('ai-multimodal', 'Study vision/document understanding patterns', 'read', 1, null),
  ('ai-multimodal', 'Build: an app that extracts structured data from images or PDFs', 'build', 2, null),
  ('ai-multimodal', 'Checkpoint quiz', 'quiz', 3, '{"question":"For extracting fields from documents, the most robust approach is…","options":["Regex on OCR text only","Multimodal model with a strict output schema and validation","Manual entry","Screenshots in prompts without structure"],"correctIndex":1,"explanation":"Schema-constrained multimodal extraction plus validation catches errors that brittle regex/OCR pipelines miss."}'),
  ('ai-llmops', 'Study LLM evaluation approaches', 'read', 1, null),
  ('ai-llmops', 'Build: an eval suite that gates a prompt change in CI', 'build', 2, null),
  ('ai-llmops', 'Checkpoint quiz', 'quiz', 3, '{"question":"Prompt changes should ship only after…","options":["Manual vibes check","Passing a regression eval suite","A bigger model is used","Temperature is zeroed"],"correctIndex":1,"explanation":"Evals turn prompt engineering into engineering: regressions get caught before users see them."}'),
  ('ai-product', 'Study AI product architecture patterns', 'read', 1, null),
  ('ai-product', 'Build: design doc + prototype for an AI product with fallbacks and latency budget', 'build', 2, null),
  ('ai-product', 'Checkpoint quiz', 'quiz', 3, '{"question":"When the model fails or times out, a production AI product should…","options":["Show a stack trace","Degrade gracefully to a designed fallback","Retry forever","Block the UI"],"correctIndex":1,"explanation":"Fallbacks (cached answers, simpler models, honest empty states) are part of the product design, not an afterthought."}'),

  ('ml-docker', 'Work through Docker getting started', 'read', 1, null),
  ('ml-docker', 'Build: containerize a model service with a slim, reproducible image', 'build', 2, null),
  ('ml-docker', 'Checkpoint quiz', 'quiz', 3, '{"question":"Docker image layers are…","options":["Random snapshots","Cached filesystem diffs created per instruction","VM disks","Encrypted volumes"],"correctIndex":1,"explanation":"Each Dockerfile instruction creates a cached layer; ordering instructions well makes rebuilds fast."}'),
  ('ml-cicd', 'Study GitHub Actions pipelines', 'read', 1, null),
  ('ml-cicd', 'Build: a CI pipeline that tests data, code, and model quality before deploy', 'build', 2, null),
  ('ml-cicd', 'Checkpoint quiz', 'quiz', 3, '{"question":"CI for ML differs from app CI because it must also validate…","options":["Only code style","Data and model quality","Commit messages","Branch names"],"correctIndex":1,"explanation":"ML behavior depends on data and weights, so pipelines test datasets and model metrics, not just code."}'),
  ('ml-monitoring', 'Study drift detection and ML monitoring', 'read', 1, null),
  ('ml-monitoring', 'Build: a monitoring dashboard that alerts on input drift', 'build', 2, null),
  ('ml-monitoring', 'Checkpoint quiz', 'quiz', 3, '{"question":"Concept drift means…","options":["Inputs changed distribution","The relationship between inputs and target changed","The model file corrupted","Latency increased"],"correctIndex":1,"explanation":"Concept drift is when P(y|x) changes — the world''s behavior shifted, so the learned mapping decays."}'),
  ('ml-production', 'Study serving patterns and feature stores', 'read', 1, null),
  ('ml-production', 'Build: an online + batch serving path for the same model', 'build', 2, null),
  ('ml-production', 'Checkpoint quiz', 'quiz', 3, '{"question":"A feature store primarily solves…","options":["GPU scheduling","Consistent features between training and serving","Model compression","Data visualization"],"correctIndex":1,"explanation":"Training/serving skew disappears when both read identical feature definitions from one store."}'),
  ('ml-platform', 'Work through the MLOps Zoomcamp capstone material', 'watch', 1, null),
  ('ml-platform', 'Build: an end-to-end platform design doc — tracking, registry, deploy paths', 'build', 2, null),
  ('ml-platform', 'Checkpoint quiz', 'quiz', 3, '{"question":"A model registry provides…","options":["Faster training","Versioned, stage-managed models with lineage","Data labeling","Feature computation"],"correctIndex":1,"explanation":"Registries track model versions, stages (staging/prod), and lineage — the backbone of controlled deployment."}')
) as t(node_slug, description, type, "order", quiz)
join n on n.slug = t.node_slug;

commit;
