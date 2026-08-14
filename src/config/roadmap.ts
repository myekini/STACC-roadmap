// Stacc Roadmap content — mirrors supabase/seed.sql exactly.
// In Supabase mode content comes from the database; in localStorage demo mode it
// comes from here. Node ids equal slugs locally so progress keys stay stable.
//
// Editorial rules (keep the tree readable, not just complete):
//  - Exactly 3 skills per node — more than that fans too many chips off one
//    module on the roadmap and the progression reads as noise instead of a path.
//  - Exactly 2 curated resources per node — one primary course/video, one
//    reference doc to come back to. Every URL below is a stable, well-known
//    official domain (project docs, a maintained course, or a canonical repo).
import type {
  ChallengePayload,
  NodeRow,
  PathRow,
  QuizPayload,
  QuizQuestion,
  ResourceRow,
  ResourceType,
  TaskRow,
  TaskType,
} from '@/lib/database.types';

type SqlRow = Record<string, unknown>;

type ResourceDef = [name: string, type: ResourceType, platform: string, url: string];
type TaskDef = [description: string, type: TaskType, payload?: QuizPayload | ChallengePayload];

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

const q = (question: string, options: string[], correctIndex: number, explanation: string): QuizQuestion => ({
  question,
  options,
  correctIndex,
  explanation,
});

const quiz = (...questions: QuizQuestion[]): QuizPayload => ({ questions });

const challenge = (prompt: string, starterCode: string, testCode: string): ChallengePayload => ({
  language: 'python',
  prompt,
  starterCode,
  testCode,
});

const sqlChallenge = (prompt: string, starterCode: string, setupSql: string, expectedRows: SqlRow[]): ChallengePayload => ({
  language: 'sql',
  prompt,
  starterCode,
  setupSql,
  expectedRows,
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
        skills: ['Python syntax', 'Functions', 'Pandas intro'], prereqs: [],
        resources: [
          ['Python for Everybody — Full Course', 'video', 'YouTube (freeCodeCamp)', 'https://www.youtube.com/watch?v=8DvywoWv6fI'],
          ['Pandas Getting Started Guide', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/getting_started/index.html'],
        ],
        tasks: [
          ['Work through the core Python course modules', 'watch'],
          ['Build: clean a messy CSV with pandas and export a tidy dataset', 'build'],
          ['Checkpoint challenge: clean_scores(values)', 'challenge', challenge(
            'Write clean_scores(values): drop every None entry and duplicate value, then return what remains sorted ascending. This exact shape — strip the junk, dedupe, sort — is what you do to real data constantly.',
            'def clean_scores(values):\n    """Remove None entries and duplicates, then return the list sorted ascending."""\n    # your code here\n    pass\n',
            'assert clean_scores([3, 1, None, 2, 3, None, 1]) == [1, 2, 3]\n'
              + 'assert clean_scores([]) == []\n'
              + 'assert clean_scores([5, 5, 5]) == [5]\n'
              + 'assert clean_scores([None, None]) == []\n'
              + 'assert clean_scores([-1, 0, None, -1, 2]) == [-1, 0, 2]\n',
          )],
        ],
      },
      {
        slug: 'found-sql', name: 'SQL Basics', subtitle: 'Query like you mean it',
        description: 'SELECT, JOIN, GROUP BY, and window-function fundamentals against a real database.',
        icon: 'database', estHours: 10, xp: 100,
        skills: ['SELECT & joins', 'Aggregation', 'Window functions'], prereqs: [],
        resources: [
          ['Kaggle: Intro to SQL', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-sql'],
          ['SQLBolt Interactive Lessons', 'article', 'SQLBolt', 'https://sqlbolt.com/'],
        ],
        tasks: [
          ['Complete the interactive SQL lessons', 'read'],
          ['Build: answer 5 business questions against a sample database', 'build'],
          ['Checkpoint challenge: paying customers over $50', 'challenge', sqlChallenge(
            "Table orders(id, customer, amount, status). Write a query that returns each customer's total spend from status = 'paid' orders only, as columns customer and total — only customers with total > 50, ordered by total descending.",
            '-- orders(id, customer, amount, status)\n-- customer, total (sum of paid amounts) where total > 50, ordered by total desc\nSELECT\n',
            "CREATE TABLE orders (id INTEGER, customer TEXT, amount REAL, status TEXT);\n"
              + "INSERT INTO orders VALUES\n"
              + "  (1, 'Ada', 120.0, 'paid'),\n"
              + "  (2, 'Grace', 45.5, 'paid'),\n"
              + "  (3, 'Ada', 60.0, 'refunded'),\n"
              + "  (4, 'Linus', 200.0, 'paid'),\n"
              + "  (5, 'Grace', 15.0, 'paid'),\n"
              + "  (6, 'Zoe', 10.0, 'paid');",
            [
              { customer: 'Linus', total: 200 },
              { customer: 'Ada', total: 120 },
              { customer: 'Grace', total: 60.5 },
            ],
          )],
        ],
      },
      {
        slug: 'found-git', name: 'Git & GitHub', subtitle: 'Version everything',
        description: 'Branch, commit, merge, and collaborate through pull requests without fear.',
        icon: 'account_tree', estHours: 6, xp: 75,
        skills: ['Commits & branching', 'Pull requests', 'Merge conflicts'], prereqs: [],
        resources: [
          ['Pro Git Book (ch. 1–3)', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'],
          ['GitHub Skills', 'course', 'GitHub', 'https://skills.github.com/'],
        ],
        tasks: [
          ['Read Pro Git chapters 1–3', 'read'],
          ['Build: open a pull request with a reviewed change on your own repo', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Pro Git, what does git rebase do compared to merge?', ['Deletes the branch', 'Replays commits onto a new base for linear history', 'Creates a merge commit', 'Pushes to remote'], 1, 'Rebase replays your commits on top of another base commit, producing a linear history; merge preserves both histories with a merge commit.'),
            q('You rebased a feature branch onto main and force-pushed. A teammate who already pulled the old branch now sees duplicate commits and conflicts. What is the safe fix?', ['Tell them to git pull again', 'Tell them to force-pull with --rebase or re-clone the branch, since rewritten history diverged from their local copy', 'Revert the rebase on main', 'Delete their local repo'], 1, 'Rebasing rewrites commit SHAs; anyone with the old branch must reset onto the new history (fetch + reset --hard, or a rebase pull) rather than merge the two diverging histories.'),
            q('A bug was introduced somewhere in the last 40 commits but you don’t know which one. What is the fastest way to find it?', ['Read every diff manually', 'git bisect, binary-searching commits by testing good/bad', 'git blame on the whole file', 'Revert commits one at a time'], 1, 'git bisect binary searches the commit range in O(log n) tests instead of a linear scan, which is why it is the standard tool for regression hunting.'),
          )],
        ],
      },
      {
        slug: 'found-cli', name: 'Command Line', subtitle: 'Live in the terminal',
        description: 'Navigate, inspect, and automate with the shell — the environment every data tool assumes.',
        icon: 'terminal', estHours: 5, xp: 75,
        skills: ['Navigation & pipes', 'Permissions', 'Shell scripts'], prereqs: [],
        resources: [
          ['The Missing Semester: Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2020/course-shell/'],
          ['Linux Command Line Basics', 'article', 'Ubuntu', 'https://ubuntu.com/tutorials/command-line-for-beginners'],
        ],
        tasks: [
          ['Watch the Missing Semester shell lecture', 'watch'],
          ['Build: write a shell script that organizes files by extension', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('In the Missing Semester shell lecture, which operator sends the output of one command into another?', ['>', '>>', '|', '&'], 2, 'The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files.'),
            q('You need to find every .csv file under a directory tree modified in the last 24 hours and count their lines. Which pipeline does that correctly?', ['cat *.csv | wc -l', 'find . -name "*.csv" -mtime -1 | xargs wc -l', 'ls -R | grep csv | head', 'grep -r csv . | wc -l'], 1, 'find locates files by name/pattern and mtime across a tree; piping to xargs wc -l runs the count over each match — the standard composable shell idiom.'),
            q('A long-running script you started in a terminal needs to keep running after you close the SSH session. What is the correct approach?', ['Just close the terminal, it keeps running', 'Run it with nohup/disown or inside tmux/screen so it detaches from the session', 'Run it with sudo', 'Pipe it to /dev/null'], 1, 'Closing a terminal sends SIGHUP to child processes by default; nohup or a multiplexer (tmux/screen) detaches the process from the controlling session so it survives disconnect.'),
          )],
        ],
      },
      {
        slug: 'found-stats', name: 'Statistics Basics', subtitle: 'Think in distributions',
        description: 'Descriptive stats, distributions, sampling, and the difference between correlation and causation.',
        icon: 'insights', estHours: 10, xp: 100,
        skills: ['Distributions & sampling', 'Hypothesis testing', 'Correlation vs causation'], prereqs: ['found-python'],
        resources: [
          ['Seeing Theory (Visual Probability)', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'],
          ['Khan Academy: Statistics', 'course', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability'],
        ],
        tasks: [
          ['Explore distributions and inference on Seeing Theory', 'read'],
          ['Build: analyze a dataset and report mean/median skew with plots', 'build'],
          ['Checkpoint challenge: describe(values)', 'challenge', challenge(
            'Write describe(values): return a (mean, median, population-stdev) tuple. These three numbers are the first thing you compute on any new dataset — mean and median tell you if it is skewed, stdev tells you how spread out it is.',
            'from statistics import mean, median, pstdev\n\ndef describe(values):\n    """Return (mean, median, population-stdev) as a tuple of floats."""\n    # your code here\n    pass\n',
            'assert describe([2, 4, 4, 4, 5, 5, 7, 9]) == (5.0, 4.5, 2.0)\n'
              + 'assert describe([10, 10, 10]) == (10.0, 10.0, 0.0)\n'
              + 'import math\n'
              + 'm, md, sd = describe([1, 2, 3, 4])\n'
              + 'assert m == 2.5 and md == 2.5 and math.isclose(sd, 1.1180339887498949, rel_tol=1e-9)\n',
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Karpathy's Intro to Large Language Models, LLMs generate text by…", ['Querying a database of answers', 'Predicting the next token', 'Running rule-based grammar', 'Searching the web'], 1, 'LLMs are next-token predictors trained on large corpora; they do not look up answers in a database.'),
            q('A model confidently cites a specific statistic that does not appear anywhere in your source documents. What is this failure mode called, and why does it happen?', ['A bug — it should be reported', 'Hallucination — the model generates plausible-sounding tokens even without grounding, since it optimizes for likely continuations, not truth', 'Overfitting on your prompt', 'A tokenizer error'], 1, 'Hallucination is a direct consequence of next-token prediction: the model produces statistically plausible text, which is not the same as verified fact — this is why grounding (RAG) and validation matter.'),
            q('Doubling a model’s context window lets you paste in a much longer document, but responses get noticeably worse at using facts from the middle of it. What does this describe?', ['The model is broken', 'Lost-in-the-middle effect — attention degrades for information placed away from the start/end of a long context', 'A tokenizer limit', 'Rate limiting'], 1, 'Empirically, models attend most reliably to the beginning and end of long contexts; relevant facts buried in the middle are recalled less accurately — a key reason retrieval/ranking still matters even with huge context windows.'),
          )],
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
        resources: [
          ['Data Engineering Zoomcamp — Lecture Playlist', 'video', 'YouTube (DataTalksClub)', 'https://www.youtube.com/playlist?list=PL3MmuxUbc_hJed7dXYoJw8DoCuVHhGEQb'],
          ['The Data Engineering Cookbook', 'documentation', 'Andreas Kretz (GitHub)', 'https://github.com/andkret/Cookbook'],
        ],
        tasks: [
          ['Study the ingestion + ETL weeks of the DE Zoomcamp', 'watch'],
          ['Build: a pipeline that ingests a public API into a database daily', 'build'],
        ],
      },
      {
        slug: 'de-modeling', name: 'Data Modeling', subtitle: 'Dimensional modeling',
        description: 'Star schemas, slowly changing dimensions, and the tradeoffs of normalization.',
        icon: 'schema', estHours: 12, xp: 150,
        skills: ['Star schema', 'SCDs', 'Normalization tradeoffs'], prereqs: ['de-etl'],
        resources: [
          ['Kimball Dimensional Modeling Resources', 'documentation', 'Kimball Group', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/'],
          ['dbt: How We Structure Our dbt Projects', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview'],
        ],
        tasks: [
          ["Read Kimball's dimensional modeling essentials", 'read'],
          ['Build: design a star schema for an e-commerce domain', 'build'],
        ],
      },
      {
        slug: 'de-dbt', name: 'dbt', subtitle: 'Data build tool',
        description: 'Transformations as code: models, tests, docs, and environments with dbt.',
        icon: 'code_blocks', estHours: 12, xp: 200,
        skills: ['Models & tests', 'Jinja macros', 'Environments'], prereqs: ['de-modeling'],
        resources: [
          ['dbt Fundamentals Course', 'course', 'dbt Labs', 'https://courses.getdbt.com/courses/fundamentals'],
          ['Official dbt Docs', 'documentation', 'getdbt.com', 'https://docs.getdbt.com/'],
        ],
        tasks: [
          ['Complete dbt Fundamentals', 'watch'],
          ['Build: a dbt project with staging/marts models and tests', 'build'],
        ],
      },
      {
        slug: 'de-orchestration', name: 'Workflow Orchestration', subtitle: 'Airflow / Prefect',
        description: 'Schedule, retry, and monitor DAGs of work that run production pipelines.',
        icon: 'published_with_changes', estHours: 12, xp: 200,
        skills: ['DAGs & scheduling', 'Retries', 'Backfills'], prereqs: ['de-dbt'],
        resources: [
          ['Astronomer Airflow Academy', 'course', 'Astronomer', 'https://academy.astronomer.io/'],
          ['Airflow Documentation: Core Concepts', 'documentation', 'Apache Airflow', 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html'],
        ],
        tasks: [
          ['Work through Airflow fundamentals', 'watch'],
          ['Build: schedule your ETL pipeline as a DAG with retries and alerts', 'build'],
        ],
      },
      {
        slug: 'de-cloud', name: 'Cloud Platforms', subtitle: 'AWS / GCP',
        description: 'Object storage, warehouses, IAM, and the managed services data teams actually use.',
        icon: 'deployed_code', estHours: 14, xp: 200,
        skills: ['Object storage', 'Cloud warehouses', 'IAM & cost basics'], prereqs: ['de-orchestration'],
        resources: [
          ['AWS Skill Builder: Data Analytics', 'course', 'AWS', 'https://skillbuilder.aws/'],
          ['Google Cloud Architecture Center', 'documentation', 'Google Cloud', 'https://cloud.google.com/architecture'],
        ],
        tasks: [
          ['Study object storage, warehouse, and IAM basics on one cloud', 'watch'],
          ['Build: deploy your pipeline to run on cloud infrastructure', 'build'],
        ],
      },
      {
        slug: 'de-spark', name: 'Spark — Advanced', subtitle: 'Distributed compute',
        description: 'Partitioning, shuffles, and writing PySpark that scales past a single machine.',
        icon: 'memory', estHours: 16, xp: 250,
        skills: ['PySpark', 'Partitioning & shuffles', 'Performance tuning'], prereqs: ['de-cloud'],
        resources: [
          ['Spark SQL Programming Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/sql-programming-guide.html'],
          ['Spark Tuning Guide', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/tuning.html'],
        ],
        tasks: [
          ['Study the Spark SQL programming guide', 'read'],
          ['Build: process a dataset too large for pandas with PySpark', 'build'],
        ],
      },
      {
        slug: 'de-streaming', name: 'Real-time Streaming', subtitle: 'Kafka',
        description: 'Topics, consumer groups, and exactly-once thinking for event-driven pipelines.',
        icon: 'electric_bolt', estHours: 16, xp: 250,
        skills: ['Topics', 'Consumer groups', 'Delivery semantics'], prereqs: ['de-spark'],
        resources: [
          ['Kafka 101', 'course', 'Confluent', 'https://developer.confluent.io/courses/apache-kafka/events/'],
          ['Apache Kafka Documentation', 'documentation', 'Apache Kafka', 'https://kafka.apache.org/documentation/'],
        ],
        tasks: [
          ['Complete Kafka 101', 'watch'],
          ['Build: a producer/consumer pair processing events in real time', 'build'],
        ],
      },
      {
        slug: 'de-vectordb', name: 'Vector DBs & LLM Infra', subtitle: 'Data for AI systems',
        description: 'Embeddings, vector stores, and the infrastructure that feeds LLM applications.',
        icon: 'biotech', estHours: 12, xp: 250,
        skills: ['Embeddings', 'Vector search', 'Chunking & indexing'], prereqs: ['de-streaming'],
        resources: [
          ['Vector Databases Explained', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/vector-database/'],
          ['Faiss Wiki', 'documentation', 'Meta AI Research', 'https://github.com/facebookresearch/faiss/wiki'],
        ],
        tasks: [
          ['Read the vector database fundamentals guide', 'read'],
          ['Build: embed a document set and serve similarity search', 'build'],
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
        skills: ['Profiling', 'Outlier detection', 'Univariate/bivariate analysis'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['Kaggle: Data Cleaning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/data-cleaning'],
          ['ydata-profiling Documentation', 'documentation', 'ydata-profiling', 'https://docs.profiling.ydata.ai/'],
        ],
        tasks: [
          ['Complete the data cleaning course', 'watch'],
          ['Build: a full EDA notebook on a dataset you have never seen', 'build'],
        ],
      },
      {
        slug: 'da-visualization', name: 'Data Visualization', subtitle: 'Matplotlib, Seaborn',
        description: 'Choose the right chart, encode honestly, and build plots people actually read.',
        icon: 'bar_chart', estHours: 10, xp: 150,
        skills: ['Chart selection', 'Matplotlib & Seaborn', 'Perception principles'], prereqs: ['da-eda'],
        resources: [
          ['Storytelling with Data (blog)', 'article', 'SWD', 'https://www.storytellingwithdata.com/'],
          ['Matplotlib Tutorials', 'documentation', 'Matplotlib', 'https://matplotlib.org/stable/tutorials/index.html'],
        ],
        tasks: [
          ['Study chart-choice and perception principles', 'read'],
          ['Build: remake three bad charts into honest, readable ones', 'build'],
        ],
      },
      {
        slug: 'da-dashboards', name: 'Dashboard Design', subtitle: 'Interfaces for decisions',
        description: 'Layout, hierarchy, and interactivity for dashboards that answer questions at a glance.',
        icon: 'dashboard', estHours: 10, xp: 150,
        skills: ['Layout & hierarchy', 'KPI design', 'Filters & interactivity'], prereqs: ['da-visualization'],
        resources: [
          ['Metabase: Dashboard Best Practices', 'article', 'Metabase Learn', 'https://www.metabase.com/learn/dashboards'],
          ['Looker Studio Help Center', 'documentation', 'Google', 'https://support.google.com/looker-studio/'],
        ],
        tasks: [
          ['Read dashboard design best practices', 'read'],
          ['Build: a KPI dashboard answering three stakeholder questions', 'build'],
        ],
      },
      {
        slug: 'da-storytelling', name: 'Data Storytelling', subtitle: 'Insight to action',
        description: 'Structure findings as narratives that move stakeholders to a decision.',
        icon: 'edit_note', estHours: 8, xp: 150,
        skills: ['Narrative structure', 'Executive summaries', 'Presenting to stakeholders'], prereqs: ['da-dashboards'],
        resources: [
          ['SWD Podcast & Exercises', 'article', 'SWD', 'https://community.storytellingwithdata.com/exercises'],
          ['Nightingale — The Journal of the Data Visualization Society', 'article', 'Data Visualization Society', 'https://nightingaledvs.com/'],
        ],
        tasks: [
          ['Work through storytelling-with-data exercises', 'read'],
          ['Build: a 5-slide narrative from one of your analyses', 'build'],
        ],
      },
      {
        slug: 'da-bi', name: 'BI Tools', subtitle: 'Looker, Power BI, Metabase',
        description: 'Model metrics once, serve them everywhere: semantic layers and governed self-serve BI.',
        icon: 'query_stats', estHours: 12, xp: 200,
        skills: ['Semantic models', 'Power BI / Metabase', 'Governance'], prereqs: ['da-storytelling'],
        resources: [
          ['Microsoft Learn: Power BI', 'course', 'Microsoft', 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi'],
          ['Metabase Documentation', 'documentation', 'Metabase', 'https://www.metabase.com/docs/latest/'],
        ],
        tasks: [
          ['Complete a Power BI (or Metabase) learning path', 'watch'],
          ['Build: publish a governed dashboard with a shared metric definition', 'build'],
        ],
      },
      {
        slug: 'da-ai-analysis', name: 'AI-Assisted Analysis', subtitle: 'Analyst + LLM',
        description: 'Use LLMs to speed up cleaning, coding, and interpretation without losing rigor.',
        icon: 'auto_awesome', estHours: 8, xp: 200,
        skills: ['Prompting for analysis', 'Validation', 'Automation'], prereqs: ['da-bi'],
        resources: [
          ['Prompt Engineering Guide', 'documentation', 'promptingguide.ai', 'https://www.promptingguide.ai/'],
          ['Anthropic Cookbook', 'documentation', 'Anthropic', 'https://github.com/anthropics/anthropic-cookbook'],
        ],
        tasks: [
          ['Study prompting patterns for analysis work', 'read'],
          ['Build: run an analysis with an LLM assistant and validate every claim', 'build'],
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
        skills: ['Regression & classification', 'Bias-variance tradeoff', 'scikit-learn'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['Kaggle: Intro to Machine Learning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/intro-to-machine-learning'],
          ['scikit-learn User Guide', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/user_guide.html'],
        ],
        tasks: [
          ['Complete the intro ML course', 'watch'],
          ['Build: train and compare two models on a tabular dataset', 'build'],
        ],
      },
      {
        slug: 'ds-features', name: 'Feature Engineering', subtitle: 'Signal from raw data',
        description: 'Encodings, scaling, leakage traps, and features that actually move metrics.',
        icon: 'settings_input_component', estHours: 10, xp: 150,
        skills: ['Encodings & scaling', 'Leakage traps', 'Feature selection'], prereqs: ['ds-ml'],
        resources: [
          ['Kaggle: Feature Engineering', 'course', 'Kaggle', 'https://www.kaggle.com/learn/feature-engineering'],
          ['scikit-learn: Preprocessing & Feature Engineering', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/preprocessing.html'],
        ],
        tasks: [
          ['Complete the feature engineering course', 'watch'],
          ['Build: engineer features that measurably beat the raw baseline', 'build'],
        ],
      },
      {
        slug: 'ds-evaluation', name: 'Model Building & Evaluation', subtitle: 'Beyond accuracy',
        description: 'Cross-validation, metrics that match the business problem, and honest baselines.',
        icon: 'verified', estHours: 12, xp: 200,
        skills: ['Cross-validation', 'Metrics & baselines', 'Calibration'], prereqs: ['ds-features'],
        resources: [
          ['scikit-learn: Model Evaluation', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/model_evaluation.html'],
          ['Google: Machine Learning Crash Course', 'course', 'Google', 'https://developers.google.com/machine-learning/crash-course'],
        ],
        tasks: [
          ['Study evaluation metrics and cross-validation', 'read'],
          ['Build: an evaluation report with CV, baselines, and the right metric', 'build'],
        ],
      },
      {
        slug: 'ds-experiments', name: 'Experimentation & A/B Testing', subtitle: 'Causal by design',
        description: 'Design experiments, size samples, and read results without fooling yourself.',
        icon: 'biotech', estHours: 12, xp: 200,
        skills: ['Experiment design', 'Power & significance', 'Common pitfalls'], prereqs: ['ds-evaluation'],
        resources: [
          ['Trustworthy Online Controlled Experiments (notes)', 'article', 'exp-platform.com', 'https://exp-platform.com/'],
          ['How Not To Run An A/B Test', 'article', 'Evan Miller', 'https://www.evanmiller.org/how-not-to-run-an-ab-test.html'],
        ],
        tasks: [
          ['Study experiment design and statistical power', 'read'],
          ['Build: design an A/B test plan with hypothesis, sample size, and decision rule', 'build'],
        ],
      },
      {
        slug: 'ds-deployment', name: 'Model Deployment', subtitle: 'Models as services',
        description: 'Package and serve models behind APIs with versioning and rollback.',
        icon: 'publish', estHours: 12, xp: 200,
        skills: ['FastAPI serving', 'Serialization', 'Versioning & rollback'], prereqs: ['ds-experiments'],
        resources: [
          ['FastAPI Docs', 'documentation', 'fastapi.tiangolo.com', 'https://fastapi.tiangolo.com/'],
          ['ONNX Runtime Documentation', 'documentation', 'ONNX', 'https://onnxruntime.ai/docs/'],
        ],
        tasks: [
          ['Study FastAPI model-serving patterns', 'read'],
          ['Build: serve a trained model behind a versioned REST endpoint', 'build'],
        ],
      },
      {
        slug: 'ds-deeplearning', name: 'Deep Learning — Advanced', subtitle: 'Neural networks',
        description: 'Backprop intuition, CNNs/transformers, and training discipline with PyTorch.',
        icon: 'psychology', estHours: 18, xp: 250,
        skills: ['PyTorch', 'CNNs & Transformers', 'Training loops'], prereqs: ['ds-deployment'],
        resources: [
          ['Practical Deep Learning for Coders', 'course', 'fast.ai', 'https://course.fast.ai/'],
          ['PyTorch Tutorials', 'documentation', 'PyTorch', 'https://pytorch.org/tutorials/'],
        ],
        tasks: [
          ['Work through fast.ai practical deep learning', 'watch'],
          ['Build: fine-tune a pretrained network on your own image/text data', 'build'],
        ],
      },
      {
        slug: 'ds-llm', name: 'LLM Fine-tuning & RAG', subtitle: 'Adapt foundation models',
        description: 'Fine-tuning versus retrieval, dataset curation, and evaluating LLM output.',
        icon: 'smart_toy', estHours: 16, xp: 250,
        skills: ['Fine-tuning vs RAG', 'Dataset curation', 'Evals'], prereqs: ['ds-deeplearning'],
        resources: [
          ['Hugging Face NLP Course', 'course', 'Hugging Face', 'https://huggingface.co/learn/nlp-course'],
          ['LlamaIndex Documentation', 'documentation', 'LlamaIndex', 'https://docs.llamaindex.ai/en/stable/'],
        ],
        tasks: [
          ['Complete the Hugging Face NLP course core chapters', 'watch'],
          ['Build: compare a RAG baseline vs fine-tuning on one task, with evals', 'build'],
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
        skills: ['Tool use', 'Structured outputs', 'Streaming responses'], prereqs: [],
        resources: [
          ['Anthropic API Docs', 'documentation', 'Anthropic', 'https://docs.anthropic.com/'],
          ['OpenAI: Function Calling Guide', 'documentation', 'OpenAI', 'https://platform.openai.com/docs/guides/function-calling'],
        ],
        tasks: [
          ['Study tool use, structured outputs, and streaming in the API docs', 'read'],
          ['Build: a CLI app using tool calls and streamed responses', 'build'],
        ],
      },
      {
        slug: 'ai-rag', name: 'RAG System Design', subtitle: 'Retrieval done right',
        description: 'Chunking, hybrid search, reranking, and grounding answers in your own data.',
        icon: 'find_in_page', estHours: 14, xp: 250,
        skills: ['Chunking strategies', 'Hybrid search', 'Reranking'], prereqs: ['ai-llm-apis'],
        resources: [
          ['Retrieval-Augmented Generation Guide', 'article', 'Pinecone Learn', 'https://www.pinecone.io/learn/retrieval-augmented-generation/'],
          ['LangChain: RAG Tutorial', 'documentation', 'LangChain', 'https://python.langchain.com/docs/tutorials/rag/'],
        ],
        tasks: [
          ['Study chunking, hybrid retrieval, and reranking', 'read'],
          ['Build: a RAG system over your own documents with cited answers', 'build'],
        ],
      },
      {
        slug: 'ai-agents', name: 'AI Agents & Tool Use', subtitle: 'Systems that act',
        description: 'Agent loops, tool design, guardrails, and when not to build an agent.',
        icon: 'smart_toy', estHours: 14, xp: 250,
        skills: ['Agent loops', 'Tool design', 'Guardrails'], prereqs: ['ai-rag'],
        resources: [
          ['Building Effective Agents', 'article', 'Anthropic', 'https://www.anthropic.com/research/building-effective-agents'],
          ['Anthropic Cookbook', 'documentation', 'Anthropic', 'https://github.com/anthropics/anthropic-cookbook'],
        ],
        tasks: [
          ['Read Building Effective Agents', 'read'],
          ['Build: an agent with 2–3 tools, guardrails, and a stop condition', 'build'],
        ],
      },
      {
        slug: 'ai-multimodal', name: 'Multimodal Systems', subtitle: 'Beyond text',
        description: 'Vision, audio, and document understanding in production workflows.',
        icon: 'smart_display', estHours: 12, xp: 250,
        skills: ['Vision', 'Audio', 'Document AI'], prereqs: ['ai-agents'],
        resources: [
          ['Vision API Cookbooks', 'documentation', 'Anthropic', 'https://docs.anthropic.com/en/docs/build-with-claude/vision'],
          ['OpenAI Cookbook', 'documentation', 'OpenAI', 'https://github.com/openai/openai-cookbook'],
        ],
        tasks: [
          ['Study vision/document understanding patterns', 'read'],
          ['Build: an app that extracts structured data from images or PDFs', 'build'],
        ],
      },
      {
        slug: 'ai-llmops', name: 'LLMOps & Evaluation', subtitle: 'Measure or guess',
        description: 'Eval suites, regression testing prompts, observability, and cost control.',
        icon: 'analytics', estHours: 12, xp: 250,
        skills: ['Eval suites', 'Prompt regression', 'Cost & observability'], prereqs: ['ai-multimodal'],
        resources: [
          ['Your Guide to LLM Evals', 'article', 'Eugene Yan', 'https://eugeneyan.com/writing/llm-evaluators/'],
          ['OpenAI Evals', 'documentation', 'OpenAI', 'https://github.com/openai/evals'],
        ],
        tasks: [
          ['Study LLM evaluation approaches', 'read'],
          ['Build: an eval suite that gates a prompt change in CI', 'build'],
        ],
      },
      {
        slug: 'ai-product', name: 'AI Product Design', subtitle: 'Architecture end-to-end',
        description: 'Design a full AI product: latency budgets, fallbacks, UX for uncertainty.',
        icon: 'explore', estHours: 14, xp: 300,
        skills: ['Latency budgets', 'Fallback design', 'UX for uncertainty'], prereqs: ['ai-llmops'],
        resources: [
          ['AI Engineering (book notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/blog/'],
          ['Patterns for Building LLM-based Systems & Products', 'article', 'Eugene Yan', 'https://eugeneyan.com/writing/llm-patterns/'],
        ],
        tasks: [
          ['Study AI product architecture patterns', 'read'],
          ['Build: design doc + prototype for an AI product with fallbacks and latency budget', 'build'],
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
        skills: ['Dockerfiles & layers', 'Compose', 'Registries'], prereqs: [],
        resources: [
          ['Docker Getting Started', 'documentation', 'Docker', 'https://docs.docker.com/get-started/'],
          ['Docker Compose Documentation', 'documentation', 'Docker', 'https://docs.docker.com/compose/'],
        ],
        tasks: [
          ['Work through Docker getting started', 'read'],
          ['Build: containerize a model service with a slim, reproducible image', 'build'],
        ],
      },
      {
        slug: 'ml-cicd', name: 'CI/CD for ML', subtitle: 'Automate the path to prod',
        description: 'Pipelines that test data, code, and models before anything ships.',
        icon: 'published_with_changes', estHours: 12, xp: 200,
        skills: ['GitHub Actions', 'Model & data tests', 'Artifacts'], prereqs: ['ml-docker'],
        resources: [
          ['GitHub Actions Docs', 'documentation', 'GitHub', 'https://docs.github.com/en/actions'],
          ['Made With ML', 'course', 'Made With ML', 'https://madewithml.com/'],
        ],
        tasks: [
          ['Study GitHub Actions pipelines', 'read'],
          ['Build: a CI pipeline that tests data, code, and model quality before deploy', 'build'],
        ],
      },
      {
        slug: 'ml-monitoring', name: 'Monitoring & Drift', subtitle: 'Know when models rot',
        description: 'Data drift, concept drift, and alerting on the metrics that predict failure.',
        icon: 'analytics', estHours: 12, xp: 250,
        skills: ['Data drift', 'Concept drift', 'Alerting'], prereqs: ['ml-cicd'],
        resources: [
          ['Evidently AI: ML Monitoring Guides', 'article', 'Evidently', 'https://www.evidentlyai.com/ml-in-production/model-monitoring'],
          ['Evidently AI Documentation', 'documentation', 'Evidently', 'https://docs.evidentlyai.com/'],
        ],
        tasks: [
          ['Study drift detection and ML monitoring', 'read'],
          ['Build: a monitoring dashboard that alerts on input drift', 'build'],
        ],
      },
      {
        slug: 'ml-production', name: 'Production ML Systems', subtitle: 'Serving at scale',
        description: 'Batch vs online serving, feature stores, and latency/throughput tradeoffs.',
        icon: 'memory', estHours: 14, xp: 250,
        skills: ['Serving patterns', 'Feature stores', 'Scaling & caching'], prereqs: ['ml-monitoring'],
        resources: [
          ['Designing Machine Learning Systems (notes)', 'article', 'Chip Huyen', 'https://huyenchip.com/machine-learning-systems-design/toc.html'],
          ['Feast Documentation', 'documentation', 'Feast', 'https://docs.feast.dev/'],
        ],
        tasks: [
          ['Study serving patterns and feature stores', 'read'],
          ['Build: an online + batch serving path for the same model', 'build'],
        ],
      },
      {
        slug: 'ml-platform', name: 'ML Platform Design', subtitle: 'End-to-end ownership',
        description: 'Design the platform: from experiment tracking to deployment paths for a whole team.',
        icon: 'schema', estHours: 16, xp: 300,
        skills: ['Experiment tracking', 'Model registries', 'Platform architecture'], prereqs: ['ml-production'],
        resources: [
          ['MLOps Zoomcamp — Lecture Playlist', 'video', 'YouTube (DataTalksClub)', 'https://www.youtube.com/playlist?list=PL3MmuxUbc_hIUISrluw_A7wDSmfOhErJK'],
          ['MLflow Documentation', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/index.html'],
        ],
        tasks: [
          ['Work through the MLOps Zoomcamp capstone material', 'watch'],
          ['Build: an end-to-end platform design doc — tracking, registry, deploy paths', 'build'],
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
    n.tasks.map(([description, type, payload], i) => ({
      id: `${n.slug}::t${i}`,
      node_id: n.slug,
      description,
      type,
      order: i + 1,
      quiz: type === 'quiz' ? (payload as QuizPayload) ?? null : null,
      challenge: type === 'challenge' ? (payload as ChallengePayload) ?? null : null,
    })),
  ),
);

export const PATH_IDS = PATHS.map((p) => p.id);
export const SPECIALIZATION_PATHS = PATHS.filter((p) => p.id !== 'foundations');
