-- Turn Data Analysis into one cumulative decision-product portfolio project.
-- Existing node slugs and task rows remain stable; the capstone is additive.

create or replace function public.apply_data_analysis_mastery_refresh()
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.paths where id='da') then return; end if;

  update public.paths set
    description='Turn ambiguous questions and messy data into trustworthy, decision-ready products.',
    tags=array['EDA','Visualization','Power BI','Communication','Decision making']
  where id='da';

  update public.nodes set
    name='Governed BI Delivery', subtitle='Power BI from model to release',
    description='Prepare data with Power Query, model facts and dimensions, write dependable DAX measures, and publish a governed report.'
  where slug='da-bi';

  insert into public.nodes(slug,path_id,name,subtitle,description,icon,"order",est_hours,xp_reward,skills)
  values(
    'da-capstone','da','Decision Intelligence Capstone','Evidence to action',
    'Release a cumulative development-outcomes decision product that joins public indicators, exposes uncertainty, and gives a real stakeholder a defensible next action.',
    'verified',7,18,300,array['Reproducible evidence chain','Decision-ready product','Governed release']
  ) on conflict(slug) do update set
    name=excluded.name, subtitle=excluded.subtitle, description=excluded.description,
    icon=excluded.icon, "order"=excluded."order", est_hours=excluded.est_hours,
    xp_reward=excluded.xp_reward, skills=excluded.skills;

  insert into public.node_prerequisites(node_id,prerequisite_id)
  select child.id,parent.id from public.nodes child cross join public.nodes parent
  where child.slug='da-capstone' and parent.slug='da-ai-analysis'
  on conflict do nothing;

  insert into public.topics(node_id,title,"order")
  select n.id,v.title,v.ord from public.nodes n cross join (values
    (1,'Reproducible evidence chain'),(2,'Decision-ready product'),(3,'Governed release')
  ) v(ord,title)
  where n.slug='da-capstone'
    and not exists(select 1 from public.topics t where t.node_id=n.id and t."order"=v.ord);

  with curated(topic_order,resource_order,name,type,platform,url) as (values
    (1,1,'World Bank Indicators API — documentation','documentation','World Bank','https://datahelpdesk.worldbank.org/knowledgebase/articles/889392'),
    (1,2,'World Bank Indicators API — basic call structures','documentation','World Bank','https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures'),
    (2,1,'Communicating quality, uncertainty and change','documentation','UK Government Analysis Function','https://analysisfunction.civilservice.gov.uk/policy-store/communicating-quality-uncertainty-and-change/'),
    (2,2,'Data visualisation — charts','documentation','UK Government Analysis Function','https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/'),
    (3,1,'The Aqua Book — quality analysis guidance','documentation','UK Government','https://www.gov.uk/government/publications/the-aqua-book-guidance-on-producing-quality-analysis-for-government'),
    (3,2,'PL-300 skills measured — governed analytics release','documentation','Microsoft Learn','https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300')
  )
  insert into public.resources(node_id,topic_id,"order",name,type,platform,url)
  select n.id,t.id,c.resource_order,c.name,c.type,c.platform,c.url
  from curated c join public.nodes n on n.slug='da-capstone'
  join public.topics t on t.node_id=n.id and t."order"=c.topic_order
  where not exists(select 1 from public.resources r where r.topic_id=t.id and r.url=c.url);

  insert into public.tasks(node_id,description,type,"order")
  select n.id,v.description,v.type,v.ord from public.nodes n cross join (values
    (1,'Learn: inspect the World Bank Indicators API and use the Aqua Book checklist to plan analytical quality assurance','read'),
    (2,'Capstone: release the cumulative repository with a reproducible indicator pipeline, analysis, accessible visual system, tested desktop/mobile dashboard, governed semantic model, executive memo, uncertainty and limitations register, AI audit, QA checklist and public portfolio walkthrough','build')
  ) v(ord,description,type)
  where n.slug='da-capstone'
    and not exists(select 1 from public.tasks t where t.node_id=n.id and t."order"=v.ord);

  update public.tasks t set description=v.description
  from public.nodes n, (values
    ('da-eda',2,'Build milestone 1: initialise one cumulative repository with brief.md and analysis.ipynb defining the stakeholder, decision, metrics and assumptions, then profile missingness, duplicates, distributions, segments and anomalies'),
    ('da-visualization',2,'Build milestone 2: extend the repository with three decision-relevant charts, justified encodings, direct labels, colour-safe palettes, alt text and a visual QA note'),
    ('da-dashboards',2,'Build milestone 3: prototype desktop and mobile dashboard views for three stakeholder questions, with metric definitions, useful defaults, keyboard order, alt text and a five-person usability test'),
    ('da-storytelling',2,'Build milestone 4: add a five-slide decision narrative and one-page executive memo covering context, evidence, recommendation, uncertainty, limitations and next action'),
    ('da-bi',2,'Build milestone 5: implement the approved dashboard in Power BI with documented Power Query steps, a star schema, date table, explicit DAX measures, row-level security, refresh notes and a shared metric dictionary'),
    ('da-ai-analysis',2,'Build milestone 6: repeat one bounded part of the analysis with AI assistance, preserve prompts and generated code, exclude sensitive data, independently verify every number and citation, and compare time saved against new risks')
  ) v(slug,ord,description)
  where n.slug=v.slug and t.node_id=n.id and t."order"=v.ord;

  update public.tasks t set project_requirements=
    '{"requiredPaths":["brief.md","analysis.ipynb","README.md"],"requiredHeadings":{"brief.md":["Stakeholder","Decision","Success metric","Assumptions"],"README.md":["Question","Data","Reproduce","Milestones"]},"submissionMode":"commit","manualReview":["All later milestones extend this repository","The analysis separates evidence from assumptions","Data quality and uncertainty are explicit"]}'::jsonb
  from public.nodes n where n.slug='da-eda' and t.node_id=n.id and t.type='build';

  update public.tasks t set project_requirements=
    '{"requiredPaths":["README.md","brief.md","analysis.ipynb","model/metric_dictionary.md","reports/decision_memo.md","reports/quality_assurance.md","AI_USE.md"],"requiredHeadings":{"README.md":["Decision","Reproduce","Dashboard","Milestones"],"reports/decision_memo.md":["Recommendation","Evidence","Uncertainty","Next action"],"reports/quality_assurance.md":["Data checks","Metric checks","Visual checks","Release decision"],"AI_USE.md":["Prompts","Changes","Failures","Verification"]},"submissionMode":"commit","manualReview":["Commit history shows one decision product growing across six milestones","The dashboard works at desktop and mobile sizes","Every metric traces to source and transformation","Uncertainty and limitations could change the recommendation","The portfolio walkthrough is understandable without opening the notebook"]}'::jsonb
  from public.nodes n where n.slug='da-capstone' and t.node_id=n.id and t.type='build';
end;
$$;

select public.apply_data_analysis_mastery_refresh();
revoke all on function public.apply_data_analysis_mastery_refresh() from public, anon, authenticated;
