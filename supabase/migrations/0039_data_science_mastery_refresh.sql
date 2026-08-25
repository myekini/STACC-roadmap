-- Make Data Science one cumulative decision system and remove mandatory deep
-- learning. The existing slug remains stable to preserve learner progress.

create or replace function public.apply_data_science_mastery_refresh()
returns void
language plpgsql
set search_path = public
as $$
begin
  if not exists(select 1 from public.paths where id='ds') then return; end if;

  update public.paths set
    description='Frame, validate, deploy, and responsibly operate predictive systems whose complexity is earned by evidence.',
    tags=array['ML','Experimentation','Deployment','Responsible AI']
  where id='ds';

  update public.nodes set
    name='Advanced Modeling', subtitle='Complexity must earn its place',
    description='Choose an advanced method that matches the data structure, validate it correctly, and ship it only when measured value justifies added cost and risk.',
    est_hours=16,
    skills=array['Problem-shaped model choice','Grouped & temporal validation','Complexity trade-offs']
  where slug='ds-deeplearning';

  update public.topics t set title=v.title
  from public.nodes n, (values
    (1,'Problem-shaped model choice'),(2,'Grouped & temporal validation'),(3,'Complexity trade-offs')
  ) v(ord,title)
  where n.slug='ds-deeplearning' and t.node_id=n.id and t."order"=v.ord;

  -- Retarget legacy advanced-node resources in place so lesson links and
  -- ratings remain attached while the subject becomes problem-dependent.
  update public.resources r set name=v.name,type=v.type,platform=v.platform,url=v.new_url
  from public.nodes n, (values
    ('https://course.fast.ai/','Choosing the right estimator','documentation','scikit-learn','https://scikit-learn.org/stable/machine_learning_map.html'),
    ('https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html','Ensembles — gradient boosting, forests, and stacking','documentation','scikit-learn','https://scikit-learn.org/stable/modules/ensemble.html'),
    ('https://course.fast.ai/Lessons/lesson5.html','Cross-validation strategies','documentation','scikit-learn','https://scikit-learn.org/stable/modules/cross_validation.html'),
    ('http://karpathy.github.io/2019/04/25/recipe/','GroupKFold — keep related samples together','documentation','scikit-learn','https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html'),
    ('https://docs.pytorch.org/tutorials/intermediate/pruning_tutorial.html','Clustering — unlabeled structure','course','Google for Developers','https://developers.google.com/machine-learning/clustering'),
    ('https://pytorch.org/blog/introduction-to-quantization-on-pytorch/','Practical Deep Learning — optional unstructured-data branch','course','fast.ai','https://course.fast.ai/')
  ) v(old_url,name,type,platform,new_url)
  where n.slug='ds-deeplearning' and r.node_id=n.id and r.url=v.old_url;

  update public.resources r set
    name='MLflow Model Registry workflows',
    url='https://mlflow.org/docs/latest/ml/model-registry/workflow'
  from public.nodes n
  where n.slug='ds-deployment' and r.node_id=n.id
    and r.url='https://mlflow.org/docs/latest/ml/model-registry/';

  update public.tasks t set description=v.description,type=v.type
  from public.nodes n, (values
    ('ds-ml',2,'Build milestone 1: initialise one cumulative repository with problem_statement.md defining the user, target, prediction time, cost of errors and naive baseline, then train two reproducible pipelines without touching the test set','build'),
    ('ds-features',2,'Build milestone 2: extend the repository with typed preprocessing inside the training pipeline, a leakage audit and an ablation table proving which features improve cross-validation','build'),
    ('ds-evaluation',2,'Build milestone 3: add evaluation.md with baseline comparison, cross-validation uncertainty, a cost-based metric and threshold, calibration, error slices, subgroup results and one final test-set evaluation','build'),
    ('ds-experiments',2,'Build milestone 4: design a post-deployment intervention experiment with hypothesis, randomisation unit, primary and guardrail metrics, minimum detectable effect, sample size, stopping rule, validity threats and ship/no-ship rule','build'),
    ('ds-deployment',2,'Build milestone 5: add a container-ready prediction API with schema validation, health and version endpoints, unit/integration tests, a registered model alias, latency evidence and executable rollback','build'),
    ('ds-deeplearning',1,'Learn: study estimator selection, ensembles, grouped/time-aware validation, clustering and transfer learning; choose only the branch appropriate to the project','read'),
    ('ds-deeplearning',2,'Build milestone 6: benchmark one justified advanced approach with tracked runs and correct validation, then compare quality, latency, interpretability and cost against the simpler champion and record a ship/reject decision','build'),
    ('ds-llm',2,'Capstone: release the cumulative decision system with reproducible training, data/model lineage, model card, tested inference, CI, service/data/model/business monitoring, alert thresholds, privacy/fairness review, rollback evidence and a plain-language stakeholder decision memo','build')
  ) v(slug,ord,description,type)
  where n.slug=v.slug and t.node_id=n.id and t."order"=v.ord;

  update public.tasks t set project_requirements=
    '{"requiredPaths":["problem_statement.md","src/train.py","README.md","tests/test_train.py"],"requiredHeadings":{"problem_statement.md":["User","Decision","Target","Prediction time","Cost of errors","Baseline"],"README.md":["Reproduce","Data contract","Milestones"]},"submissionMode":"commit","manualReview":["All later milestones extend this repository","Feature availability matches prediction time","Two reproducible pipelines beat or honestly retain the naive baseline"]}'::jsonb
  from public.nodes n where n.slug='ds-ml' and t.node_id=n.id and t.type='build';

  update public.tasks t set project_requirements=
    '{"requiredPaths":["reports/advanced_model_tradeoff.md"],"requiredHeadings":{"reports/advanced_model_tradeoff.md":["Problem shape","Validation design","Baseline","Quality","Latency","Interpretability","Cost","Ship decision"]},"submissionMode":"commit","manualReview":["The validation split respects time, groups, or independence assumptions","The advanced approach is rejected when value does not justify complexity","Unsupervised or deep learning methods are used only when the data and decision require them"]}'::jsonb
  from public.nodes n where n.slug='ds-deeplearning' and t.node_id=n.id and t.type='build';

  update public.tasks t set project_requirements=
    '{"requiredPaths":["README.md","MODEL_CARD.md","docs/monitoring.md","docs/rollback.md","reports/decision_memo.md",".github/workflows/ci.yml"],"requiredHeadings":{"README.md":["Decision","Reproduce","Inference","Milestones"],"MODEL_CARD.md":["Intended use","Out of scope","Limitations","Evaluation","Ethical considerations"],"docs/monitoring.md":["Service","Data","Model","Business","Alerts"],"docs/rollback.md":["Trigger","Procedure","Validation"],"reports/decision_memo.md":["Recommendation","Evidence","Risk","Next action"]},"submissionMode":"commit","manualReview":["Commit history shows one decision system growing across six milestones","Training-to-inference lineage is reproducible","CI tests data, model and service contracts","Threshold and subgroup behavior follow stated costs","Monitoring, privacy, fairness and rollback make the release operable"]}'::jsonb
  from public.nodes n where n.slug='ds-llm' and t.node_id=n.id and t.type='build';
end;
$$;

select public.apply_data_science_mastery_refresh();
revoke all on function public.apply_data_science_mastery_refresh() from public, anon, authenticated;
