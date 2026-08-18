-- Strengthen Data Science in place while preserving progress, ratings and evidence.

update public.nodes n set name=v.name, subtitle=v.subtitle, description=v.description, icon=v.icon, skills=v.skills
from (values
 ('ds-ml','ML Fundamentals','Supervised learning core','Frame a prediction problem, define its target and cost of error, and build a reproducible baseline before tuning models.','model_training',array['Problem & target framing','Baselines','Reproducible pipelines']),
 ('ds-features','Feature Engineering','Signal from raw data','Create leakage-safe feature transformations and prove that each retained feature improves a cross-validated baseline.','settings_input_component',array['Encodings & scaling','Leakage traps','Feature selection']),
 ('ds-evaluation','Model Building & Evaluation','Beyond accuracy','Evaluate errors with business-aligned metrics, calibration, subgroup analysis, and an untouched final test set.','verified',array['Metrics & thresholds','Calibration','Error & subgroup analysis']),
 ('ds-experiments','Experimentation & A/B Testing','Causal by design','Design a powered experiment with a decision rule, guardrail metrics, validity checks, and an honest interpretation of uncertainty.','biotech',array['Experiment design','Power & effect size','Validity & decision rules']),
 ('ds-deployment','Model Deployment','Models as services','Package the chosen model behind a tested API with versioned artifacts, input validation, latency measurement, and rollback instructions.','publish',array['Validated inference API','Artifact versioning','Latency & rollback']),
 ('ds-deeplearning','Deep Learning — Advanced','Neural networks','Fine-tune a pretrained neural network only when it beats the simpler baseline enough to justify its added cost and risk.','psychology',array['Transfer learning','Training discipline','Complexity trade-offs']),
 ('ds-llm','Responsible Production Capstone','From model to decision system','Ship the cumulative project with reproducible training, a model card, monitored inference, responsible-use checks, and a stakeholder decision memo.','verified',array['Model documentation','Monitoring contract','Responsible release'])
) as v(slug,name,subtitle,description,icon,skills) where n.slug=v.slug;

update public.resources r set name=v.new_name,type=v.new_type,platform=v.platform,url=v.url
from public.nodes n, (values
 ('ds-ml','Kaggle: Intro to Machine Learning','Machine Learning Crash Course — linear and logistic regression','course','Google for Developers','https://developers.google.com/machine-learning/crash-course'),
 ('ds-ml','scikit-learn User Guide','scikit-learn — pipelines and composite estimators','documentation','scikit-learn','https://scikit-learn.org/stable/modules/compose.html'),
 ('ds-features','Kaggle: Feature Engineering','scikit-learn — preprocessing data','documentation','scikit-learn','https://scikit-learn.org/stable/modules/preprocessing.html'),
 ('ds-features','scikit-learn: Preprocessing & Feature Engineering','scikit-learn — common pitfalls and recommended practices','documentation','scikit-learn','https://scikit-learn.org/stable/common_pitfalls.html'),
 ('ds-evaluation','scikit-learn: Model Evaluation','scikit-learn — model evaluation','documentation','scikit-learn','https://scikit-learn.org/stable/modules/model_evaluation.html'),
 ('ds-evaluation','Google: Machine Learning Crash Course','scikit-learn — probability calibration','documentation','scikit-learn','https://scikit-learn.org/stable/modules/calibration.html'),
 ('ds-experiments','Trustworthy Online Controlled Experiments (notes)','Online controlled experiments — key concepts','article','Microsoft Research','https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/'),
 ('ds-experiments','How Not To Run An A/B Test','statsmodels — power and sample size','documentation','statsmodels','https://www.statsmodels.org/stable/stats.html#power-and-sample-size-calculations'),
 ('ds-deployment','FastAPI Docs','FastAPI — first steps','documentation','FastAPI','https://fastapi.tiangolo.com/tutorial/first-steps/'),
 ('ds-deployment','ONNX Runtime Documentation','MLflow Model Registry','documentation','MLflow','https://mlflow.org/docs/latest/ml/model-registry/'),
 ('ds-deeplearning','Practical Deep Learning for Coders','Practical Deep Learning — lessons 1–3','course','fast.ai','https://course.fast.ai/'),
 ('ds-deeplearning','PyTorch Tutorials','PyTorch transfer learning tutorial','documentation','PyTorch','https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html'),
 ('ds-llm','Hugging Face NLP Course','Production ML systems','course','Google for Developers','https://developers.google.com/machine-learning/crash-course/production-ml-systems'),
 ('ds-llm','LlamaIndex Documentation','Model Card Toolkit','documentation','Google Research','https://github.com/tensorflow/model-card-toolkit')
) as v(slug,old_name,new_name,new_type,platform,url)
where r.node_id=n.id and n.slug=v.slug and r.name=v.old_name;

update public.tasks t set description=v.description,type=v.task_type
from public.nodes n, (values
 ('ds-ml',1,'Learn: complete the Google linear/logistic regression modules and scikit-learn pipeline guide','read'),
 ('ds-ml',2,'Build: add problem_statement.md with user, target, prediction time, cost of errors and naive baseline, then train two reproducible pipeline-based models without touching the test set','build'),
 ('ds-features',1,'Learn: study preprocessing pipelines, inconsistent transformation and leakage pitfalls','read'),
 ('ds-features',2,'Build: add typed preprocessing inside the training pipeline, a leakage audit and an ablation table showing which features improve cross-validation and by how much','build'),
 ('ds-evaluation',1,'Learn: study scoring, cross-validation, threshold metrics and probability calibration','read'),
 ('ds-evaluation',2,'Build: add evaluation.md with baseline comparison, cross-validation uncertainty, chosen metric and threshold, calibration plot, error slices, subgroup results and one final test-set evaluation','build'),
 ('ds-experiments',1,'Learn: study experiment validity, guardrails, power and sample-size calculations','read'),
 ('ds-experiments',2,'Build: add experiment_plan.md with hypothesis, randomisation unit, primary and guardrail metrics, minimum detectable effect, sample size, duration, stopping rule, validity threats and ship/no-ship decision rule','build'),
 ('ds-deployment',1,'Learn: complete FastAPI first steps and the MLflow registry workflow','read'),
 ('ds-deployment',2,'Build: add a container-ready prediction API with schema validation, health endpoint, unit/integration tests, versioned model artifact, latency measurement and documented rollback','build'),
 ('ds-deeplearning',1,'Learn: complete fast.ai lessons 1–3 and the PyTorch transfer-learning tutorial','watch'),
 ('ds-deeplearning',2,'Build: fine-tune a pretrained model with fixed seeds, tracked runs and error analysis, then compare quality, latency and cost against the simpler baseline and justify whether it should ship','build'),
 ('ds-llm',1,'Learn: complete Production ML Systems and study the Model Card Toolkit','read'),
 ('ds-llm',2,'Build: finish the cumulative project with reproducible training, data/version lineage, model card, API or batch inference, service/data/model/business monitoring plan, alert thresholds, privacy/fairness review and a plain-language decision memo','build')
) as v(slug,task_order,description,task_type)
where t.node_id=n.id and n.slug=v.slug and t."order"=v.task_order;
