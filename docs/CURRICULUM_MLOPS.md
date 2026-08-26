# MLOps curriculum audit

## Decision

MLOps is the final currently available specialization and comes before the held AI Engineering path. It assumes the learner already completed Data Engineering and Data Science; Docker is used as a reproducibility mechanism, not retaught as an isolated beginner subject.

The path produces one cumulative production-ML repository. Each node adds an operable layer and verifies a commit. Small practice may support learning, but it does not replace the build artifact.

## Progression

1. **Experiments & Reproducible Pipelines** — tracked baseline, data contract, orchestrated train/evaluate flow, versioned artifacts, reproducible container.
2. **CI/CD for ML** — code, data, model, service, integration and regression gates; immutable artifacts tied to commits.
3. **Serving & Safe Release** — one model contract across batch and online inference, health probes, load evidence, progressive delivery and rollback.
4. **Monitoring & Incident Response** — service, data, model and business signals; delayed labels; owned alerts; incident diagnosis and rollback-versus-retraining decisions.
5. **Continuous ML Platform Capstone** — triggered training, lineage, governed registry promotion, CI/CD/CT, infrastructure as code, SLOs, monitoring and rehearsed recovery.

## Resource standard

The maintained DataTalksClub MLOps Zoomcamp video course is the primary guided resource. Exact module materials, Made With ML, Google Cloud architecture guidance, and official tool documentation remain bounded supporting references. The UI leads with video and keeps links under topic-level supporting disclosure.

## Evidence standard

The final repository must make the system reproducible, deployable, observable and recoverable. Required evidence includes pipeline code, tests, immutable artifacts, batch and online serving, promotion rules, infrastructure, dashboards, alert thresholds, SLOs, rollback instructions, an incident rehearsal and an operator-grade README. A platform diagram without an executable system is insufficient.
