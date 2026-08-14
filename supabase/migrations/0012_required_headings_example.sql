-- One illustrative use of `requiredHeadings` (src/lib/database.types.ts) to
-- show the content-check engine working end to end: de-orchestration's
-- manualReview note already asks for "retries and a documented backfill
-- path" (0010_project_verification.sql) — this makes the "retries" half
-- objectively checkable instead of relying only on manual review.
-- Deliberately not applied to every DE task yet: picking the right keyword
-- per task is a curriculum call, not something to bulk-generate.

update public.tasks
set project_requirements = project_requirements || '{"requiredHeadings":{"dags/pipeline.py":["retries"]}}'::jsonb
where id in (select t.id from public.tasks t join public.nodes n on n.id = t.node_id where n.slug = 'de-orchestration' and t.type = 'build');
