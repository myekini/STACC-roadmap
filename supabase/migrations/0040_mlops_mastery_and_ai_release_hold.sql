-- Put MLOps before the held AI Engineering path and turn its five stable
-- nodes into one cumulative, production-grade ML system.

create or replace function public.apply_mlops_mastery_refresh()
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.paths where id = 'mlops') then return; end if;

  update public.paths
  set "order" = case id when 'mlops' then 4 when 'ai-engineering' then 5 else "order" end
  where id in ('mlops', 'ai-engineering');

  update public.paths set
    description = 'Turn a validated model into a tested, deployable, observable production system with a safe path for continuous improvement.',
    tags = array['Tracking','CI/CD/CT','Serving','Monitoring']
  where id = 'mlops';

  update public.nodes n set
    name = v.name, subtitle = v.subtitle, description = v.description,
    est_hours = v.hours, skills = v.skills
  from (values
    ('ml-docker','Experiments & Reproducible Pipelines','From notebook to repeatable run','Track experiments, version artifacts, orchestrate training, and package the same workflow for local and automated execution.',14,array['Experiment tracking','Pipeline orchestration','Reproducible containers']::text[]),
    ('ml-cicd','CI/CD for ML','Gate every production change','Gate every change with code, data, model, integration, security, and artifact checks before a release can move forward.',14,array['ML quality gates','Immutable artifacts','Release automation']::text[]),
    ('ml-monitoring','Serving & Safe Release','Ship without gambling production','Implement batch and online inference, deployment health checks, progressive delivery, load evidence, and executable rollback.',14,array['Batch & online serving','Progressive delivery','Rollback engineering']::text[]),
    ('ml-production','Monitoring & Incident Response','Know, decide, recover','Observe service, data, model, and business behavior; connect alerts to ownership, diagnosis, rollback, and retraining decisions.',14,array['Four-layer monitoring','Drift & delayed labels','Incident response']::text[]),
    ('ml-platform','Continuous ML Platform Capstone','Operate the whole lifecycle','Complete a production-grade continuous-training system with governed promotion, infrastructure, observability, recovery, and evidence.',18,array['Continuous training','Governed promotion','Platform ownership']::text[])
  ) v(slug,name,subtitle,description,hours,skills)
  where n.slug = v.slug;

  update public.topics t set title = v.title
  from public.nodes n, (values
    ('ml-docker',1,'Experiment tracking'),('ml-docker',2,'Pipeline orchestration'),('ml-docker',3,'Reproducible containers'),
    ('ml-cicd',1,'ML quality gates'),('ml-cicd',2,'Immutable artifacts'),('ml-cicd',3,'Release automation'),
    ('ml-monitoring',1,'Batch & online serving'),('ml-monitoring',2,'Progressive delivery'),('ml-monitoring',3,'Rollback engineering'),
    ('ml-production',1,'Four-layer monitoring'),('ml-production',2,'Drift & delayed labels'),('ml-production',3,'Incident response'),
    ('ml-platform',1,'Continuous training'),('ml-platform',2,'Governed promotion'),('ml-platform',3,'Platform ownership')
  ) v(slug,ord,title)
  where n.slug = v.slug and t.node_id = n.id and t."order" = v.ord;

  -- Every node opens with the maintained DataTalksClub video course. Precise
  -- module notes and official docs remain supporting links under each topic.
  update public.resources r set
    name = 'MLOps Zoomcamp — video course', type = 'video',
    platform = 'YouTube · DataTalksClub',
    url = 'https://www.youtube.com/playlist?list=PL3MmuxUbc_hIUISrluw_A7wDSmfOhErJK'
  from public.nodes n, public.topics topic
  where n.path_id = 'mlops' and topic.node_id = n.id and topic."order" = 1
    and r.id = (
      select candidate.id from public.resources candidate
      where candidate.node_id = n.id and candidate.topic_id = topic.id
      order by candidate."order", candidate.created_at nulls last, candidate.id limit 1
    );

  update public.tasks task set
    description = v.description, type = 'watch', lesson_title = v.title,
    duration_minutes = v.minutes,
    resource_id = (
      select r.id from public.resources r join public.topics topic on topic.id = r.topic_id
      where r.node_id = n.id and topic."order" = 1 and r.type = 'video'
      order by r."order", r.id limit 1
    )
  from public.nodes n, (values
    ('ml-docker','Learn: study experiment tracking, model registry, orchestration and reproducible packaging','Track and reproduce the full training run',60),
    ('ml-cicd','Learn: study ML-specific testing and CI/CD quality gates','Build quality gates for code, data and models',55),
    ('ml-monitoring','Learn: study batch, web and streaming deployment plus safe release patterns','Serve models through production-shaped interfaces',60),
    ('ml-production','Learn: study service, data and model monitoring with actionable alert design','Detect failure and operate the response loop',60),
    ('ml-platform','Learn: study the final-project standard and continuous ML maturity model','Join the lifecycle into one operable platform',55)
  ) v(slug,description,title,minutes)
  where n.slug = v.slug and task.node_id = n.id and task."order" = 1;

  update public.tasks task set description = v.description, type = 'build', project_requirements = v.requirements::jsonb
  from public.nodes n, (values
    ('ml-docker','Build milestone 1: initialise one cumulative production-ML repository with a tracked baseline, versioned data contract, orchestrated train/evaluate flow and reproducible container','{"requiredPaths":["README.md","src/train.py","pipeline.py","Dockerfile","tests/test_train.py"],"requiredHeadings":{"README.md":["System goal","Reproduce","Data contract","Experiment tracking"]},"submissionMode":"commit","manualReview":["A clean environment can reproduce the tracked baseline","Pipeline stages produce versioned artifacts","The container runs the same workflow"]}'),
    ('ml-cicd','Build milestone 2: extend the repository with code, data, model and service tests; CI must publish immutable artifacts and block regressions','{"requiredPaths":[".github/workflows/ci.yml","tests/test_data.py","tests/test_model.py","tests/test_service.py"],"requiredHeadings":{"README.md":["Quality gates","Artifacts"]},"submissionMode":"commit","manualReview":["CI fails on code, data, model or contract regression","Artifacts are immutable and traceable to a commit"]}'),
    ('ml-monitoring','Build milestone 3: add batch and online inference using one versioned artifact, contract tests, health probes, load evidence, a staged release and tested rollback','{"requiredPaths":["src/serve.py","src/batch.py","tests/test_contract.py","docs/release.md","docs/rollback.md"],"requiredHeadings":{"docs/release.md":["Strategy","Health checks","Load evidence"],"docs/rollback.md":["Trigger","Procedure","Validation"]},"submissionMode":"commit","manualReview":["Batch and online paths use the same model contract","A failed release can be rolled back deterministically"]}'),
    ('ml-production','Build milestone 4: add service, data, model and business dashboards; delayed-label evaluation; owned alerts; an incident runbook; and a rehearsed rollback or retraining decision','{"requiredPaths":["docs/monitoring.md","docs/runbook.md","reports/incident_rehearsal.md"],"requiredHeadings":{"docs/monitoring.md":["Service","Data","Model","Business","Delayed labels","Alerts"],"docs/runbook.md":["Owner","Diagnosis","Rollback","Retraining"]},"submissionMode":"commit","manualReview":["Every alert maps to an owner and action","The rehearsal distinguishes rollback from retraining"]}'),
    ('ml-platform','Capstone: ship the cumulative system with triggered training, lineage, registry promotion, CI/CD/CT, infrastructure as code, SLOs, monitoring, incident evidence, rollback and an operator-grade README','{"requiredPaths":["README.md","infra",".github/workflows/ci.yml",".github/workflows/retrain.yml","docs/architecture.md","docs/slo.md","docs/runbook.md","reports/incident_rehearsal.md"],"requiredHeadings":{"README.md":["System goal","Architecture","Reproduce","Deploy","Operate","Evidence"],"docs/architecture.md":["Training","Registry","Promotion","Serving","Monitoring"],"docs/slo.md":["Indicators","Objectives","Error budget"]},"submissionMode":"commit","manualReview":["Commit history shows one system growing through every milestone","Promotion is governed and reversible","Training-to-serving lineage is reproducible","Monitoring and incident evidence prove the system can be operated"]}')
  ) v(slug,description,requirements)
  where n.slug = v.slug and task.node_id = n.id and task."order" = 2;
end;
$$;

select public.apply_mlops_mastery_refresh();
revoke all on function public.apply_mlops_mastery_refresh() from public, anon, authenticated;
