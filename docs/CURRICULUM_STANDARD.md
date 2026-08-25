# Stacc Curriculum Standard

**Status:** Operating standard for curriculum authors and reviewers  
**Audience:** Stacc members, mentors, and curriculum administrators  
**Review cadence:** Quarterly for links; twice yearly for role outcomes

## The verdict

Stacc has a strong product mechanism: prerequisites create order, practice happens inside the
platform, and specialization work accumulates in a public GitHub project. The weak point is the
learning contract. A topic name, two broad links, and a sentence beginning with “Build” are not
enough to make a learner employable. They leave the learner to decide what to study, how deeply
to study it, and whether the result is credible.

The curriculum must be **competency-led, evidence-backed, and bounded**. Resources support a
competency; they are never the curriculum themselves.

## The member promise

For every module, a member must be able to answer five questions before starting:

1. What will I be able to do?
2. Why does this matter in the job?
3. Exactly what should I study?
4. What must I produce?
5. What evidence proves that the work is good enough?

Every module follows one visible sequence:

```text
LEARN → PRACTISE → PROVE → SHIP
```

- **Learn:** one bounded primary lesson and one durable reference.
- **Practise:** a small, low-risk exercise with feedback.
- **Prove:** a quiz, code challenge, review, or explanation that tests transfer—not recall.
- **Ship:** a project increment that meets explicit acceptance criteria.

Foundations can practise inline. Every specialization must use one cumulative repository so the
final artifact tells a coherent engineering or business story.

## Scope guardrails

This is an enhancement of the curriculum and product that already exist, not a replacement LMS.
Keep the current paths, prerequisite model, two-resource limit, progress tracking,
GitHub project flow, and admin curriculum editor unless a small change is required to make the
learning contract clear.

Prioritise only three outcomes:

1. members know exactly what to learn next;
2. completed work demonstrates credible job skills;
3. resources stay focused, current, and easy to use.

Do not add social feeds, complex peer matching, certificates, large resource libraries, new
gamification, elaborate publishing machinery, or analytics that will not change a curriculum
decision. Prefer sharper copy, better sequencing, explicit outputs, and stronger checks over new
features or database complexity.

## Definition of a job-ready module

A module is publishable only when it has:

- one observable outcome written with an action verb;
- three or fewer competencies, each exercised by the work;
- exact chapters, lessons, or documentation pages—not a provider homepage or an unbounded course;
- an honest time estimate split between study and production;
- a learner output with a filename, query, dashboard, service, decision memo, or other inspectable artifact;
- acceptance criteria covering correctness, reproducibility, explanation, and role-specific quality;
- a checkpoint that cannot be passed by copying the tutorial;
- a clear place in the cumulative track project;
- an accessibility, ethics, privacy, security, or reliability consideration where the role demands it;
- a review date and an owner.

Certificates and watch time are not evidence of competence. A recruiter should be able to open
the resulting repository and understand the problem, decisions, trade-offs, tests, and result.

## Resource selection policy

Required resources must be free without a trial or credit card, technically current, accessible
in the learner's region, and specific enough to assign precisely. Prefer, in order:

1. official documentation or training from the tool owner;
2. a maintained university or open course;
3. an original author or recognised practitioner with working examples;
4. a community resource only when it explains the topic materially better.

Each module gets one primary learning resource and one reference. Additional links belong in an
optional library, not the required path. Do not assign an entire playlist, documentation root,
blog archive, or book homepage. Record the exact section and expected duration.

Quarterly review checks: URL health, paywall/login changes, version drift, region availability,
captions/transcripts, duplication, and whether a more authoritative source now exists. Resource
analytics should measure open rate, completion, rating coverage, and the point where members
leave a module. A low-rated resource is reviewed; it is not automatically removed without
checking whether the difficulty is necessary.

## Portfolio evidence rubric

Every specialization repository is assessed on four universal dimensions:

| Dimension | Hiring signal |
|---|---|
| Correct | Tests, checks, or reconciliations show that the output works. |
| Reproducible | A reviewer can set up and run it from documented instructions. |
| Explained | The README states the problem, users, decisions, trade-offs, and limitations. |
| Operable | Failures, costs, security, monitoring, or maintenance are considered at the level appropriate to the role. |

Each milestone must name its required files and checks. “Push a commit” is transport, not a
rubric. The final milestone includes a short demo, architecture or analysis narrative, and a
retrospective explaining what the learner would improve next.

## Track rebuilds

### Foundations — professional working baseline

Keep Python, tabular Python, SQL, Git, command line, statistics, and AI literacy, but raise the standard:

Teach them in dependency order: command line → Python → Git → tabular Python → SQL → statistics → AI literacy → readiness capstone.

- Python foundations: functions, modules, files, precise errors, environments, tests, and runnable programs.
- Tabular Python: essential NumPy arrays/vectorisation, practical pandas transformations, and executable data contracts. Advanced broadcasting, linear algebra, and scientific computing stay in Data Science.
- SQL: joins, aggregation, CTEs, window functions, nulls, query plans, and data-quality queries.
- Git: branches, pull requests, review, conflicts, rollback, and a clean commit history.
- Command line: navigation, pipes, processes, permissions, environment variables, and scripts.
- Statistics: distributions, sampling, uncertainty, confidence intervals, hypothesis tests, effect size, and correlation versus causation.
- AI literacy: model limits, verification, privacy, prompt injection, responsible use, and documenting AI assistance.

Completion artifact: a small, tested data investigation with SQL, Python, version control, a
written decision, and a transparent AI-use note. This becomes the shared baseline portfolio item.

The Foundation artifact is a local readiness gate and does not require a connected repository.
The learner connects one repository when beginning a specialization. Every specialization node
then adds a meaningful, verified milestone to that same repository; the final node integrates,
operates, documents, and presents the accumulated system as the track capstone.

### Data Analysis — from request to decision

The implemented path grows one decision product through:

1. **Exploratory analysis** — stakeholder decision, metric definitions, data quality, segments, uncertainty, and causal limits.
2. **Visualisation** — honest encodings, comparison, annotation, accessibility, and visual QA.
3. **Dashboard design** — decision-led information architecture, KPI contracts, interaction, mobile layout, and usability testing.
4. **Decision communication** — executive synthesis, recommendation, limitations, uncertainty, and next action.
5. **Governed BI delivery** — Power Query, semantic modelling, DAX, security, refresh, ownership, and metric documentation.
6. **AI-assisted analysis** — bounded assistance, privacy, traceability, independent verification, and an auditable contribution log.
7. **Capstone** — a development-outcomes decision product built from public indicators and a real stakeholder brief, not a decorative dashboard.

The cumulative project must include `brief.md`, a data dictionary, analysis queries/notebook,
the semantic model, dashboard, QA checklist, and a one-page decision memo.

### Data Engineering — reliable data products

Replace the present tool tour with the sequence already detailed in
`CURRICULUM_DATA_ENGINEERING.md`:

1. reproducible environments with Docker and infrastructure-as-code;
2. idempotent batch ingestion;
3. warehousing and dimensional modelling;
4. analytics engineering with dbt;
5. orchestration and backfills;
6. cloud security, cost, and operations;
7. distributed processing only when scale justifies it;
8. streaming semantics and recovery;
9. reliability, observability, and an integrated capstone.

Move vector databases to AI Engineering. Require data contracts, freshness checks, lineage,
least-privilege access, incident notes, and a backfill runbook. The capstone is an operable data
platform, not eight unrelated demos.

### Data Science — evidence to deployment

Rebuild the sequence so modelling never outruns problem formulation or evaluation:

1. problem framing, target definition, baselines, and leakage prevention;
2. probability, inference, sampling, and experimental reasoning;
3. supervised learning with reproducible pipelines;
4. feature engineering and representation;
5. evaluation, calibration, subgroup analysis, and error analysis;
6. experimentation and causal limits;
7. unsupervised learning and time-series only where the problem calls for them;
8. model communication, fairness, privacy, and responsible release;
9. deployment, monitoring contract, and decision threshold;
10. optional deep-learning specialisation after the tabular production baseline.

The capstone must start with a decision and cost-of-error statement. It ends with a model card,
reproducible training pipeline, evaluation report, API or batch inference path, monitoring plan,
and a plain-language stakeholder memo.

### AI Engineering — locked for now

Keep the existing AI Engineering curriculum in the codebase, but do not promote or expand it.
The path remains visibly locked and unavailable to members while Foundations, Data Analysis,
Data Engineering, and Data Science are improved and validated. Do not move Vector DB content or
add new AI modules during this enhancement.

Revisit AI Engineering only when the core paths have clear outcomes, bounded resources,
module-specific evidence, and at least one completed learner pilot. At that point, review the
existing material for evaluation, security, reliability, cost, and human-handoff gaps before
unlocking it. This avoids teaching a fast-moving advanced path on top of an unproven core.

### MLOps — safe, repeatable model operations

Avoid reteaching Docker as if the learner has never seen it. Use a short readiness check, then:

1. reproducible training, configuration, lineage, and experiment tracking;
2. data and model validation with versioned artifacts;
3. CI gates for code, data, model quality, security, and reproducibility;
4. registry, approval, deployment strategies, and rollback;
5. batch and online serving with service-level objectives;
6. feature consistency and point-in-time correctness;
7. monitoring for service health, data quality, drift, performance, and business outcomes;
8. incident response, retraining policy, cost, and platform self-service;
9. capstone operating an end-to-end model lifecycle.

The final repository must include pipeline code, tests, deployment manifests, a model card,
monitoring dashboard, alert thresholds, rollback procedure, and one simulated incident report.

## Essential learner-experience enhancements

The interface must show the module outcome and competencies before any resource. It must visually
separate Learn, Practise, Prove, and Ship; show which artifact is added to the track project; and
state what unlocks next. Required and optional material cannot look equal.

Keep the experience focused: a clear resume action, honest external-link behaviour, mobile-safe
reading and coding, and a simple way to report an unavailable resource. The system must never
equate opening a link with learning; completion follows evidence or a checkpoint.

For admins, add only the operational information needed to maintain quality: resource owner,
last-reviewed date, broken-link state, member rating, and module completion/retry signal. Retain
the current editor and audit trail; improve save clarity instead of building a complex publishing
platform.

## Focused enhancement plan

### 1. Clarify the existing modules

- Rewrite each description as one observable outcome.
- Keep three competencies and two resources per module.
- Replace broad homepages/playlists with exact, bounded lessons.
- Add the expected output and module-specific “done well” checks to existing task copy.
- Remove duplicate, outdated, or non-essential material instead of adding more.

### 2. Strengthen the three core career paths

- **Data Analysis:** add the missing business-question, SQL/Power Query, semantic-model/DAX,
  accessibility, and governance expectations inside the existing path structure.
- **Data Engineering:** apply the existing blueprint, prioritising reproducibility, idempotency,
  modelling, testing, orchestration, cloud operations, and one coherent capstone.
- **Data Science:** strengthen problem framing, evaluation, leakage prevention, fairness,
  communication, deployment, and monitoring without turning every topic into a new module.

Foundations is improved first because every path depends on it. MLOps remains advanced and is
reviewed only after Data Engineering and Data Science are solid. AI Engineering stays locked.

### 3. Improve evidence without changing the product model

- Keep one cumulative GitHub repository per specialization.
- Give every milestone module-specific files, checks, and README expectations.
- Keep Foundations practice inline and free of repository verification.
- Use automated verification only for facts the system can reliably check; do not present a new
  commit as proof of overall quality.

### 4. Make resources maintainable

- Record an owner and review date.
- Add a simple broken-resource report action.
- Review links quarterly for access, version drift, captions, and relevance.
- Use existing ratings and basic completion/retry information before adding deeper analytics.

### 5. Validate before expanding

- Pilot Foundations and Data Analysis with 10–15 members.
- Observe confusion, completion, retries, and the quality of shipped work.
- Apply the findings to Data Engineering and Data Science.
- Ask a small number of mentors or hiring managers to review final artifacts against the rubric.
- Unlock or expand advanced paths only when the core produces credible evidence.

Do not migrate all learners blindly. Preserve completed work, map equivalent competencies, and
offer a short bridge module when a new required competency has no prior evidence.
