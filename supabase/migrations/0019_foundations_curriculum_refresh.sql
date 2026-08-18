-- Strengthen the existing Foundations curriculum in place. IDs are preserved
-- so member progress, task completions, and resource ratings remain intact.

update public.nodes set
  description = 'Write a readable Python program that loads, validates, cleans, and exports a tabular dataset.',
  skills = array['Functions & errors', 'Pandas transformations', 'Data validation']
where slug = 'found-python';

update public.nodes set
  description = 'Answer business questions with correct joins, aggregations, CTEs, and window functions, then validate the result.',
  skills = array['Joins & CTEs', 'Aggregation & windows', 'Query validation']
where slug = 'found-sql';

update public.nodes set
  description = 'Create a focused branch, review its changes, resolve a conflict, and merge it through a clear pull request.',
  skills = array['Focused commits', 'Pull-request review', 'Conflict recovery']
where slug = 'found-git';

update public.nodes set
  description = 'Inspect files and processes, combine commands with pipes, and automate a repeatable file-processing task safely.',
  skills = array['Pipes & redirection', 'Processes & permissions', 'Safe shell scripts']
where slug = 'found-cli';

update public.nodes set
  description = 'Describe uncertainty in a dataset, choose an appropriate comparison, and communicate what the evidence cannot prove.',
  skills = array['Sampling & uncertainty', 'Effect size & testing', 'Causal limits']
where slug = 'found-stats';

update public.nodes set
  description = 'Use an AI assistant on a bounded data task while protecting sensitive data, testing its output, and documenting its contribution.',
  skills = array['Model limitations', 'Output verification', 'Safe AI-assisted work']
where slug = 'found-ai';

update public.resources r set
  name = 'Python Tutorial — sections 3–5', type = 'documentation', platform = 'Python.org',
  url = 'https://docs.python.org/3/tutorial/introduction.html'
from public.nodes n where r.node_id = n.id and n.slug = 'found-python'
  and r.name = 'Python for Everybody — Full Course';
update public.resources r set
  name = '10 minutes to pandas', type = 'documentation', platform = 'pandas.pydata.org',
  url = 'https://pandas.pydata.org/docs/user_guide/10min.html'
from public.nodes n where r.node_id = n.id and n.slug = 'found-python'
  and r.name = 'Pandas Getting Started Guide';

update public.resources r set
  name = 'SQLBolt — lessons 1–18', type = 'course', platform = 'SQLBolt', url = 'https://sqlbolt.com/'
from public.nodes n where r.node_id = n.id and n.slug = 'found-sql'
  and r.name = 'Kaggle: Intro to SQL';
update public.resources r set
  name = 'PostgreSQL Window Functions Tutorial', type = 'documentation', platform = 'PostgreSQL',
  url = 'https://www.postgresql.org/docs/current/tutorial-window.html'
from public.nodes n where r.node_id = n.id and n.slug = 'found-sql'
  and r.name = 'SQLBolt Interactive Lessons';

update public.resources r set
  name = 'Pro Git — Git Basics and Branching', platform = 'git-scm.com', url = 'https://git-scm.com/book/en/v2'
from public.nodes n where r.node_id = n.id and n.slug = 'found-git'
  and r.name = 'Pro Git Book (ch. 1–3)';
update public.resources r set
  name = 'Review pull requests', type = 'course', platform = 'GitHub Skills',
  url = 'https://github.com/skills/review-pull-requests'
from public.nodes n where r.node_id = n.id and n.slug = 'found-git'
  and r.name = 'GitHub Skills';

update public.resources r set name = 'The Missing Semester — The Shell'
from public.nodes n where r.node_id = n.id and n.slug = 'found-cli'
  and r.name = 'The Missing Semester: Shell';
update public.resources r set name = 'The Linux command line for beginners'
from public.nodes n where r.node_id = n.id and n.slug = 'found-cli'
  and r.name = 'Linux Command Line Basics';

update public.resources r set name = 'Seeing Theory — distributions and inference'
from public.nodes n where r.node_id = n.id and n.slug = 'found-stats'
  and r.name = 'Seeing Theory (Visual Probability)';
update public.resources r set
  name = 'OpenIntro Statistics — chapters 2, 4 and 5', type = 'documentation', platform = 'OpenIntro',
  url = 'https://www.openintro.org/book/os/'
from public.nodes n where r.node_id = n.id and n.slug = 'found-stats'
  and r.name = 'Khan Academy: Statistics';

update public.resources r set
  name = 'Intro to Large Language Models', type = 'video', platform = 'YouTube (Andrej Karpathy)',
  url = 'https://www.youtube.com/watch?v=zjkBMFhNj_g'
from public.nodes n where r.node_id = n.id and n.slug = 'found-ai'
  and r.name = 'Prompt Engineering Guide';
update public.resources r set
  name = 'OWASP Top 10 for LLM Applications — prompt injection', type = 'documentation', platform = 'OWASP',
  url = 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/'
from public.nodes n where r.node_id = n.id and n.slug = 'found-ai'
  and r.name = 'Intro to Large Language Models' and r.platform = 'YouTube (Karpathy)';

update public.tasks t set description = 'Learn: complete Python Tutorial sections 3–5 and reproduce the examples locally', type = 'read'
from public.nodes n where t.node_id = n.id and n.slug = 'found-python' and t."order" = 1;
update public.tasks t set description = 'Build: create clean_data.py that validates required columns, handles missing values and duplicates, exports a tidy CSV, and documents how to run it'
from public.nodes n where t.node_id = n.id and n.slug = 'found-python' and t."order" = 2;

update public.tasks t set description = 'Learn: complete SQLBolt lessons 1–18 and the PostgreSQL window-functions tutorial'
from public.nodes n where t.node_id = n.id and n.slug = 'found-sql' and t."order" = 1;
update public.tasks t set description = 'Build: submit five labelled business queries using joins, aggregation, a CTE and a window function, with row-count or total checks for every answer'
from public.nodes n where t.node_id = n.id and n.slug = 'found-sql' and t."order" = 2;

update public.tasks t set description = 'Learn: read Pro Git chapters 2–3 and complete GitHub Skills: Review pull requests'
from public.nodes n where t.node_id = n.id and n.slug = 'found-git' and t."order" = 1;
update public.tasks t set description = 'Build: create a branch with focused commits, open a pull request that explains the change and test evidence, resolve one deliberate conflict, and merge it'
from public.nodes n where t.node_id = n.id and n.slug = 'found-git' and t."order" = 2;

update public.tasks t set description = 'Learn: complete The Missing Semester shell lecture and Ubuntu tutorial sections 1–6'
from public.nodes n where t.node_id = n.id and n.slug = 'found-cli' and t."order" = 1;
update public.tasks t set description = 'Build: write an idempotent shell script that validates its input directory, organises files by extension, logs its actions, and handles spaces in filenames'
from public.nodes n where t.node_id = n.id and n.slug = 'found-cli' and t."order" = 2;

update public.tasks t set description = 'Learn: complete Seeing Theory distributions/inference and OpenIntro chapters 2, 4 and 5'
from public.nodes n where t.node_id = n.id and n.slug = 'found-stats' and t."order" = 1;
update public.tasks t set description = 'Build: analyse one comparison with distribution plots, confidence interval, effect size, assumptions, and a plain-language statement of what cannot be concluded'
from public.nodes n where t.node_id = n.id and n.slug = 'found-stats' and t."order" = 2;

update public.tasks t set description = 'Learn: watch Intro to LLMs and read the OWASP prompt-injection guidance', type = 'watch'
from public.nodes n where t.node_id = n.id and n.slug = 'found-ai' and t."order" = 1;
update public.tasks t set description = 'Build: complete one bounded data task with AI assistance, remove sensitive inputs, test every generated claim or code path, and add an AI_USE.md log of prompts, changes, failures, and verification'
from public.nodes n where t.node_id = n.id and n.slug = 'found-ai' and t."order" = 2;
