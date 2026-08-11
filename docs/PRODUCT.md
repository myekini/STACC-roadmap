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
Sign in (GitHub OAuth, or admin email/password) → Choose a path (/paths)
    ↓
/roadmap — pan/zoom skill-tree canvas (or list view on mobile)
    ↓
Click a node → full-page workspace (`/roadmap/[slug]`): description, skills, resources, tasks
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
Overview: four health metrics + members needing attention
    ↓
Members: full list, filter by cohort or attention state, export CSV
    ↓
Click a member → node-level progress drilldown (per path)
    ↓
Curriculum: starts/completions/completion-rate per node
```

---

## 4. Feature set — what's actually built

### Member-facing

| Feature | Status | Notes |
|---|---|---|
| Skill tree | ✅ Shipped | Pan/zoom canvas (React Flow) on desktop with a canvas/list toggle — the list is a zigzag center-spine layout (landing-page visual language); vertical rail on mobile. Public, structure-only version at `/tree` for SEO. |
| Path selection | ✅ Shipped | Foundations + Data Engineering, Data Analysis, Data Science, AI Engineering, MLOps. AI-Eng and MLOps unlock only after DE + DS are fully complete. |
| Node detail | ✅ Shipped | Description, skills, curated resources (2 per node, community-rated), tasks, estimated hours. |
| Progress tracking | ✅ Shipped | Per-node and per-path completion; derived status `locked \| available \| in_progress \| complete`. |
| Prerequisite gates | ✅ Shipped | Node-level (fan-in supported — a node can require several prerequisites) + path-level gates. |
| Resource ratings | ⚙️ Backend only | 1–5 stars, aggregated server-side (`rate_resource`, `resources.avg_rating`) — pulled from the node workspace UI for now, re-implementing later. |
| **Evidence shipping** | ✅ Shipped | Specialization build tasks require a public URL inside the learner's path project. Foundations build exercises stay lightweight checklist completions and do not require GitHub setup or evidence. Enforced server-side in `complete_task`. |
| **Projects (per-path)** | ✅ Shipped | Migration `0004`: one repo per `(user, path)`, set once via `set_project`. Once set, every later build-task evidence on that path must link inside it (prefix match) — a specialization's build tasks accumulate into one running project instead of disconnected links. |
| **Public portfolio** | ✅ Shipped | `/u/[handle]` — each path renders as a build-log timeline (oldest → newest) under its project repo link, not a flat recency feed. Powered by an anon-callable `get_public_profile` RPC that exposes only username/avatar/shipped work/project repos, never XP/rank/role. |
| **Code challenges** | ✅ Shipped (Foundations) | `challenge` task type, Monaco editor + a client-only runtime — Pyodide (CPython/WASM) for Python, sql.js (SQLite/WASM) for SQL — both loaded lazily from CDN, no server execution. Opening a challenge enters a focused full-screen workspace: problem/editor/console split on desktop and Problem/Code/Results tabs on mobile. These **replace**, not supplement, the checkpoint quiz on the three Foundations topics that are genuinely code-testable: Python Basics (`clean_scores`), Statistics Basics (`describe`), SQL Basics (aggregate query, min. 3 assertions each). Git & GitHub, Command Line, and AI Literacy stay multiple-choice — none of them reduce to a clean in-browser pass/fail check without a much bigger build (a simulated git/shell environment). Every other node's checkpoint is still a quiz — this hasn't rolled out past Foundations. |
| XP system | ⚙️ Backend only | Accrues server-side, never shown (see §2). |
| AI Study Assistant | ❌ Removed | See §2. |

### Admin-facing

| Feature | Status | Notes |
|---|---|---|
| Member list | ✅ Shipped | Overall %, cohort, last active. |
| Member filters | ✅ Shipped | Filter Members by cohort or attention state. |
| Individual progress view | ✅ Shipped | Node-level breakdown per member, per path. |
| Progress export | ✅ Shipped (CSV only) | No PDF export. |
| Stuck alerts | ✅ Shipped | 14+ days with no roadmap activity (logins excluded). |
| Module analytics | ✅ Shipped | Starts/completions/completion-rate **per node**. |
| Resource-level analytics | ❌ Not built | Spec asked for completion-vs-abandonment **per resource link**; only node-level exists today. |
| GitHub profile link | ✅ Shipped | Stuck members are flagged in the UI with a one-click link to their GitHub profile (migration `0007`'s `github_username`). No automated outreach — GitHub has no DM mechanism to build against, unlike the Discord bot approach this replaced. |

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
  talks to Supabase directly (via `@supabase/ssr`'s cookie-based `createBrowserClient`, see
  `src/utils/supabase/client.ts`) for reads, and to security-definer RPCs for every write:
  `start_node`, `complete_task` (evidence URL — migration `0002_evidence.sql` — validated
  against the path's project repo once one is set, migration `0004_projects.sql`),
  `rate_resource`, `set_project` (one repo per user+path, immutable once set), and the
  anon-callable `get_public_profile` for portfolio pages. See `supabase/README.md` for the
  full RLS/RPC design notes and setup steps.
- **Session storage is cookie-based, not localStorage.** `src/utils/supabase/client.ts` uses
  `createBrowserClient`, `src/utils/supabase/server.ts` uses `createServerClient` (Route
  Handlers), and root `middleware.ts` + `src/utils/supabase/middleware.ts` refresh the session
  cookie on every request. This is required for the OAuth PKCE code exchange in
  `src/app/auth/callback/route.ts` to reliably find the code verifier server-side — localStorage
  doesn't survive the full-page redirect to GitHub and back in all browsers/privacy modes.

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
  The desktop list view is a zigzag spine (adapted from the landing-page roadmap preview):
  a central spine with a glowing progress fill that ends at the last completed junction,
  module cards alternating sides, and skill chips fanning out on curved dashed connectors
  opposite each card. Connector geometry is row-local (fixed chip heights), so it holds for
  any node count. Mobile keeps the single-column left rail.
  Clicking a node navigates to `/roadmap/[slug]` — a full-bleed workspace page, not a
  slide-in sheet: description/skills/resources (click-to-load YouTube embeds; ratings UI
  pulled for now, see §4) in the primary column, a sticky task rail alongside it. Build tasks
  ship evidence into the path's project repo — the first build task on a path prompts for a
  repo URL once (`set_project`), every later build task on that path ships a commit/PR/file
  link inside it instead of an unrelated one-off link. Watch tasks are gated behind actually
  opening a video resource on the node, tracked client-side per page visit. Challenge tasks
  open a Monaco editor and run entirely client-side — Pyodide (WASM CPython) for Python,
  sql.js (WASM SQLite) for SQL — both loaded lazily from CDN, no server execution.
  A floating **field notes** pill (bottom-right, desktop, `❯ stacc explain "<module>"`
  terminal framing) shows the curriculum description of the hovered/keyboard-focused node —
  content comes straight from the roadmap config; it is *not* an AI feature. It only renders
  on `/roadmap` while the tree is in view.
- **Sidebar** — collapsible to a 76px icon rail (persisted), one continuous navy/cyan-border
  shell with the TopBar (no duplicate branding, no mismatched tokens). Carries only
  workspace navigation (Roadmap, Progress, Explore paths, Admin) — account-level links
  (settings, public portfolio) live only in the TopBar avatar dropdown, not duplicated here.
- **`/dashboard`** — completion %, streak, hours invested, skills practiced, activity heatmap,
  "next move" card, milestones.
- **`/admin`** — its own shell (shadcn dashboard block, restyled), independent of the member
  app chrome.
- **`/u/[handle]`** — public, unauthenticated, no app shell — shipped modules grouped by path
  with evidence links.

Light and dark modes share the same Stacc token system and the user's persisted preference.
The member app and independent admin shell must expose the same theme control.

---

## 8. Stuck detection

A member is flagged stuck in `/admin` when there has been **no roadmap activity for 14+
consecutive days** — a node started with no task completions in that window, or nothing
completed at all in that window. Logging in alone does not reset the clock. There is a one-click
link to the member's GitHub profile (§4), but no automatic member-facing notification — GitHub
has no DM mechanism to automate outreach through, unlike the Discord bot approach this replaced.

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
Framer Motion · Zustand · TanStack Query · Supabase (Postgres + GitHub OAuth) · React Flow
(`@xyflow/react`) for the skill tree canvas.

### Mobile and PWA

The app is installable as a mobile-first PWA with branded icons, standalone display,
safe-area-aware navigation, a branded route/data loader, and a minimal offline recovery page.
The service worker caches only the offline shell and brand icon; authenticated roadmap data is
never cached, preventing private member data from leaking through shared browser caches.
Core surfaces reflow from single-column phone layouts to tablet and desktop compositions;
mobile admin member data renders as cards instead of requiring horizontal table scrolling.

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

- `src/app/` — routes: `/` (landing), `/paths` (path selection), `/roadmap` (skill tree),
  `/roadmap/[slug]` (full-page node workspace), `/dashboard` (progress), `/admin` (admin panel),
  `/u/[handle]` (public portfolio), `/tree` (public SEO tree), `/auth/callback` (Supabase
  OAuth — server Route Handler, see §6). Root `middleware.ts` refreshes the session cookie on
  every request.
- `src/config/roadmap.ts` — static path/node/resource/task/quiz content, source of truth for
  demo mode; mirrors `supabase/seed.sql` exactly. See the editorial rules at the top of that
  file (3 skills/node, 2 resources/node) before adding content.
- `src/components/roadmap/` — `SkillTreeCanvas` (desktop pan/zoom tree), `SkillTree` (mobile
  rail), `NodeWorkspace` (full-page task/resource workspace + evidence shipping, rendered at
  `/roadmap/[slug]`), `ChallengeBlock` (Monaco + `usePyodide`/`useSqlJs`, dynamically imported so
  Monaco never ships in a bundle that doesn't need it), `bits.tsx` (shared status chips/badges).
- `src/components/layout/` — `AppLayout`, `Sidebar` (collapsible), `TopBar`, `BottomBar`
  (mobile nav).
- `src/components/admin/` — `AdminShell`, `MembersTable`, `ModuleChart`, `StatCards`.
- `src/hooks/useUserData.ts` — all member state, dual-mode. `src/hooks/useAdminData.ts` — admin
  rollups + stuck detection + CSV export.
- `src/store/useUiStore.ts` — UI-only state (Zustand): focused (hovered) node, tree view mode,
  theme, sidebar collapse — persisted where it should survive a refresh.
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
3. **Resource-level analytics** (§4) — spec'd, not built.
4. **§9 success metrics** — not instrumented.
5. No CI — `npm run check` is a local/manual gate, not enforced on push.
6. **Migrations `0004_projects.sql` through `0007_github_auth.sql` may not be applied to the
   production Supabase project yet.** Same category of risk as gap 1 — verify before relying on
   per-path projects, challenge tasks, or GitHub sign-in in production. `0007` additionally
   requires a manual step outside any migration: registering a GitHub OAuth App and enabling the
   GitHub provider in the Supabase dashboard (Discord's provider config doesn't carry over).
7. **`supabase/seed.sql`'s checkpoint-quiz text has drifted from `src/config/roadmap.ts`** on
   the ~29 nodes outside the challenge-conversion rounds — the resource-grounded question
   rewrites only landed in `roadmap.ts` (demo mode), never backported to the seed file. Cosmetic
   (wrong wording, not wrong behavior) but worth a sync pass before it's forgotten.
8. **Members who signed up via the old Discord flow can't sign back in.** GitHub fully replaced
   Discord as the sign-in provider (migration `0007`) rather than being added alongside it — any
   existing Discord-authenticated `auth.users` row is now sign-in-orphaned. Re-authing via GitHub
   creates a new profile rather than recovering the old one. If there are real members on the
   production project from before this change, this needs a conscious decision (manual account
   linking, a one-time export, or accepting the loss) — it isn't handled automatically.

See `git log` for what's shipped when; this section will drift, keep it honest.
