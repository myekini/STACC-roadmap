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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the DE Zoomcamp ingestion lectures, an idempotent pipeline run…', ['Runs faster each time', 'Produces the same result if re-run', 'Never fails', 'Requires no scheduler'], 1, 'Idempotency means re-running the same load does not duplicate or corrupt data — key for safe retries and backfills.'),
            q('Your ingestion job appends rows on every run instead of upserting. After a scheduler retry fires twice for the same window, what happens and how do you prevent it?', ['Nothing, retries are automatically deduped by the scheduler', 'Duplicate rows land in the table; fix it with a merge/upsert on a natural key or a delete-then-insert per partition', 'The job crashes', 'The warehouse deduplicates automatically'], 1, 'Append-only loads are not idempotent — a retry or backfill re-adds the same window. Upserting on a key, or deleting-and-reinserting the target partition before load, makes the operation safely repeatable.'),
            q('A source system can deliver the same event twice under network retries. Your pipeline must guarantee financial totals are correct downstream. Which delivery guarantee should you actually design for?', ['Exactly-once delivery, since it is always achievable', 'At-least-once delivery combined with idempotent/deduplicated processing on your side', 'At-most-once delivery, accepting some data loss', 'None — totals will always be approximate'], 1, 'True exactly-once delivery across distributed systems is effectively unachievable end-to-end; the standard real-world pattern is at-least-once delivery paired with idempotent consumers (dedup keys, upserts) to get exactly-once *effects*.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Kimball's dimensional modeling resources, in a star schema, facts are…", ['Descriptive attributes', 'Measurable events at a declared grain', 'Lookup tables', 'Slowly changing dimensions'], 1, 'Fact tables hold measurable events at a specific grain; dimensions carry the descriptive context.'),
            q('A customer\'s address changes, and the business needs to report historical sales against the address that was correct *at the time of each sale*. Which dimension pattern handles this?', ['Overwrite the address in place (SCD Type 1)', 'Add a new dimension row with new surrogate key and effective date range (SCD Type 2)', 'Add an "old_address" column (SCD Type 3)', 'Delete and reinsert the customer row'], 1, 'SCD Type 2 preserves history by inserting a new versioned row with its own surrogate key and validity window, so each fact joins to the dimension state that was true when the event happened.'),
            q('Analysts keep double-counting revenue because a fact table has one row per order line but they are joining and summing at the order level. What is the root cause?', ['A join bug in the BI tool', 'The query is aggregating at a grain coarser than the fact table\'s declared grain without pre-aggregating first', 'The warehouse is out of sync', 'Missing indexes'], 1, 'Every fact table has one true grain; summing a finer-grained metric after a join that fans it out (order line → order) multiplies rows unless you aggregate to the correct grain first — the single most common star-schema bug.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per dbt Fundamentals, dbt primarily handles which part of ELT?', ['Extract', 'Load', 'Transform', 'Orchestration'], 2, 'dbt transforms data already loaded in the warehouse using SQL models with testing and docs.'),
            q('A dbt model reads from a 2-billion-row events table but only needs the last 24 hours each run, and a full rebuild takes hours. Which materialization fixes this?', ['view', 'table, rebuilt fully every run', 'incremental, filtering on a timestamp with is_incremental()', 'ephemeral'], 2, 'Incremental models append/merge only new rows using an is_incremental() filter, avoiding a full table scan and rebuild on every run — the standard fix for large, append-heavy sources.'),
            q('You add a not_null and a relationships test to a model. dbt test fails in CI on the relationships test. What does that specifically tell you?', ['The model has NULL values in a required column', 'A foreign-key-style value in this model has no matching value in the referenced model — referential integrity is broken', 'The SQL has a syntax error', 'The model failed to compile'], 1, 'dbt\'s relationships test checks that every value in a column exists in a specified column of another model — a failure means orphaned rows/broken referential integrity, distinct from a not_null failure.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Astronomer Airflow Academy, a DAG in orchestration is…', ['A database table', 'A directed acyclic graph of tasks', 'A deployment artifact', 'A data quality rule'], 1, 'Workflows are modeled as directed acyclic graphs so dependencies run in order without cycles.'),
            q('A daily DAG failed to run for the past 5 days due to an outage. You fix the bug — what is the correct way to reprocess the missed days without manually triggering 5 separate runs?', ['Manually re-run the DAG 5 times with today\'s date', 'Backfill: run the DAG for each missed logical/execution date so each run processes its own historical window', 'Just run it once — Airflow catches up automatically with no configuration', 'Delete and recreate the DAG'], 1, 'Orchestrators track a logical/execution date per run; a backfill re-triggers the DAG once per missed date so each run operates on the correct historical partition, not just "today".'),
            q('Task B in a DAG must not start until an upstream file lands in S3, which happens at an unpredictable time. What is the right primitive?', ['A fixed time delay before Task B', 'A sensor/deferrable operator that polls or waits for the S3 key to exist before Task B runs', 'Running Task B on a tighter cron schedule', 'Retrying Task B until it succeeds'], 1, 'Sensors (or event-driven/deferrable operators) exist exactly for this: waiting on an external condition rather than guessing a delay or hammering retries.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the AWS Skill Builder data analytics course, object storage (S3/GCS) is best suited for…', ['Low-latency transactions', 'Files and immutable data at scale', 'Relational joins', 'In-memory caching'], 1, 'Object stores are cheap, durable homes for files and raw/lake data — not transactional workloads.'),
            q('Analysts query a lake of Parquet files in S3 and complain scans are slow even for queries that only touch one month of data. What is the highest-leverage fix?', ['Switch to CSV files', 'Partition the data by date (e.g. year/month) so the query engine can prune irrelevant files instead of scanning everything', 'Add more compute nodes', 'Compress the files further'], 1, 'Partitioning lets the engine skip entire prefixes that cannot match the filter (partition pruning) — this reduces bytes scanned far more than raw compute or format tweaks.'),
            q('A team wants to write a small lookup value that many services read constantly, with strict low-latency point reads. Why is S3 the wrong tool here even though it is durable and cheap?', ['S3 cannot store small files', 'Object stores are optimized for durable bulk storage, not low-latency high-throughput point lookups — a key-value store or cache fits that access pattern better', 'S3 has no API', 'S3 is more expensive than a database'], 1, 'Storage choice should follow access pattern: object storage is excellent for large, infrequently-mutated files; a KV store/cache is built for the low-latency point-read pattern described here.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Spark Tuning Guide, a shuffle in Spark is expensive because…', ['It uses GPUs', 'Data moves across the network between partitions', 'It recompiles the job', 'It writes to the driver'], 1, 'Shuffles repartition data across executors over the network — the main cost to minimize in Spark jobs.'),
            q('A join between a 2TB fact table and a 10MB lookup table is slow because Spark shuffles the huge table across the cluster. What is the fix?', ['Increase the number of partitions', 'Use a broadcast join — send the small table to every executor and avoid shuffling the large one', 'Cache the large table in memory', 'Switch to RDDs instead of DataFrames'], 1, 'When one side is small enough to fit in executor memory, broadcasting it lets each partition of the large table join locally with zero shuffle of the big side.'),
            q('One Spark task in a stage takes 20x longer than every other task in the same stage, dragging the whole job. What is this called and what usually causes it?', ['Garbage collection pause — restart the cluster', 'Data skew — a small number of partition keys hold disproportionately more rows than the rest', 'Network timeout', 'Driver OOM'], 1, 'Skew means the partitioning key distribution is uneven (e.g. one customer_id dominates), so one task processes far more data than its peers; fixes include salting the key or repartitioning.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Kafka 101, consumer groups in Kafka enable…', ['Message encryption', 'Parallel consumption with each partition read by one member', 'Schema validation', 'Exactly-once storage'], 1, 'Partitions are divided among group members, giving horizontal scale while preserving per-partition order.'),
            q('A topic has 6 partitions and you add a 7th consumer to a group that already has 6 consumers, one per partition. What happens to the 7th consumer?', ['It processes duplicate messages', 'It sits idle — a partition can only be read by one consumer per group, so consumers cannot outnumber partitions usefully', 'Kafka auto-creates a 7th partition', 'It errors out and crashes the group'], 1, 'Parallelism in a consumer group is capped by partition count; extra consumers beyond that number simply get no partitions assigned and stay idle.'),
            q('Your consumer commits offsets *before* finishing processing a batch, and the process crashes mid-batch. On restart, what data is at risk, and what is the safer pattern?', ['No risk — Kafka guarantees exactly-once automatically', 'Messages in that batch can be lost since their offset was already committed; commit only after successful processing (at-least-once) and make processing idempotent', 'The topic gets corrupted', 'The consumer group is deleted'], 1, 'Committing before processing risks silently losing the in-flight batch on a crash. Committing after processing gives at-least-once delivery, which paired with idempotent handling gets you correct, durable results.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Pinecone's Vector Databases Explained, embeddings are…", ['Compressed files', 'Dense vectors capturing semantic meaning', 'Database indexes', 'Encrypted tokens'], 1, 'Embeddings map text/images into dense vectors where semantic similarity becomes geometric closeness.'),
            q('A vector index with 50M embeddings needs sub-100ms nearest-neighbor search, and exact brute-force search is too slow. What kind of index solves this, and what do you trade away?', ['A B-tree index, no tradeoff', 'An approximate nearest neighbor (ANN) index like HNSW/IVF, trading a small amount of recall accuracy for large speed gains', 'A hash index, with no accuracy loss', 'Sorting the vectors alphabetically'], 1, 'ANN algorithms (HNSW, IVF, etc.) skip exhaustive comparison by organizing vectors into searchable structures, returning "close enough" neighbors almost as accurately as brute force but orders of magnitude faster.'),
            q('Two documents with very different literal wording but the same meaning should retrieve as similar in a RAG system. Which similarity metric is typically used on normalized embeddings to capture "same meaning" rather than "same length"?', ['Euclidean distance on raw text length', 'Cosine similarity, which measures the angle between vectors and ignores magnitude', 'Levenshtein (edit) distance', 'Exact string match'], 1, 'Cosine similarity compares vector direction, not magnitude, so it captures semantic closeness regardless of document length — the standard metric for embedding search.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Kaggle Data Cleaning course, the first thing to check in a new dataset is…', ['Model accuracy', 'Missing values, types, and distributions', 'Dashboard colors', 'Feature importance'], 1, 'Profiling — completeness, types, ranges, distributions — comes before any analysis or modeling.'),
            q('A revenue column is 90% populated and you need to decide how to handle the missing 10% before analysis. What should drive that decision?', ['Always drop the rows', 'Always fill with the mean', 'Whether the values are missing at random vs. systematically (e.g. missing for a specific segment), since that determines whether dropping/imputing biases the result', 'Whatever is fastest to code'], 2, 'The correct handling depends on the missingness mechanism — missing-completely-at-random is safer to drop or impute than systematic missingness, which can silently bias conclusions if ignored.'),
            q('A dataset\'s average order value looks reasonable, but a histogram reveals two distinct peaks — one near $20 and one near $200. What does this indicate and why does it matter?', ['A data entry error that should be deleted', 'A bimodal distribution, likely two different populations (e.g. two customer segments) mixed together — the single average is misleading for either group', 'Nothing, the mean is still valid', 'The data needs to be log-transformed only'], 1, 'Bimodal distributions signal a mixture of subpopulations; summarizing with one mean/median hides the real structure and can lead to wrong conclusions unless you segment first.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Storytelling with Data, for comparing quantities across categories, prefer…', ['Pie chart', 'Bar chart', '3D surface', 'Word cloud'], 1, 'Length on a common baseline (bars) is the most accurately perceived encoding for comparisons.'),
            q('A stakeholder asks for a pie chart with 9 slices to show market share by vendor. Why should you push back, and what would you propose instead?', ['Pie charts are always wrong, use a table instead', 'Humans are poor at comparing angles/areas, especially with many similar-sized slices — a sorted horizontal bar chart makes the ranking and magnitude instantly readable', 'Add more colors to the pie chart', 'Use a 3D pie chart for more detail'], 1, 'Angle/area judgments are one of the weakest visual channels for precise comparison; a sorted bar chart converts the same data into length comparisons, which humans read far more accurately, especially past 5-6 categories.'),
            q('You are charting a metric that has both a small subset of very large outlier values and many small values, and a linear y-axis makes the small values invisible. What is a defensible fix, and what must you always do when you use it?', ['Delete the outliers', 'Use a log scale, and clearly label it as log-scaled so readers do not misread the visual differences as linear', 'Cap the y-axis arbitrarily with no label', 'Switch to a pie chart'], 1, 'Log scales are a legitimate way to make wide-ranging data readable, but because visual distance no longer maps linearly to value, failing to label the axis as log-scaled makes the chart actively misleading.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Metabase's dashboard best practices, a good dashboard leads with…", ['Every available metric', 'The most decision-relevant KPIs', 'Raw tables', 'Filters'], 1, 'Hierarchy matters: the questions users came to answer belong at the top, detail below.'),
            q('Executives say your ops dashboard is "too busy" even though every chart is technically accurate and relevant to someone. What design principle did the dashboard violate?', ['It needs more colors', 'A single dashboard should serve one primary audience/decision; mixing every stakeholder\'s metrics on one screen kills the visual hierarchy for all of them', 'It needs a dark theme', 'It needs more charts, not fewer'], 1, 'Dashboards fail when they try to be everything to everyone — the fix is usually splitting by audience/decision rather than adding more polish to one crowded screen.'),
            q('A KPI tile shows "Revenue: $1.2M" with no comparison point. A stakeholder asks "is that good?" and you cannot answer from the dashboard alone. What is missing?', ['A bigger font', 'Context — a comparison against a target, prior period, or trend, since a bare number carries no signal about direction or performance', 'More decimal places', 'A pie chart next to it'], 1, 'A number alone answers "what" but not "so what" — pairing it with a trend line, target, or period-over-period delta is what turns a metric into an actionable signal.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the SWD storytelling exercises, a data story should end with…', ['The methodology', 'A recommended action', 'All caveats', 'The raw data'], 1, 'Analyses drive decisions: close with the action the evidence supports, then back it up.'),
            q('You present an analysis chronologically — how you cleaned the data, then explored it, then found the insight — and the VP loses interest halfway through. What structural change fixes this?', ['Add more slides', 'Lead with the conclusion/recommendation up front, then use supporting analysis as evidence — decision-makers need the "so what" before the "how"', 'Remove all charts and use only text', 'Present it as a live coding demo instead'], 1, 'Analytical narrative and presentation order are different: build the analysis chronologically, but present findings-first (the "pyramid principle") so busy stakeholders get the answer immediately and can dig into evidence only if they need to.'),
            q('Your data shows a strong correlation between ice cream sales and drowning incidents. A stakeholder wants to conclude ice cream causes drownings. What is the correct response and the underlying issue?', ['Agree — the data doesn\'t lie', 'Point out this is a classic confounder: hot weather independently drives both ice cream sales and swimming (and thus drowning risk) — correlation here doesn\'t imply causation', 'Recommend banning ice cream sales near pools', 'Ignore the finding entirely'], 1, 'A shared underlying cause (confounder — here, temperature) can produce a strong correlation between two variables with no causal link between them; a rigorous storyteller flags this before a decision-maker acts on a spurious causal claim.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Power BI learning path, a semantic layer exists to…', ['Speed up SQL', 'Define metrics once and reuse everywhere', 'Replace the warehouse', 'Encrypt data'], 1, 'Semantic layers centralize metric definitions so every tool and team reports the same numbers.'),
            q('Marketing and Finance both report "active users" for the same month, but the numbers differ by 15%, and each team insists their BI tool is correct. What is the most likely root cause and the systemic fix?', ['One tool has a bug — restart it', 'Each team independently defined "active user" (different lookback windows, filters) in its own report; the fix is a shared semantic layer/metric definition both tools query', 'The warehouse data is corrupted', 'Add more decimal precision'], 1, 'Metric drift across tools almost always comes from duplicated, inconsistent business logic rather than a data bug — centralizing the definition in a semantic layer (or dbt metrics) is what prevents teams from silently disagreeing.'),
            q('A BI dashboard built directly on live production OLTP tables starts timing out and slowing down the app during peak traffic. What is the architectural fix?', ['Add a cache to the frontend only', 'Query a separate analytics warehouse/replica instead of the production transactional database, so BI load never contends with app traffic', 'Reduce the dashboard refresh rate to once a year', 'Turn off the dashboard permanently'], 1, 'OLTP systems are tuned for many small transactional queries, not large analytical scans; separating analytical workloads into a warehouse (via ETL/CDC) protects production performance and gives BI room to run heavier queries.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the prompt engineering guide, when an LLM produces an analysis claim, you should…', ['Ship it', 'Verify it against the data before using it', 'Ask it to be confident', 'Lower the temperature'], 1, 'LLMs speed up analysis but hallucinate; every number and claim must be validated against the source data.'),
            q('You ask an LLM to write and run SQL to answer "what was our churn rate last quarter" against your warehouse. It returns a confident number. What is the single most important verification step before it goes into a report?', ['None, LLM-generated SQL is trustworthy by default', 'Read the generated SQL itself and confirm the churn definition (denominator, date window, exclusions) actually matches what the business means by "churn rate"', 'Ask the LLM twice and average the two answers', 'Increase the temperature for more creative phrasing'], 1, 'The risk with LLM-generated analysis isn\'t just wrong arithmetic — it\'s silently wrong business logic (wrong cohort, wrong window). Reviewing the actual query against the intended metric definition is the check that catches this.'),
            q('An LLM-assisted analysis pipeline is used to auto-generate a weekly exec summary with no human review before sending. What is the biggest risk of this setup, and the minimum safeguard?', ['None — automation is always safe', 'An undetected hallucinated number or misinterpreted trend reaches decision-makers unchecked; require a human review gate (or automated validation against known source values) before external distribution', 'It will run too slowly', 'It costs too much in API calls'], 1, 'Removing a human/automated check between LLM output and a real decision-maker is the core danger with AI-assisted analysis — speed is only useful if there is still a verification step before the claim is acted on.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Kaggle Intro to Machine Learning course, high training accuracy but poor test accuracy indicates…', ['Underfitting', 'Overfitting', 'Data leakage is impossible', 'A perfect model'], 1, 'The model memorized training data instead of generalizing — the classic overfitting signature.'),
            q('A decision tree with unlimited depth gets 99.9% training accuracy but 62% test accuracy, barely better than a simple baseline. Which two changes are most directly aimed at fixing this?', ['Train longer and add more trees with no limits', 'Limit tree depth / add regularization, and get more training data or use cross-validation to tune complexity', 'Remove the test set entirely', 'Increase the learning rate'], 1, 'This is textbook overfitting from excess model capacity relative to data; constraining complexity (max depth, pruning, regularization) and validating with cross-validation are the standard levers.'),
            q('You are comparing a high-bias/low-variance linear model against a low-bias/high-variance deep tree on the same problem, and both perform worse than desired. What does the bias-variance tradeoff say about how to choose, and how would you diagnose which one you have?', ['Always pick the more complex model', 'Plot training vs. validation error: high error on both means high bias (underfitting) — need more capacity; low training error but high validation error means high variance (overfitting) — need regularization or more data', 'Bias and variance cannot both be measured', 'Pick randomly, it does not matter'], 1, 'The train/validation error gap is the standard diagnostic: both errors high and close together points to bias (underfitting); a big gap with low training error points to variance (overfitting) — this determines which lever to pull.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Kaggle Feature Engineering course, data leakage means…', ['Missing values', 'Information from the target/future leaking into features', 'Slow training', 'Too many features'], 1, 'Leakage lets the model peek at information unavailable at prediction time, inflating offline metrics.'),
            q('You standardize (mean/std) a feature using the full dataset\'s statistics before splitting into train/test, and offline accuracy looks great but production performance is much worse. What went wrong?', ['Standardization is never appropriate', 'The test set statistics leaked into the training-time transformation; scaling parameters must be fit on the training set only, then applied to the test/production data', 'The model needs more epochs', 'The learning rate was too high'], 1, 'Fitting any preprocessing (scalers, encoders, imputers) on data that includes the test set leaks test-set information into training, inflating offline metrics in a way that will not hold in production.'),
            q('A churn model includes a feature "days_since_cancellation_request" and gets near-perfect accuracy. Why is this a red flag rather than a win?', ['It is not a red flag, ship it', 'That feature is only populated *after* the outcome you are predicting has already happened, so it directly encodes the label — a classic case of target leakage', 'The feature name is too long', 'The model is simply very good'], 1, 'Suspiciously perfect performance is the classic symptom of target leakage: a feature that is only known post-outcome effectively hands the model the answer, and the model will fail once that feature is unavailable at real prediction time.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the scikit-learn model evaluation guide, for imbalanced classification, accuracy is misleading because…', ['It is slow', 'Predicting the majority class scores high', 'It needs GPUs', 'It requires calibration'], 1, 'With 99/1 class balance, always predicting the majority hits 99% accuracy while catching nothing.'),
            q('A fraud model has 99.5% accuracy on a dataset where 0.5% of transactions are fraud, but it catches almost no real fraud. Which pair of metrics would have exposed this immediately?', ['R² and MAE', 'Precision and recall (or PR-AUC), which measure performance specifically on the positive/minority class', 'Mean squared error', 'Training loss curve'], 1, 'Precision/recall focus on how the model handles the positive class specifically, so a model that mostly predicts "not fraud" shows up immediately as near-zero recall, unlike accuracy which is dominated by the majority class.'),
            q('For a cancer-screening model, missing an actual positive case (false negative) is far more costly than a false alarm (false positive). Which should you optimize for, and how would you tune it?', ['Maximize precision only, ignore recall', 'Maximize recall (catch as many true positives as possible), accepting lower precision, by lowering the classification threshold', 'Maximize accuracy only', 'Use the default 0.5 threshold always, thresholds cannot be changed'], 1, 'When false negatives are more costly than false positives, you deliberately trade precision for recall by lowering the decision threshold — accuracy and a fixed default threshold ignore this asymmetric cost.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per Trustworthy Online Controlled Experiments, peeking at A/B results daily and stopping early…', ['Is best practice', 'Inflates false positives', 'Reduces variance', 'Has no effect'], 1, 'Repeated significance checks without correction dramatically inflate the false-positive rate.'),
            q('You pre-computed a required sample size for 95% confidence, but a PM wants to stop the test the moment p < 0.05 appears mid-experiment, whenever that happens. Why is this statistically invalid?', ['It is valid, p < 0.05 always means significant', 'Repeatedly testing significance as data accumulates and stopping at the first crossing inflates the true false-positive rate far above 5% (the classic "peeking problem")', 'It only affects small samples', 'It makes the test run faster with no downside'], 1, 'A p-value threshold assumes a single test at a predetermined sample size; checking repeatedly and stopping at the first significant result is equivalent to running many tests, which sharply raises the chance of a false positive — sequential testing methods exist specifically to correct for this.'),
            q('An A/B test shows a statistically significant 0.3% lift in click-through rate with p = 0.01. Why might a mature experimentation team still decline to ship the change?', ['p = 0.01 is not significant enough', 'Statistical significance does not imply practical significance — a real but tiny effect may not be worth the engineering/maintenance cost or may not move the actual business metric that matters', 'Significant results should never be trusted', '0.3% is impossible to measure accurately'], 1, 'Significance tells you an effect is probably real, not that it is large enough to matter; practical significance (effect size vs. cost, and whether it moves a metric the business actually cares about) is a separate judgment call.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Following FastAPI's model-serving docs, model artifacts should be…", ['Retrained per request', 'Versioned and loaded at startup', 'Stored in the client', 'Hardcoded'], 1, 'Versioned artifacts loaded at startup give reproducible, fast inference and clean rollbacks.'),
            q('A newly deployed model version causes a spike in errors 10 minutes after rollout. What deployment pattern lets you catch and revert this with minimal user impact, instead of a full instant cutover?', ['Deploy directly to 100% of traffic every time', 'Canary/rolling deployment — route a small percentage of traffic to the new version first, monitor, then ramp up or roll back', 'Disable monitoring to reduce noise', 'Only deploy on weekends'], 1, 'Canary or rolling rollouts limit blast radius: a small traffic slice validates the new version in production before it serves everyone, so a bad model version is caught and reverted before it affects most users.'),
            q('Your online inference endpoint returns different predictions than your offline batch evaluation for the same inputs. What is the most likely engineering cause to check first?', ['The model is non-deterministic by nature, nothing to check', 'Training/serving skew — the online feature computation path uses different logic, data freshness, or preprocessing than the offline training/eval path', 'The server has too much RAM', 'The client is caching old responses'], 1, 'Training/serving skew — subtly different feature pipelines between offline training and online serving — is the classic cause of this mismatch, which is exactly the problem feature stores are designed to eliminate.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per fast.ai's Practical Deep Learning for Coders, transfer learning works because…", ['Small data trains from scratch', 'Early layers learn reusable general features', 'GPUs are fast', 'Labels are optional'], 1, 'Pretrained networks capture general features; fine-tuning adapts them to your task with little data.'),
            q('You fine-tune a large pretrained image model on only 300 labeled examples for a new task, and validation loss starts rising after just 2 epochs while training loss keeps falling. What is happening and what would you try first?', ['The model needs more layers', 'Rapid overfitting on a tiny dataset — freeze most of the pretrained backbone and only fine-tune the last layers, add augmentation, or use early stopping', 'The learning rate is too low', 'This is expected and fine to ship'], 1, 'A small fine-tuning set relative to model capacity overfits fast; freezing earlier general-purpose layers, adding augmentation, and stopping early are the standard countermeasures.'),
            q('Training loss decreases smoothly but validation loss plateaus then increases while training continues for many more epochs. What technique directly addresses this without changing the model architecture?', ['Increase the batch size only', 'Early stopping — halt training at the epoch where validation loss is lowest, before the model starts overfitting to the training set', 'Train for more epochs regardless', 'Remove the validation set'], 1, 'Early stopping monitors validation loss and stops training once it stops improving, directly countering the point where additional training epochs start hurting generalization.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Hugging Face NLP Course, prefer RAG over fine-tuning when…', ['Knowledge changes frequently', 'You need a new output style', 'Latency must be minimal', 'You have no documents'], 0, 'RAG serves fresh, updatable knowledge at query time; fine-tuning bakes behavior/style into weights.'),
            q('Your company\'s policy documents change weekly, and users need answers reflecting the latest version at all times with no model retraining. Which architecture fits, and why is fine-tuning the wrong default here?', ['Fine-tune weekly on the new documents', 'RAG — retrieve the current documents at query time so answers always reflect the latest source, since fine-tuning bakes a snapshot into frozen weights that goes stale immediately', 'Neither, use only prompt engineering', 'Increase the context window and paste nothing'], 1, 'Fine-tuning encodes a point-in-time snapshot into the weights and requires retraining to update; RAG separates knowledge from the model so updating a document instantly updates what the system can answer with, without touching the model.'),
            q('A support bot fine-tuned on your product docs still occasionally fabricates a plausible-sounding but wrong feature. Adding RAG on top of the fine-tuned model does NOT fully fix this. What is the remaining necessary safeguard?', ['Nothing more is needed, RAG solves everything', 'The model can still ignore or misuse retrieved context; you still need grounding checks, citation of retrieved sources, and evals that specifically test faithfulness to the retrieved documents', 'Switch back to pure fine-tuning', 'Remove the fine-tuning step entirely'], 1, 'RAG reduces but does not eliminate hallucination — the model can still generate ungrounded claims despite having correct context available, which is why faithfulness evals and citation/grounding checks remain necessary on top of retrieval.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the Anthropic API docs, tool use lets an LLM…', ['Train itself', 'Call functions you define and use the results', 'Access weights', 'Skip safety'], 1, 'You declare tools; the model requests calls with arguments and incorporates your returned results.'),
            q('You give a model a get_weather tool. The model returns a tool_use block requesting that function with arguments. What must your application do next before the conversation can continue?', ['Nothing, the model calls the function itself', 'Execute the function yourself with those arguments and send the result back as a tool_result message in the next API call', 'Ignore it and ask the model to answer directly', 'Restart the conversation'], 1, 'The model only *requests* a call — your application code is responsible for actually executing the function and returning the result as a tool_result, which the model then reasons over.'),
            q('An orchestration layer calls three different LLM providers depending on task type, and a rate limit or outage on one provider currently crashes the whole app. What resilience pattern should wrap each provider call?', ['No pattern needed, providers never fail', 'Retries with backoff plus a fallback provider/model, so a single provider failure degrades gracefully instead of crashing the app', 'A single try/catch that always returns a blank response', 'Removing error handling to simplify the code'], 1, 'Multi-provider orchestration should treat any single provider as unreliable — retries with backoff and a fallback path are the standard way to keep the app functioning through a provider outage.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Pinecone's Retrieval-Augmented Generation guide, reranking improves RAG by…", ['Making embeddings smaller', 'Reordering retrieved candidates by relevance before generation', 'Caching responses', 'Increasing chunk size'], 1, 'A reranker scores query-document pairs precisely, promoting the truly relevant chunks into context.'),
            q('Your RAG system retrieves the top 5 chunks by embedding similarity, but the answer often needs a fact that ranked 12th. What two-stage retrieval pattern addresses this without just always fetching more chunks?', ['Only ever fetch 5 chunks, nothing more', 'Retrieve a larger candidate set (e.g. top 50) cheaply via vector search, then rerank with a more precise (often cross-encoder) model and keep only the true top few for the prompt', 'Switch to keyword search only', 'Increase the LLM context window instead'], 1, 'Vector similarity search is fast but imprecise at the margins; a two-stage retrieve-then-rerank pipeline gets the recall benefit of a wide first pass with the precision of a slower, more accurate reranker on the smaller candidate set.'),
            q('You chunk documents into fixed 200-token blocks with no overlap, and answers frequently miss context because a key sentence got split across two chunks. What chunking change fixes this class of problem?', ['Chunk size does not matter', 'Add overlap between consecutive chunks (or chunk along semantic boundaries like paragraphs) so a sentence/idea is unlikely to be split with no shared context', 'Use larger embeddings instead', 'Remove chunking entirely and embed whole documents'], 1, 'Naive fixed-size chunking with no overlap regularly severs ideas mid-thought; overlapping windows or boundary-aware (semantic/paragraph) chunking preserves enough surrounding context that a split point rarely loses the answer.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Anthropic's Building Effective Agents, you should reach for an agent when…", ['Always', "A workflow's steps cannot be predetermined", 'Latency is critical', 'Costs must be fixed'], 1, 'If the path is predictable, a fixed workflow is cheaper and more reliable; agents earn their cost on open-ended tasks.'),
            q('A task always follows the same 4 fixed steps in the same order (extract → validate → transform → load) with no branching based on intermediate results. Should you build this as an autonomous agent that decides its own steps?', ['Yes, always use an agent for any LLM task', 'No — a fixed, predetermined workflow is more reliable, cheaper, and easier to debug than giving an LLM autonomy over a path that never actually varies', 'Only if the LLM is a large model', 'Agents and workflows are the same thing'], 1, 'Agent autonomy earns its cost/latency/reliability tradeoff specifically when the next step genuinely depends on unpredictable intermediate results; a fixed sequence is exactly the case where a deterministic pipeline beats an agent.'),
            q('An autonomous coding agent given file-write and shell-exec tools with no limits deletes an important file while "cleaning up" during a long unsupervised run. What agent design principle was missing?', ['Agents should never have any tools', 'Guardrails — scoped permissions, human-in-the-loop confirmation for destructive/irreversible actions, and a bounded action space appropriate to the risk', 'The model needed a bigger context window', 'The agent needed more autonomy, not less'], 1, 'The core agent-safety pattern is matching autonomy to risk: irreversible or destructive actions need explicit confirmation gates or restricted permissions, not unlimited tool access in an unsupervised loop.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Anthropic's vision documentation, for extracting fields from documents, the most robust approach is…", ['Regex on OCR text only', 'Multimodal model with a strict output schema and validation', 'Manual entry', 'Screenshots in prompts without structure'], 1, 'Schema-constrained multimodal extraction plus validation catches errors that brittle regex/OCR pipelines miss.'),
            q('A multimodal invoice-extraction pipeline occasionally returns a total_amount field as the string "approximately $450" instead of a number, breaking downstream code that expects a float. What is the most robust fix?', ['Manually check every invoice', 'Enforce a strict output schema (e.g. JSON schema/structured output) with typed fields and validate/reject responses that don\'t conform, rather than parsing free-form text', 'Ask the model nicely to always use numbers', 'Switch to a smaller model'], 1, 'Constraining the model to a strict, typed schema (and validating the response against it, retrying on violation) is what makes extraction pipelines robust — free-form text output will eventually drift in format.'),
            q('A document-extraction system performs well on clean scans but silently returns wrong values on rotated or low-quality scans, with no way to tell which outputs to trust. What should the pipeline add?', ['Nothing, low-quality scans are rare enough to ignore', 'A confidence/uncertainty signal or self-consistency check (e.g. asking the model to flag low-confidence fields, or cross-checking against a second pass) so low-quality outputs can be routed to human review instead of shipped silently', 'Always use the first response with no checks', 'Remove multimodal input for lower-quality documents entirely'], 1, 'Since models can produce confident-sounding wrong answers on degraded inputs, production extraction pipelines need an explicit way to flag low-confidence outputs for human review, not just trust every response equally.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Eugene Yan's Guide to LLM Evals, prompt changes should ship only after…", ['Manual vibes check', 'Passing a regression eval suite', 'A bigger model is used', 'Temperature is zeroed'], 1, 'Evals turn prompt engineering into engineering: regressions get caught before users see them.'),
            q('A prompt tweak makes outputs "feel better" in five manual spot checks, but after shipping, a whole category of edge-case inputs starts failing in production. What process failure caused this?', ['Nothing could have caught this', 'No regression eval suite covering the known edge cases was run before shipping — five manual "vibes" checks cannot represent the full input distribution the way a maintained eval set can', 'The model was too small', 'The prompt was too short'], 1, 'Manual spot-checking samples too small and too biased toward obvious cases to catch edge-case regressions; a maintained eval set (including known hard cases) run on every change is what catches this before users do.'),
            q('You need to evaluate whether an LLM\'s free-text summaries are factually faithful to the source document, at a scale where human review of every output is infeasible. What is the standard approach?', ['Only spot-check a handful manually, forever', 'Use an LLM-as-judge with a clear rubric (and periodically validate the judge against human ratings) or automated faithfulness/groundedness checks, since exact-match scoring does not work for open-ended text', 'Exact string match against a reference summary', 'Skip evaluation since summaries are subjective'], 1, 'Open-ended generation cannot be scored with exact match; LLM-as-judge (calibrated against human labels) or dedicated faithfulness metrics are the standard way to evaluate free-text quality at scale.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Chip Huyen's AI Engineering notes, when the model fails or times out, a production AI product should…", ['Show a stack trace', 'Degrade gracefully to a designed fallback', 'Retry forever', 'Block the UI'], 1, 'Fallbacks (cached answers, simpler models, honest empty states) are part of the product design, not an afterthought.'),
            q('An AI feature\'s p50 latency is fine but p99 latency spikes to 30 seconds during peak load, frustrating a small but real slice of users. What should the product design around this, beyond just "optimize the model"?', ['Ignore p99, only p50 matters', 'Design explicit UX for the slow-tail case — timeouts with a fallback (cached/simpler response, streaming partial output, or an honest "still working" state) rather than a silent hang', 'Force every request to wait the full 30 seconds', 'Remove the AI feature entirely'], 1, 'Tail latency is a design problem as much as an infra problem — a mature AI product plans for the slow case explicitly (timeouts, fallbacks, streaming) instead of only optimizing the median and leaving p99 users with a hang.'),
            q('A cost review shows one AI feature accounts for 80% of total LLM spend because it always calls the largest, most expensive model regardless of query complexity. What architectural pattern reduces cost without necessarily hurting quality?', ['Cache nothing and call the biggest model for everything, always', 'Model routing/cascading — use a cheaper, faster model for simple queries and only escalate to the expensive model when needed (e.g. based on a confidence check or query classifier)', 'Reduce the number of users', 'Remove all monitoring to save compute'], 1, 'Routing simple queries to smaller/cheaper models and reserving expensive models for genuinely hard cases (a cascade) is a standard cost-control pattern that avoids paying top-model prices for every request.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Docker's Getting Started guide, Docker image layers are…", ['Random snapshots', 'Cached filesystem diffs created per instruction', 'VM disks', 'Encrypted volumes'], 1, 'Each Dockerfile instruction creates a cached layer; ordering instructions well makes rebuilds fast.'),
            q('A Dockerfile does COPY . . before RUN pip install -r requirements.txt, so every code change (even a one-line comment) invalidates the pip install layer and forces a full dependency reinstall on every build. What is the fix?', ['Nothing can be done, this is unavoidable', 'Reorder: COPY only requirements.txt and run pip install first, then COPY the rest of the code — code changes no longer invalidate the dependency layer', 'Remove the requirements.txt file', 'Disable Docker layer caching entirely'], 1, 'Docker caches each layer and invalidates everything after the first changed instruction; copying dependency manifests and installing them before copying the full source keeps that expensive layer cached across code-only changes.'),
            q('A production image built from python:3.11 is 1.8GB because it includes build tools, compilers, and cached pip wheels only needed at build time. What Docker technique directly reduces the final image size while keeping build tooling available during the build?', ['Use a bigger base image', 'Multi-stage builds — compile/install in a build stage, then copy only the needed artifacts into a slim final stage that excludes build-only tooling', 'Delete the Dockerfile after building', 'Compress the image with a zip file after the fact'], 1, 'Multi-stage builds let you use a full toolchain in an intermediate stage and copy only the runtime artifacts into a minimal final image, cutting size without sacrificing the build environment.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Working through the GitHub Actions docs, CI for ML differs from app CI because it must also validate…', ['Only code style', 'Data and model quality', 'Commit messages', 'Branch names'], 1, 'ML behavior depends on data and weights, so pipelines test datasets and model metrics, not just code.'),
            q('An ML CI pipeline passes all unit tests (code compiles, functions return correct types) but a newly trained model still ships with 15% worse accuracy than the previous version. What did the CI pipeline fail to check?', ['Nothing, unit tests are sufficient for ML', 'Model-quality gates — CI needs to also evaluate the trained model against a held-out benchmark/eval set and fail the build if key metrics regress past a threshold, not just check that code runs', 'The commit message format', 'Whether the code is well-commented'], 1, 'Passing code-level tests says nothing about model quality; ML CI needs an explicit metric-regression gate against a fixed evaluation set, since a model can be "correct code, wrong behavior" in a way pure unit tests never catch.'),
            q('A retraining pipeline automatically promotes any newly trained model to production the moment training finishes, with no human check. What is the main risk this introduces, and what is the standard safeguard?', ['No risk, automation is always safer', 'A model degraded by bad/corrupted training data (or a silent bug) could reach production unnoticed; the safeguard is a gated promotion step — automated eval thresholds and/or human sign-off before a new model replaces the serving one', 'The pipeline will run too fast', 'Automatic promotion has no relationship to data quality'], 1, 'Fully automatic promotion removes the last check between a bad training run and production; mature MLOps pipelines gate promotion on eval thresholds (and often human approval) precisely to prevent this failure mode.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Evidently AI's monitoring guides, concept drift means…", ['Inputs changed distribution', 'The relationship between inputs and target changed', 'The model file corrupted', 'Latency increased'], 1, "Concept drift is when P(y|x) changes — the world's behavior shifted, so the learned mapping decays."),
            q('Monitoring shows the distribution of an input feature (e.g. average session length) shifted significantly, but the model\'s accuracy on labeled recent data hasn\'t changed yet. What is this called, and why might it still matter even before accuracy drops?', ['Concept drift — accuracy must already be dropping', 'Data/feature drift — the input distribution moved even though the learned input-output relationship still holds; it is an early warning that accuracy degradation may follow if the shift continues or interacts with edge cases', 'A labeling error', 'Nothing, this is not a real signal'], 1, 'Data drift (input distribution change) is distinct from concept drift (the relationship changing) — it can precede an accuracy drop and serves as an early warning even when current labeled accuracy still looks fine.'),
            q('A fraud model\'s accuracy on live traffic can\'t be measured in real time because true fraud labels only arrive weeks later after investigation. How do teams monitor for degradation in the meantime?', ['Wait for labels and do nothing until then', 'Monitor proxy signals — input/prediction distribution drift, prediction confidence shifts, and business-outcome proxies — as an early-warning system until ground-truth labels catch up', 'Assume the model is fine since accuracy cannot be measured', 'Retrain daily regardless of any signal'], 1, 'When labels are delayed, monitoring shifts to proxy signals (feature drift, output distribution changes, confidence scores) that can flag a likely problem well before delayed ground truth confirms it.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Chip Huyen's Designing Machine Learning Systems notes, a feature store primarily solves…", ['GPU scheduling', 'Consistent features between training and serving', 'Model compression', 'Data visualization'], 1, 'Training/serving skew disappears when both read identical feature definitions from one store.'),
            q('An online model needs a "user\'s average order value over the last 30 days" feature computed with sub-50ms latency per request, while the training pipeline computes the same feature in a batch job over the full historical warehouse. What feature-store capability reconciles these two very different compute paths?', ['Nothing needed, just compute it twice independently', 'An offline store for batch training data and a low-latency online store for serving, both derived from the same feature definition — so the value is guaranteed consistent even though the compute paths differ', 'Only ever use the online store for training too', 'Precompute the feature once and never update it'], 1, 'Feature stores typically split into an offline store (batch-friendly, used for training) and an online store (low-latency, used for serving), both fed by the same feature definition — this dual-path design is exactly what prevents skew while still meeting serving latency.'),
            q('Two different model teams each independently compute "customer lifetime value" with slightly different logic, and their models disagree in production in ways that are hard to debug. What feature-store benefit would have prevented this?', ['Faster GPUs', 'A shared, versioned feature definition that both teams reuse instead of re-deriving the same business concept independently, eliminating silent logic drift between teams', 'More storage capacity', 'A bigger training dataset'], 1, 'Beyond train/serve consistency, a feature store\'s registry of shared, reusable feature definitions prevents different teams from quietly diverging on the definition of the same underlying concept.'),
          )],
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
          ['Checkpoint quiz', 'quiz', quiz(
            q('Per the MLOps Zoomcamp capstone material, a model registry provides…', ['Faster training', 'Versioned, stage-managed models with lineage', 'Data labeling', 'Feature computation'], 1, 'Registries track model versions, stages (staging/prod), and lineage — the backbone of controlled deployment.'),
            q('A model in production starts behaving badly and the on-call engineer needs to roll back to the previous known-good version in minutes, at 3am, without access to the original training script. What does a model registry give them that makes this possible?', ['Nothing, they need to retrain from scratch', 'A versioned, immutable record of every promoted model artifact (with its stage history) that can be re-deployed directly — rollback becomes "point at the previous version," not "reproduce the training run"', 'The registry only stores hyperparameters, not artifacts', 'Faster GPUs for retraining'], 1, 'The whole point of registering trained artifacts (not just code) is that rollback is instant — you redeploy a previously versioned artifact rather than needing to re-run training under time pressure.'),
            q('An auditor asks which exact dataset version, code commit, and hyperparameters produced the model currently serving predictions to customers. Which MLOps practice is this question really testing, and what artifact answers it directly?', ['Model accuracy metrics', 'Lineage tracking captured in the model registry — linking each registered model version back to its training data version, code commit, and config, so provenance is answerable without guesswork', 'The size of the training cluster', 'The name of the model file'], 1, 'This is a lineage/reproducibility question — the registry entry for a model version is meant to record exactly this chain (data, code, params) so provenance and compliance questions have a direct, auditable answer.'),
          )],
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
