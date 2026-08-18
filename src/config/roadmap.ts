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
interface LessonMeta {
  resourceIndex: 0 | 1;
  title: string;
  durationMinutes: number;
  startSeconds?: number;
  endSeconds?: number;
}

type TaskDef = [
  description: string,
  type: TaskType,
  payload?: QuizPayload | ChallengePayload,
  lesson?: LessonMeta,
];

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

// Product hold: retain the authored curriculum for later review, but do not
// unlock or expand it while the core career paths are being strengthened.
export const PAUSED_PATH_IDS = new Set(['ai-engineering']);

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
        description: 'Write a readable Python program that loads, validates, cleans, and exports a tabular dataset.',
        icon: 'code', estHours: 12, xp: 100,
        skills: ['Functions & errors', 'Pandas transformations', 'Data validation'], prereqs: [],
        resources: [
          ['Python Tutorial — sections 3–5', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/introduction.html'],
          ['10 minutes to pandas', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/10min.html'],
        ],
        tasks: [
          ['Learn: complete Python Tutorial sections 3–5 and reproduce the examples locally', 'read', undefined, { resourceIndex: 0, title: 'Python essentials: values, control flow and functions', durationMinutes: 45 }],
          ['Build: create clean_data.py that validates required columns, handles missing values and duplicates, exports a tidy CSV, and documents how to run it', 'build'],
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
        description: 'Answer business questions with correct joins, aggregations, CTEs, and window functions, then validate the result.',
        icon: 'database', estHours: 10, xp: 100,
        skills: ['Joins & CTEs', 'Aggregation & windows', 'Query validation'], prereqs: [],
        resources: [
          ['SQLBolt — lessons 1–18', 'course', 'SQLBolt', 'https://sqlbolt.com/'],
          ['PostgreSQL Window Functions Tutorial', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/tutorial-window.html'],
        ],
        tasks: [
          ['Learn: complete SQLBolt lessons 1–18 and the PostgreSQL window-functions tutorial', 'read', undefined, { resourceIndex: 0, title: 'SQLBolt core queries and joins', durationMinutes: 75 }],
          ['Build: submit five labelled business queries using joins, aggregation, a CTE and a window function, with row-count or total checks for every answer', 'build'],
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
        description: 'Create a focused branch, review its changes, resolve a conflict, and merge it through a clear pull request.',
        icon: 'account_tree', estHours: 6, xp: 75,
        skills: ['Focused commits', 'Pull-request review', 'Conflict recovery'], prereqs: [],
        resources: [
          ['Pro Git — Git Basics and Branching', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'],
          ['Review pull requests', 'course', 'GitHub Skills', 'https://github.com/skills/review-pull-requests'],
        ],
        tasks: [
          ['Learn: read Pro Git chapters 2–3 and complete GitHub Skills: Review pull requests', 'read', undefined, { resourceIndex: 0, title: 'Everyday Git: commits, branches and remotes', durationMinutes: 55 }],
          ['Build: create a branch with focused commits, open a pull request that explains the change and test evidence, resolve one deliberate conflict, and merge it', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Pro Git, what does git rebase do compared to merge?', ['Deletes the branch', 'Replays commits onto a new base for linear history', 'Creates a merge commit', 'Pushes to remote'], 1, 'Rebase replays your commits on top of another base commit, producing a linear history; merge preserves both histories with a merge commit.'),
            q('You rebased a feature branch onto main and force-pushed. A teammate who already pulled the old branch now sees duplicate commits and conflicts. What is the safe fix?', ['Tell them to git pull again', 'Tell them to force-pull with --rebase or re-clone the branch, since rewritten history diverged from their local copy', 'Revert the rebase on main', 'Delete their local repo'], 1, 'Rebasing rewrites commit SHAs; anyone with the old branch must reset onto the new history (fetch + reset --hard, or a rebase pull) rather than merge the two diverging histories.'),
            q('A bug was introduced somewhere in the last 40 commits but you don’t know which one. What is the fastest way to find it?', ['Read every diff manually', 'git bisect, binary-searching commits by testing good/bad', 'git blame on the whole file', 'Revert commits one at a time'], 1, 'git bisect binary searches the commit range in O(log n) tests instead of a linear scan, which is why it is the standard tool for regression hunting.'),
          )],
        ],
      },
      {
        slug: 'found-cli', name: 'Command Line', subtitle: 'Live in the terminal',
        description: 'Inspect files and processes, combine commands with pipes, and automate a repeatable file-processing task safely.',
        icon: 'terminal', estHours: 5, xp: 75,
        skills: ['Pipes & redirection', 'Processes & permissions', 'Safe shell scripts'], prereqs: [],
        resources: [
          ['The Missing Semester — The Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2020/course-shell/'],
          ['The Linux command line for beginners', 'article', 'Ubuntu', 'https://ubuntu.com/tutorials/command-line-for-beginners'],
        ],
        tasks: [
          ['Learn: complete The Missing Semester shell lecture and Ubuntu tutorial sections 1–6', 'watch', undefined, { resourceIndex: 0, title: 'The shell: navigation, pipes and automation', durationMinutes: 50 }],
          ['Build: write an idempotent shell script that validates its input directory, organises files by extension, logs its actions, and handles spaces in filenames', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('In the Missing Semester shell lecture, which operator sends the output of one command into another?', ['>', '>>', '|', '&'], 2, 'The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files.'),
            q('You need to find every .csv file under a directory tree modified in the last 24 hours and count their lines. Which pipeline does that correctly?', ['cat *.csv | wc -l', 'find . -name "*.csv" -mtime -1 | xargs wc -l', 'ls -R | grep csv | head', 'grep -r csv . | wc -l'], 1, 'find locates files by name/pattern and mtime across a tree; piping to xargs wc -l runs the count over each match — the standard composable shell idiom.'),
            q('A long-running script you started in a terminal needs to keep running after you close the SSH session. What is the correct approach?', ['Just close the terminal, it keeps running', 'Run it with nohup/disown or inside tmux/screen so it detaches from the session', 'Run it with sudo', 'Pipe it to /dev/null'], 1, 'Closing a terminal sends SIGHUP to child processes by default; nohup or a multiplexer (tmux/screen) detaches the process from the controlling session so it survives disconnect.'),
          )],
        ],
      },
      {
        slug: 'found-stats', name: 'Statistics Basics', subtitle: 'Think in distributions',
        description: 'Describe uncertainty in a dataset, choose an appropriate comparison, and communicate what the evidence cannot prove.',
        icon: 'insights', estHours: 10, xp: 100,
        skills: ['Sampling & uncertainty', 'Effect size & testing', 'Causal limits'], prereqs: ['found-python'],
        resources: [
          ['Seeing Theory — distributions and inference', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'],
          ['OpenIntro Statistics — chapters 2, 4 and 5', 'documentation', 'OpenIntro', 'https://www.openintro.org/book/os/'],
        ],
        tasks: [
          ['Learn: complete Seeing Theory distributions/inference and OpenIntro chapters 2, 4 and 5', 'read', undefined, { resourceIndex: 0, title: 'Distributions, sampling and inference', durationMinutes: 60 }],
          ['Build: analyse one comparison with distribution plots, confidence interval, effect size, assumptions, and a plain-language statement of what cannot be concluded', 'build'],
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
        description: 'Use an AI assistant on a bounded data task while protecting sensitive data, testing its output, and documenting its contribution.',
        icon: 'auto_awesome', estHours: 6, xp: 75,
        skills: ['Model limitations', 'Output verification', 'Safe AI-assisted work'], prereqs: ['found-python'],
        resources: [
          ['Intro to Large Language Models', 'video', 'YouTube (Andrej Karpathy)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'],
          ['OWASP Top 10 for LLM Applications — prompt injection', 'documentation', 'OWASP', 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'],
        ],
        tasks: [
          ['Learn: watch Intro to LLMs and read the OWASP prompt-injection guidance', 'watch', undefined, { resourceIndex: 0, title: 'How LLMs work and where they fail', durationMinutes: 60 }],
          ['Build: complete one bounded data task with AI assistance, remove sensitive inputs, test every generated claim or code path, and add an AI_USE.md log of prompts, changes, failures, and verification', 'build'],
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
        slug: 'de-etl', name: 'Reproducible Ingestion', subtitle: 'Docker, APIs, and safe reruns',
        description: 'Containerise an API-to-PostgreSQL pipeline that validates inputs and can be rerun without duplicating data.',
        icon: 'transform', estHours: 10, xp: 150,
        skills: ['Docker & environments', 'Incremental ingestion', 'Idempotency & quality'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['DE Zoomcamp — Docker and Terraform', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/data-engineering-zoomcamp/tree/main/01-docker-terraform'],
          ['dlt — incremental loading', 'documentation', 'dltHub', 'https://dlthub.com/docs/general-usage/incremental-loading'],
        ],
        tasks: [
          ['Learn: complete the Docker, PostgreSQL and Terraform sections, then study cursor-based incremental loading', 'read', undefined, { resourceIndex: 0, title: 'Containerised ingestion and safe reruns', durationMinutes: 55 }],
          ['Build: add a containerised API-to-PostgreSQL pipeline with configuration outside source control, pagination, schema checks, an incremental cursor, duplicate-safe reruns and a documented local setup', 'build'],
        ],
      },
      {
        slug: 'de-modeling', name: 'Data Modeling', subtitle: 'Dimensional modeling',
        description: 'Design an analytics-ready star schema with declared grain, dependable keys, and a justified history strategy.',
        icon: 'schema', estHours: 12, xp: 150,
        skills: ['Grain & dimensional models', 'Keys & SCDs', 'Warehouse performance'], prereqs: ['de-etl'],
        resources: [
          ['Kimball dimensional modelling techniques', 'documentation', 'Kimball Group', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/'],
          ['BigQuery — partitioned tables', 'documentation', 'Google Cloud', 'https://cloud.google.com/bigquery/docs/partitioned-tables'],
        ],
        tasks: [
          ['Learn: study grain, facts, dimensions, surrogate keys, SCDs, partitioning and clustering', 'read', undefined, { resourceIndex: 0, title: 'Grain, facts and dimensional decisions', durationMinutes: 50 }],
          ['Build: add a grain statement, bus matrix, fact table, conformed dimensions, one SCD Type 2 dimension and a partition choice with cost/query justification', 'build'],
        ],
      },
      {
        slug: 'de-dbt', name: 'dbt', subtitle: 'Data build tool',
        description: 'Build layered dbt transformations with tested sources, documented lineage, and separate development and production targets.',
        icon: 'code_blocks', estHours: 12, xp: 200,
        skills: ['Layered dbt models', 'Tests & lineage', 'Environment discipline'], prereqs: ['de-modeling'],
        resources: [
          ['dbt — structure a project', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview'],
          ['dbt data tests', 'documentation', 'dbt Labs', 'https://docs.getdbt.com/docs/build/data-tests'],
        ],
        tasks: [
          ['Learn: complete the staging, intermediate, marts and data-tests guidance', 'read', undefined, { resourceIndex: 0, title: 'Layered dbt models and trustworthy tests', durationMinutes: 45 }],
          ['Build: add sources, staging/intermediate/mart layers, key and relationship tests, one business-rule test, generated docs and separate development/production targets', 'build'],
        ],
      },
      {
        slug: 'de-orchestration', name: 'Workflow Orchestration', subtitle: 'Airflow operations',
        description: 'Schedule the platform as an observable Airflow DAG that retries safely, backfills correctly, and exposes failures.',
        icon: 'published_with_changes', estHours: 12, xp: 200,
        skills: ['DAGs & data intervals', 'Retries & alerts', 'Safe backfills'], prereqs: ['de-dbt'],
        resources: [
          ['Airflow — first workflow', 'documentation', 'Apache Airflow', 'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html'],
          ['Airflow — backfill', 'documentation', 'Apache Airflow', 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html'],
        ],
        tasks: [
          ['Learn: complete the Airflow fundamentals tutorial and backfill guide', 'read', undefined, { resourceIndex: 0, title: 'Airflow DAGs, retries and backfills', durationMinutes: 50 }],
          ['Build: orchestrate ingestion, validation and dbt as separate tasks with retries, failure notification, a deliberate failure test and a documented seven-day backfill procedure', 'build'],
        ],
      },
      {
        slug: 'de-cloud', name: 'Cloud Platforms', subtitle: 'AWS / GCP',
        description: 'Deploy the batch platform with least-privilege identities, separated environments, and documented storage and query costs.',
        icon: 'deployed_code', estHours: 14, xp: 200,
        skills: ['Object storage & warehouse', 'IAM & secrets', 'Cost & environment control'], prereqs: ['de-orchestration'],
        resources: [
          ['Google Cloud IAM overview', 'documentation', 'Google Cloud', 'https://cloud.google.com/iam/docs/overview'],
          ['BigQuery — optimise query computation', 'documentation', 'Google Cloud', 'https://cloud.google.com/bigquery/docs/best-practices-performance-compute'],
        ],
        tasks: [
          ['Learn: study IAM identities/policies and BigQuery computation-cost guidance', 'read', undefined, { resourceIndex: 0, title: 'Cloud identity, storage and cost controls', durationMinutes: 45 }],
          ['Build: deploy the platform with raw/processed storage zones, separate developer and scheduler identities, secrets outside code, least-privilege roles and a before/after query-cost comparison', 'build'],
        ],
      },
      {
        slug: 'de-spark', name: 'Spark — Advanced', subtitle: 'Distributed compute',
        description: 'Use PySpark for a justified large-data workload, inspect its execution plan, and remove avoidable shuffle or skew.',
        icon: 'memory', estHours: 16, xp: 250,
        skills: ['PySpark', 'Partitioning & shuffles', 'Performance tuning'], prereqs: ['de-cloud'],
        resources: [
          ['Spark SQL getting started', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/sql-getting-started.html'],
          ['Spark SQL performance tuning', 'documentation', 'Apache Spark', 'https://spark.apache.org/docs/latest/sql-performance-tuning.html'],
        ],
        tasks: [
          ['Learn: complete Spark SQL getting started and the partitioning, join and adaptive-execution tuning sections', 'read', undefined, { resourceIndex: 0, title: 'Spark execution, partitions and joins', durationMinutes: 55 }],
          ['Build: add a PySpark batch job, compare it with a local baseline, capture the explain plan, demonstrate partition choices and remove one measured shuffle or skew problem', 'build'],
        ],
      },
      {
        slug: 'de-streaming', name: 'Real-time Streaming', subtitle: 'Kafka',
        description: 'Build a recoverable Kafka event flow and explain its ordering, replay, consumer-group, and delivery guarantees.',
        icon: 'electric_bolt', estHours: 16, xp: 250,
        skills: ['Topics', 'Consumer groups', 'Delivery semantics'], prereqs: ['de-spark'],
        resources: [
          ['Apache Kafka 101', 'course', 'Confluent Developer', 'https://developer.confluent.io/courses/apache-kafka/events/'],
          ['Kafka consumers', 'course', 'Confluent Developer', 'https://developer.confluent.io/courses/apache-kafka/consumers/'],
        ],
        tasks: [
          ['Learn: complete Kafka 101 and the consumers lesson', 'read', undefined, { resourceIndex: 0, title: 'Kafka topics, partitions and consumer groups', durationMinutes: 45 }],
          ['Build: add keyed events, multiple partitions and a consumer group, then demonstrate replay from an earlier offset and document ordering scope, rebalancing and chosen delivery semantics', 'build'],
        ],
      },
      {
        slug: 'de-vectordb', name: 'Reliability & Capstone', subtitle: 'Operate the whole platform',
        description: 'Ship the cumulative data platform with quality gates, lineage, observability, recovery procedures, and documentation another engineer can use.',
        icon: 'verified', estHours: 16, xp: 250,
        skills: ['Data observability', 'Failure recovery', 'Technical documentation'], prereqs: ['de-streaming'],
        resources: [
          ['OpenLineage — getting started', 'documentation', 'OpenLineage', 'https://openlineage.io/docs/guides/'],
          ['Great Expectations — introduction', 'documentation', 'Great Expectations', 'https://docs.greatexpectations.io/docs/core/introduction/'],
        ],
        tasks: [
          ['Learn: study lineage events and executable data-quality expectations', 'read', undefined, { resourceIndex: 0, title: 'Lineage, quality checks and recovery', durationMinutes: 45 }],
          ['Build: finish the cumulative platform with freshness/key/business-rule checks, lineage, architecture diagram, data dictionary, setup guide, cost note, failure alert, backfill runbook and one dashboard or query pack proving the data is usable', 'build'],
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
        description: 'Translate a stakeholder question into defined metrics, profile the data, and produce a reproducible analysis plan.',
        icon: 'find_in_page', estHours: 10, xp: 150,
        skills: ['Question & metric framing', 'Data profiling', 'Analysis planning'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['Pandas — working with missing data', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/missing_data.html'],
          ['NIST EDA Handbook — introduction', 'documentation', 'NIST', 'https://www.itl.nist.gov/div898/handbook/eda/section1/eda11.htm'],
        ],
        tasks: [
          ['Learn: study pandas missing-data handling and the NIST EDA purpose and approach sections', 'read', undefined, { resourceIndex: 0, title: 'A disciplined exploratory analysis', durationMinutes: 45 }],
          ['Build: add brief.md and analysis.ipynb that define the stakeholder, decision, metrics and assumptions, then profile missingness, duplicates, distributions, segments and anomalies with reproducible code', 'build'],
        ],
      },
      {
        slug: 'da-visualization', name: 'Data Visualization', subtitle: 'Matplotlib, Seaborn',
        description: 'Choose honest visual encodings and produce accessible charts that make the comparison and uncertainty clear.',
        icon: 'bar_chart', estHours: 10, xp: 150,
        skills: ['Chart selection', 'Honest encoding', 'Accessible visualisation'], prereqs: ['da-eda'],
        resources: [
          ['Matplotlib — the lifecycle of a plot', 'documentation', 'Matplotlib', 'https://matplotlib.org/stable/tutorials/lifecycle.html'],
          ['Accessible data visualisation guidance', 'article', 'UK Analysis Function', 'https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/'],
        ],
        tasks: [
          ['Learn: complete the Matplotlib lifecycle tutorial and accessibility guidance', 'read', undefined, { resourceIndex: 0, title: 'Chart construction and accessible encoding', durationMinutes: 40 }],
          ['Build: remake three misleading charts with justified chart choices, direct labels, colour-safe palettes, alt text and a written note explaining every correction', 'build'],
        ],
      },
      {
        slug: 'da-dashboards', name: 'Dashboard Design', subtitle: 'Interfaces for decisions',
        description: 'Build a focused dashboard that answers three defined questions on desktop and mobile without hiding context or accessibility.',
        icon: 'dashboard', estHours: 10, xp: 150,
        skills: ['Decision-led layout', 'KPI definitions', 'Accessible interaction'], prereqs: ['da-visualization'],
        resources: [
          ['Power BI report design tips', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips'],
          ['Design Power BI reports for accessibility', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports'],
        ],
        tasks: [
          ['Learn: study Microsoft report-design and accessibility guidance', 'read', undefined, { resourceIndex: 0, title: 'Decision-first dashboard design', durationMinutes: 40 }],
          ['Build: produce desktop and mobile dashboard views for three stakeholder questions, with metric definitions, useful defaults, keyboard order, alt text and a five-person usability checklist', 'build'],
        ],
      },
      {
        slug: 'da-storytelling', name: 'Data Storytelling', subtitle: 'Insight to action',
        description: 'Turn analysis into a concise recommendation that separates evidence, uncertainty, limitations, and the decision required.',
        icon: 'edit_note', estHours: 8, xp: 150,
        skills: ['Executive synthesis', 'Evidence & uncertainty', 'Recommendation delivery'], prereqs: ['da-dashboards'],
        resources: [
          ['Storytelling with Data exercises', 'article', 'Storytelling with Data', 'https://community.storytellingwithdata.com/exercises'],
          ['Communicating quality, uncertainty and change', 'documentation', 'UK Analysis Function', 'https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/'],
        ],
        tasks: [
          ['Learn: complete one Storytelling with Data exercise and study the uncertainty guidance', 'read', undefined, { resourceIndex: 0, title: 'From evidence to a decision narrative', durationMinutes: 40 }],
          ['Build: create a five-slide decision narrative and one-page executive memo covering context, evidence, recommendation, uncertainty, limitations and next action', 'build'],
        ],
      },
      {
        slug: 'da-bi', name: 'BI Tools', subtitle: 'Looker, Power BI, Metabase',
        description: 'Prepare data with Power Query, model facts and dimensions, write dependable DAX measures, and publish a governed report.',
        icon: 'query_stats', estHours: 12, xp: 200,
        skills: ['Power Query', 'Semantic models & DAX', 'Security & refresh'], prereqs: ['da-storytelling'],
        resources: [
          ['PL-300 Data Analyst study guide', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300'],
          ['Learn DAX basics in Power BI Desktop', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics'],
        ],
        tasks: [
          ['Learn: cover the PL-300 prepare/model/manage objectives and complete the DAX basics tutorial', 'read', undefined, { resourceIndex: 0, title: 'Semantic models, measures and governed BI', durationMinutes: 55 }],
          ['Build: publish a star-schema report with documented Power Query steps, a date table, explicit DAX measures, row-level security, scheduled refresh notes and a shared metric dictionary', 'build'],
        ],
      },
      {
        slug: 'da-ai-analysis', name: 'AI-Assisted Analysis', subtitle: 'Analyst + LLM',
        description: 'Use AI to accelerate an analysis while preserving reproducibility, privacy, source traceability, and human accountability.',
        icon: 'auto_awesome', estHours: 8, xp: 200,
        skills: ['AI-assisted workflow', 'Claim verification', 'Audit trail'], prereqs: ['da-bi'],
        resources: [
          ['NIST AI RMF Generative AI Profile', 'documentation', 'NIST', 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence'],
          ['Generative AI Framework for government', 'documentation', 'UK Government', 'https://www.gov.uk/government/publications/generative-ai-framework-for-hmg/generative-ai-framework-for-hmg-html'],
        ],
        tasks: [
          ['Learn: review the NIST generative-AI risk profile and one documented AI analysis workflow', 'read', undefined, { resourceIndex: 0, title: 'Verifiable AI-assisted analysis', durationMinutes: 40 }],
          ['Build: repeat one prior analysis with AI assistance, preserve prompts and generated code, remove sensitive data, independently verify every number and citation, and compare time saved against new risks', 'build'],
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
        description: 'Frame a prediction problem, define its target and cost of error, and build a reproducible baseline before tuning models.',
        icon: 'model_training', estHours: 14, xp: 200,
        skills: ['Problem & target framing', 'Baselines', 'Reproducible pipelines'], prereqs: FOUNDATION_SLUGS,
        resources: [
          ['Machine Learning Crash Course — linear and logistic regression', 'course', 'Google for Developers', 'https://developers.google.com/machine-learning/crash-course'],
          ['scikit-learn — pipelines and composite estimators', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/compose.html'],
        ],
        tasks: [
          ['Learn: complete the Google linear/logistic regression modules and scikit-learn pipeline guide', 'read', undefined, { resourceIndex: 0, title: 'Prediction framing and baseline models', durationMinutes: 55 }],
          ['Build: add problem_statement.md with user, target, prediction time, cost of errors and naive baseline, then train two reproducible pipeline-based models without touching the test set', 'build'],
        ],
      },
      {
        slug: 'ds-features', name: 'Feature Engineering', subtitle: 'Signal from raw data',
        description: 'Create leakage-safe feature transformations and prove that each retained feature improves a cross-validated baseline.',
        icon: 'settings_input_component', estHours: 10, xp: 150,
        skills: ['Encodings & scaling', 'Leakage traps', 'Feature selection'], prereqs: ['ds-ml'],
        resources: [
          ['scikit-learn — preprocessing data', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/preprocessing.html'],
          ['scikit-learn — common pitfalls and recommended practices', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/common_pitfalls.html'],
        ],
        tasks: [
          ['Learn: study preprocessing pipelines, inconsistent transformation and leakage pitfalls', 'read', undefined, { resourceIndex: 0, title: 'Leakage-safe feature pipelines', durationMinutes: 45 }],
          ['Build: add typed preprocessing inside the training pipeline, a leakage audit and an ablation table showing which features improve cross-validation and by how much', 'build'],
        ],
      },
      {
        slug: 'ds-evaluation', name: 'Model Building & Evaluation', subtitle: 'Beyond accuracy',
        description: 'Evaluate errors with business-aligned metrics, calibration, subgroup analysis, and an untouched final test set.',
        icon: 'verified', estHours: 12, xp: 200,
        skills: ['Metrics & thresholds', 'Calibration', 'Error & subgroup analysis'], prereqs: ['ds-features'],
        resources: [
          ['scikit-learn — model evaluation', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/model_evaluation.html'],
          ['scikit-learn — probability calibration', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/calibration.html'],
        ],
        tasks: [
          ['Learn: study scoring, cross-validation, threshold metrics and probability calibration', 'read', undefined, { resourceIndex: 0, title: 'Evaluation beyond accuracy', durationMinutes: 50 }],
          ['Build: add evaluation.md with baseline comparison, cross-validation uncertainty, chosen metric and threshold, calibration plot, error slices, subgroup results and one final test-set evaluation', 'build'],
        ],
      },
      {
        slug: 'ds-experiments', name: 'Experimentation & A/B Testing', subtitle: 'Causal by design',
        description: 'Design a powered experiment with a decision rule, guardrail metrics, validity checks, and an honest interpretation of uncertainty.',
        icon: 'biotech', estHours: 12, xp: 200,
        skills: ['Experiment design', 'Power & effect size', 'Validity & decision rules'], prereqs: ['ds-evaluation'],
        resources: [
          ['Online controlled experiments — key concepts', 'article', 'Microsoft Research', 'https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/'],
          ['statsmodels — power and sample size', 'documentation', 'statsmodels', 'https://www.statsmodels.org/stable/stats.html#power-and-sample-size-calculations'],
        ],
        tasks: [
          ['Learn: study experiment validity, guardrails, power and sample-size calculations', 'read', undefined, { resourceIndex: 0, title: 'Experiments that support causal decisions', durationMinutes: 50 }],
          ['Build: add experiment_plan.md with hypothesis, randomisation unit, primary and guardrail metrics, minimum detectable effect, sample size, duration, stopping rule, validity threats and ship/no-ship decision rule', 'build'],
        ],
      },
      {
        slug: 'ds-deployment', name: 'Model Deployment', subtitle: 'Models as services',
        description: 'Package the chosen model behind a tested API with versioned artifacts, input validation, latency measurement, and rollback instructions.',
        icon: 'publish', estHours: 12, xp: 200,
        skills: ['Validated inference API', 'Artifact versioning', 'Latency & rollback'], prereqs: ['ds-experiments'],
        resources: [
          ['FastAPI — first steps', 'documentation', 'FastAPI', 'https://fastapi.tiangolo.com/tutorial/first-steps/'],
          ['MLflow Model Registry', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/ml/model-registry/'],
        ],
        tasks: [
          ['Learn: complete FastAPI first steps and the MLflow registry workflow', 'read', undefined, { resourceIndex: 0, title: 'Serving and versioning a model', durationMinutes: 50 }],
          ['Build: add a container-ready prediction API with schema validation, health endpoint, unit/integration tests, versioned model artifact, latency measurement and documented rollback', 'build'],
        ],
      },
      {
        slug: 'ds-deeplearning', name: 'Deep Learning — Advanced', subtitle: 'Neural networks',
        description: 'Fine-tune a pretrained neural network only when it beats the simpler baseline enough to justify its added cost and risk.',
        icon: 'psychology', estHours: 18, xp: 250,
        skills: ['Transfer learning', 'Training discipline', 'Complexity trade-offs'], prereqs: ['ds-deployment'],
        resources: [
          ['Practical Deep Learning — lessons 1–3', 'course', 'fast.ai', 'https://course.fast.ai/'],
          ['PyTorch transfer learning tutorial', 'documentation', 'PyTorch', 'https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html'],
        ],
        tasks: [
          ['Learn: complete fast.ai lessons 1–3 and the PyTorch transfer-learning tutorial', 'watch', undefined, { resourceIndex: 0, title: 'Transfer learning and disciplined experiments', durationMinutes: 90 }],
          ['Build: fine-tune a pretrained model with fixed seeds, tracked runs and error analysis, then compare quality, latency and cost against the simpler baseline and justify whether it should ship', 'build'],
        ],
      },
      {
        slug: 'ds-llm', name: 'Responsible Production Capstone', subtitle: 'From model to decision system',
        description: 'Ship the cumulative project with reproducible training, a model card, monitored inference, responsible-use checks, and a stakeholder decision memo.',
        icon: 'verified', estHours: 16, xp: 250,
        skills: ['Model documentation', 'Monitoring contract', 'Responsible release'], prereqs: ['ds-deeplearning'],
        resources: [
          ['Production ML systems', 'course', 'Google for Developers', 'https://developers.google.com/machine-learning/crash-course/production-ml-systems'],
          ['Model Card Toolkit', 'documentation', 'Google Research', 'https://github.com/tensorflow/model-card-toolkit'],
        ],
        tasks: [
          ['Learn: complete Production ML Systems and study the Model Card Toolkit', 'read', undefined, { resourceIndex: 0, title: 'Operate, monitor and explain an ML system', durationMinutes: 60 }],
          ['Build: finish the cumulative project with reproducible training, data/version lineage, model card, API or batch inference, service/data/model/business monitoring plan, alert thresholds, privacy/fairness review and a plain-language decision memo', 'build'],
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
    n.tasks.map(([description, type, payload, lesson], i) => ({
      id: `${n.slug}::t${i}`,
      node_id: n.slug,
      description,
      type,
      order: i + 1,
      quiz: type === 'quiz' ? (payload as QuizPayload) ?? null : null,
      challenge: type === 'challenge' ? (payload as ChallengePayload) ?? null : null,
      resource_id: lesson ? `${n.slug}::r${lesson.resourceIndex}` : null,
      lesson_title: lesson?.title ?? null,
      duration_minutes: lesson?.durationMinutes ?? null,
      start_seconds: lesson?.startSeconds ?? null,
      end_seconds: lesson?.endSeconds ?? null,
    })),
  ),
);

export const PATH_IDS = PATHS.map((p) => p.id);
export const SPECIALIZATION_PATHS = PATHS.filter((p) => p.id !== 'foundations');

// Keep the lightweight content contract executable. This catches accidental
// curriculum bloat during development without changing the existing data model.
for (const path of PATH_DEFS) {
  for (const node of path.nodes) {
    if (node.skills.length !== 3) throw new Error(`${node.slug} must define exactly 3 competencies.`);
    if (node.resources.length !== 2) throw new Error(`${node.slug} must define exactly 2 focused resources.`);
    if (node.tasks.length < 2) throw new Error(`${node.slug} must include learning and applied work.`);
  }
}
