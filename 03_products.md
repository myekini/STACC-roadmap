# Stacc — Product Specifications
**Version 2.0 | March 2026**

---

# Part 1: Roadmap Tracker

## 1.1 Overview

| Attribute | Value |
|-----------|-------|
| Name | Roadmap Tracker |
| URL | app.getstacc.org/roadmap |
| Build status | Priority 1 — Ship First |
| Model | AI-integrated visual skill tree with curated resources and progress tracking |

The Roadmap Tracker answers the three questions that stop most learners: *What do I learn next? Am I on track? What does ready actually look like?*

It does not create content. It curates the best free resources on the internet, organizes them into clear, visual progression paths, integrates AI assistance at the point of learning, and tracks every step — so members always know exactly where they are and what comes next.

---

## 1.2 Target Users

| User | Core Need |
|------|-----------|
| Dev | Self-paced structure with visible progress |
| Stagee | Curriculum path tracking tied to cohort project context |
| Builder | Advanced paths and AI engineering tracks |
| Pro Member | Personalized path tracking with mentor admin visibility |
| Admin | Cohort health monitoring, stuck detection, resource analytics |

---

## 1.3 User Flows

### Member Flow

```
Login → Dashboard → Roadmap
    ↓
Select path: DE / DA / DS / AI Engineering / MLOps / Full Stack
    ↓
Browse nodes → Click node → Resources + tasks
    ↓
Complete resource → Mark task done → XP awarded
    ↓
All tasks complete → Node done → Next node unlocks
    ↓
[Optional] Ask AI Study Assistant — context-aware help on current topic
```

### Admin Flow

```
Login → Admin Panel → Progress Tracking
    ↓
All members OR filter by cohort: S1, S2, P1, P2…
    ↓
Click member → Full node-level progress breakdown
    ↓
Identify stuck or inactive members → Trigger nudge or support action
```

---

## 1.4 Feature Set

### Member-Facing

| Feature | Description |
|---------|-------------|
| Skill Tree | Full visual node-based roadmap spanning all paths |
| Path Selection | DE, DA, DS, AI Engineering, MLOps, or Full Stack |
| Node Detail | Resources, tasks, estimated hours, community quality ratings |
| Progress Tracking | Mark tasks complete; visual fill per node and per path |
| XP System | XP awarded per node completion; feeds member rank on dashboard |
| Prerequisite Gates | Advanced nodes locked until prerequisites are complete |
| Resource Ratings | Community-assigned 1–5 star ratings per resource |
| AI Study Assistant | LLM-powered assistant operating within the context of the currently open node — explains concepts, answers questions, suggests exercises |

### Admin-Facing

| Feature | Description |
|---------|-------------|
| Member List | All users with overall progress %, path breakdown, last active date |
| Cohort Filter | Filter all views by cohort label: S1, S2, P1, P2 |
| Individual Progress View | Full node-level breakdown for any single member |
| Progress Export | CSV or PDF reports per cohort or per individual |
| Stuck Alerts | Automatic flagging of members with no activity for 14+ days |
| Resource Analytics | Completion vs. abandonment rates per resource across all members |

---

## 1.5 Skill Tree Structure

```
FOUNDATIONS  (Required before any path)
├── Python Basics
├── SQL Basics
├── Git & GitHub
├── Command Line
├── Statistics Basics
└── AI Literacy
    ├── Prompt engineering fundamentals
    ├── How LLMs work (conceptual)
    └── AI tool fluency: Cursor, Copilot, ChatGPT for dev work

DATA ENGINEERING PATH
├── ETL Concepts
├── Data Modeling
├── dbt (data build tool)
├── Workflow Orchestration (Airflow / Prefect)
├── Cloud Platforms (AWS / GCP)
├── Spark — Advanced
├── Real-time Streaming (Kafka)
└── Vector Databases & LLM Infrastructure

DATA ANALYSIS PATH
├── Exploratory Data Analysis
├── Data Visualization
├── Dashboard Design
├── Data Storytelling
├── BI Tools (Looker, Power BI, Metabase)
└── AI-Assisted Analysis

DATA SCIENCE PATH
├── ML Fundamentals
├── Feature Engineering
├── Model Building and Evaluation
├── Experimentation and A/B Testing
├── Model Deployment
├── Deep Learning — Advanced
└── LLM Fine-tuning and RAG

AI ENGINEERING PATH  ← Unlocks after DE + DS
├── LLM APIs and Orchestration (OpenAI, Anthropic, Gemini)
├── RAG System Design and Implementation
├── AI Agents and Tool Use
├── Multimodal Systems
├── LLMOps and Evaluation
└── AI Product Design and Architecture

MLOPS PATH  ← Unlocks after DE + DS
├── Docker and Containerization
├── CI/CD for ML
├── Model Monitoring and Drift Detection
├── Production ML Systems
└── End-to-End ML Platform Design
```

---

## 1.6 Data Structures

### Node

```typescript
Node {
  id:          uuid
  name:        string
  path:        'foundations' | 'de' | 'da' | 'ds' | 'ai-engineering' | 'mlops'
  parent_id:   uuid | null       // prerequisite node
  order:       integer
  est_hours:   integer
  xp_reward:   integer
  resources:   Resource[]
  tasks:       Task[]
}
```

### Resource

```typescript
Resource {
  id:           uuid
  node_id:      uuid
  name:         string
  type:         'article' | 'video' | 'course' | 'project' | 'documentation'
  platform:     string           // e.g. "YouTube", "freeCodeCamp"
  url:          string
  cost:         'free' | 'paid'
  avg_rating:   float
  rating_count: integer
}
```

### User Progress

```typescript
UserProgress {
  id:              uuid
  user_id:         uuid
  node_id:         uuid
  status:          'locked' | 'available' | 'in_progress' | 'complete'
  started_at:      timestamp | null
  completed_at:    timestamp | null
  tasks_completed: uuid[]
}
```

---

## 1.7 Database Schema

```sql
nodes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  path        text not null,
  parent_id   uuid references nodes(id) on delete set null,
  "order"     integer not null,
  est_hours   integer not null,
  xp_reward   integer not null,
  created_at  timestamptz default now()
);

resources (
  id          uuid primary key default gen_random_uuid(),
  node_id     uuid references nodes(id) on delete cascade,
  name        text not null,
  type        text not null,
  platform    text not null,
  url         text not null,
  cost        text not null default 'free',
  avg_rating  float default 0,
  created_at  timestamptz default now()
);

tasks (
  id          uuid primary key default gen_random_uuid(),
  node_id     uuid references nodes(id) on delete cascade,
  description text not null,
  type        text not null,     -- 'read' | 'watch' | 'build' | 'quiz'
  "order"     integer not null
);

user_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  node_id      uuid references nodes(id) on delete cascade,
  status       text not null default 'locked',
  started_at   timestamptz,
  completed_at timestamptz,
  unique(user_id, node_id)
);

task_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  task_id      uuid references tasks(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(user_id, task_id)
);

resource_ratings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  resource_id  uuid references resources(id) on delete cascade,
  rating       integer check (rating between 1 and 5),
  created_at   timestamptz default now(),
  unique(user_id, resource_id)
);
```

---

## 1.8 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/roadmap` | GET | Public | Full tree — node names and paths only, no resources |
| `/api/roadmap/[path]` | GET | Public | Path nodes with preview |
| `/api/nodes/[id]` | GET | Auth | Full node — resources and tasks included |
| `/api/progress` | GET | Auth | Authenticated user's full progress |
| `/api/progress/[nodeId]` | POST | Auth | Update node status |
| `/api/tasks/[id]/complete` | POST | Auth | Mark task complete |
| `/api/resources/[id]/rate` | POST | Auth | Submit rating (1–5) |
| `/api/assistant/ask` | POST | Auth | LLM study assistant — node-scoped |
| `/api/admin/progress` | GET | Admin | All members' progress |
| `/api/admin/cohort/[label]` | GET | Admin | Cohort-filtered progress view |
| `/api/admin/stuck` | GET | Admin | Members flagged as inactive 14+ days |

---

## 1.9 Access Control

| Component | Access |
|-----------|--------|
| Skill tree structure only | Public — for SEO and marketing |
| Node details, resources, tasks | Authenticated members |
| Progress tracking | Authenticated members |
| Resource ratings | Authenticated members |
| AI Study Assistant | Authenticated members |
| Admin dashboard and endpoints | Admin role only |

The public skill tree surfaces Stacc's roadmap in search results for data learning queries and converts visitors through the "log in to track progress" prompt.

---

## 1.10 UI Layout

*Full visual specifications in `04_design_system.md`. The Roadmap Tracker follows the Modern Technical Brutalism aesthetic: navy surfaces, cyan progress indicators, Geist Mono labels, bento-box grid.*

### Roadmap Page

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR                                   [DASHBOARD]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OVERALL  ████████████░░░░  72%               XP: 3,200    │
│  [FOUNDATIONS ✓] [DE ████░] [DA ░░░] [DS ░░░] [AI ░░░]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   SKILL TREE                         │   │
│  │                                                      │   │
│  │             ┌──────────────┐                         │   │
│  │             │ FOUNDATIONS  │                         │   │
│  │             │  ✓ ✓ ✓ ✓ ✓ ✓│                         │   │
│  │             └──────┬───────┘                         │   │
│  │      ┌─────────────┼─────────┬──────────┐            │   │
│  │      ▼             ▼         ▼          ▼            │   │
│  │  ┌────────┐   ┌────────┐ ┌──────┐ ┌────────┐        │   │
│  │  │   DE   │   │   DA   │ │  DS  │ │AI-ENG  │        │   │
│  │  │ ████░░ │   │ ░░░░░░ │ │ ░░░░ │ │ ░░░░░░ │        │   │
│  │  └────────┘   └────────┘ └──────┘ └────────┘        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Node Detail Panel (slide-in)

```
┌──────────────────────────────────────┐
│  dbt Fundamentals               [×]  │
│  ──────────────────────────────────  │
│  PATH: DATA ENGINEERING              │
│  EST: 12 HRS  │  XP: +200            │
│  STATUS: IN PROGRESS   ████░░  60%   │
│  ──────────────────────────────────  │
│  RESOURCES                           │
│  ★ 4.8  [COURSE]  dbt Fundamentals   │
│  ★ 4.5  [DOCS]    Official dbt Docs  │
│  ★ 4.2  [VIDEO]   dbt Crash Course   │
│  ──────────────────────────────────  │
│  TASKS                               │
│  ✓  Read: What is dbt?               │
│  ✓  Watch: dbt in 10 minutes         │
│  ○  Build: Set up a local project    │
│  ○  Build: Write your first model    │
│  ──────────────────────────────────  │
│  [ ASK AI ASSISTANT → ]              │
└──────────────────────────────────────┘
```

---

## 1.11 Stuck Detection

A member is flagged as stuck when:
- A node has been `in_progress` for 14+ days with no task completions, or
- No roadmap activity has been recorded for 14+ consecutive days (login alone does not count)

Admin response options:
- Member is flagged in the admin panel with timestamp and last active date
- Admin can trigger a manual Discord DM nudge from within the panel
- Optional auto-notification to the member at the 14-day threshold

---

## 1.12 Success Metrics

| Metric | Target |
|--------|--------|
| Weekly active users as % of all signups | ≥30% |
| Node completion rate | ≥60% |
| Path completion rate | ≥20% |
| Avg time per node vs. est_hours | Within ±50% |
| Resource rating coverage | ≥80% of resources rated |

---

---

# Part 2: The Ladder

## 2.1 Overview

| Attribute | Value |
|-----------|-------|
| Name | The Ladder |
| URL | app.getstacc.org/ladder |
| Build status | Build after 500 active Devs + Roadmap Tracker stable |
| Model | Leveled data-specific interview prep with P2P structured practice |

Stacc owns the content — the question banks, rubrics, level structure, and scoring logic. The practice is peer-to-peer: matched at the same level, running an identical session format, scored against the same rubric. By the time a Builder walks into a real interview, they have already been through the equivalent experience many times.

There is no meaningful competitor for this product in the African market. AlgoExpert and LeetCode are not data-specific. Pramp is generic. Neither addresses the African job market or role-specific data interview depth.

---

## 2.2 Full Level Structure

Five levels. Entry-point to FAANG. All data-specific.

---

### Level 1 — Foundations
**Access:** Open to all — Devs, Stagees, Builders, Pro Members
**Covers:** The baseline every data role requires at first interview

| Topic | Sample Questions |
|-------|-----------------|
| SQL | Write a query to find the top 5 customers by revenue in the last 30 days using a window function |
| Python | Given a list of transaction dictionaries, clean the data and compute monthly totals using pandas |
| Statistics | Explain the difference between correlation and causation. Give a data example of each |
| Project pitch | Walk me through a project you have worked on from start to finish |
| Git basics | What is the difference between merge and rebase? When would you use each? |

---

### Level 2 — Technical Core
**Access:** Open to all
**Covers:** Intermediate depth for analyst and junior DE roles

| Topic | Sample Questions |
|-------|-----------------|
| Advanced SQL | Write a CTE to calculate 7-day rolling average revenue, grouped by region |
| Data modeling | Star schema vs. normalized model — what are the tradeoffs, and when do you choose each? |
| ETL design | Design a daily ingestion pipeline from a third-party REST API into a warehouse |
| Metrics | How would you define and measure the success of a new onboarding flow for a mobile lending app? |
| A/B testing | A product team wants to test a new checkout. Design the experiment from hypothesis to decision |

---

### Level 3 — Applied Practice
**Access:** Stagees and above — unlocks on Staging graduation
**Covers:** Case studies, product thinking, early AI reasoning

| Topic | Sample Questions |
|-------|-----------------|
| Business case | A fintech platform sees a 20% drop in transactions this week. Walk me through your investigation |
| Data product design | Build a churn prediction model for a mobile lending product — define the problem, data, features, and evaluation |
| LLM fundamentals | How would you use a RAG system to build a Q&A product for a law firm? What are the design decisions? |
| Communication | You found an insight that contradicts your head of growth's assumption. How do you present it? |
| Code review | Here is a query written by a junior analyst. What are the problems? What would you change and why? |

---

### Level 4 — System Design
**Access:** Builders and above — unlocks on Prod graduation
**Covers:** Large-scale architecture, AI systems, engineering leadership

| Topic | Sample Questions |
|-------|-----------------|
| Data warehouse | Design the warehouse for a ride-sharing company processing 5 million trips per day across 10 cities |
| Streaming vs. batch | A fraud detection system needs to flag transactions in real time. Design the architecture and defend it |
| ML system design | Design a recommendation engine for a Nigerian e-commerce platform, from ingestion to serving |
| AI architecture | Build a production RAG pipeline serving 100,000 requests per day — how do you ensure latency and reliability? |
| Engineering tradeoffs | Four weeks to ship a data product. What do you cut, what do you keep, and how do you decide? |

---

### Level 5 — Senior & FAANG-Ready
**Access:** Builder Alumni only
**Covers:** Executive-level reasoning, organizational leadership, architectural vision

| Topic | Sample Questions |
|-------|-----------------|
| End-to-end platform | Design the full data platform for a Series B African fintech — raw event ingestion to executive dashboard |
| Data strategy | A company wants to be data-driven. What does that mean operationally, and how do you lead the transformation over 18 months? |
| Stakeholder navigation | Engineering wants to rebuild the data infrastructure. Business needs features now. You are in the middle. How do you move? |
| Principal-level design | Design the data platform for a super-app with 10 million daily active users. What do you build, buy, and borrow? |
| Behavioral — impact | Tell me about a time your data work directly influenced a major business decision. What was the decision, what was your analysis, and what happened? |

---

## 2.3 Session Format

Every Ladder session is 60 minutes, structured identically at every level.

```
00:00 – 25:00  │  A interviews B
               │  Questions from Stacc question bank for their level
               │  A scores B using the Stacc rubric
               │
25:00 – 50:00  │  B interviews A
               │  Same structure, different question set
               │
50:00 – 60:00  │  Mutual structured feedback
               │  Both complete the rubric scorecard
               │  Scores submitted — feed into Readiness Score
```

### Rubric Dimensions (each scored 1–10)

| Dimension | What It Measures |
|-----------|-----------------|
| Technical accuracy | Is the answer correct? Are concepts well understood? |
| Structured reasoning | Is the thinking clear, systematic, and logical? |
| Communication clarity | Can this person explain it to a non-technical stakeholder? |
| Depth under follow-up | Does the answer hold when questioned further? |
| Confidence and delivery | Does this person feel credible in a live interview? |

---

## 2.4 Matching Logic

| Rule | Detail |
|------|--------|
| Level match | Same level only — no cross-level pairing |
| Schedule | Compatible availability from member profile |
| Repeat buffer | No repeat pairing within 2 weeks |
| Role filter | Optional — filter by target role for more relevant question sets |

---

## 2.5 Interview Readiness Score

- Aggregated from peer rubric scores across all completed sessions
- Scoped per level — L1 score, L2 score, etc., tracked separately
- Displayed on the Builder Profile as a verifiable, public signal
- Updates automatically after each session submission

---

## 2.6 Level Gating Summary

| Level | Name | Access |
|-------|------|--------|
| L1 | Foundations | All members |
| L2 | Technical Core | All members |
| L3 | Applied Practice | Stagees and above (post-Staging graduation) |
| L4 | System Design | Builders and above (post-Prod graduation) |
| L5 | Senior & FAANG-Ready | Builder Alumni only |

---

## 2.7 Manual MVP

Validate demand and format before any engineering investment.

| Step | Method |
|------|--------|
| 1 | Google Form — collect level, availability, target role |
| 2 | Admin matches pairs manually in a spreadsheet |
| 3 | Calendar invites sent with session format guide and rubric PDF |
| 4 | Post-session feedback form from both participants |
| 5 | Scores tracked manually in spreadsheet |

**Build trigger criteria:**
- 20+ sessions completed
- ≥80% positive post-session feedback
- Consistent unprompted demand for more

---

## 2.8 Build Triggers

Build The Ladder as a platform feature when:
- 500+ active Devs in the community
- Roadmap Tracker is stable with consistent active usage
- Manual MVP has validated both session quality and sustained demand
- Builder profile infrastructure exists to display the Readiness Score

---

*End of Product Specifications*
