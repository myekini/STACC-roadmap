-- Turn Foundations into a real readiness gate: dependable Python first,
-- practical NumPy/pandas second, then a sequential baseline and an integrated
-- capstone. Existing IDs stay intact; the two new nodes form a bridge for
-- members who completed the earlier six-module version.

create or replace function public.apply_foundations_mastery_refresh()
returns void
language plpgsql
set search_path = public
as $$
declare
  foundations_id text;
begin
  select id into foundations_id from public.paths where id = 'foundations';
  if foundations_id is null then return; end if;

  update public.paths
  set description = 'The tested professional baseline every data role requires before a specialization.',
      tags = array['Python','NumPy','pandas','SQL','Git','Statistics','AI Literacy']
  where id = 'foundations';

  update public.nodes set
    name = 'Python Foundations', subtitle = 'Programs you can trust',
    description = 'Write, test, and run a small Python program with clear functions, deliberate error handling, and a reproducible environment.',
    "order" = 2, est_hours = 10,
    skills = array['Control flow, functions & modules','Files, parsing & errors','Environments, dependencies & tests']
  where slug = 'found-python';

  insert into public.nodes (slug,path_id,name,subtitle,description,icon,"order",est_hours,xp_reward,skills)
  values (
    'found-tabular','foundations','Tabular Python','NumPy and pandas',
    'Transform messy tabular data with vectorized NumPy and pandas operations, then enforce an explicit data contract.',
    'table_view',4,10,100,array['NumPy arrays & vectorization','pandas cleaning, joins & grouping','Schemas & quality checks']
  ) on conflict (slug) do update set
    name=excluded.name, subtitle=excluded.subtitle, description=excluded.description,
    icon=excluded.icon, "order"=excluded."order", est_hours=excluded.est_hours,
    xp_reward=excluded.xp_reward, skills=excluded.skills;

  update public.nodes set
    name = 'SQL Foundations', subtitle = 'Questions into queries',
    description = 'Build from SELECT, filtering, sorting, and grouping to correct joins, CTEs, window functions, and validated business answers.',
    "order" = 5,
    skills = array['SELECT, FROM, WHERE & NULLs','Joins, grouping & CTEs','Windows, plans & validation']
  where slug = 'found-sql';
  update public.nodes set "order" = 3,
    skills = array['Files, staging & commits','Branches & pull requests','Conflicts & safe recovery']
  where slug = 'found-git';
  update public.nodes set "order" = 1,
    skills = array['Navigation, files & pipes','Processes, permissions & environment','Safe shell scripts']
  where slug = 'found-cli';
  update public.nodes set "order" = 6,
    skills = array['Distributions, sampling & uncertainty','Intervals, effects & tests','Correlation & causal limits']
  where slug = 'found-stats';
  update public.nodes set "order" = 7,
    skills = array['How models work & fail','Claims & code verification','Privacy, injection & disclosure']
  where slug = 'found-ai';

  insert into public.nodes (slug,path_id,name,subtitle,description,icon,"order",est_hours,xp_reward,skills)
  values (
    'found-capstone','foundations','Foundation Readiness Capstone','Evidence before specialization',
    'Deliver a reproducible data investigation that uses Python, SQL, statistics, version control, and documented AI assistance to support a defensible decision.',
    'verified',8,14,175,array['Decision & metric framing','Reproducible investigation','Recommendation & limitations']
  ) on conflict (slug) do update set
    name=excluded.name, subtitle=excluded.subtitle, description=excluded.description,
    icon=excluded.icon, "order"=excluded."order", est_hours=excluded.est_hours,
    xp_reward=excluded.xp_reward, skills=excluded.skills;

  -- Rebuild authored topics for the two new nodes; retain IDs when rerun.
  insert into public.topics (node_id,title,"order")
  select n.id, authored.title, authored.ord
  from public.nodes n
  cross join (values
    (1,'NumPy arrays & vectorization'),(2,'pandas cleaning, joins & grouping'),(3,'Schemas & quality checks')
  ) authored(ord,title)
  where n.slug = 'found-tabular'
    and not exists (select 1 from public.topics t where t.node_id=n.id and t."order"=authored.ord);

  insert into public.topics (node_id,title,"order")
  select n.id, authored.title, authored.ord
  from public.nodes n
  cross join (values
    (1,'Decision & metric framing'),(2,'Reproducible investigation'),(3,'Recommendation & limitations')
  ) authored(ord,title)
  where n.slug = 'found-capstone'
    and not exists (select 1 from public.topics t where t.node_id=n.id and t."order"=authored.ord);

  -- New-node resources: one bounded primary and one durable reference per topic.
  with curated(slug,topic_order,resource_order,name,type,platform,url) as (values
    ('found-tabular',1,1,'NumPy — absolute basics for beginners','documentation','NumPy','https://numpy.org/doc/stable/user/absolute_beginners.html'),
    ('found-tabular',1,2,'NumPy quickstart — shape, axes, and vectorization','documentation','NumPy','https://numpy.org/doc/stable/user/quickstart.html'),
    ('found-tabular',2,1,'10 minutes to pandas','documentation','pandas','https://pandas.pydata.org/docs/user_guide/10min.html'),
    ('found-tabular',2,2,'pandas — group by: split-apply-combine','documentation','pandas','https://pandas.pydata.org/docs/user_guide/groupby.html'),
    ('found-tabular',3,1,'Validate pandas data with Pandera','video','ArjanCodes','https://www.youtube.com/watch?v=-tU7fuUiq7w'),
    ('found-tabular',3,2,'Pandera DataFrame schemas','documentation','Pandera','https://pandera.readthedocs.io/en/stable/dataframe_schemas.html'),
    ('found-capstone',1,1,'World Bank Indicators API — basic call structures','documentation','World Bank','https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures'),
    ('found-capstone',1,2,'World Bank Indicators','project','World Bank','https://data.worldbank.org/indicator'),
    ('found-capstone',2,1,'The Turing Way — reproducible research','documentation','The Turing Way','https://book.the-turing-way.org/reproducible-research/reproducible-research'),
    ('found-capstone',2,2,'Cookiecutter Data Science — opinions','documentation','DrivenData','https://cookiecutter-data-science.drivendata.org/opinions/'),
    ('found-capstone',3,1,'The Aqua Book — analysis, quality, and uncertainty','documentation','UK Government','https://www.gov.uk/government/publications/the-aqua-book-guidance-on-producing-quality-analysis-for-government'),
    ('found-capstone',3,2,'Communicating quality, uncertainty and change','documentation','UK Government Analysis Function','https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/')
  )
  insert into public.resources (node_id,topic_id,"order",name,type,platform,url)
  select n.id,t.id,c.resource_order,c.name,c.type,c.platform,c.url
  from curated c join public.nodes n on n.slug=c.slug
  join public.topics t on t.node_id=n.id and t."order"=c.topic_order
  where not exists (select 1 from public.resources r where r.topic_id=t.id and r.url=c.url);

  -- Keep topic labels in lockstep with the observable competencies.
  update public.topics t
  set title = n.skills[t."order"]
  from public.nodes n
  where t.node_id=n.id and n.path_id='foundations'
    and t."order" between 1 and array_length(n.skills,1);

  -- The original Python node carried pandas/Pandera sources. Repurpose those
  -- six stable resource rows for program construction; tabular work now has
  -- its own node above. Selecting by topic/order preserves ratings and IDs.
  with replacements(topic_order,resource_order,name,type,platform,url) as (values
    (1,1,'Python Tutorial — control flow and functions','documentation','Python.org','https://docs.python.org/3/tutorial/controlflow.html'),
    (1,2,'Python Tutorial — modules','documentation','Python.org','https://docs.python.org/3/tutorial/modules.html'),
    (2,1,'Python Tutorial — input/output','documentation','Python.org','https://docs.python.org/3/tutorial/inputoutput.html'),
    (2,2,'Python Tutorial — errors and exceptions','documentation','Python.org','https://docs.python.org/3/tutorial/errors.html'),
    (3,1,'Python Tutorial — virtual environments','documentation','Python.org','https://docs.python.org/3/tutorial/venv.html'),
    (3,2,'pytest — get started','documentation','pytest','https://docs.pytest.org/en/stable/getting-started.html')
  )
  update public.resources r
  set name=x.name,type=x.type,platform=x.platform,url=x.url
  from replacements x join public.topics t on t."order"=x.topic_order
  join public.nodes n on n.id=t.node_id and n.slug='found-python'
  where r.topic_id=t.id and r."order"=x.resource_order;

  with replacements(topic_order,resource_order,name,type,platform,url) as (values
    (1,1,'Python Tutorial — control flow and functions','documentation','Python.org','https://docs.python.org/3/tutorial/controlflow.html'),
    (1,2,'Python Tutorial — modules','documentation','Python.org','https://docs.python.org/3/tutorial/modules.html'),
    (2,1,'Python Tutorial — input/output','documentation','Python.org','https://docs.python.org/3/tutorial/inputoutput.html'),
    (2,2,'Python Tutorial — errors and exceptions','documentation','Python.org','https://docs.python.org/3/tutorial/errors.html'),
    (3,1,'Python Tutorial — virtual environments','documentation','Python.org','https://docs.python.org/3/tutorial/venv.html'),
    (3,2,'pytest — get started','documentation','pytest','https://docs.pytest.org/en/stable/getting-started.html')
  )
  insert into public.resources (node_id,topic_id,"order",name,type,platform,url)
  select n.id,t.id,x.resource_order,x.name,x.type,x.platform,x.url
  from replacements x join public.nodes n on n.slug='found-python'
  join public.topics t on t.node_id=n.id and t."order"=x.topic_order
  where not exists (select 1 from public.resources r where r.topic_id=t.id and r."order"=x.resource_order);

  with replacements(topic_order,resource_order,name,type,platform,url) as (values
    (1,1,'SQLBolt — lessons 1–12','course','SQLBolt','https://sqlbolt.com/'),
    (1,2,'PostgreSQL — querying a table','documentation','PostgreSQL','https://www.postgresql.org/docs/current/tutorial-select.html'),
    (2,1,'PostgreSQL Exercises — joins and subqueries','course','PGExercises','https://pgexercises.com/questions/joins/'),
    (2,2,'PostgreSQL — WITH queries','documentation','PostgreSQL','https://www.postgresql.org/docs/current/queries-with.html'),
    (3,1,'PostgreSQL — window functions tutorial','documentation','PostgreSQL','https://www.postgresql.org/docs/current/tutorial-window.html'),
    (3,2,'PostgreSQL — using EXPLAIN','documentation','PostgreSQL','https://www.postgresql.org/docs/current/using-explain.html')
  )
  update public.resources r
  set name=x.name,type=x.type,platform=x.platform,url=x.url
  from replacements x join public.topics t on t."order"=x.topic_order
  join public.nodes n on n.id=t.node_id and n.slug='found-sql'
  where r.topic_id=t.id and r."order"=x.resource_order;

  with replacements(topic_order,resource_order,name,type,platform,url) as (values
    (1,1,'SQLBolt — lessons 1–12','course','SQLBolt','https://sqlbolt.com/'),
    (1,2,'PostgreSQL — querying a table','documentation','PostgreSQL','https://www.postgresql.org/docs/current/tutorial-select.html'),
    (2,1,'PostgreSQL Exercises — joins and subqueries','course','PGExercises','https://pgexercises.com/questions/joins/'),
    (2,2,'PostgreSQL — WITH queries','documentation','PostgreSQL','https://www.postgresql.org/docs/current/queries-with.html'),
    (3,1,'PostgreSQL — window functions tutorial','documentation','PostgreSQL','https://www.postgresql.org/docs/current/tutorial-window.html'),
    (3,2,'PostgreSQL — using EXPLAIN','documentation','PostgreSQL','https://www.postgresql.org/docs/current/using-explain.html')
  )
  insert into public.resources (node_id,topic_id,"order",name,type,platform,url)
  select n.id,t.id,x.resource_order,x.name,x.type,x.platform,x.url
  from replacements x join public.nodes n on n.slug='found-sql'
  join public.topics t on t.node_id=n.id and t."order"=x.topic_order
  where not exists (select 1 from public.resources r where r.topic_id=t.id and r."order"=x.resource_order);

  -- References are for lookup, not completion theatre. Remove only generated
  -- secondary-resource lesson tasks; primary lessons and applied work retain
  -- their IDs and member history.
  delete from public.tasks task
  using public.resources r, public.nodes n
  where task.resource_id=r.id and r.node_id=n.id and n.path_id='foundations'
    and r."order"=2;

  update public.tasks task
  set "order"=10 + task."order"
  from public.nodes n
  where task.node_id=n.id and n.path_id='foundations' and task.resource_id is null;

  insert into public.tasks (node_id,description,type,"order",resource_id,lesson_title,duration_minutes)
  select n.id,
    case when r.type='video' then 'Watch: ' else 'Learn: ' end || r.name,
    case when r.type='video' then 'watch' else 'read' end,
    t."order",r.id,r.name,
    case when r.type='video' then 45 else 55 end
  from public.nodes n join public.topics t on t.node_id=n.id
  join public.resources r on r.topic_id=t.id and r."order"=1
  where n.path_id='foundations'
    and not exists (select 1 from public.tasks existing where existing.resource_id=r.id);

  -- Required learning steps point only at each topic's primary resource;
  -- references remain visible but optional.
  with lessons(slug,resource_url,description,type,ord,title,minutes) as (values
    ('found-tabular','https://numpy.org/doc/stable/user/absolute_beginners.html','Learn: work through array creation, shape, dtype, indexing, boolean masks, aggregation, and broadcasting','read',1,'NumPy arrays without unnecessary scientific-computing depth',60),
    ('found-tabular','https://pandas.pydata.org/docs/user_guide/10min.html','Learn: reproduce pandas selection, missing-data, merge, groupby, reshape, and export examples','read',2,'Practical DataFrame transformations',80),
    ('found-tabular','https://www.youtube.com/watch?v=-tU7fuUiq7w','Learn: watch the bounded Pandera walkthrough and reproduce one DataFrame schema','watch',3,'Executable tabular data contracts',30),
    ('found-capstone','https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures','Learn: frame a real allocation decision using 2–4 World Bank indicators before downloading data','read',1,'Capstone brief: a real allocation decision using public indicators',45),
    ('found-capstone','https://book.the-turing-way.org/reproducible-research/reproducible-research','Learn: create the required project structure and a one-command reproducibility check','read',2,'A project another analyst can rerun',35),
    ('found-capstone','https://www.gov.uk/government/publications/the-aqua-book-guidance-on-producing-quality-analysis-for-government','Learn: apply the quality and uncertainty checklist before writing the recommendation','read',3,'Communicate evidence without overstating it',40)
  )
  insert into public.tasks (node_id,description,type,"order",resource_id,lesson_title,duration_minutes)
  select n.id,l.description,l.type,l.ord,r.id,l.title,l.minutes
  from lessons l join public.nodes n on n.slug=l.slug
  join public.resources r on r.node_id=n.id and r.url=l.resource_url
  where not exists (select 1 from public.tasks x where x.node_id=n.id and x.resource_id=r.id);

  insert into public.tasks (node_id,description,type,"order")
  select n.id, authored.description, 'build', authored.ord
  from public.nodes n
  join (values
    ('found-tabular',4,'Build: create clean_data.py and test_clean_data.py that load a messy CSV, validate types and required columns, handle nulls and duplicates, join a lookup table, calculate grouped metrics, and export a deterministic tidy CSV'),
    ('found-capstone',4,'Build: complete a local foundation-capstone folder containing README.md, requirements.txt, data/raw, data/processed, src/clean_data.py, tests/test_clean_data.py, analysis/queries.sql, analysis/findings.md, and AI_USE.md; include provenance, a data dictionary, validation and reconciliation checks, uncertainty analysis, a ranked recommendation, limitations, and exact rerun instructions')
  ) authored(slug,ord,description) on authored.slug=n.slug
  where not exists (select 1 from public.tasks x where x.node_id=n.id and x.type='build');

  -- Make the baseline truly sequential. The specialization gates keep all
  -- Foundation prerequisites so old clients and new clients agree.
  delete from public.node_prerequisites np
  using public.nodes child, public.nodes parent
  where np.node_id=child.id and np.prerequisite_id=parent.id
    and child.path_id='foundations' and parent.path_id='foundations';

  with edges(child_slug,parent_slug) as (values
    ('found-python','found-cli'),('found-git','found-python'),
    ('found-tabular','found-git'),('found-sql','found-tabular'),
    ('found-stats','found-sql'),('found-ai','found-stats'),
    ('found-capstone','found-ai')
  )
  insert into public.node_prerequisites (node_id,prerequisite_id)
  select child.id,parent.id from edges
  join public.nodes child on child.slug=edges.child_slug
  join public.nodes parent on parent.slug=edges.parent_slug
  on conflict do nothing;

  insert into public.node_prerequisites (node_id,prerequisite_id)
  select entry.id, foundation.id
  from public.nodes entry cross join public.nodes foundation
  where entry.slug in ('de-etl','da-eda','ds-ml')
    and foundation.slug in ('found-python','found-tabular','found-sql','found-git','found-cli','found-stats','found-ai','found-capstone')
  on conflict do nothing;
end;
$$;

select public.apply_foundations_mastery_refresh();
revoke all on function public.apply_foundations_mastery_refresh() from public, anon, authenticated;
