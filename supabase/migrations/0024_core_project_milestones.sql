-- Make every active specialization module a verifiable feature milestone in
-- one cumulative track repository. Verification remains intentionally
-- mechanical: it proves a fresh commit and required artifacts exist; the
-- manualReview list tells learners what a mentor/reviewer must judge.

create or replace function public.apply_core_project_milestones()
returns void
language sql
set search_path = public
as $$
update public.tasks t
set project_requirements = requirements.value
from public.nodes n
join (values
  ('da-eda', '{"requiredPaths":["brief.md","analysis.ipynb"],"requiredHeadings":{"brief.md":["Stakeholder","Decision","Success metric","Assumptions"]},"submissionMode":"commit","manualReview":["Analysis is reproducible and distinguishes observations from assumptions","Missingness, duplicates, distributions, segments and anomalies are investigated"]}'::jsonb),
  ('da-visualization', '{"requiredPaths":["reports/visual_review.md"],"requiredHeadings":{"reports/visual_review.md":["Chart choices","Accessibility","Corrections"]},"submissionMode":"commit","manualReview":["Three misleading charts are remade and each change is justified","Charts remain understandable without relying on colour alone"]}'::jsonb),
  ('da-dashboards', '{"requiredPaths":["dashboard/README.md"],"requiredHeadings":{"dashboard/README.md":["Stakeholder questions","Metric definitions","Mobile view","Usability checks"]},"submissionMode":"commit","manualReview":["Desktop and mobile views answer the three stated decisions","Defaults, keyboard order and empty/loading states are intentional"]}'::jsonb),
  ('da-storytelling', '{"requiredPaths":["reports/decision_memo.md"],"requiredHeadings":{"reports/decision_memo.md":["Recommendation","Evidence","Uncertainty","Next action"]},"submissionMode":"commit","manualReview":["The narrative leads to a defensible decision rather than a data dump","Limitations and uncertainty are communicated plainly"]}'::jsonb),
  ('da-bi', '{"requiredPaths":["model/metric_dictionary.md","reports/bi_release.md"],"requiredHeadings":{"model/metric_dictionary.md":["Metric","Definition","Owner"],"reports/bi_release.md":["Refresh","Security","Validation"]},"submissionMode":"commit","manualReview":["Measures agree with the documented metric definitions","The semantic model has a clear grain and working access controls"]}'::jsonb),
  ('da-ai-analysis', '{"requiredPaths":["AI_USE.md","reports/ai_comparison.md"],"requiredHeadings":{"AI_USE.md":["Prompts","Changes","Failures","Verification"],"reports/ai_comparison.md":["Time saved","New risks","Decision"]},"submissionMode":"commit","manualReview":["Every AI-generated number, claim and code path is independently checked","Sensitive data is excluded and the comparison is candid"]}'::jsonb),

  ('de-etl', '{"requiredPaths":["src/ingestion.py","docker-compose.yml","README.md"],"requiredHeadings":{"README.md":["Setup","Configuration","Safe reruns"]},"submissionMode":"commit","manualReview":["Pipeline paginates, validates schema and is safe to rerun without duplicates","Secrets and environment-specific configuration are outside source control"]}'::jsonb),
  ('de-modeling', '{"requiredPaths":["models/schema.sql","docs/bus_matrix.md"],"requiredHeadings":{"docs/bus_matrix.md":["Grain","Facts","Dimensions","Slowly changing"]},"submissionMode":"commit","manualReview":["Fact grain and key choices are explicit","Partitioning and SCD choices match the workload"]}'::jsonb),
  ('de-dbt', '{"requiredPaths":["dbt_project.yml","models/schema.yml"],"requiredHeadings":{"models/schema.yml":["tests","description"]},"submissionMode":"commit","manualReview":["Staging, intermediate and mart layers have clear responsibilities","Key, relationship and business-rule tests fail for the right reasons"]}'::jsonb),
  ('de-orchestration', '{"requiredPaths":["dags/pipeline.py","docs/backfill.md"],"requiredHeadings":{"docs/backfill.md":["Procedure","Validation","Recovery"]},"submissionMode":"commit","manualReview":["Workflow separates ingestion, validation and transformation with sensible retries","A deliberate failure and seven-day backfill are demonstrated"]}'::jsonb),
  ('de-cloud', '{"requiredPaths":["infra/main.tf","docs/cost.md"],"requiredHeadings":{"docs/cost.md":["Baseline","Optimisation","Result"]},"submissionMode":"commit","manualReview":["Infrastructure uses least privilege and stores no credentials in Git","Raw and processed zones plus cost controls are demonstrable"]}'::jsonb),
  ('de-spark', '{"requiredPaths":["src/spark_job.py","docs/spark_plan.md"],"requiredHeadings":{"docs/spark_plan.md":["Baseline","Explain plan","Partitioning","Result"]},"submissionMode":"commit","manualReview":["Distributed execution is justified against a local baseline","A measured shuffle, skew or partition problem is improved"]}'::jsonb),
  ('de-streaming', '{"requiredPaths":["src/streaming.py","docs/streaming.md"],"requiredHeadings":{"docs/streaming.md":["Ordering","Delivery semantics","Replay","Recovery"]},"submissionMode":"commit","manualReview":["Replay from an earlier offset is demonstrated","Partitioning, consumer groups and failure semantics are explained"]}'::jsonb),
  ('de-vectordb', '{"requiredPaths":["README.md","docs/architecture.md","docs/data_dictionary.md","docs/runbook.md"],"requiredHeadings":{"README.md":["Setup","Validation","Demo"],"docs/runbook.md":["Alerts","Backfill","Recovery"]},"submissionMode":"commit","manualReview":["The complete platform is reproducible and produces decision-ready output","Freshness, lineage, data quality, cost and failure recovery are operationally credible"]}'::jsonb),

  ('ds-ml', '{"requiredPaths":["problem_statement.md","src/train.py"],"requiredHeadings":{"problem_statement.md":["User","Target","Prediction time","Cost of errors","Baseline"]},"submissionMode":"commit","manualReview":["Two reproducible pipelines are compared without touching the test set","The target and prediction-time feature availability match the real decision"]}'::jsonb),
  ('ds-features', '{"requiredPaths":["src/features.py","reports/feature_ablation.md"],"requiredHeadings":{"reports/feature_ablation.md":["Leakage audit","Ablation results","Decision"]},"submissionMode":"commit","manualReview":["Preprocessing is fitted inside the training pipeline","Feature gains are supported by cross-validation rather than intuition"]}'::jsonb),
  ('ds-evaluation', '{"requiredPaths":["evaluation.md"],"requiredHeadings":{"evaluation.md":["Baseline","Cross-validation","Threshold","Calibration","Error slices","Final test"]},"submissionMode":"commit","manualReview":["The metric and threshold follow business error costs","The test set is used once and subgroup failures are not hidden"]}'::jsonb),
  ('ds-experiments', '{"requiredPaths":["experiment_plan.md"],"requiredHeadings":{"experiment_plan.md":["Hypothesis","Randomisation unit","Primary metric","Guardrails","Sample size","Stopping rule","Decision rule"]},"submissionMode":"commit","manualReview":["Design can identify the claimed causal effect","Validity threats and operational constraints are addressed before launch"]}'::jsonb),
  ('ds-deployment', '{"requiredPaths":["app/main.py","tests/test_api.py","docs/rollback.md"],"requiredHeadings":{"docs/rollback.md":["Trigger","Procedure","Validation"]},"submissionMode":"commit","manualReview":["API validates schemas and exposes health/version information","Tests, latency evidence and rollback are executable"]}'::jsonb),
  ('ds-deeplearning', '{"requiredPaths":["reports/deep_learning_tradeoff.md"],"requiredHeadings":{"reports/deep_learning_tradeoff.md":["Baseline","Quality","Latency","Cost","Ship decision"]},"submissionMode":"commit","manualReview":["Runs are reproducible and errors are analysed","The complex model ships only if measured value justifies its cost"]}'::jsonb),
  ('ds-llm', '{"requiredPaths":["MODEL_CARD.md","docs/monitoring.md","reports/decision_memo.md"],"requiredHeadings":{"MODEL_CARD.md":["Intended use","Limitations","Evaluation"],"docs/monitoring.md":["Service","Data","Model","Business","Alerts"],"reports/decision_memo.md":["Recommendation","Risk","Next action"]},"submissionMode":"commit","manualReview":["Training-to-inference lineage is reproducible","Monitoring, privacy, fairness and rollback make the system operable"]}'::jsonb)
) as requirements(slug, value) on requirements.slug = n.slug
where t.node_id = n.id and t.type = 'build';
$$;

select public.apply_core_project_milestones();
revoke all on function public.apply_core_project_milestones() from public, anon, authenticated;
