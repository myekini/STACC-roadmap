-- Human/mentor review is not a product workflow yet. Keep milestone
-- progression limited to checks the platform can actually perform.
update public.tasks
set project_requirements = project_requirements - 'manualReview'
where project_requirements ? 'manualReview';
