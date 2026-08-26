# Stacc specialization portfolio projects

## Shared project contract

Every specialization produces one flagship repository. The learner chooses a domain with data they can legally publish, but the project must serve a named user making a consequential decision. Retail “Superstore” summaries, copied tutorials, static notebooks without reproduction instructions, and disconnected mini-projects do not qualify.

Each node ends with one reviewable commit. A milestone is complete only when the new artifact works with everything already built. The final repository must show the evolution through commit history, include a short architecture or decision record, disclose limitations, and provide a five-minute portfolio walkthrough.

Good domains include public infrastructure, climate resilience, mobility, health access, education, agriculture, energy, financial inclusion, and open-source operations. Learners may propose another domain if its decision, data rights, update process, and harm considerations are explicit.

---

## Data Engineering — Civic Reliability Data Platform

### Portfolio story

Build a production-shaped platform that helps a city operations or public-service team identify where service demand is rising, which areas are underserved, and whether response reliability is improving. Combine one changing operational source, such as service requests or transit events, with contextual public data such as weather, geography, or population indicators.

The outcome is not a dashboard alone. It is a recoverable batch-and-stream data product that another engineer can deploy, operate, and trust.

| Node | Contribution to the same repository | Evidence added |
|---|---|---|
| Local Data Platform | Ingest a paginated operational API into PostgreSQL with incremental state, schema validation and duplicate-safe reruns. | Containerized pipeline, data contract, tests, configuration example and rerun proof. |
| Warehouse Modeling | Define the event grain and service dimensions; model events, location, time, category and status, including one history-tracked dimension. | Bus matrix, dimensional model, SCD2 test and measured partition/query decision. |
| Analytics Engineering with dbt | Turn raw tables into documented staging, intermediate and decision-ready marts. | dbt DAG, source freshness, key/relationship/business tests and generated docs. |
| Workflow Orchestration | Schedule ingestion, validation and transformation; make retries, notification and backfills safe. | Orchestrated DAG, deliberate-failure evidence and seven-day backfill log. |
| Cloud & Infrastructure as Code | Recreate the platform in a cloud environment with separated storage zones, identities, secrets, budgets and least privilege. | Terraform, architecture decision record and before/after cost evidence. |
| Distributed Batch with Spark | Process one genuinely large historical or geospatial workload and justify distributed execution against a local baseline. | PySpark job, explain plan, benchmark and one measured optimization. |
| Event Streaming with Kafka | Add a bounded live service-event feed and preserve replayability and ordering expectations. | Producer/consumer flow, keyed partitions, replay demonstration and delivery-semantics note. |
| Production Readiness Capstone | Release the entire platform as an operable service-reliability data product. | CI, lineage, freshness/quality alerts, data dictionary, runbook, recovery rehearsal and one decision-ready output. |

Final demo question: “A source failed and seven days of events arrived late—show how the platform detects, recovers, and produces the same trusted metrics.”

---

## Data Analysis — Development Outcomes Decision Briefing

### Portfolio story

Advise a foundation, policy unit, or social-impact organization deciding where to focus a bounded intervention. Join public indicators across two or more authoritative sources, compare peer groups fairly, expose uncertainty, and recommend one defensible next action.

The outcome is a governed decision product—not a gallery of charts—and must work for both an executive audience and an analyst who needs to audit the numbers.

| Node | Contribution to the same repository | Evidence added |
|---|---|---|
| Exploratory Data Analysis | Define the stakeholder, decision, metrics and assumptions; profile quality, missingness, distributions, segments and anomalies. | Decision brief, reproducible notebook and data-quality register. |
| Data Visualization | Create three charts that directly answer decision questions and remain understandable without narration. | Source files, direct labels, colour-safe palette, alt text and visual QA note. |
| Dashboard Design | Prototype desktop and mobile views around three stakeholder questions and test the information path with users. | Wireframes, interaction specification, accessibility checks and usability findings. |
| Data Storytelling | Convert evidence into a recommendation with context, uncertainty, limitations and a concrete next action. | Five-slide narrative and one-page executive memo. |
| Governed BI Delivery | Implement the approved product in Power BI with a trustworthy model and operational documentation. | Power Query steps, star schema, date table, explicit DAX, RLS, refresh notes and metric dictionary. |
| AI-Assisted Analysis | Repeat one bounded analysis task with AI, independently verify it, and document where assistance helped or created risk. | Prompt/code log, verification table, sensitive-data decision and time-versus-risk comparison. |
| Decision Intelligence Capstone | Publish the briefing as a complete, accessible and auditable decision product. | Reproducible pipeline, dashboard, memo, uncertainty/limitations register, AI audit, QA checklist and portfolio walkthrough. |

Final demo question: “What should the stakeholder do next, what evidence changes that recommendation, and where could this analysis mislead them?”

---

## Data Science — Preventive Service Decision System

### Portfolio story

Build an early-warning system for a real allocation decision: for example, which service cases need proactive review, which equipment is at risk of failure, or where demand may exceed capacity. The model recommends attention; it does not automate a high-impact decision without human review.

The project must make prediction time, intervention, error costs and data availability explicit. Model complexity is accepted only when it improves the decision enough to justify its operational and interpretability cost.

| Node | Contribution to the same repository | Evidence added |
|---|---|---|
| ML Fundamentals | Frame the user, target, prediction time, intervention and error costs; establish a naive baseline and two reproducible pipelines. | Problem statement, baseline report, training code and tests. |
| Feature Engineering | Build typed preprocessing inside the pipeline and prove features are available at prediction time. | Leakage audit, feature tests and ablation table. |
| Model Building & Evaluation | Select a cost-aware metric and threshold, quantify uncertainty, inspect calibration, slices and subgroup behavior, then touch the test set once. | Evaluation report, error analysis and model-selection decision. |
| Experimentation & A/B Testing | Design how the recommended intervention would be tested after deployment. | Experiment protocol with unit, power, guardrails, stopping and ship/no-ship rules. |
| Model Deployment | Serve a versioned champion safely and make rollback executable. | Container-ready API, schemas, health/version endpoints, integration tests, latency evidence and registry alias. |
| Advanced Modeling | Benchmark one problem-shaped advanced approach against the simpler champion and reject it if the value is not earned. | Tracked comparison of quality, latency, interpretability and cost with a signed ship/reject record. |
| Responsible Production Capstone | Release the complete human-in-the-loop decision system. | Model card, lineage, CI, monitored inference, privacy/fairness review, alerts, rollback evidence and stakeholder decision memo. |

Final demo question: “At prediction time, what action changes, what does each error cost, and why is this model the simplest responsible choice?”

---

## MLOps — Continuously Operated Risk Service

### Portfolio story

Productionize a validated model from Data Science—or an equivalent supplied baseline—as a continuously operated service. The learner owns the lifecycle from tracked training through governed promotion, serving, monitoring, incident response and retraining.

The model is intentionally not the star. The portfolio value is evidence that the surrounding system can reproduce, release, observe and recover it.

| Node | Contribution to the same repository | Evidence added |
|---|---|---|
| Experiments & Reproducible Pipelines | Convert the baseline into a tracked, orchestrated and containerized training/evaluation workflow. | Versioned data contract, tracked run, pipeline, artifact lineage, container and clean-environment reproduction. |
| CI/CD for ML | Gate changes across code, data, model behavior and service contracts; produce immutable artifacts. | CI workflow, test suites, regression thresholds and commit-to-artifact trace. |
| Serving & Safe Release | Expose the same artifact through batch and online paths and release it progressively. | Contract tests, health probes, load results, staged-release record and exercised rollback. |
| Monitoring & Incident Response | Observe service, data, model and business behavior and connect alerts to owned actions. | Dashboards, delayed-label evaluation, alert policy, runbook and incident rehearsal. |
| Continuous ML Platform Capstone | Join training triggers, registry promotion, deployment, infrastructure, SLOs and recovery into one governed lifecycle. | CI/CD/CT, IaC, architecture, lineage, SLO/error budget, promotion approval, operational README and recovery evidence. |

Final demo question: “A new model passes offline evaluation but causes a production regression—show how the system detects, contains, diagnoses and safely resolves it.”

---

## AI Engineering — Evidence-Grounded Operations Copilot (Coming Soon)

This project remains a design blueprint while AI Engineering is held. It must not appear as an available learner project until the path is audited and released.

### Portfolio story

Build a copilot that helps an operations team investigate incidents using approved runbooks, service documentation and structured telemetry. It must cite evidence, expose uncertainty, require confirmation before consequential actions, and degrade safely when retrieval or tools fail.

| Future node | Contribution to the same repository | Required evidence before release |
|---|---|---|
| LLM APIs & Orchestration | Implement typed inputs/outputs, streaming and bounded tool calls. | Provider-independent interface, schema tests, retry/time-budget policy and cost trace. |
| RAG System Design | Ground answers in versioned operational knowledge with measurable retrieval quality. | Ingestion pipeline, chunking study, hybrid retrieval, reranking, citations and retrieval evaluation set. |
| AI Agents & Tool Use | Add a constrained investigation loop with read-only tools first and explicit stopping/approval rules. | Tool contracts, state machine, least privilege, loop limits and adversarial tests. |
| Multimodal Systems | Accept one justified document or screenshot workflow without weakening provenance. | Structured extraction schema, confidence handling, provenance and failure examples. |
| LLMOps & Evaluation | Gate prompt, model and retrieval changes against quality, safety, latency and cost. | Versioned eval suite, regression thresholds, traces, red-team cases and release report. |
| AI Product Design | Release the complete human-supervised copilot with fallbacks and honest uncertainty UX. | Architecture, threat model, latency/cost budgets, human handoff, audit log, incident plan and product decision memo. |

Future demo question: “The retrieved evidence conflicts and a tool requests a consequential action—show how the system refuses false certainty and hands control back to a human.”

---

## Portfolio review rubric

Reviewers score every final project on six dimensions:

1. **Decision value** — a named user can make or operate a real decision.
2. **Technical integrity** — the system is reproducible, tested and internally consistent.
3. **Evidence** — claims are supported by measurements, artifacts and commit history.
4. **Operational maturity** — failure, monitoring, recovery, cost and ownership are addressed at the level appropriate to the path.
5. **Responsible practice** — limitations, privacy, security, accessibility and potential harm are explicit.
6. **Communication** — a reviewer can understand, run and evaluate the work without the learner present.

Passing requires no critical failure in reproducibility, data rights, secret handling, fabricated evidence, or misleading claims. A beautiful interface cannot compensate for an untrustworthy system.
