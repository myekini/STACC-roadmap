-- Continuation of 0031: the rest of the verified topic-2/topic-3 resources
-- for Foundations and Data Analysis (0031 only covered found-python's third
-- topic and two Data Analysis fixups). Dedup is keyed on (topic_id, url) —
-- not a bare url — because several sources are deliberately cited for more
-- than one topic (e.g. the same Coursera course's different modules), which
-- a global url-uniqueness check would have silently dropped.
--
-- Slots the curation pass flagged as "no candidate found" are left empty on
-- purpose (found-sql's Query validation primary, da-eda's Analysis planning
-- secondary) rather than filled with something unverified.

begin;

with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  -- found-python — Pandas transformations
  ('found-python', 2, 1, 'Grouping and Sorting (Kaggle Learn — Pandas)', 'course', 'Kaggle', 'https://www.kaggle.com/learn/pandas'),
  ('found-python', 2, 2, 'Group by: split-apply-combine', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/groupby.html'),

  -- found-sql — Aggregation & windows (Query validation primary: no candidate found, left empty)
  ('found-sql', 2, 1, 'PostgreSQL Exercises — Aggregation', 'course', 'pgexercises.com', 'https://pgexercises.com/questions/aggregates/'),
  ('found-sql', 2, 2, 'Aggregate Functions', 'documentation', 'PostgreSQL', 'https://www.postgresql.org/docs/current/functions-aggregate.html'),
  ('found-sql', 3, 1, 'Data tests', 'documentation', 'docs.getdbt.com', 'https://docs.getdbt.com/docs/build/data-tests'),

  -- found-git — Pull-request review / Conflict recovery
  ('found-git', 2, 1, 'Review Pull Requests', 'course', 'GitHub Skills', 'https://github.com/skills/review-pull-requests'),
  ('found-git', 2, 2, 'About pull request reviews', 'documentation', 'GitHub Docs', 'https://docs.github.com/en/pull-requests/reference/pull-request-reviews'),
  ('found-git', 3, 1, 'Resolve Merge Conflicts', 'course', 'GitHub Skills', 'https://github.com/skills/resolve-merge-conflicts'),
  ('found-git', 3, 2, 'Basic Branching and Merging', 'documentation', 'git-scm.com (Pro Git)', 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging'),

  -- found-cli — Processes & permissions / Safe shell scripts
  ('found-cli', 2, 1, 'Command-line Environment (Job Control)', 'video', 'MIT — Missing Semester', 'https://missing.csail.mit.edu/2026/command-line-environment/'),
  ('found-cli', 2, 2, 'File permissions', 'documentation', 'gnu.org (Coreutils)', 'https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html'),
  ('found-cli', 3, 1, 'Course Overview + the Shell', 'video', 'MIT — Missing Semester', 'https://missing.csail.mit.edu/2026/course-shell/'),
  ('found-cli', 3, 2, 'Shell Style Guide', 'documentation', 'google.github.io', 'https://google.github.io/styleguide/shellguide.html'),

  -- found-stats — Effect size & testing / Causal limits
  ('found-stats', 2, 1, 'P-values and significance tests', 'video', 'Khan Academy', 'https://www.khanacademy.org/math/ap-statistics/xfb5d8e68:inference-categorical-proportions/idea-significance-tests/v/p-values-and-significance-tests'),
  ('found-stats', 2, 2, 'FAQ: How is effect size used in power analysis?', 'documentation', 'UCLA OARC Stats', 'https://stats.oarc.ucla.edu/other/mult-pkg/faq/general/effect-size-power/faqhow-is-effect-size-used-in-power-analysis/'),
  ('found-stats', 3, 1, 'Correlation vs. Causation', 'video', 'Khan Academy', 'https://www.khanacademy.org/math/ap-statistics/xfb5d9a27:inference-in-experiments/regression/v/correlation-vs-causation'),
  ('found-stats', 3, 2, 'Correlation and causality', 'article', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability/designing-studies/study-design/a/correlation-and-causality'),

  -- found-ai — Output verification (Discernment) / Safe AI-assisted work (Diligence)
  ('found-ai', 2, 1, 'AI Fluency: Framework & Foundations — Discernment', 'course', 'Anthropic Academy', 'https://anthropic.skilljar.com/ai-fluency-framework-foundations'),
  ('found-ai', 2, 2, 'Reduce hallucinations', 'documentation', 'platform.claude.com', 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations'),
  ('found-ai', 3, 1, 'AI Fluency: Framework & Foundations — Diligence', 'course', 'Anthropic Academy', 'https://anthropic.skilljar.com/ai-fluency-framework-foundations'),
  ('found-ai', 3, 2, 'Usage Policy', 'documentation', 'anthropic.com', 'https://www.anthropic.com/legal/aup'),

  -- da-eda — Data profiling (Analysis planning secondary: no candidate found, left empty)
  ('da-eda', 2, 1, 'Learn Data Cleaning', 'course', 'Kaggle', 'https://www.kaggle.com/learn/data-cleaning'),
  ('da-eda', 2, 2, 'Essential basic functionality', 'documentation', 'pandas.pydata.org', 'https://pandas.pydata.org/docs/user_guide/basics.html'),

  -- da-visualization — Honest encoding / Accessible visualisation
  ('da-visualization', 2, 1, 'Share Data Through the Art of Visualization — effective encoding', 'course', 'Google (Coursera)', 'https://www.coursera.org/learn/visualize-data'),
  ('da-visualization', 2, 2, 'Visualization traps', 'documentation', 'developers.google.com', 'https://developers.google.com/machine-learning/guides/data-traps/visualization-traps'),
  ('da-visualization', 3, 1, 'Share Data Through the Art of Visualization — accessible design', 'course', 'Google (Coursera)', 'https://www.coursera.org/learn/visualize-data'),
  ('da-visualization', 3, 2, 'Data visualizations component', 'documentation', 'U.S. Web Design System', 'https://designsystem.digital.gov/components/data-visualizations/'),

  -- da-dashboards — KPI definitions (Accessible interaction already filled by 0031)
  ('da-dashboards', 2, 1, 'Ask Questions to Make Data-Driven Decisions', 'course', 'Google (Coursera)', 'https://www.coursera.org/learn/ask-questions-make-decisions'),
  ('da-dashboards', 2, 2, 'Key Performance Indicator (KPI) visuals', 'documentation', 'learn.microsoft.com', 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi'),

  -- da-storytelling — Evidence & uncertainty / Recommendation delivery
  ('da-storytelling', 2, 1, 'Share Data Through Visualization — presenting limitations', 'course', 'Google (Coursera)', 'https://www.coursera.org/learn/visualize-data'),
  ('da-storytelling', 2, 2, 'Calling Bullshit — syllabus', 'course', 'University of Washington', 'https://www.callingbullshit.org/syllabus.html'),
  ('da-storytelling', 3, 1, 'Share Data Through Visualization — delivering recommendations', 'course', 'Google (Coursera)', 'https://www.coursera.org/learn/visualize-data'),
  ('da-storytelling', 3, 2, 'The Report Body — Recommendations', 'documentation', 'Purdue OWL', 'https://owl.purdue.edu/owl/subject_specific_writing/writing_in_engineering/handbook_on_report_formats/the_report_body.html'),

  -- da-bi — Semantic models & DAX (Security & refresh already filled by 0031)
  ('da-bi', 2, 1, 'Use DAX in Power BI semantic models', 'course', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/training/paths/dax-power-bi/'),
  ('da-bi', 2, 2, 'Semantic model designer documentation', 'documentation', 'learn.microsoft.com', 'https://learn.microsoft.com/en-us/power-bi/personas/semantic-model-designer/'),

  -- da-ai-analysis — Claim verification / Audit trail
  ('da-ai-analysis', 2, 1, 'Lateral Reading with Fact-Checking Organizations', 'course', 'Stanford COR / Digital Inquiry Group', 'https://cor.inquirygroup.org/curriculum/lessons/lateral-reading-with-fact-checking-organizations/'),
  ('da-ai-analysis', 2, 2, 'Evaluating AI Output — Fact-Checking with Lateral Reading', 'documentation', 'University of Maryland Libraries', 'https://lib.guides.umd.edu/AI/fact-checking'),
  ('da-ai-analysis', 3, 1, 'Reproducible Research', 'course', 'Johns Hopkins University (Coursera)', 'https://www.coursera.org/learn/reproducible-research'),
  ('da-ai-analysis', 3, 2, 'Model documentation', 'documentation', 'docs.getdbt.com', 'https://docs.getdbt.com/docs/collaborate/documentation')
)
insert into public.resources (node_id, topic_id, "order", name, type, platform, url)
select n.id, t.id, c.resource_order, c.name, c.type, c.platform, c.url
from curated c
join public.nodes n on n.slug = c.node_slug
join public.topics t on t.node_id = n.id and t."order" = c.topic_order
where not exists (
  select 1 from public.resources existing where existing.topic_id = t.id and existing.url = c.url
);

commit;
