-- Stacc Roadmap Tracker — in-browser code challenges (docs/PRODUCT.md §4).
-- A new task type for kata-style practice: starter code + hidden test code,
-- run entirely client-side in Pyodide (no server execution, no new infra).

alter table public.tasks drop constraint tasks_type_check;
alter table public.tasks add constraint tasks_type_check
  check (type in ('read', 'watch', 'build', 'quiz', 'challenge'));

alter table public.tasks
  add column challenge jsonb; -- {prompt, starterCode, testCode} for type='challenge'
