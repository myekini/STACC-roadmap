# Stacc Roadmap Tracker — Product & Engineering Reference

**Live at:** app.getstacc.org (provisioned on Vercel) · **Repo:** `myekini/STACC-roadmap`
**Status:** Core product shipped and deployed. This document is the single source of truth —
it replaces the old `03_products.md` spec and folds in the engineering context that used to
live only in `CLAUDE.md`. `CLAUDE.md` is now a short pointer to this file plus the handful of
rules a coding session needs on every turn.

This is a living document — when the product changes, update this file in the same PR/commit,
not after.

---

## 1. What this is

The Roadmap Tracker is the flagship product for **Stacc**, a data-career community — *"Not
learning. Just shipping."* It's a visual, gamified-but-not-gamey skill tree for data careers
that answers three questions: **What do I learn next? Am I on track? What does ready actually
look like?**

It doesn't create content. It curates the best free resources on the internet, sequences them
into clear progression paths with prerequisite gates, and tracks every step. Members ship real
build tasks with public evidence — the roadmap doubles as a portfolio.

The marketing site is a **separate repo** (`myekini/STACC`, getstacc.org). This repo is the app
only.

### Target users

| User | Core need |
|---|---|
| Dev | Self-paced structure with visible progress |
| Stagee | Curriculum path tracking tied to cohort project context |
| Builder | Advanced paths (AI Engineering, MLOps) |
| Admin | Cohort health monitoring, stuck-member detection |

---

## 2. Founder decisions in force

These are deliberate product cuts, not gaps to fill in. Don't reintroduce without being asked.

- **No AI features in the product.** An AI Study Assistant was originally spec'd (node-scoped
  LLM help) and was fully removed 2026-07-07. No assistant, no "coming soon" teaser, no
  `/api/assistant` route. If AI comes back, it'll be an explicit ask.
- **Gamification stays minimal.** XP and rank (Bronze → Diamond) still accrue silently
  server-side in the schema (`profiles.xp`, `profiles.rank`), but are **never surfaced in the
  UI**. What members see instead: completion %, day-streak, an activity heatmap, and four plain
  milestones (first module, foundations complete, 7-day streak, path complete). The founder
  found XP/rank displays "weird" for this audience — don't add an XP counter or rank badge back
  without being asked.
- **No "Full Stack" path.** An early flow sketch mentioned a 6th "Full Stack" specialization
  alongside DE/DA/DS/AI-Engineering/MLOps. It was never built and there's no plan to build it —
  the tree is Foundations + 5 specializations.
- **Part 2, "The Ladder"** (peer interview-prep product) is fully deferred — see §9. Do not
  build until the trigger criteria in that section are met.

---

## 3. User flows

### Member flow

```
Sign in (Discord OAuth, or admin email/password) → Choose a path (/paths)
    ↓
/roadmap — pan/zoom skill-tree canvas (or list view on mobile)
    ↓
Click a node → side sheet: description, skills, resources, tasks
    ↓
Read/watch tasks: mark complete · Build tasks: ship a public evidence URL · Quiz tasks: pass the checkpoint
    ↓
All tasks done → node completes, XP awarded (silently) → next node unlocks
    ↓
Rate resources (1–5 stars) · Track progress on /dashboard (streak, heatmap, milestones)
    ↓
Shipped work appears on a public portfolio at /u/[handle] — shareable with anyone, no login required
```

### Admin flow

```
Sign in with an admin account (email/password) → /admin
    ↓
Overview: stat cards + module completion chart
    ↓
Members: full list, filter by cohort label, export CSV
    ↓
Click a member → node-level progress drilldown (per path)
    ↓
Stuck Alerts: members with no roadmap activity in 14+ days (logins don't count)
    ↓
Module Analytics: starts/completions/completion-rate per node
```

---

## 4. Feature set — what's actually built

### Member-facing

| Feature | Status | Notes |
|---|---|---|
| Skill tree | ✅ Shipped | Pan/zoom canvas (React Flow) on desktop with a canvas/list toggle; vertical rail on mobile. Public, structure-only version at `/tree` for SEO. |
| Path selection | ✅ Shipped | Foundations + Data Engineering, Data Analysis, Data Science, AI Engineering, MLOps. AI-Eng and MLOps unlock only after DE + DS are fully complete. |
| Node detail | ✅ Shipped | Description, skills, curated resources (2 per node, community-rated), tasks, estimated hours. |
| Progress tracking | ✅ Shipped | Per-node and per-path completion; derived status `locked \| available \| in_progress \| complete`. |
| Prerequisite gates | ✅ Shipped | Node-level (fan-in supported — a node can require several prerequisites) + path-level gates. |
| Resource ratings | ✅ Shipped | 1–5 stars, aggregated server-side. |
| **Evidence shipping** | ✅ Shipped | Build tasks require a public URL (repo / live app / writeup) instead of a checkbox — enforced server-side in `complete_task`. Not in the original spec; added because "ship, don't just watch" is the actual product thesis. |
| **Public portfolio** | ✅ Shipped | `/u/[handle]` — shipped modules + evidence links, public, no auth. Powered by an anon-callable `get_public_profile` RPC that exposes only username/avatar/shipped work, never XP/rank/role. |
| XP system | ⚙️ Backend only | Accrues server-side, never shown (see §2). |
| AI Study Assistant | ❌ Removed | See §2. |

### Admin-facing

| Feature | Status | Notes |
|---|---|---|
| Member list | ✅ Shipped | Overall %, cohort, last active. |
| Cohort filter | ✅ Shipped | Filter Members / Stuck Alerts by cohort label. |
| Individual progress view | ✅ Shipped | Node-level breakdown per member, per path. |
| Progress export | ✅ Shipped (CSV only) | No PDF export. |
| Stuck alerts | ✅ Shipped | 14+ days with no roadmap activity (logins excluded). |
| Module analytics | ✅ Shipped | Starts/completions/completion-rate **per node**. |
| Resource-level analytics | ❌ Not built | Spec asked for completion-vs-abandonment **per resource link**; only node-level exists today. |
| Discord nudge button | ❌ Not built | Stuck members are flagged in the UI; there's no one-click Discord DM trigger yet (needs a bot/webhook integration). |

---

## 5. Skill tree structure

```
FOUNDATIONS  (required before any specialization)
├── Python Basics
├── SQL Basics
├── Git & GitHub
├── Command Line
├── Statistics Basics
└── AI Literacy

DATA ENGINEERING                    DATA ANALYSIS
├── ETL Concepts                    ├── Exploratory Data Analysis
├── Data Modeling                   ├── Data Visualization
├── dbt                             ├── Dashboard Design
├── Workflow Orchestration          ├── Data Storytelling
├── Cloud Platforms                 ├── BI Tools
├── Spark — Advanced                └── AI-Assisted Analysis
├── Real-time Streaming (Kafka)
└── Vector DBs & LLM Infra

DATA SCIENCE                        AI ENGINEERING ← unlocks after DE + DS
├── ML Fundamentals                 ├── LLM APIs & Orchestration
├── Feature Engineering             ├── RAG System Design
├── Model Building & Evaluation     ├── AI Agents & Tool Use
├── Experimentation & A/B Testing   ├── Multimodal Systems
├── Model Deployment                ├── LLMOps & Evaluation
├── Deep Learning — Advanced        └── AI Product Design
└── LLM Fine-tuning & RAG

MLOPS ← unlocks after DE + DS
├── Docker & Containerization
├── CI/CD for ML
├── Monitoring & Drift
├── Production ML Systems
└── ML Platform Design
```

38 modules total. Every node ships with exactly 3 skills and 2 curated resources — kept
deliberately capped so the canvas stays readable and the sheet stays scannable; see
`src/config/roadmap.ts` for the editorial rule and content, which mirrors `supabase/seed.sql`
exactly.

---

## 6. Data model & access control

The real schema lives in `supabase/migrations/` — treat that as source of truth, not the prose
below. Two deliberate deviations from the earliest spec sketch:

- **`node_prerequisites` join table**, not a single `parent_id` — real content has fan-in (a
  node can require several prerequisites, e.g. every specialization's first node requires all
  six Foundations nodes).
- **No custom REST API layer.** There is no `/api/roadmap`, `/api/progress`, etc. The frontend
  talks to Supabase directly (`@supabase/supabase-js`) for reads, and to four security-definer
  RPCs for every write: `start_node`, `complete_task` (now takes an optional evidence URL —
  migration `0002_evidence.sql`), `rate_resource`, and the anon-callable `get_public_profile`
  for portfolio pages. See `supabase/README.md` for the full RLS/RPC design notes and setup
  steps.

**Access control:**

| Surface | Access |
|---|---|
| Skill tree structure (`/tree`, path/node names+order) | Public — SEO |
| Node resources, tasks, ratings | Authenticated members |
| Progress, evidence, completions | Authenticated members, own rows only (+ admin read) |
| Public portfolio (`/u/[handle]`) | Public — deliberately, that's the point |
| Admin dashboard | `profiles.role = 'admin'` only |

XP/rank columns on `profiles` have update policies locked down to a transaction-local flag set
only inside the RPCs — a client can never write its own XP.

---

## 7. UI

Follows the landing page's **Modern Technical Brutalism** design language: deep navy surfaces,
orange primary actions, cyan for progress/signal, `rounded-none`, uppercase Geist Mono
micro-labels, `// comment`-style captions.

- **`/roadmap`** — command header (overall %, streak, canvas/list toggle) + the skill tree.
  Desktop default is a pan/zoom canvas (React Flow): Foundations converge on a junction gate,
  the active specialization runs down a central trunk, skills fan out on dotted curves.
  Clicking a node opens a slide-in sheet with description, skills, resources (rateable), and
  tasks — build tasks show a "ship it" URL form instead of a checkbox.
- **Sidebar** — collapsible to a 76px icon rail (persisted), one continuous navy/cyan-border
  shell with the TopBar (no duplicate branding, no mismatched tokens).
- **`/dashboard`** — completion %, streak, hours invested, skills practiced, activity heatmap,
  "next move" card, milestones.
- **`/admin`** — its own shell (shadcn dashboard block, restyled), independent of the member
  app chrome.
- **`/u/[handle]`** — public, unauthenticated, no app shell — shipped modules grouped by path
  with evidence links.

Dark-only by design (no light/dark toggle) — see CLAUDE.md for the exact token values.

---

## 8. Stuck detection

A member is flagged stuck in `/admin` when there has been **no roadmap activity for 14+
consecutive days** — a node started with no task completions in that window, or nothing
completed at all in that window. Logging in alone does not reset the clock. There is currently
no automatic member-facing notification and no one-click Discord nudge — both are manual/future
work (§4).

---

## 9. Success metrics (targets — not yet instrumented)

| Metric | Target |
|---|---|
| Weekly active users as % of signups | ≥30% |
| Node completion rate | ≥60% |
| Path completion rate | ≥20% |
| Avg time per node vs. `est_hours` | Within ±50% |
| Resource rating coverage | ≥80% of resources rated |

Vercel Analytics is wired for pageviews only. None of the above are actually measured yet —
this needs its own instrumentation pass before it's meaningful.

---

## 10. Part 2 — The Ladder (deferred, do not build)

A leveled, peer-to-peer, data-specific interview-prep product. Stacc owns the content (question
banks, rubrics, level structure); practice is peer-matched at the same level with a shared
60-minute session format and mutual rubric scoring.

**Build trigger criteria — all of these, not any:**
- 500+ active Devs in the community
- Roadmap Tracker stable with consistent active usage
- A manual MVP (Google Form matching + spreadsheet scoring, 20+ sessions, ≥80% positive
  feedback) has validated demand
- Builder-profile infrastructure exists to display a public Readiness Score

Five levels (Foundations → Technical Core → Applied Practice → System Design → Senior/FAANG),
gated by community track (Dev/Stagee/Builder/Alumni). Full level content, sample questions,
session format, rubric dimensions, and matching logic are preserved in git history
(`03_products.md` as of commit before this doc existed) — restore from there if/when this gets
built, rather than re-deriving it.

---

## 11. Engineering reference

### Stack

Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind 3 · Radix primitives ·
Framer Motion · Zustand · TanStack Query · Supabase (Postgres + Discord OAuth) · React Flow
(`@xyflow/react`) for the skill tree canvas.

### Commands

`npm run dev` / `npm run lint` / `npm run typecheck` / `npm run build` / `npm run check`
(lint+typecheck+build — run before finishing any task). No automated test suite by design —
verify by running the app and walking the flow.

### Env / demo mode

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). **Without
env the app runs in localStorage demo mode** — every data feature must degrade gracefully to
it. See `src/hooks/useUserData.ts` for the dual-mode pattern; this is the single hook that
owns all user state (profile, XP/rank, active path, completed nodes, evidence, quests-equivalent
milestones, heatmap) and branches Supabase-vs-localStorage internally with identical semantics
on both sides.

### Architecture map

- `src/app/` — routes: `/` (landing), `/paths` (path selection), `/roadmap` (skill tree + node
  sheet), `/dashboard` (progress), `/admin` (admin panel), `/u/[handle]` (public portfolio),
  `/tree` (public SEO tree), `/auth/callback` (Supabase OAuth).
- `src/config/roadmap.ts` — static path/node/resource/task/quiz content, source of truth for
  demo mode; mirrors `supabase/seed.sql` exactly. See the editorial rules at the top of that
  file (3 skills/node, 2 resources/node) before adding content.
- `src/components/roadmap/` — `SkillTreeCanvas` (desktop pan/zoom tree), `SkillTree` (mobile
  rail), `NodeSheet` (task/resource workspace + evidence shipping), `bits.tsx` (shared status
  chips/badges).
- `src/components/layout/` — `AppLayout`, `Sidebar` (collapsible), `TopBar`, `BottomBar`
  (mobile nav).
- `src/components/admin/` — `AdminShell`, `MembersTable`, `ModuleChart`, `StatCards`.
- `src/hooks/useUserData.ts` — all member state, dual-mode. `src/hooks/useAdminData.ts` — admin
  rollups + stuck detection + CSV export.
- `src/store/useUiStore.ts` — UI-only state (Zustand): active node sheet, tree view mode,
  sidebar collapse — persisted where it should survive a refresh.
- `src/lib/database.types.ts` — hand-authored Supabase types; keep in sync with migrations.

### Conventions & gotchas

- Prerequisite gating is core product logic: node status is always **derived**
  (`locked | available | in_progress | complete`), never stored directly except the
  `in_progress`/`complete` states.
- Public vs authed split (§6) is load-bearing for SEO — don't leak resources/tasks to
  logged-out requests.
- Keep client-trusted XP writes out of new code — XP/rank are computed server-side only, inside
  the RPCs.
- Deploy target: Vercel, **app.getstacc.org (live)**.

### Design DNA

- **Modern Technical Brutalism** — terminal/mono, `rounded-none`, uppercase mono micro-labels,
  `// comment`-style captions, bento-box grids.
- Colors: deep navy surfaces; **orange** = primary action; **cyan** = signal/focus/progress.
  Style via CSS-var design tokens in `globals.css` / Tailwind theme mappings — never hardcoded
  hex in components.
- Fonts: Geist Sans + Geist Mono, loaded locally from `src/app/fonts/` (never Google Fonts
  links).
- Motion: intentional, not decorative. Always pair custom motion with `prefers-reduced-motion`
  fallbacks.
- Icons: component SVGs (lucide) via `src/components/ui/app-icon.tsx`'s name→icon map — never
  icon-font ligature strings. Adding a node with a new icon name means adding it to that map
  first, or it silently falls back to a generic question-mark icon.

---

## 12. Known gaps (as of this doc)

Ranked by how much they actually matter — **see `docs/ISSUES.md` for the concrete fix for
each one**; this list stays a one-line summary on purpose, don't let the two drift apart.

1. **Migration `0002_evidence.sql` may not be applied to the production Supabase project yet.**
   Evidence shipping and `/u/[handle]` need it — verify it's been run before relying on either
   in production.
2. **No username uniqueness or self-service editing.** `/u/[handle]` is keyed on username with
   no DB constraint; `get_public_profile` resolves collisions by "oldest profile wins," which
   silently breaks a second member with the same name. There's also no settings page to change
   a username at all.
3. **Discord nudge button** (§4) and **resource-level analytics** (§4) — spec'd, not built.
4. **§9 success metrics** — not instrumented.
5. No CI — `npm run check` is a local/manual gate, not enforced on push.

See `git log` for what's shipped when; this section will drift, keep it honest.
