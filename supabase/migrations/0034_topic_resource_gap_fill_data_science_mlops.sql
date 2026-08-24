-- Verified topic-2/topic-3 resources for every Data Science and MLOps
-- module. Dedup keyed on (topic_id, url) — see 0032. Two deliberate
-- cross-references worth knowing about, not bugs:
--   - ds-features' Leakage traps secondary reuses the same scikit-learn
--     "Common pitfalls" doc as that node's topic 1 — no distinct, equally
--     strong official secondary exists specifically for leakage.
--   - ml-platform's Model registries primary reuses the same MLflow
--     tutorial as ds-deployment's Artifact versioning — same canonical
--     source, applicable at both the individual-model and platform level.

begin;

with curated(node_slug, topic_order, resource_order, name, type, platform, url) as (values
  -- ds-ml — Baselines / Reproducible pipelines
  ('ds-ml', 2, 1, 'ML Zoomcamp — Model Selection Process', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/machine-learning-zoomcamp/blob/master/01-intro/05-model-selection.md'),
  ('ds-ml', 2, 2, 'scikit-learn — Dummy estimators', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/model_evaluation.html#dummy-estimators'),
  ('ds-ml', 3, 1, 'MLOps Zoomcamp — Module 3: Orchestration and ML Pipelines', 'course', 'DataTalksClub', 'https://github.com/DataTalksClub/mlops-zoomcamp/tree/main/03-orchestration'),
  ('ds-ml', 3, 2, 'DVC — Get Started: Data Pipelines', 'documentation', 'DVC', 'https://doc.dvc.org/start/data-pipelines/data-pipelines'),

  -- ds-features — Leakage traps / Feature selection
  ('ds-features', 2, 1, 'Kaggle Learn — Data Leakage', 'course', 'Kaggle', 'https://www.kaggle.com/code/alexisbcook/data-leakage'),
  ('ds-features', 2, 2, 'scikit-learn — Common pitfalls and recommended practices', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/common_pitfalls.html'),
  ('ds-features', 3, 1, 'Feature Selection in Machine Learning with Python', 'video', 'YouTube (DataTalks.Club) — Soledad Galli', 'https://www.youtube.com/watch?v=blvmNWbcPDo'),
  ('ds-features', 3, 2, 'scikit-learn — Feature selection', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/feature_selection.html'),

  -- ds-evaluation — Calibration / Error & subgroup analysis
  ('ds-evaluation', 2, 1, 'Classification: Prediction Bias', 'course', 'Google for Developers (ML Crash Course)', 'https://developers.google.com/machine-learning/crash-course/classification/prediction-bias'),
  ('ds-evaluation', 2, 2, 'scikit-learn — CalibratedClassifierCV', 'documentation', 'scikit-learn', 'https://scikit-learn.org/stable/modules/generated/sklearn.calibration.CalibratedClassifierCV.html'),
  ('ds-evaluation', 3, 1, 'Building Fairer AI Systems with Fairlearn', 'video', 'Microsoft Learn (AI Show)', 'https://learn.microsoft.com/en-us/shows/ai-show/building-fairer-ai-systems-with-fairlearn'),
  ('ds-evaluation', 3, 2, 'Fairlearn — Performing a Fairness Assessment', 'documentation', 'Fairlearn', 'https://fairlearn.org/main/user_guide/assessment/perform_fairness_assessment.html'),

  -- ds-experiments — Power & effect size / Validity & decision rules
  ('ds-experiments', 2, 1, 'Error probabilities and power', 'video', 'Khan Academy', 'https://www.khanacademy.org/math/statistics-probability/significance-tests-one-sample/error-probabilities-and-power'),
  ('ds-experiments', 2, 2, 'statsmodels — TTestIndPower', 'documentation', 'statsmodels', 'https://www.statsmodels.org/stable/generated/statsmodels.stats.power.TTestIndPower.html'),
  ('ds-experiments', 3, 1, 'A/B Testing (ud257)', 'course', 'Udacity (by Google)', 'https://www.udacity.com/course/ab-testing--ud257'),
  ('ds-experiments', 3, 2, 'Patterns of Trustworthy Experimentation — Post-Experiment Stage', 'article', 'Microsoft Research', 'https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-post-experiment-stage/'),

  -- ds-deployment — Artifact versioning / Latency & rollback
  ('ds-deployment', 2, 1, 'MLflow — Model Registry Tutorial', 'course', 'MLflow', 'https://mlflow.org/docs/latest/ml/model-registry/tutorial/'),
  ('ds-deployment', 2, 2, 'MLflow — Model Registry Workflow', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/ml/model-registry/workflow/'),
  ('ds-deployment', 3, 1, 'SRE Workbook — Canarying Releases (Ch. 16)', 'article', 'Google SRE', 'https://sre.google/workbook/canarying-releases/'),
  ('ds-deployment', 3, 2, 'Configure Liveness, Readiness and Startup Probes', 'documentation', 'Kubernetes', 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/'),

  -- ds-deeplearning — Training discipline / Complexity trade-offs
  ('ds-deeplearning', 2, 1, 'Practical Deep Learning for Coders — Lesson 5', 'course', 'fast.ai', 'https://course.fast.ai/Lessons/lesson5.html'),
  ('ds-deeplearning', 2, 2, 'A Recipe for Training Neural Networks', 'article', 'Andrej Karpathy', 'http://karpathy.github.io/2019/04/25/recipe/'),
  ('ds-deeplearning', 3, 1, 'PyTorch — Pruning Tutorial', 'documentation', 'PyTorch', 'https://docs.pytorch.org/tutorials/intermediate/pruning_tutorial.html'),
  ('ds-deeplearning', 3, 2, 'Introduction to Quantization on PyTorch', 'article', 'PyTorch', 'https://pytorch.org/blog/introduction-to-quantization-on-pytorch/'),

  -- ds-llm — Monitoring contract / Responsible release
  ('ds-llm', 2, 1, 'Evidently — LLM Evaluation Quickstart', 'documentation', 'Evidently', 'https://docs.evidentlyai.com/quickstart_llm'),
  ('ds-llm', 2, 2, 'The ML Test Score: A Rubric for ML Production Readiness', 'article', 'Google Research', 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/'),
  ('ds-llm', 3, 1, 'Introduction to Responsible AI', 'course', 'Google for Developers', 'https://developers.google.com/machine-learning/guides/intro-responsible-ai'),
  ('ds-llm', 3, 2, 'Responsible Generative AI Toolkit — Design a responsible approach', 'documentation', 'Google AI for Developers', 'https://ai.google.dev/responsible/docs/design'),

  -- ml-docker — Compose / Registries
  ('ml-docker', 2, 1, 'Docker Compose Quickstart', 'course', 'Docker', 'https://docs.docker.com/compose/gettingstarted/'),
  ('ml-docker', 2, 2, 'Compose File Reference', 'documentation', 'Docker', 'https://docs.docker.com/reference/compose-file/'),
  ('ml-docker', 3, 1, 'Build and push your first image', 'course', 'Docker', 'https://docs.docker.com/get-started/introduction/build-and-push-first-image/'),
  ('ml-docker', 3, 2, 'What is a registry?', 'documentation', 'Docker', 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/'),

  -- ml-cicd — Model & data tests / Artifacts
  ('ml-cicd', 2, 1, 'Testing Machine Learning Systems: Code, Data and Models', 'course', 'Made With ML', 'https://madewithml.com/courses/mlops/testing/'),
  ('ml-cicd', 2, 2, 'Great Expectations — Try GX Core', 'documentation', 'Great Expectations', 'https://docs.greatexpectations.io/docs/core/introduction/try_gx/'),
  ('ml-cicd', 3, 1, 'actions/upload-artifact', 'project', 'GitHub', 'https://github.com/actions/upload-artifact'),
  ('ml-cicd', 3, 2, 'Workflow artifacts', 'documentation', 'GitHub Docs', 'https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts'),

  -- ml-monitoring — Concept drift / Alerting
  ('ml-monitoring', 2, 1, 'What is concept drift in ML, and how to detect and address it', 'article', 'Evidently', 'https://www.evidentlyai.com/ml-in-production/concept-drift'),
  ('ml-monitoring', 2, 2, 'Data Drift — Evidently metric preset', 'documentation', 'Evidently', 'https://docs.evidentlyai.com/metrics/preset_data_drift'),
  ('ml-monitoring', 3, 1, 'How to deploy a live ML monitoring dashboard', 'video', 'Evidently — ML Observability Course', 'https://learn.evidentlyai.com/ml-observability-course/module-6-deploying-an-ml-monitoring-dashboard/how-deploy-ml-monitoring-dashboard'),
  ('ml-monitoring', 3, 2, 'Grafana Alerting', 'documentation', 'Grafana', 'https://grafana.com/docs/grafana/latest/alerting/'),

  -- ml-production — Feature stores / Scaling & caching
  ('ml-production', 2, 1, 'Feast Workshop', 'course', 'Feast (feast-dev)', 'https://github.com/feast-dev/feast-workshop'),
  ('ml-production', 2, 2, 'Feast — Quickstart', 'documentation', 'Feast', 'https://docs.feast.dev/getting-started/quickstart'),
  ('ml-production', 3, 1, 'NVIDIA Triton Inference Server — Optimization', 'documentation', 'NVIDIA', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/optimization.html'),
  ('ml-production', 3, 2, 'Redis — Client-side caching reference', 'documentation', 'Redis', 'https://redis.io/docs/latest/develop/reference/client-side-caching/'),

  -- ml-platform — Model registries / Platform architecture
  ('ml-platform', 2, 1, 'MLflow — Model Registry Tutorial', 'course', 'MLflow', 'https://mlflow.org/docs/latest/ml/model-registry/tutorial/'),
  ('ml-platform', 2, 2, 'MLflow — Model Registry Workflow', 'documentation', 'MLflow', 'https://mlflow.org/docs/latest/ml/model-registry/workflow/'),
  ('ml-platform', 3, 1, 'MLOps: Continuous delivery and automation pipelines in ML', 'documentation', 'Google Cloud', 'https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning'),
  ('ml-platform', 3, 2, 'Meet Michelangelo: Uber''s Machine Learning Platform', 'article', 'Uber Engineering', 'https://www.uber.com/en-US/blog/michelangelo-machine-learning-platform/')
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
