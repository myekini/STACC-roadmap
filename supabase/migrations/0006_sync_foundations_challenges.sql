-- Stacc Roadmap Tracker — production content sync for the Foundations
-- checkpoint-to-challenge conversion (Python/Stats/SQL). Requires 0005 to
-- already be applied (adds the 'challenge' type + tasks.challenge column).
--
-- Safe to run against a LIVE database: it only updates the 3 existing
-- checkpoint task rows in place (matched by node + type='quiz', the same
-- row that's always order 3), and never touches user_progress or
-- task_completions — no member progress is affected. If a member had
-- already answered the old quiz, task_completions.task_id still points at
-- the same row id, now serving the challenge instead.

update public.tasks t
set
  description = 'Checkpoint challenge: clean_scores(values)',
  type = 'challenge',
  quiz = null,
  challenge = '{"language":"python","prompt":"Write clean_scores(values): drop every None entry and duplicate value, then return what remains sorted ascending. This exact shape — strip the junk, dedupe, sort — is what you do to real data constantly.","starterCode":"def clean_scores(values):\n    \"\"\"Remove None entries and duplicates, then return the list sorted ascending.\"\"\"\n    # your code here\n    pass\n","testCode":"assert clean_scores([3, 1, None, 2, 3, None, 1]) == [1, 2, 3]\nassert clean_scores([]) == []\nassert clean_scores([5, 5, 5]) == [5]\nassert clean_scores([None, None]) == []\nassert clean_scores([-1, 0, None, -1, 2]) == [-1, 0, 2]\n"}'::jsonb
from public.nodes n
where t.node_id = n.id and n.slug = 'found-python' and t.type = 'quiz';

update public.tasks t
set
  description = 'Checkpoint challenge: describe(values)',
  type = 'challenge',
  quiz = null,
  challenge = '{"language":"python","prompt":"Write describe(values): return a (mean, median, population-stdev) tuple. These three numbers are the first thing you compute on any new dataset — mean and median tell you if it is skewed, stdev tells you how spread out it is.","starterCode":"from statistics import mean, median, pstdev\n\ndef describe(values):\n    \"\"\"Return (mean, median, population-stdev) as a tuple of floats.\"\"\"\n    # your code here\n    pass\n","testCode":"assert describe([2, 4, 4, 4, 5, 5, 7, 9]) == (5.0, 4.5, 2.0)\nassert describe([10, 10, 10]) == (10.0, 10.0, 0.0)\nimport math\nm, md, sd = describe([1, 2, 3, 4])\nassert m == 2.5 and md == 2.5 and math.isclose(sd, 1.1180339887498949, rel_tol=1e-9)\n"}'::jsonb
from public.nodes n
where t.node_id = n.id and n.slug = 'found-stats' and t.type = 'quiz';

update public.tasks t
set
  description = 'Checkpoint challenge: paying customers over $50',
  type = 'challenge',
  quiz = null,
  challenge = '{"language":"sql","prompt":"Table orders(id, customer, amount, status). Write a query that returns each customer''s total spend from status = ''paid'' orders only, as columns customer and total — only customers with total > 50, ordered by total descending.","starterCode":"-- orders(id, customer, amount, status)\n-- customer, total (sum of paid amounts) where total > 50, ordered by total desc\nSELECT\n","setupSql":"CREATE TABLE orders (id INTEGER, customer TEXT, amount REAL, status TEXT);\nINSERT INTO orders VALUES\n  (1, ''Ada'', 120.0, ''paid''),\n  (2, ''Grace'', 45.5, ''paid''),\n  (3, ''Ada'', 60.0, ''refunded''),\n  (4, ''Linus'', 200.0, ''paid''),\n  (5, ''Grace'', 15.0, ''paid''),\n  (6, ''Zoe'', 10.0, ''paid'');","expectedRows":[{"customer":"Linus","total":200},{"customer":"Ada","total":120},{"customer":"Grace","total":60.5}]}'::jsonb
from public.nodes n
where t.node_id = n.id and n.slug = 'found-sql' and t.type = 'quiz';
