# Stacc — Program Architecture
**Version 3.0 | March 2026**

---

## Overview

```
DEV (Open) → STAGING S1, S2… → PROD P1, P2… → Builder Alumni
                                       ↕
                                  PRO 1:1 (Paid)
```

| Program | Duration | Size | Entry | Cost | Member Name |
|---------|----------|------|-------|------|-------------|
| Dev | Ongoing | Unlimited | Open | Free | Dev |
| Staging | 12 weeks | 20–30 | Application | Free | Stagee |
| Prod | 12 weeks | 15–20 | Merit selection | Free | Builder |
| Pro 1:1 | 13 weeks | 1–5 per mentor | Application | ₦350,000+ | Pro Member |

---

## Learning Philosophy

Stacc does not lecture. There are no lessons, no slides, no content library created by Stacc.

Learning happens through three mechanisms:

**Curated resources** via the Roadmap Tracker — the best free content on the internet, organized by path, rated by the community, and kept current.

**Contribution** — skills only count once they have been applied to live systems with real users. Reading about dbt is not the same as merging a dbt model into a production pipeline.

**Peer accountability** — progress is visible to cohort peers, Builder Alumni reviewers, and admins. Silence is a signal.

### AI is Not Optional

A data professional in 2026 who cannot reason about LLMs, vector databases, AI agents, RAG systems, and AI-assisted development tooling is already behind the market. Stacc's curriculum — across all three programs — reflects where the market is, not where it was. AI is in the work at every stage, not introduced as a final topic.

---

## Dev Program

| Attribute | Value |
|-----------|-------|
| Member name | Dev |
| Cohort label | None — Dev is always open |
| Entry | Open — no requirements |
| Platform | Discord + app.getstacc.org |
| Format | Self-paced, async, community-driven |
| Access | Roadmap Tracker, The Ladder (L1–L2), weekly challenges, office hours |
| Exit | Application to Staging after 4+ weeks of visible, documented progress |

Dev is the first filter, not a waiting room. The community is active — challenges, peer support, wins channels, weekly events. Devs who do not engage do not advance. The application to Staging is the proof point that separates intent from action.

### The Ladder Access at Dev Level

L1 and L2 are open to all Devs from Day 1. This is intentional — it gives every new member an immediate, concrete, high-value reason to join beyond community access. Structured interview prep starts on arrival, not after graduation.

---

## Staging Program

| Attribute | Value |
|-----------|-------|
| Member name | Stagee |
| Cohort label | S1, S2, S3… |
| Entry | 4+ weeks active in Dev, visible roadmap progress, written application, acceptance |
| Duration | 12 weeks |
| Size | 20–30 Stagees per cohort |
| Format | Teams of 4–5, GitHub-native, async-first with weekly syncs |
| Output | Merged contributions to live Stacc data products, completed roadmap path, real GitHub work history |

### What Staging Actually Is

Staging is Stacc's in-house data and AI team.

Stagees do not contribute to random external open-source projects. They build real features for Stacc's own live products — analytics systems, AI-powered tooling, and intelligence layers that the Stacc community itself depends on.

This matters for three reasons. The contributions are real because the users are real — the Stacc community immediately feels what Stagees ship. The feedback loop is fast — work goes into production within weeks, not months. And the GitHub history is genuine — PRs, code reviews, merges on a live codebase, not a practice repo nobody uses.

### What Stagees Build

Stagees work on the data and AI infrastructure that sits on top of Stacc's own platform. The dataset is live, the users are active, and the problems are genuine.

| Project Area | Description |
|--------------|-------------|
| Cohort Analytics Dashboard | Admin visibility into Stagee engagement, roadmap progress, and churn risk across cohorts |
| Resource Recommendation Engine | ML model surfacing the next best learning resource based on a member's pattern and progress |
| LLM Study Assistant | Node-level AI assistant answering questions within the context of the member's current roadmap topic |
| Churn Prediction | Model flagging Devs who are going quiet so admins can intervene before they drop off |
| Roadmap Completion Insights | Analysis of which paths, nodes, and resources drive the fastest time-to-completion |

Stagees choose a project area in Week 1, work in cross-functional teams across the full data stack, and contribute via PRs reviewed and merged by Builder Alumni.

### Curriculum Path

Staging is full-stack by design. Every Stagee works across all data disciplines — not because they are expected to specialize in all of them, but because Prod teams require people who can reason across the whole system. Staging is where the horizontal bar of the T-shape gets built. Specialization happens in Prod.

| Weeks | Focus | AI Integration |
|-------|-------|----------------|
| 1–2 | Foundations review + project scoping | AI tool fluency: Cursor, Copilot, prompt engineering for dev work |
| 3–4 | Data Engineering | Pipelines, dbt, Airflow, vector databases, LLM data infrastructure |
| 5–6 | Data Analysis | AI-assisted EDA, metric frameworks, dashboard design |
| 7–8 | Data Science | Model building, evaluation, LLM fine-tuning basics |
| 9–10 | AI Engineering | RAG systems, LLM APIs, agent design patterns, multimodal basics |
| 11–12 | Capstone | Full PR cycle on chosen Stacc product area — end to end |

### Staging Graduation Requirements

- 1+ merged pull request on a live Stacc product
- Roadmap path at ≥80% completion
- ≥80% attendance at weekly cohort syncs
- 2+ peer code reviews given and documented on GitHub
- Written project reflection submitted to admin

### The Ladder Access at Staging Level

Stagees unlock **Level 3 — Applied Practice** upon graduation. Levels 1–2 remain accessible throughout the Staging program.

---

## Prod Program

| Attribute | Value |
|-----------|-------|
| Member name | Builder |
| Cohort label | P1, P2, P3… |
| Entry | Staging graduation + merit selection |
| Duration | 12 weeks |
| Size | 15–20 Builders per cohort (3–4 teams) |
| Format | Lean AI-native startup team, GitHub-native, JIRA-tracked |
| Output | Shipped AI or data product, verified real user base, Demo Day presentation |

### What Prod Actually Is

Prod is a lean, high-functioning startup environment where Builders ship real AI or data products to real users. The output is not a project. It is a product — deployed, actively used, and validated by people outside the team.

Every Prod product must:
- Solve a real, specific problem in an African market context — fintech, healthcare, agriculture, logistics, education, or comparable sectors
- Have AI or data at the core of the value proposition — not as a bolt-on feature, but as the reason the product exists
- Be shipped to and actively used by people outside the building team
- Be presented at Demo Day to the Stacc community and invited guests

**The standard is YC-quality framing.** The DPM opens Week 1 with three things: who is the user, what is the exact problem, and why does AI or data make this 10x better than what exists. Products that cannot answer these questions cleanly do not proceed past Discovery.

### Team Structure

Each Prod team has 5–6 Builders in the following roles:

| Role | Count | Responsibility |
|------|-------|----------------|
| Data Product Manager (DPM) | 1 | Problem definition, user research, JIRA, sprint planning, stakeholder communication |
| Data Engineer (DE) | 1–2 | Pipelines, infrastructure, data layer, vector databases, real-time systems |
| Data Analyst (DA) | 1 | Insights, dashboards, business metrics, supports DPM on research and validation |
| ML / AI Engineer | 1–2 | Models, LLM integrations, agent design, RAG systems, embeddings, evaluation |
| AI Builder / Vibe Coder | 1 | Interface — web or mobile — built with AI-assisted development tools |

**On the AI Builder role:** This position does not require a data background. It requires strong product sense and fluency with AI-assisted development tools — Cursor, Lovable, v0, Bolt, and equivalent platforms. In 2026, a skilled AI Builder using these tools can ship production-quality interfaces that would have required a multi-person engineering team three years ago. This is a deliberate architectural decision, not a compromise.

### Build Phases

| Phase | Weeks | Focus |
|-------|-------|-------|
| Discovery | 1–2 | User research, competitor landscape, problem definition, product brief sign-off |
| Architecture | 3–4 | System design, data model, stack selection, infrastructure planning |
| Build: Data Layer | 5–6 | Pipelines, ingestion, storage, AI infrastructure, vector databases |
| Build: Intelligence | 7–8 | Models, LLM integrations, AI features, analytics layer |
| Build: Product | 9–10 | Interface, end-to-end integration, user testing, iteration |
| Launch | 11–12 | Deploy, user acquisition, feedback collection, Demo Day |

### Prod Graduation Requirements

- Product shipped and publicly accessible
- Verified, active user base with documented usage data — not signups, but measurable usage
- Demo Day presented to the Stacc community and invited guests
- All team members contributed meaningfully across at least two build phases
- GitHub history demonstrates cross-functional contribution

### The Ladder Access at Prod Level

Builders unlock **Level 4 — System Design** upon joining Prod. Builder Alumni unlock **Level 5 — Senior & FAANG-Ready**.

---

## Pro 1:1 Program

Pro 1:1 is Stacc's premium, revenue-generating mentorship track. It is the highest-touch product and the primary revenue source. Every design decision reflects that.

| Attribute | Value |
|-----------|-------|
| Member name | Pro Member |
| Entry | Written application + intake interview |
| Duration | 13 weeks |
| Format | 2 sessions per week × 2 hours each |
| Total mentorship contact | ~52 hours |
| Price | ₦350,000+ |
| Cohort size | 1–5 simultaneous clients per mentor |
| Mentor compensation | 30–40% revenue share per engagement |

### Tracks

| Track | Target Role | Core Deliverable |
|-------|-------------|-----------------|
| Data Engineering | DE job-ready | End-to-end pipeline project + AI data infrastructure component on GitHub |
| Data Analysis | DA job-ready | BI dashboard portfolio + AI-assisted insight report suite |
| Data Science / AI | DS or AI Engineer job-ready | Deployed ML or LLM-powered product with real, documented users |
| Full Stack Data | Versatile | Two or more projects spanning different data disciplines |

### Session Structure

**Session 1 (Build):**
Project work and technical execution. Code review. Resource gaps identified and assigned. Clear deliverable set before Session 2.

**Session 2 (Review + Positioning):**
Deliverable reviewed and documented. Portfolio narrative refined. Interview prep — mock questions from The Ladder rubric, job application strategy, LinkedIn and GitHub positioning.

### Pro 1:1 Graduation Requirements

- Complete, public GitHub portfolio with 2+ end-to-end projects
- Mentor-verified skill record aligned to target track
- Full job application package: resume, LinkedIn, portfolio case studies
- Minimum 3 completed mock interview sessions with structured Ladder rubric feedback

---

## Progression Summary

| Transition | Requirements |
|------------|--------------|
| Dev → Staging | 4+ weeks active, roadmap progress documented, application submitted and accepted |
| Staging → Prod | All Staging graduation requirements met, merit selection by program team |
| Prod → Builder Alumni | Product shipped, Demo Day completed, all graduation requirements met |
| Any stage → Pro 1:1 | Written application + intake interview — open at all stages |

---

*End of Program Architecture*
