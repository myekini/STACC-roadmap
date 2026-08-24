// Stacc Roadmap content — mirrors supabase/seed.sql exactly.
// In Supabase mode content comes from the database; in localStorage demo mode it
// comes from here. Node ids equal slugs locally so progress keys stay stable.
//
// Editorial rules (keep the tree readable, not just complete):
//  - Exactly 3 skills per node — more than that fans too many chips off one
//    module on the roadmap and the progression reads as noise instead of a path.
//  - Up to 2 curated resources per topic — a bounded primary lesson and, when
//    it adds real value, a reference to return to. Do not fill format quotas
//    with weaker material: executable checkpoints can be the validation layer.
//
// Node content structure (supabase/migrations/0030_node_topics.sql): a node
// breaks into topics — today, exactly the node's 3 `skills`, synthesized
// below rather than hand-authored, since that's already the de facto topic
// list. The optional topic index on a resource keeps the demo curriculum in
// lockstep with the topic-aware Supabase content.
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
  TopicRow,
} from '@/lib/database.types';

type SqlRow = Record<string, unknown>;

type ResourceDef = [
  name: string,
  type: ResourceType,
  platform: string,
  url: string,
  topicIndex?: 0 | 1 | 2,
];
interface LessonMeta {
  resourceIndex: number;
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

const FOUNDATION_SLUGS = [
  'found-cli',
  'found-python',
  'found-git',
  'found-tabular',
  'found-sql',
  'found-stats',
  'found-ai',
  'found-capstone',
];

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
    description: 'The tested professional baseline every data role requires before a specialization.',
    icon: 'terminal',
    tags: ['Python', 'NumPy', 'pandas', 'SQL', 'Git', 'Statistics', 'AI Literacy'],
    requiresPaths: [],
    nodes: [
      {
        slug: 'found-python', name: 'Python Foundations', subtitle: 'Programs you can trust',
        description: 'Write, test, and run a small Python program with clear functions, deliberate error handling, and a reproducible environment.',
        icon: 'code', estHours: 10, xp: 100,
        skills: ['Control flow, functions & modules', 'Files, parsing & errors', 'Environments, dependencies & tests'], prereqs: ['found-cli'],
        resources: [
          ['Python Tutorial — control flow and functions', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/controlflow.html'],
          ['Python Tutorial — modules', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/modules.html'],
          ['Python Tutorial — input/output and errors', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/inputoutput.html', 1],
          ['Python Tutorial — errors and exceptions', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/errors.html', 1],
          ['Python Tutorial — virtual environments', 'documentation', 'Python.org', 'https://docs.python.org/3/tutorial/venv.html', 2],
          ['pytest — get started', 'documentation', 'pytest', 'https://docs.pytest.org/en/stable/getting-started.html', 2],
        ],
        tasks: [
          ['Learn: reproduce the bounded control-flow, function, and module examples', 'read', undefined, { resourceIndex: 0, title: 'Functions, modules, and readable program structure', durationMinutes: 70 }],
          ['Learn: complete the file I/O and exception-handling examples', 'read', undefined, { resourceIndex: 2, title: 'Files, parsing failures, and precise exceptions', durationMinutes: 55 }],
          ['Learn: create a virtual environment and complete the pytest getting-started example', 'read', undefined, { resourceIndex: 4, title: 'Reproducible environments and first tests', durationMinutes: 40 }],
          ['Build: create summarize_csv.py with small functions, argparse input/output paths, specific exceptions, a requirements file, and tests for a valid file, missing file, and malformed row', 'build'],
          ['Checkpoint challenge: parse_measurements(rows)', 'challenge', challenge(
            'Write parse_measurements(rows). Each row is "name,value". Ignore blank rows, raise ValueError for malformed rows or non-numeric values, and return a dictionary mapping each name to a float.',
            'def parse_measurements(rows):\n    """Parse name,value rows into {name: float_value}."""\n    # your code here\n    pass\n',
            "assert parse_measurements(['cpu,12.5', '', 'memory,8']) == {'cpu': 12.5, 'memory': 8.0}\n"
              + "assert parse_measurements([]) == {}\n"
              + "\nfor bad in (['missing-comma'], ['cpu,not-a-number'], ['cpu,1,extra']):\n"
              + "    try:\n        parse_measurements(bad)\n        raise AssertionError('Expected ValueError')\n    except ValueError:\n        pass\n",
          )],
        ],
      },
      {
        slug: 'found-tabular', name: 'Tabular Python', subtitle: 'NumPy and pandas',
        description: 'Transform messy tabular data with vectorized NumPy and pandas operations, then enforce an explicit data contract.',
        icon: 'table_view', estHours: 10, xp: 100,
        skills: ['NumPy arrays & vectorization', 'pandas cleaning, joins & grouping', 'Schemas & quality checks'], prereqs: ['found-git'],
        resources: [
          ['NumPy — absolute basics for beginners', 'documentation', 'NumPy', 'https://numpy.org/doc/stable/user/absolute_beginners.html'],
          ['NumPy quickstart — shape, axes, and vectorization', 'documentation', 'NumPy', 'https://numpy.org/doc/stable/user/quickstart.html'],
          ['10 minutes to pandas', 'documentation', 'pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html', 1],
          ['pandas — group by: split-apply-combine', 'documentation', 'pandas', 'https://pandas.pydata.org/docs/user_guide/groupby.html', 1],
          ['Validate pandas data with Pandera', 'video', 'ArjanCodes', 'https://www.youtube.com/watch?v=-tU7fuUiq7w', 2],
          ['Pandera DataFrame schemas', 'documentation', 'Pandera', 'https://pandera.readthedocs.io/en/stable/dataframe_schemas.html', 2],
        ],
        tasks: [
          ['Learn: work through array creation, shape, dtype, indexing, boolean masks, aggregation, and broadcasting', 'read', undefined, { resourceIndex: 0, title: 'NumPy arrays without unnecessary scientific-computing depth', durationMinutes: 60 }],
          ['Learn: reproduce pandas selection, missing-data, merge, groupby, reshape, and export examples', 'read', undefined, { resourceIndex: 2, title: 'Practical DataFrame transformations', durationMinutes: 80 }],
          ['Learn: watch the bounded Pandera walkthrough and reproduce one DataFrame schema', 'watch', undefined, { resourceIndex: 4, title: 'Executable tabular data contracts', durationMinutes: 30 }],
          ['Build: create clean_data.py and test_clean_data.py that load a messy CSV, validate types and required columns, handle nulls and duplicates, join a lookup table, calculate grouped metrics, and export a deterministic tidy CSV', 'build'],
          ['Checkpoint challenge: valid_rows(values)', 'challenge', challenge(
            'Write valid_rows(values): convert the input to a NumPy float array, keep only finite non-negative values, and return their mean as a float. Return None when no valid values remain.',
            'def valid_rows(values):\n    """Return the mean of finite, non-negative values, or None."""\n    import numpy as np\n    # your code here\n    pass\n',
            'import math\nassert valid_rows([1, 2, 3]) == 2.0\nassert valid_rows([-1, float("nan"), 4, 6]) == 5.0\nassert valid_rows([-2, float("inf")]) is None\nassert math.isclose(valid_rows([0, 0.5]), 0.25)\n',
          )],
        ],
      },
      {
        slug: 'found-sql', name: 'SQL Foundations', subtitle: 'Questions into queries',
        description: 'Build from SELECT, filtering, sorting, and grouping to correct joins, CTEs, window functions, and validated business answers.',
        icon: 'database', estHours: 10, xp: 100,
        skills: ['SELECT, FROM, WHERE & NULLs', 'Joins, grouping & CTEs', 'Windows, plans & validation'], prereqs: ['found-tabular'],
        resources: [
          ['SQLBolt — lessons 1–12', 'course', 'SQLBolt', 'https://sqlbolt.com/'],
          ['PostgreSQL — querying a table', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/tutorial-select.html'],
          ['PostgreSQL Exercises — joins and subqueries', 'course', 'PGExercises', 'https://pgexercises.com/questions/joins/', 1],
          ['PostgreSQL — WITH queries', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/queries-with.html', 1],
          ['PostgreSQL — window functions tutorial', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/tutorial-window.html', 2],
          ['PostgreSQL — using EXPLAIN', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/using-explain.html', 2],
        ],
        tasks: [
          ['Learn: complete SQLBolt lessons 1–12, including NULLs and query order', 'read', undefined, { resourceIndex: 0, title: 'Relational queries, joins, NULLs, and aggregation', durationMinutes: 80 }],
          ['Learn: complete the join exercises, then study CTE and window-function examples', 'read', undefined, { resourceIndex: 2, title: 'Multi-step analysis with CTEs and windows', durationMinutes: 75 }],
          ['Learn: reproduce window-function examples, inspect one query plan, and write uniqueness, not-null, and reconciliation checks', 'read', undefined, { resourceIndex: 4, title: 'Windows, query plans, and validation', durationMinutes: 55 }],
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
        skills: ['Files, staging & commits', 'Branches & pull requests', 'Conflicts & safe recovery'], prereqs: ['found-python'],
        resources: [
          ['Pro Git — Git Basics and Branching', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2'],
          ['Review pull requests', 'course', 'GitHub Skills', 'https://github.com/skills/review-pull-requests', 1],
          ['Resolve merge conflicts', 'course', 'GitHub Skills', 'https://github.com/skills/resolve-merge-conflicts', 2],
          ['Git tools — reset demystified', 'documentation', 'git-scm.com', 'https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified', 2],
        ],
        tasks: [
          ['Learn: read Pro Git chapters 2–3 and complete GitHub Skills: Review pull requests', 'read', undefined, { resourceIndex: 0, title: 'Everyday Git: commits, branches and remotes', durationMinutes: 55 }],
          ['Learn: complete Resolve Merge Conflicts and compare restore, revert, reset, and reflog', 'read', undefined, { resourceIndex: 2, title: 'Conflict resolution and safe recovery', durationMinutes: 45 }],
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
        skills: ['Navigation, files & pipes', 'Processes, permissions & environment', 'Safe shell scripts'], prereqs: [],
        resources: [
          ['Missing Semester 2026 — Introduction to the Shell', 'video', 'MIT', 'https://missing.csail.mit.edu/2026/course-shell/'],
          ['Missing Semester 2026 — Command-line Environment', 'video', 'MIT', 'https://missing.csail.mit.edu/2026/command-line-environment/', 1],
          ['ShellCheck', 'project', 'ShellCheck', 'https://www.shellcheck.net/', 2],
          ['Google Shell Style Guide', 'documentation', 'Google', 'https://google.github.io/styleguide/shellguide.html', 2],
        ],
        tasks: [
          ['Learn: complete the 2026 shell lecture and exercises on navigation, streams, pipes, quoting, and loops', 'watch', undefined, { resourceIndex: 0, title: 'The shell as a composable programming environment', durationMinutes: 65 }],
          ['Learn: study arguments, environment variables, return codes, signals, processes, permissions, and safe installer habits', 'watch', undefined, { resourceIndex: 1, title: 'Processes and the command-line environment', durationMinutes: 55 }],
          ['Learn: run ShellCheck on a script and correct every justified finding', 'read', undefined, { resourceIndex: 2, title: 'Safer shell scripts', durationMinutes: 25 }],
          ['Build: write an idempotent shell script that validates its input directory, organises files by extension, logs its actions, and handles spaces in filenames', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('In the Missing Semester shell lecture, which operator sends the output of one command into another?', ['>', '>>', '|', '&'], 2, 'The pipe | streams stdout of one command into stdin of the next; > and >> redirect to files.'),
            q('You need to count lines in every .csv file modified in the last 24 hours, including filenames with spaces. Which command is safe?', ['cat *.csv | wc -l', 'find . -name "*.csv" -mtime -1 -exec wc -l {} +', 'ls -R | grep csv | head', 'find . -name "*.csv" | xargs wc -l'], 1, 'find -exec passes paths as arguments without splitting on spaces; plain xargs is unsafe unless paired with null-delimited input.'),
            q('A long-running script you started in a terminal needs to keep running after you close the SSH session. What is the correct approach?', ['Just close the terminal, it keeps running', 'Run it with nohup/disown or inside tmux/screen so it detaches from the session', 'Run it with sudo', 'Pipe it to /dev/null'], 1, 'Closing a terminal sends SIGHUP to child processes by default; nohup or a multiplexer (tmux/screen) detaches the process from the controlling session so it survives disconnect.'),
          )],
        ],
      },
      {
        slug: 'found-stats', name: 'Statistics Basics', subtitle: 'Think in distributions',
        description: 'Describe uncertainty in a dataset, choose an appropriate comparison, and communicate what the evidence cannot prove.',
        icon: 'insights', estHours: 10, xp: 100,
        skills: ['Distributions, sampling & uncertainty', 'Intervals, effects & tests', 'Correlation & causal limits'], prereqs: ['found-sql'],
        resources: [
          ['Seeing Theory — distributions and inference', 'article', 'Brown University', 'https://seeing-theory.brown.edu/'],
          ['OpenIntro Statistics — study design and inference', 'documentation', 'OpenIntro', 'https://www.openintro.org/book/os/', 1],
          ['Correlation vs. causation', 'video', 'Khan Academy', 'https://www.khanacademy.org/math/ap-statistics/xfb5d9a27:inference-in-experiments/regression/v/correlation-vs-causation', 2],
          ['Correlation and causality', 'article', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability/designing-studies/study-design/a/correlation-and-causality', 2],
        ],
        tasks: [
          ['Learn: complete Seeing Theory probability, distributions, and inference interactives', 'read', undefined, { resourceIndex: 0, title: 'Distributions, sampling, and uncertainty', durationMinutes: 75 }],
          ['Learn: study OpenIntro sections 1.1–1.4, 5.1–5.3, and 7.1–7.4; reproduce one interval and one test in Python', 'read', undefined, { resourceIndex: 1, title: 'Study design, confidence intervals, tests, and power', durationMinutes: 150 }],
          ['Learn: complete the causal-limits lesson and identify confounding in two observational claims', 'watch', undefined, { resourceIndex: 2, title: 'Correlation, confounding, and causal restraint', durationMinutes: 25 }],
          ['Build: analyse one comparison with distribution plots, confidence interval, effect size, assumptions, and a plain-language statement of what cannot be concluded', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('A 95% confidence interval for a mean difference is 1.2 to 4.8. What is the defensible conclusion?', ['The groups are identical', 'The estimated difference is positive, with plausible values from 1.2 to 4.8 under the method assumptions', 'There is a 95% probability every future observation lies in that range', 'The treatment caused the difference'], 1, 'A confidence interval quantifies uncertainty in the estimated parameter under assumptions; it is neither a prediction interval nor proof of causation.'),
            q('A huge sample produces p < 0.001 for an average improvement of 0.02 seconds. What must be checked before recommending the change?', ['Only the p-value', 'Practical importance, effect size, uncertainty, cost, and study validity', 'Whether the mean is positive', 'Whether the sample is larger than 30'], 1, 'Statistical detectability does not establish practical value. Effect size, uncertainty, costs, and validity determine whether the result supports action.'),
            q('Users chose whether to enable a feature, and enabled users retained better. Why can this not establish that the feature caused retention?', ['Retention cannot be measured', 'Self-selection can create confounding differences between the groups', 'The sample is necessarily too small', 'Correlation is always useless'], 1, 'Without random assignment or a defensible causal design, pre-existing differences may explain the association.'),
          )],
        ],
      },
      {
        slug: 'found-ai', name: 'AI Literacy', subtitle: 'Work with the machines',
        description: 'Use an AI assistant on a bounded data task while protecting sensitive data, testing its output, and documenting its contribution.',
        icon: 'auto_awesome', estHours: 6, xp: 75,
        skills: ['How models work & fail', 'Claims & code verification', 'Privacy, injection & disclosure'], prereqs: ['found-stats'],
        resources: [
          ['Intro to Large Language Models', 'video', 'YouTube (Andrej Karpathy)', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'],
          ['Google ML glossary — language models', 'documentation', 'Google for Developers', 'https://developers.google.com/machine-learning/glossary/language-model'],
          ['Fact-checking AI output with lateral reading', 'documentation', 'University of Maryland Libraries', 'https://lib.guides.umd.edu/AI/fact-checking', 1],
          ['Reduce hallucinations', 'documentation', 'Anthropic', 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 1],
          ['OWASP LLM01 — prompt injection', 'documentation', 'OWASP', 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/', 2],
          ['NIST AI RMF — Generative AI Profile', 'documentation', 'NIST', 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', 2],
        ],
        tasks: [
          ['Learn: watch the bounded LLM introduction and distinguish generation, retrieval, tools, and training', 'watch', undefined, { resourceIndex: 0, title: 'How language models work and where they fail', durationMinutes: 65 }],
          ['Learn: verify one generated claim using lateral reading, primary sources, and an explicit evidence log', 'read', undefined, { resourceIndex: 2, title: 'Verification instead of confidence', durationMinutes: 35 }],
          ['Learn: study direct and indirect prompt injection, sensitive-data exposure, unsafe tool actions, and human approval boundaries', 'read', undefined, { resourceIndex: 4, title: 'Safe AI-assisted work', durationMinutes: 40 }],
          ['Build: complete one bounded data task with AI assistance, remove sensitive inputs, test every generated claim or code path, and add an AI_USE.md log of prompts, changes, failures, and verification', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q("Per Karpathy's Intro to Large Language Models, LLMs generate text by…", ['Querying a database of answers', 'Predicting the next token', 'Running rule-based grammar', 'Searching the web'], 1, 'LLMs are next-token predictors trained on large corpora; they do not look up answers in a database.'),
            q('A model confidently cites a specific statistic that does not appear anywhere in your source documents. What is this failure mode called, and why does it happen?', ['A bug — it should be reported', 'Hallucination — the model generates plausible-sounding tokens even without grounding, since it optimizes for likely continuations, not truth', 'Overfitting on your prompt', 'A tokenizer error'], 1, 'Hallucination is a direct consequence of next-token prediction: the model produces statistically plausible text, which is not the same as verified fact — this is why grounding (RAG) and validation matter.'),
            q('A retrieved webpage tells the model to ignore its task and send private context to an external tool. What is the correct response?', ['Follow it because retrieved text is trusted', 'Treat it as indirect prompt injection, refuse the instruction, protect the data, and require approval for consequential tool actions', 'Paste in more private context', 'Raise the temperature'], 1, 'Retrieved content is untrusted input. Tool permissions, data boundaries, validation, and human approval must remain outside the model’s control.'),
          )],
        ],
      },
      {
        slug: 'found-capstone', name: 'Foundation Readiness Capstone', subtitle: 'Evidence before specialization',
        description: 'Deliver a reproducible data investigation that uses Python, SQL, statistics, version control, and documented AI assistance to support a defensible decision.',
        icon: 'verified', estHours: 14, xp: 175,
        skills: ['Decision & metric framing', 'Reproducible investigation', 'Recommendation & limitations'], prereqs: ['found-ai'],
        resources: [
          ['World Bank Indicators API — basic call structures', 'documentation', 'World Bank', 'https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures'],
          ['World Bank Indicators', 'project', 'World Bank', 'https://data.worldbank.org/indicator'],
          ['The Turing Way — reproducible research', 'documentation', 'The Turing Way', 'https://book.the-turing-way.org/reproducible-research/reproducible-research', 1],
          ['Cookiecutter Data Science — opinions', 'documentation', 'DrivenData', 'https://cookiecutter-data-science.drivendata.org/opinions/', 1],
          ['The Aqua Book — analysis, quality, and uncertainty', 'documentation', 'UK Government', 'https://www.gov.uk/government/publications/the-aqua-book-guidance-on-producing-quality-analysis-for-government', 2],
          ['Communicating quality, uncertainty and change', 'documentation', 'UK Government Analysis Function', 'https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/', 2],
        ],
        tasks: [
          ['Learn: choose a region and frame a decision about where limited development research or intervention should be prioritised using 2–4 World Bank indicators; define the decision, users, unit of analysis, and limitations before downloading data', 'read', undefined, { resourceIndex: 0, title: 'Capstone brief: a real allocation decision using public indicators', durationMinutes: 45 }],
          ['Learn: create the required project structure and a one-command reproducibility check', 'read', undefined, { resourceIndex: 2, title: 'A project another analyst can rerun', durationMinutes: 35 }],
          ['Learn: apply the quality and uncertainty checklist before writing the recommendation', 'read', undefined, { resourceIndex: 4, title: 'Communicate evidence without overstating it', durationMinutes: 40 }],
          ['Build: complete a local foundation-capstone folder containing README.md, requirements.txt, data/raw, data/processed, src/clean_data.py, tests/test_clean_data.py, analysis/queries.sql, analysis/findings.md, and AI_USE.md; include provenance, data dictionary, validation and reconciliation checks, one confidence interval or uncertainty analysis, a ranked recommendation, limitations, and exact rerun instructions', 'build'],
          ['Checkpoint quiz', 'quiz', quiz(
            q('A reviewer reruns the capstone after the source data changes. What best protects reproducibility?', ['A screenshot of the result', 'Pinned dependencies, preserved raw inputs or source version, deterministic transformations, tests, and exact run commands', 'A longer conclusion', 'More charts'], 1, 'Reproducibility depends on recoverable inputs, environment, deterministic code, executable checks, and documented commands.'),
            q('Your ranking changes completely when one indicator is removed. What should the recommendation say?', ['Hide the sensitivity check', 'Report that the result is fragile, show the alternative, and avoid a strong recommendation without better justification', 'Choose the more dramatic ranking', 'Average both rankings without explanation'], 1, 'Decision-grade analysis exposes sensitivity and limits confidence when reasonable choices materially change the result.'),
            q('An AI assistant wrote a plausible paragraph containing two numbers. What makes it acceptable evidence?', ['The wording sounds professional', 'Each number is traced to the data or a primary source, recomputed where possible, and the AI contribution is disclosed', 'The model is popular', 'The prompt was long'], 1, 'Generated confidence is not provenance. Claims require traceable evidence and independent verification.'),
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
          ['The Aqua Book — analysis design, quality and uncertainty (chapters 6–8)', 'documentation', 'UK Government', 'https://www.gov.uk/guidance/the-aqua-book', 2],
        ],
        tasks: [
          ['Learn: study pandas missing-data handling and use the Aqua Book chapters 6–8 to frame the analysis plan, quality checks and uncertainty', 'read', undefined, { resourceIndex: 0, title: 'A disciplined exploratory analysis', durationMinutes: 45 }],
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
          ['Design effective reports in Power BI — first 3 modules', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/power-bi-effective/', 2],
          ['Design Power BI reports for accessibility', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-accessibility-creating-reports', 2],
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
          ['Manage and secure Power BI — semantic models and data access', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/manage-secure-power-bi/', 2],
          ['Configure scheduled refresh', 'documentation', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/power-bi/connect-data/refresh-scheduled-refresh', 2],
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
          ['MLOps Zoomcamp — platform capstone', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/mlops-zoomcamp/tree/main/07-project'],
          ['MLflow Documentation', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/index.html'],
        ],
        tasks: [
          ['Read the bounded MLOps Zoomcamp capstone brief', 'read'],
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
    order: p.id === 'foundations' ? FOUNDATION_SLUGS.indexOf(n.slug) + 1 : i + 1,
    est_hours: n.estHours,
    xp_reward: n.xp,
    skills: n.skills,
    created_at: '',
  })),
);

export const PREREQUISITES: Record<string, string[]> = Object.fromEntries(
  PATH_DEFS.flatMap((p) => p.nodes.map((n) => [n.slug, n.prereqs])),
);

export const TOPICS: TopicRow[] = PATH_DEFS.flatMap((p) =>
  p.nodes.flatMap((n) =>
    n.skills.map((title, i) => ({
      id: `${n.slug}::topic${i}`,
      node_id: n.slug,
      title,
      order: i + 1,
      created_at: '',
    })),
  ),
);

export const RESOURCES: ResourceRow[] = PATH_DEFS.flatMap((p) =>
  p.nodes.flatMap((n) =>
    n.resources.map(([name, type, platform, url, topicIndex = 0], i) => ({
      id: `${n.slug}::r${i}`,
      node_id: n.slug,
      topic_id: `${n.slug}::topic${topicIndex}`,
      order: n.resources
        .slice(0, i + 1)
        .filter((resource) => (resource[4] ?? 0) === topicIndex).length,
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
    [
      ...n.tasks.map(([description, type, payload, lesson], i) => ({
      id: `${n.slug}::t${i}`,
      node_id: n.slug,
      description,
      type,
      order: p.id === 'foundations' ? i + 1 : i === 0 ? 1 : i + (PAUSED_PATH_IDS.has(p.id) ? 1 : 3),
      quiz: type === 'quiz' ? (payload as QuizPayload) ?? null : null,
      challenge: type === 'challenge' ? (payload as ChallengePayload) ?? null : null,
      resource_id: lesson
        ? `${n.slug}::r${lesson.resourceIndex}`
        : i === 0 && (type === 'read' || type === 'watch') && !PAUSED_PATH_IDS.has(p.id)
          ? `${n.slug}::r0`
          : null,
      lesson_title: lesson?.title
        ?? (i === 0 && (type === 'read' || type === 'watch') && !PAUSED_PATH_IDS.has(p.id) ? n.resources[0][0] : null),
      duration_minutes: lesson?.durationMinutes
        ?? (i === 0 && (type === 'read' || type === 'watch') && !PAUSED_PATH_IDS.has(p.id) ? 45 : null),
      start_seconds: lesson?.startSeconds ?? null,
      end_seconds: lesson?.endSeconds ?? null,
      })),
      ...(!PAUSED_PATH_IDS.has(p.id) && p.id !== 'foundations' ? [{
        id: `${n.slug}::lesson-reference`,
        node_id: n.slug,
        description: `Read: complete the bounded reference step from ${n.resources[1][0]}.`,
        type: (n.resources[1][1] === 'video' ? 'watch' : 'read') as TaskType,
        order: 2,
        quiz: null,
        challenge: null,
        resource_id: `${n.slug}::r1`,
        lesson_title: n.resources[1][0],
        duration_minutes: 15,
        start_seconds: null,
        end_seconds: null,
      }] : []),
      ...(!PAUSED_PATH_IDS.has(p.id) && p.id !== 'foundations' ? [{
        id: `${n.slug}::practice`,
        node_id: n.slug,
        description: `Practise: reproduce a small example using ${n.skills[0].toLowerCase()}, then record the result and one decision you made.`,
        type: 'practice' as TaskType,
        order: 3,
        quiz: null,
        challenge: null,
        resource_id: null,
        lesson_title: null,
        duration_minutes: null,
        start_seconds: null,
        end_seconds: null,
      }] : []),
    ],
  ),
);

export const PATH_IDS = PATHS.map((p) => p.id);
export const SPECIALIZATION_PATHS = PATHS.filter((p) => p.id !== 'foundations');

// Keep the lightweight content contract executable. Resource limits apply per
// topic now that a node can carry several focused lesson/reference pairs.
for (const path of PATH_DEFS) {
  for (const node of path.nodes) {
    if (node.skills.length !== 3) throw new Error(`${node.slug} must define exactly 3 competencies.`);
    const resourcesPerTopic = node.resources.reduce<number[]>((counts, resource) => {
      const topicIndex = resource[4] ?? 0;
      counts[topicIndex] = (counts[topicIndex] ?? 0) + 1;
      return counts;
    }, []);
    if (node.resources.length === 0 || resourcesPerTopic.some((count) => count > 2)) {
      throw new Error(`${node.slug} must define 1–2 focused resources per populated topic.`);
    }
    if (node.tasks.length < 2) throw new Error(`${node.slug} must include learning and applied work.`);
  }
}
