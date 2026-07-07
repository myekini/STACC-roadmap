// Stacc Roadmap content — mirrors supabase/seed.sql exactly.
// In Supabase mode content comes from the database; in localStorage demo mode it
// comes from here. Node ids equal slugs locally so progress keys stay stable.
import type {
  NodeRow,
  PathRow,
  QuizPayload,
  ResourceRow,
  ResourceType,
  TaskRow,
  TaskType,
} from '@/lib/database.types';

type ResourceDef = [name: string, type: ResourceType, platform: string, url: string];
type TaskDef = [description: string, type: TaskType, quiz?: QuizPayload];

interface NodeDef {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  estHours: number;
  xp: number;
  skills: string[];
  prereqs: string[];
  resources: ResourceDef[];
  tasks: TaskDef[];
}

interface PathDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  requiresPaths: string[];
  nodes: NodeDef[];
}

const FOUNDATION_SLUGS = ['found-python', 'found-sql', 'found-git', 'found-cli', 'found-stats', 'found-ai'];

const quiz = (question: string, options: string[], correctIndex: number, explanation: string): QuizPayload => ({
  question,
  options,
  correctIndex,
  explanation,
});

const PATH_DEFS: PathDef[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'The baseline every data role requires. Complete this before branching into a specialization.',
    icon: 'terminal',
    tags: ['Python', 'SQL', 'Git', 'Statistics', 'AI Literacy'],
    requiresPaths: [],
    nodes: [
      {
        slug: 'found-python', name: 'Python Basics', subtitle: 'Variables to pandas',
        description: 'Write scripts that load, clean, and reshape data. The working language of every path that follows.',
        icon: 'code', estHours: 12, xp: 100,
        skills: ['Python syntax', 'Data types', 'Functions', 'Pandas intro'], prereqs: [],
        resources: [
          ['Python for Everybody', 'course', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/python-for-everybody/'],
          ['Pandas Getting Started Guide', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/getting_started/index.html'],
        ],
        tasks: [
          ['Work through the core Python course modules', 'watch'],
          ['Build: clean a messy CSV with pandas and export a tidy dataset', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Which pandas method returns the first 5 rows of a DataFrame?', ['df.first()', 'df.head()', 'df.top()', 'df.preview()'], 1, 'df.head() returns the first n rows (default 5). There is no first()/top()/preview() in pandas.')],
        ],
      },
      {
        slug: 'found-sql', name: 'SQL Basics', subtitle: 'Query like you mean it',
        description: 'SELECT, JOIN, GROUP BY, and window-function fundamentals against a real database.',
        icon: 'database', estHours: 10, xp: 100,
        skills: ['SELECT', 'Joins', 'Aggregation', 'Window functions'], prereqs: [],
        resources: [
          ['Kaggle: Intro to SQL', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-sql'],
          ['SQLBolt Interactive Lessons', 'article', 'SQLBolt', 'https://sqlbolt.com/'],
        ],
        tasks: [
          ['Complete the interactive SQL lessons', 'read'],
          ['Build: answer 5 business questions against a sample database', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Which SQL clause filters results after aggregation?', ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], 1, 'HAVING filters after GROUP BY has aggregated rows; WHERE filters rows before aggregation.')],
        ],
      },
      {
        slug: 'found-git', name: 'Git & GitHub', subtitle: 'Version everything',
        description: 'Branch, commit, merge, and collaborate through pull requests without fear.',
        icon: 'account_tree', estHours: 6, xp: 75,
        skills: ['Commits', 'Branching', 'Pull requests', 'Merge conflicts'], prereqs: [],
        resources: [
          ['Pro Git Book (ch. 1–3)', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'],
          ['GitHub Skills', 'course', 'GitHub', 'https://skills.github.com/'],
        ],
        tasks: [
          ['Read Pro Git chapters 1–3', 'read'],
          ['Build: open a pull request with a reviewed change on your own repo', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('What does git rebase do compared to merge?', ['Deletes the branch', 'Replays commits onto a new base for linear history', 'Creates a merge commit', 'Pushes to remote'], 1, 'Rebase replays your commits on top of another base commit, producing a linear history; merge preserves both histories with a merge commit.')],
        ],
      },
      {
        slug: 'found-cli', name: 'Command Line', subtitle: 'Live in the terminal',
        description: 'Navigate, inspect, and automate with the shell — the environment every data tool assumes.',
        icon: 'terminal', estHours: 5, xp: 75,
        skills: ['Navigation', 'Pipes', 'Permissions', 'Shell scripts'], prereqs: [],
        resources: [
          ['The Missing Semester: Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2020/course-shell/'],
          ['Linux Command Line Basics', 'article', 'Ubuntu', 'https://ubuntu.com/tutorials/command-line-for-beginners'],
        ],
        tasks: [
          ['Watch the Missing Semester shell lecture', 'watch'],
          ['Build: write a shell script that organizes files by extension', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Which operator sends the output of one command into another?', ['>', '>>', '|', '&'], 2, 'The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files.')],
        ],
      },
      {
        slug: 'found-stats', name: 'Statistics Basics', subtitle: 'Think in distributions',
        description: 'Descriptive stats, distributions, sampling, and the difference between correlation and causation.',
        icon: 'insights', estHours: 10, xp: 100,
        skills: ['Distributions', 'Sampling', 'Hypothesis testing', 'Correlation vs causation'], prereqs: ['found-python'],
        resources: [
          ['Seeing Theory (Visual Probability)', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'],
          ['Khan Academy: Statistics', 'course', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability'],
        ],
        tasks: [
          ['Explore distributions and inference on Seeing Theory', 'read'],
          ['Build: analyze a dataset and report mean/median skew with plots', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Correlation between X and Y means…', ['X causes Y', 'Y causes X', 'X and Y move together', 'X and Y are independent'], 2, 'Correlation measures co-movement only; causation needs experimental or quasi-experimental evidence.')],
        ],
      },
      {
        slug: 'found-ai', name: 'AI Literacy', subtitle: 'Work with the machines',
        description: 'Prompt engineering fundamentals, how LLMs work conceptually, and AI tool fluency for dev work.',
        icon: 'auto_awesome', estHours: 6, xp: 75,
        skills: ['Prompt engineering', 'How LLMs work', 'Cursor/Copilot fluency'], prereqs: ['found-python'],
        resources: [
          ['Prompt Engineering Guide', 'documentation', 'promptingguide.ai', 'https://www.promptingguide.ai/'],
          ['Intro to Large Language Models', 'video', 'YouTube (Karpathy)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'],
        ],
        tasks: [
          ['Read the prompt engineering fundamentals guide', 'read'],
          ['Build: solve a coding task end-to-end with an AI assistant, documenting prompts', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('LLMs generate text by…', ['Querying a database of answers', 'Predicting the next token', 'Running rule-based grammar', 'Searching the web'], 1, 'LLMs are next-token predictors trained on large corpora; they do not look up answers in a database.')],
        ],
      },
    ],
  },
  {
    id: 'de',
    title: 'Data Engineering',
    description: 'Build the infrastructure. Design robust pipelines, manage massive datasets, and ensure data quality and accessibility.',
    icon: 'database',
    tags: ['ETL', 'dbt', 'Airflow', 'Cloud', 'Spark', 'Kafka'],
    requiresPaths: [],
    nodes: [
      {
        slug: 'de-etl', name: 'ETL Concepts', subtitle: 'Extract, Transform, Load',
        description: 'Design batch pipelines: ingestion patterns, idempotency, and data quality checks.',
        icon: 'transform', estHours: 10, xp: 150,
        skills: ['Batch vs streaming', 'Idempotency', 'Data quality'], prereqs: FOUNDATION_SLUGS,
        resources: [['Data Engineering Zoomcamp', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/data-engineering-zoomcamp']],
        tasks: [
          ['Study the ingestion + ETL weeks of the DE Zoomcamp', 'watch'],
          ['Build: a pipeline that ingests a public API into a database daily', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('An idempotent pipeline run…', ['Runs faster each time', 'Produces the same result if re-run', 'Never fails', 'Requires no scheduler'], 1, 'Idempotency means re-running the same load does not duplicate or corrupt data — key for safe retries and backfills.')],
        ],
      },
      {
        slug: 'de-modeling', name: 'Data Modeling', subtitle: 'Dimensional modeling',
        description: 'Star schemas, slowly changing dimensions, and the tradeoffs of normalization.',
        icon: 'schema', estHours: 12, xp: 150,
        skills: ['Star schema', 'SCDs', 'Normalization tradeoffs'], prereqs: ['de-etl'],
        resources: [['Kimball Dimensional Modeling Resources', 'documentation', 'Kimball Group', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/']],
        tasks: [
          ["Read Kimball's dimensional modeling essentials", 'read'],
          ['Build: design a star schema for an e-commerce domain', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('In a star schema, facts are…', ['Descriptive attributes', 'Measurable events at a declared grain', 'Lookup tables', 'Slowly changing dimensions'], 1, 'Fact tables hold measurable events at a specific grain; dimensions carry the descriptive context.')],
        ],
      },
      {
        slug: 'de-dbt', name: 'dbt', subtitle: 'Data build tool',
        description: 'Transformations as code: models, tests, docs, and environments with dbt.',
        icon: 'code_blocks', estHours: 12, xp: 200,
        skills: ['Models', 'Tests', 'Jinja', 'Environments'], prereqs: ['de-modeling'],
        resources: [
          ['dbt Fundamentals Course', 'course', 'dbt Labs', 'https://courses.getdbt.com/courses/fundamentals'],
          ['Official dbt Docs', 'documentation', 'getdbt.com', 'https://docs.getdbt.com/'],
        ],
        tasks: [
          ['Complete dbt Fundamentals', 'watch'],
          ['Build: a dbt project with staging/marts models and tests', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('dbt primarily handles which part of ELT?', ['Extract', 'Load', 'Transform', 'Orchestration'], 2, 'dbt transforms data already loaded in the warehouse using SQL models with testing and docs.')],
        ],
      },
      {
        slug: 'de-orchestration', name: 'Workflow Orchestration', subtitle: 'Airflow / Prefect',
        description: 'Schedule, retry, and monitor DAGs of work that run production pipelines.',
        icon: 'published_with_changes', estHours: 12, xp: 200,
        skills: ['DAGs', 'Scheduling', 'Retries', 'Backfills'], prereqs: ['de-dbt'],
        resources: [['Astronomer Airflow Academy', 'course', 'Astronomer', 'https://academy.astronomer.io/']],
        tasks: [
          ['Work through Airflow fundamentals', 'watch'],
          ['Build: schedule your ETL pipeline as a DAG with retries and alerts', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A DAG in orchestration is…', ['A database table', 'A directed acyclic graph of tasks', 'A deployment artifact', 'A data quality rule'], 1, 'Workflows are modeled as directed acyclic graphs so dependencies run in order without cycles.')],
        ],
      },
      {
        slug: 'de-cloud', name: 'Cloud Platforms', subtitle: 'AWS / GCP',
        description: 'Object storage, warehouses, IAM, and the managed services data teams actually use.',
        icon: 'deployed_code', estHours: 14, xp: 200,
        skills: ['S3/GCS', 'BigQuery/Redshift', 'IAM', 'Cost basics'], prereqs: ['de-orchestration'],
        resources: [['AWS Skill Builder: Data Analytics', 'course', 'AWS', 'https://skillbuilder.aws/']],
        tasks: [
          ['Study object storage, warehouse, and IAM basics on one cloud', 'watch'],
          ['Build: deploy your pipeline to run on cloud infrastructure', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Object storage (S3/GCS) is best suited for…', ['Low-latency transactions', 'Files and immutable data at scale', 'Relational joins', 'In-memory caching'], 1, 'Object stores are cheap, durable homes for files and raw/lake data — not transactional workloads.')],
        ],
      },
      {
        slug: 'de-spark', name: 'Spark — Advanced', subtitle: 'Distributed compute',
        description: 'Partitioning, shuffles, and writing PySpark that scales past a single machine.',
        icon: 'memory', estHours: 16, xp: 250,
        skills: ['PySpark', 'Partitioning', 'Shuffles', 'Tuning'], prereqs: ['de-cloud'],
        resources: [['Spark SQL Programming Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/sql-programming-guide.html']],
        tasks: [
          ['Study the Spark SQL programming guide', 'read'],
          ['Build: process a dataset too large for pandas with PySpark', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A shuffle in Spark is expensive because…', ['It uses GPUs', 'Data moves across the network between partitions', 'It recompiles the job', 'It writes to the driver'], 1, 'Shuffles repartition data across executors over the network — the main cost to minimize in Spark jobs.')],
        ],
      },
      {
        slug: 'de-streaming', name: 'Real-time Streaming', subtitle: 'Kafka',
        description: 'Topics, consumer groups, and exactly-once thinking for event-driven pipelines.',
        icon: 'electric_bolt', estHours: 16, xp: 250,
        skills: ['Topics', 'Consumer groups', 'Delivery semantics'], prereqs: ['de-spark'],
        resources: [['Kafka 101', 'course', 'Confluent', 'https://developer.confluent.io/courses/apache-kafka/events/']],
        tasks: [
          ['Complete Kafka 101', 'watch'],
          ['Build: a producer/consumer pair processing events in real time', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Consumer groups in Kafka enable…', ['Message encryption', 'Parallel consumption with each partition read by one member', 'Schema validation', 'Exactly-once storage'], 1, 'Partitions are divided among group members, giving horizontal scale while preserving per-partition order.')],
        ],
      },
      {
        slug: 'de-vectordb', name: 'Vector DBs & LLM Infra', subtitle: 'Data for AI systems',
        description: 'Embeddings, vector stores, and the infrastructure that feeds LLM applications.',
        icon: 'biotech', estHours: 12, xp: 250,
        skills: ['Embeddings', 'Vector search', 'Chunking', 'Indexing'], prereqs: ['de-streaming'],
        resources: [['Vector Databases Explained', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/vector-database/']],
        tasks: [
          ['Read the vector database fundamentals guide', 'read'],
          ['Build: embed a document set and serve similarity search', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Embeddings are…', ['Compressed files', 'Dense vectors capturing semantic meaning', 'Database indexes', 'Encrypted tokens'], 1, 'Embeddings map text/images into dense vectors where semantic similarity becomes geometric closeness.')],
        ],
      },
    ],
  },
  {
    id: 'da',
    title: 'Data Analysis',
    description: 'Turn messy data into decisions. Master exploration, visualization, dashboards, and data storytelling.',
    icon: 'bar_chart',
    tags: ['EDA', 'Visualization', 'BI Tools', 'Storytelling'],
    requiresPaths: [],
    nodes: [
      {
        slug: 'da-eda', name: 'Exploratory Data Analysis', subtitle: 'Interrogate the data',
        description: 'Profile datasets, find outliers and patterns, and form hypotheses worth testing.',
        icon: 'find_in_page', estHours: 10, xp: 150,
        skills: ['Profiling', 'Outliers', 'Univariate/bivariate analysis'], prereqs: FOUNDATION_SLUGS,
        resources: [['Kaggle: Data Cleaning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/data-cleaning']],
        tasks: [
          ['Complete the data cleaning course', 'watch'],
          ['Build: a full EDA notebook on a dataset you have never seen', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('The first thing to check in a new dataset is…', ['Model accuracy', 'Missing values, types, and distributions', 'Dashboard colors', 'Feature importance'], 1, 'Profiling — completeness, types, ranges, distributions — comes before any analysis or modeling.')],
        ],
      },
      {
        slug: 'da-visualization', name: 'Data Visualization', subtitle: 'Matplotlib, Seaborn',
        description: 'Choose the right chart, encode honestly, and build plots people actually read.',
        icon: 'bar_chart', estHours: 10, xp: 150,
        skills: ['Chart choice', 'Matplotlib', 'Seaborn', 'Perception'], prereqs: ['da-eda'],
        resources: [['Storytelling with Data (blog)', 'article', 'SWD', 'https://www.storytellingwithdata.com/']],
        tasks: [
          ['Study chart-choice and perception principles', 'read'],
          ['Build: remake three bad charts into honest, readable ones', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('For comparing quantities across categories, prefer…', ['Pie chart', 'Bar chart', '3D surface', 'Word cloud'], 1, 'Length on a common baseline (bars) is the most accurately perceived encoding for comparisons.')],
        ],
      },
      {
        slug: 'da-dashboards', name: 'Dashboard Design', subtitle: 'Interfaces for decisions',
        description: 'Layout, hierarchy, and interactivity for dashboards that answer questions at a glance.',
        icon: 'dashboard', estHours: 10, xp: 150,
        skills: ['Layout', 'KPI design', 'Filters', 'Performance'], prereqs: ['da-visualization'],
        resources: [['Metabase: Dashboard Best Practices', 'article', 'Metabase Learn', 'https://www.metabase.com/learn/dashboards']],
        tasks: [
          ['Read dashboard design best practices', 'read'],
          ['Build: a KPI dashboard answering three stakeholder questions', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A good dashboard leads with…', ['Every available metric', 'The most decision-relevant KPIs', 'Raw tables', 'Filters'], 1, 'Hierarchy matters: the questions users came to answer belong at the top, detail below.')],
        ],
      },
      {
        slug: 'da-storytelling', name: 'Data Storytelling', subtitle: 'Insight to action',
        description: 'Structure findings as narratives that move stakeholders to a decision.',
        icon: 'edit_note', estHours: 8, xp: 150,
        skills: ['Narrative structure', 'Executive summaries', 'Presenting'], prereqs: ['da-dashboards'],
        resources: [['SWD Podcast & Exercises', 'article', 'SWD', 'https://community.storytellingwithdata.com/exercises']],
        tasks: [
          ['Work through storytelling-with-data exercises', 'read'],
          ['Build: a 5-slide narrative from one of your analyses', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A data story should end with…', ['The methodology', 'A recommended action', 'All caveats', 'The raw data'], 1, 'Analyses drive decisions: close with the action the evidence supports, then back it up.')],
        ],
      },
      {
        slug: 'da-bi', name: 'BI Tools', subtitle: 'Looker, Power BI, Metabase',
        description: 'Model metrics once, serve them everywhere: semantic layers and governed self-serve BI.',
        icon: 'query_stats', estHours: 12, xp: 200,
        skills: ['Semantic models', 'Power BI', 'Metabase', 'Governance'], prereqs: ['da-storytelling'],
        resources: [['Microsoft Learn: Power BI', 'course', 'Microsoft', 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi']],
        tasks: [
          ['Complete a Power BI (or Metabase) learning path', 'watch'],
          ['Build: publish a governed dashboard with a shared metric definition', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A semantic layer exists to…', ['Speed up SQL', 'Define metrics once and reuse everywhere', 'Replace the warehouse', 'Encrypt data'], 1, 'Semantic layers centralize metric definitions so every tool and team reports the same numbers.')],
        ],
      },
      {
        slug: 'da-ai-analysis', name: 'AI-Assisted Analysis', subtitle: 'Analyst + LLM',
        description: 'Use LLMs to speed up cleaning, coding, and interpretation without losing rigor.',
        icon: 'auto_awesome', estHours: 8, xp: 200,
        skills: ['Prompting for analysis', 'Validation', 'Automation'], prereqs: ['da-bi'],
        resources: [['Prompt Engineering Guide', 'documentation', 'promptingguide.ai', 'https://www.promptingguide.ai/']],
        tasks: [
          ['Study prompting patterns for analysis work', 'read'],
          ['Build: run an analysis with an LLM assistant and validate every claim', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('When an LLM produces an analysis claim, you should…', ['Ship it', 'Verify it against the data before using it', 'Ask it to be confident', 'Lower the temperature'], 1, 'LLMs speed up analysis but hallucinate; every number and claim must be validated against the source data.')],
        ],
      },
    ],
  },
  {
    id: 'ds',
    title: 'Data Science',
    description: 'Model, test, and explain predictions. From ML fundamentals through deployment and LLM fine-tuning.',
    icon: 'model_training',
    tags: ['ML', 'Experimentation', 'Deployment', 'Deep Learning'],
    requiresPaths: [],
    nodes: [
      {
        slug: 'ds-ml', name: 'ML Fundamentals', subtitle: 'Supervised learning core',
        description: 'Regression, classification, overfitting, and the bias-variance tradeoff in practice.',
        icon: 'model_training', estHours: 14, xp: 200,
        skills: ['Regression', 'Classification', 'Bias-variance', 'scikit-learn'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['Kaggle: Intro to Machine Learning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-machine-learning'],
          ['scikit-learn User Guide', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/user_guide.html'],
        ],
        tasks: [
          ['Complete the intro ML course', 'watch'],
          ['Build: train and compare two models on a tabular dataset', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('High training accuracy but poor test accuracy indicates…', ['Underfitting', 'Overfitting', 'Data leakage is impossible', 'A perfect model'], 1, 'The model memorized training data instead of generalizing — the classic overfitting signature.')],
        ],
      },
      {
        slug: 'ds-features', name: 'Feature Engineering', subtitle: 'Signal from raw data',
        description: 'Encodings, scaling, leakage traps, and features that actually move metrics.',
        icon: 'settings_input_component', estHours: 10, xp: 150,
        skills: ['Encodings', 'Scaling', 'Leakage', 'Selection'], prereqs: ['ds-ml'],
        resources: [['Kaggle: Feature Engineering', 'course', 'Kaggle', 'https://www.kaggle.com/learn/feature-engineering']],
        tasks: [
          ['Complete the feature engineering course', 'watch'],
          ['Build: engineer features that measurably beat the raw baseline', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Data leakage means…', ['Missing values', 'Information from the target/future leaking into features', 'Slow training', 'Too many features'], 1, 'Leakage lets the model peek at information unavailable at prediction time, inflating offline metrics.')],
        ],
      },
      {
        slug: 'ds-evaluation', name: 'Model Building & Evaluation', subtitle: 'Beyond accuracy',
        description: 'Cross-validation, metrics that match the business problem, and honest baselines.',
        icon: 'verified', estHours: 12, xp: 200,
        skills: ['Cross-validation', 'Metrics', 'Baselines', 'Calibration'], prereqs: ['ds-features'],
        resources: [['scikit-learn: Model Evaluation', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/model_evaluation.html']],
        tasks: [
          ['Study evaluation metrics and cross-validation', 'read'],
          ['Build: an evaluation report with CV, baselines, and the right metric', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('For imbalanced classification, accuracy is misleading because…', ['It is slow', 'Predicting the majority class scores high', 'It needs GPUs', 'It requires calibration'], 1, 'With 99/1 class balance, always predicting the majority hits 99% accuracy while catching nothing.')],
        ],
      },
      {
        slug: 'ds-experiments', name: 'Experimentation & A/B Testing', subtitle: 'Causal by design',
        description: 'Design experiments, size samples, and read results without fooling yourself.',
        icon: 'biotech', estHours: 12, xp: 200,
        skills: ['Experiment design', 'Power', 'Significance', 'Pitfalls'], prereqs: ['ds-evaluation'],
        resources: [['Trustworthy Online Controlled Experiments (notes)', 'article', 'exp-platform.com', 'https://exp-platform.com/']],
        tasks: [
          ['Study experiment design and statistical power', 'read'],
          ['Build: design an A/B test plan with hypothesis, sample size, and decision rule', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Peeking at A/B results daily and stopping early…', ['Is best practice', 'Inflates false positives', 'Reduces variance', 'Has no effect'], 1, 'Repeated significance checks without correction dramatically inflate the false-positive rate.')],
        ],
      },
      {
        slug: 'ds-deployment', name: 'Model Deployment', subtitle: 'Models as services',
        description: 'Package and serve models behind APIs with versioning and rollback.',
        icon: 'publish', estHours: 12, xp: 200,
        skills: ['FastAPI', 'Serialization', 'Versioning', 'Rollback'], prereqs: ['ds-experiments'],
        resources: [['FastAPI Docs', 'documentation', 'fastapi.tiangolo.com', 'https://fastapi.tiangolo.com/']],
        tasks: [
          ['Study FastAPI model-serving patterns', 'read'],
          ['Build: serve a trained model behind a versioned REST endpoint', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Model artifacts should be…', ['Retrained per request', 'Versioned and loaded at startup', 'Stored in the client', 'Hardcoded'], 1, 'Versioned artifacts loaded at startup give reproducible, fast inference and clean rollbacks.')],
        ],
      },
      {
        slug: 'ds-deeplearning', name: 'Deep Learning — Advanced', subtitle: 'Neural networks',
        description: 'Backprop intuition, CNNs/transformers, and training discipline with PyTorch.',
        icon: 'psychology', estHours: 18, xp: 250,
        skills: ['PyTorch', 'CNNs', 'Transformers', 'Training loops'], prereqs: ['ds-deployment'],
        resources: [['Practical Deep Learning for Coders', 'course', 'fast.ai', 'https://course.fast.ai/']],
        tasks: [
          ['Work through fast.ai practical deep learning', 'watch'],
          ['Build: fine-tune a pretrained network on your own image/text data', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Transfer learning works because…', ['Small data trains from scratch', 'Early layers learn reusable general features', 'GPUs are fast', 'Labels are optional'], 1, 'Pretrained networks capture general features; fine-tuning adapts them to your task with little data.')],
        ],
      },
      {
        slug: 'ds-llm', name: 'LLM Fine-tuning & RAG', subtitle: 'Adapt foundation models',
        description: 'Fine-tuning versus retrieval, dataset curation, and evaluating LLM output.',
        icon: 'smart_toy', estHours: 16, xp: 250,
        skills: ['Fine-tuning', 'RAG', 'Dataset curation', 'Evals'], prereqs: ['ds-deeplearning'],
        resources: [['Hugging Face NLP Course', 'course', 'Hugging Face', 'https://huggingface.co/learn/nlp-course']],
        tasks: [
          ['Complete the Hugging Face NLP course core chapters', 'watch'],
          ['Build: compare a RAG baseline vs fine-tuning on one task, with evals', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Prefer RAG over fine-tuning when…', ['Knowledge changes frequently', 'You need a new output style', 'Latency must be minimal', 'You have no documents'], 0, 'RAG serves fresh, updatable knowledge at query time; fine-tuning bakes behavior/style into weights.')],
        ],
      },
    ],
  },
  {
    id: 'ai-engineering',
    title: 'AI Engineering',
    description: 'Build useful AI products. LLM orchestration, RAG systems, agents, and production AI architecture.',
    icon: 'smart_toy',
    tags: ['LLM APIs', 'RAG', 'Agents', 'LLMOps'],
    requiresPaths: ['de', 'ds'],
    nodes: [
      {
        slug: 'ai-llm-apis', name: 'LLM APIs & Orchestration', subtitle: 'OpenAI, Anthropic, Gemini',
        description: 'Structured outputs, tool use, streaming, and orchestrating multi-step LLM calls.',
        icon: 'smart_toy', estHours: 12, xp: 250,
        skills: ['Tool use', 'Structured output', 'Streaming', 'Orchestration'], prereqs: [],
        resources: [['Anthropic API Docs', 'documentation', 'Anthropic', 'https://docs.anthropic.com/']],
        tasks: [
          ['Study tool use, structured outputs, and streaming in the API docs', 'read'],
          ['Build: a CLI app using tool calls and streamed responses', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Tool use lets an LLM…', ['Train itself', 'Call functions you define and use the results', 'Access weights', 'Skip safety'], 1, 'You declare tools; the model requests calls with arguments and incorporates your returned results.')],
        ],
      },
      {
        slug: 'ai-rag', name: 'RAG System Design', subtitle: 'Retrieval done right',
        description: 'Chunking, hybrid search, reranking, and grounding answers in your own data.',
        icon: 'find_in_page', estHours: 14, xp: 250,
        skills: ['Chunking', 'Hybrid search', 'Reranking', 'Grounding'], prereqs: ['ai-llm-apis'],
        resources: [['Retrieval-Augmented Generation Guide', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/retrieval-augmented-generation/']],
        tasks: [
          ['Study chunking, hybrid retrieval, and reranking', 'read'],
          ['Build: a RAG system over your own documents with cited answers', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Reranking improves RAG by…', ['Making embeddings smaller', 'Reordering retrieved candidates by relevance before generation', 'Caching responses', 'Increasing chunk size'], 1, 'A reranker scores query-document pairs precisely, promoting the truly relevant chunks into context.')],
        ],
      },
      {
        slug: 'ai-agents', name: 'AI Agents & Tool Use', subtitle: 'Systems that act',
        description: 'Agent loops, tool design, guardrails, and when not to build an agent.',
        icon: 'smart_toy', estHours: 14, xp: 250,
        skills: ['Agent loops', 'Tool design', 'Guardrails', 'Memory'], prereqs: ['ai-rag'],
        resources: [['Building Effective Agents', 'article', 'Anthropic', 'https://www.anthropic.com/research/building-effective-agents']],
        tasks: [
          ['Read Building Effective Agents', 'read'],
          ['Build: an agent with 2–3 tools, guardrails, and a stop condition', 'build'],
          ['Checkpoint quiz', 'quiz', quiz("Per Anthropic's guidance, you should reach for an agent when…", ['Always', "A workflow's steps cannot be predetermined", 'Latency is critical', 'Costs must be fixed'], 1, 'If the path is predictable, a fixed workflow is cheaper and more reliable; agents earn their cost on open-ended tasks.')],
        ],
      },
      {
        slug: 'ai-multimodal', name: 'Multimodal Systems', subtitle: 'Beyond text',
        description: 'Vision, audio, and document understanding in production workflows.',
        icon: 'smart_display', estHours: 12, xp: 250,
        skills: ['Vision', 'Audio', 'Document AI'], prereqs: ['ai-agents'],
        resources: [['Vision API Cookbooks', 'documentation', 'Anthropic', 'https://docs.anthropic.com/en/docs/build-with-claude/vision']],
        tasks: [
          ['Study vision/document understanding patterns', 'read'],
          ['Build: an app that extracts structured data from images or PDFs', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('For extracting fields from documents, the most robust approach is…', ['Regex on OCR text only', 'Multimodal model with a strict output schema and validation', 'Manual entry', 'Screenshots in prompts without structure'], 1, 'Schema-constrained multimodal extraction plus validation catches errors that brittle regex/OCR pipelines miss.')],
        ],
      },
      {
        slug: 'ai-llmops', name: 'LLMOps & Evaluation', subtitle: 'Measure or guess',
        description: 'Eval suites, regression testing prompts, observability, and cost control.',
        icon: 'analytics', estHours: 12, xp: 250,
        skills: ['Evals', 'Prompt regression', 'Tracing', 'Cost control'], prereqs: ['ai-multimodal'],
        resources: [['Your Guide to LLM Evals', 'article', 'Eugene Yan', 'https://eugeneyan.com/writing/llm-evaluators/']],
        tasks: [
          ['Study LLM evaluation approaches', 'read'],
          ['Build: an eval suite that gates a prompt change in CI', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Prompt changes should ship only after…', ['Manual vibes check', 'Passing a regression eval suite', 'A bigger model is used', 'Temperature is zeroed'], 1, 'Evals turn prompt engineering into engineering: regressions get caught before users see them.')],
        ],
      },
      {
        slug: 'ai-product', name: 'AI Product Design', subtitle: 'Architecture end-to-end',
        description: 'Design a full AI product: latency budgets, fallbacks, UX for uncertainty.',
        icon: 'explore', estHours: 14, xp: 300,
        skills: ['Latency budgets', 'Fallbacks', 'UX for AI', 'Architecture'], prereqs: ['ai-llmops'],
        resources: [['AI Engineering (book notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/blog/']],
        tasks: [
          ['Study AI product architecture patterns', 'read'],
          ['Build: design doc + prototype for an AI product with fallbacks and latency budget', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('When the model fails or times out, a production AI product should…', ['Show a stack trace', 'Degrade gracefully to a designed fallback', 'Retry forever', 'Block the UI'], 1, 'Fallbacks (cached answers, simpler models, honest empty states) are part of the product design, not an afterthought.')],
        ],
      },
    ],
  },
  {
    id: 'mlops',
    title: 'MLOps',
    description: 'Ship and run models in production. Containers, CI/CD for ML, monitoring, and platform design.',
    icon: 'settings_suggest',
    tags: ['Docker', 'CI/CD', 'Monitoring', 'Platforms'],
    requiresPaths: ['de', 'ds'],
    nodes: [
      {
        slug: 'ml-docker', name: 'Docker & Containerization', subtitle: 'Reproducible everything',
        description: 'Images, layers, and packaging ML workloads that run the same everywhere.',
        icon: 'deployed_code', estHours: 10, xp: 200,
        skills: ['Dockerfiles', 'Layers', 'Compose', 'Registries'], prereqs: [],
        resources: [['Docker Getting Started', 'documentation', 'Docker', 'https://docs.docker.com/get-started/']],
        tasks: [
          ['Work through Docker getting started', 'read'],
          ['Build: containerize a model service with a slim, reproducible image', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Docker image layers are…', ['Random snapshots', 'Cached filesystem diffs created per instruction', 'VM disks', 'Encrypted volumes'], 1, 'Each Dockerfile instruction creates a cached layer; ordering instructions well makes rebuilds fast.')],
        ],
      },
      {
        slug: 'ml-cicd', name: 'CI/CD for ML', subtitle: 'Automate the path to prod',
        description: 'Pipelines that test data, code, and models before anything ships.',
        icon: 'published_with_changes', estHours: 12, xp: 200,
        skills: ['GitHub Actions', 'Model tests', 'Artifacts', 'Environments'], prereqs: ['ml-docker'],
        resources: [['GitHub Actions Docs', 'documentation', 'GitHub', 'https://docs.github.com/en/actions']],
        tasks: [
          ['Study GitHub Actions pipelines', 'read'],
          ['Build: a CI pipeline that tests data, code, and model quality before deploy', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('CI for ML differs from app CI because it must also validate…', ['Only code style', 'Data and model quality', 'Commit messages', 'Branch names'], 1, 'ML behavior depends on data and weights, so pipelines test datasets and model metrics, not just code.')],
        ],
      },
      {
        slug: 'ml-monitoring', name: 'Monitoring & Drift', subtitle: 'Know when models rot',
        description: 'Data drift, concept drift, and alerting on the metrics that predict failure.',
        icon: 'analytics', estHours: 12, xp: 250,
        skills: ['Data drift', 'Concept drift', 'Alerting', 'Dashboards'], prereqs: ['ml-cicd'],
        resources: [['Evidently AI: ML Monitoring Guides', 'article', 'Evidently', 'https://www.evidentlyai.com/ml-in-production/model-monitoring']],
        tasks: [
          ['Study drift detection and ML monitoring', 'read'],
          ['Build: a monitoring dashboard that alerts on input drift', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('Concept drift means…', ['Inputs changed distribution', 'The relationship between inputs and target changed', 'The model file corrupted', 'Latency increased'], 1, "Concept drift is when P(y|x) changes — the world's behavior shifted, so the learned mapping decays.")],
        ],
      },
      {
        slug: 'ml-production', name: 'Production ML Systems', subtitle: 'Serving at scale',
        description: 'Batch vs online serving, feature stores, and latency/throughput tradeoffs.',
        icon: 'memory', estHours: 14, xp: 250,
        skills: ['Serving patterns', 'Feature stores', 'Scaling', 'Caching'], prereqs: ['ml-monitoring'],
        resources: [['Designing Machine Learning Systems (notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/machine-learning-systems-design/toc.html']],
        tasks: [
          ['Study serving patterns and feature stores', 'read'],
          ['Build: an online + batch serving path for the same model', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A feature store primarily solves…', ['GPU scheduling', 'Consistent features between training and serving', 'Model compression', 'Data visualization'], 1, 'Training/serving skew disappears when both read identical feature definitions from one store.')],
        ],
      },
      {
        slug: 'ml-platform', name: 'ML Platform Design', subtitle: 'End-to-end ownership',
        description: 'Design the platform: from experiment tracking to deployment paths for a whole team.',
        icon: 'schema', estHours: 16, xp: 300,
        skills: ['Experiment tracking', 'Registries', 'Platform architecture'], prereqs: ['ml-production'],
        resources: [['MLOps Zoomcamp', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/mlops-zoomcamp']],
        tasks: [
          ['Work through the MLOps Zoomcamp capstone material', 'watch'],
          ['Build: an end-to-end platform design doc — tracking, registry, deploy paths', 'build'],
          ['Checkpoint quiz', 'quiz', quiz('A model registry provides…', ['Faster training', 'Versioned, stage-managed models with lineage', 'Data labeling', 'Feature computation'], 1, 'Registries track model versions, stages (staging/prod), and lineage — the backbone of controlled deployment.')],
        ],
      },
    ],
  },
];

// ── Flattened, DB-row-shaped exports (id === slug in local mode) ──

export const PATHS: PathRow[] = PATH_DEFS.map((p, i) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  icon: p.icon,
  tags: p.tags,
  order: i,
  requires_paths: p.requiresPaths,
}));

export const NODES: NodeRow[] = PATH_DEFS.flatMap((p) =>
  p.nodes.map((n, i) => ({
    id: n.slug,
    slug: n.slug,
    path_id: p.id,
    name: n.name,
    subtitle: n.subtitle,
    description: n.description,
    icon: n.icon,
    order: i + 1,
    est_hours: n.estHours,
    xp_reward: n.xp,
    skills: n.skills,
    created_at: '',
  })),
);

export const PREREQUISITES: Record<string, string[]> = Object.fromEntries(
  PATH_DEFS.flatMap((p) => p.nodes.map((n) => [n.slug, n.prereqs])),
);

export const RESOURCES: ResourceRow[] = PATH_DEFS.flatMap((p) =>
  p.nodes.flatMap((n) =>
    n.resources.map(([name, type, platform, url], i) => ({
      id: `${n.slug}::r${i}`,
      node_id: n.slug,
      name,
      type,
      platform,
      url,
      cost: 'free' as const,
      avg_rating: 0,
      rating_count: 0,
      created_at: '',
    })),
  ),
);

export const TASKS: TaskRow[] = PATH_DEFS.flatMap((p) =>
  p.nodes.flatMap((n) =>
    n.tasks.map(([description, type, quizPayload], i) => ({
      id: `${n.slug}::t${i}`,
      node_id: n.slug,
      description,
      type,
      order: i + 1,
      quiz: quizPayload ?? null,
    })),
  ),
);

export const PATH_IDS = PATHS.map((p) => p.id);
export const SPECIALIZATION_PATHS = PATHS.filter((p) => p.id !== 'foundations');
