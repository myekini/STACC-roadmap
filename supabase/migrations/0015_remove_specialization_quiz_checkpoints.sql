-- Every specialization module had both a "Build:" milestone (verified via
-- the connected GitHub project) and a redundant "Checkpoint quiz" task —
-- duplicate verification for work that a real project commit already
-- proves. Foundations nodes keep their checkpoints (found-git, found-cli,
-- found-ai keep quizzes; found-python/found-sql/found-stats keep their
-- in-browser challenges) since Foundations has no GitHub project to verify
-- against. Mirrors the same removal in src/config/roadmap.ts and
-- supabase/seed.sql. task_completions cascade-deletes with the task, so a
-- member who already passed the quiz simply has one fewer completed task —
-- if their remaining tasks (read/watch + build) are already done, the node
-- now reads as complete without the quiz gate.

delete from public.tasks t
using public.nodes n
where t.node_id = n.id
  and t.type = 'quiz'
  and n.path_id <> 'foundations';
