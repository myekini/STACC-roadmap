# Stacc Roadmap Tracker — Execution Plan

Spec: [`03_products.md`](../03_products.md) (Part 1). Design DNA: the getstacc.org landing page (see `CLAUDE.md` → Design DNA).
Model: sequential phases, each owned by a specialist "team member" (Claude agent in `.claude/agents/`). One phase ships and is verified before the next starts.

## Current state (2026-07-06)

Working local-first prototype: Next.js 14 / React 18 / Tailwind 3 / Zustand / TanStack Query / Framer Motion / Supabase (optional, Discord OAuth).
Pages: `/` (landing), `/paths`, `/roadmap`, `/dashboard`. Static content in `src/config/roadmapData.ts` (5 paths, ~4-6 nodes each, quizzes). Progress = localStorage, or ad-hoc Supabase tables (`profiles`, `user_paths`, `completed_nodes`, `user_quests`) when env is present.

## Gap vs spec

| Spec requirement | Status |
| --- | --- |
| DB-backed nodes/resources/tasks (§1.6–1.7) | ❌ static TS file, no tasks table |
| Node status model `locked/available/in_progress/complete` + prerequisite gates | ❌ only "completed" set |
| Task-level completion driving node completion | ❌ node completed via quiz only |
| Resource ratings (1–5 community) | ❌ |
| XP + rank | ✅ prototype (client-side, trusts client) |
| AI Study Assistant (node-scoped, `/api/assistant/ask`) | ❌ UI shell only (`StudyAssistant.tsx`) |
| Public skill tree (SEO) vs authed detail (§1.9) | ❌ everything client-rendered, no gating |
| Admin panel: member list, cohort filter, stuck alerts, exports, resource analytics | ❌ |
| Foundations-first tree with cross-path unlocks (AI-Eng/MLOps after DE+DS) | ❌ paths are independent silos |

---

## Phase 0 — Design DNA + baseline (owner: `stacc-design-engineer`) — ✅ SHIPPED 2026-07-07

> Shipped: landing dark tokens ported to `globals.css` + `tailwind.config.ts` (radius scale zeroed for brutalism, hex kept so Tailwind 3 opacity modifiers work), primitives/shell/pages restyled, off-brand SVG blues → cyan/green, rebranded "Mastery Path" → Stacc (UI + metadata). Deferred: Next 15/16 + Tailwind v4 upgrade; removal of dead `dark:` variant classes (no `.dark` on `<html>`, so they never applied).

Make this app unmistakably Stacc before building features on top.

- Port landing-page design tokens into `src/app/globals.css` as CSS vars (`--orange`, `--cyan`, navy surfaces, `--border`, `--surface-card`) and wire Tailwind to them.
- Adopt the aesthetic: terminal/mono, `rounded-none`, uppercase Geist Mono micro-labels, `// comment`-style captions. Audit existing components (`layout/`, `ui/`, `progress/`) to match.
- Replace remaining Material-icon-name strings (`icon: 'query_stats'` etc.) with lucide/SVG components.
- Keep `npm run check` green. Optional (decide with founder): upgrade to Next 15/16 + Tailwind v4 to match landing repo — not a blocker.

**Done when:** app shell, paths page, dashboard visually read as Stacc; check passes.

## Phase 1 — Data platform (owner: `stacc-data-platform`) — ✅ SHIPPED 2026-07-07

> Shipped: `supabase/migrations/0001_init.sql` (schema per §1.7 + profiles/paths, RLS per §1.9, security-definer RPCs `start_node`/`complete_task`/`rate_resource`, server-owned XP with client-write protection trigger), `supabase/seed.sql` (6 paths / 38 nodes / 47 prereq edges / 46 resources / 114 tasks per §1.5), `src/lib/database.types.ts`, `supabase/README.md`. Smoke-tested on Postgres 17 with a stubbed auth schema: lock gates (node + path level), single XP award, no double-award, client XP writes neutralized, rating aggregates. Deviations from spec: `node_prerequisites` join table instead of `nodes.parent_id` (content has fan-in); only `in_progress`/`complete` stored — `locked`/`available` derived. App still reads static `roadmapData.ts`; rewiring `useUserData` to this schema is Phase 2.

- Supabase migrations in `supabase/migrations/`: `profiles` (+ `role`, `cohort_label`), `nodes`, `resources`, `tasks`, `user_progress`, `task_completions`, `resource_ratings` per spec §1.7, plus `paths` lookup.
- RLS: public read on tree structure (names/paths only via view), authed read on resources/tasks, own-rows-only writes on progress/ratings, admin role for admin reads.
- XP/rank computed server-side (trigger or RPC on node completion) — stop trusting the client.
- Seed script: spec §1.5 skill tree (Foundations + DE/DA/DS/AI-Eng/MLOps, cross-path prerequisites) seeded from an expanded `roadmapData`-style source file; keep existing curated resources/quizzes.
- Type generation (`supabase gen types`) into `src/lib/database.types.ts`.

**Done when:** fresh Supabase project can be stood up with `supabase db reset` + seed; RLS verified for anon/member/admin.

## Phase 2 — Core member experience (owners: `stacc-design-engineer` + main session) — ✅ SHIPPED 2026-07-07

> Shipped: `src/config/roadmap.ts` (typed content engine mirroring seed.sql — 38 nodes/114 tasks/quizzes), `useUserData` rewritten around the Phase-1 schema (Supabase RPCs or localStorage with identical gating semantics; XP server-owned or derived), roadmap page rebuilt as a sectioned "mission rail" skill tree (Foundations block → specialization spine with progress-filled rail, path switcher, ghost indices), `NodeSheet` learning workspace (task checklist, inline checkpoint quizzes, resource ratings, confetti + XP award on completion, auth gate for logged-out members), paths page with AI-Eng/MLOps lock badges, dashboard with real metrics (rank runway, XP trend, heatmap from completions, milestone badges). Deleted: RoadmapCanvas, StudyAssistant, QuestList, ProgressChart, roadmapData.ts (quests were not in spec).
>
> **Founder revisions (2026-07-07):** (1) Gamification simplified — XP counters, ranks (Bronze→Diamond), rank runway, and XP chips removed from the UI; the product's currency is now completion % + day-streak + heatmap + four plain milestones. XP/rank still accrue server-side (schema untouched) so they can be resurfaced later. (2) **AI features removed from the product entirely** (not just deferred) — no assistant, no teaser; Phase 3 below is on hold until the founder revives it. The AI-Engineering *curriculum path* stays — that's content, not a product feature. (3) Landing page rebuilt with an animated "stacc://roadmap" terminal-rail hero (pure CSS, reduced-motion safe).

- Skill tree per spec §1.10: overall progress + XP header, path chips, Foundations root fanning into paths, node states (locked/available/in-progress/complete) with cyan progress fill.
- Node detail slide-in panel: resources (type badge, star rating, rate control), tasks checklist (`read/watch/build/quiz`), est hours, XP reward, status.
- Task completion → node completion → XP → next node unlock (prerequisite gates, incl. AI-Eng/MLOps after DE+DS).
- Rework `useUserData` around the new schema; keep localStorage mode as demo fallback.
- Dashboard: keep heatmap/quests, wire to real progress events.
- Motion: Framer Motion for panel/unlock moments, `prefers-reduced-motion` fallbacks (landing convention).

**Done when:** full member flow of spec §1.3 works end-to-end against Supabase.

## Phase 3 — AI Study Assistant (owner: `stacc-ai-engineer`)

- `POST /api/assistant/ask` (auth required): node-scoped system prompt (node name, skills, resources, member's task state), streaming responses.
- Vercel AI SDK + AI Gateway, Claude model; rate limiting per user; friendly 503 if env missing (landing-repo convention).
- Wire `StudyAssistant.tsx` into the node panel ("ASK AI ASSISTANT →"), suggest exercises / explain concepts / quiz-me modes.

**Done when:** assistant answers in the context of the open node, streams, and is inaccessible logged-out.

## Phase 4 — Admin panel (owner: `stacc-data-platform` + main session) — ✅ SHIPPED 2026-07-07

> Shipped: `/admin` (role-gated UI; data protected by RLS admin policies from Phase 1) with member list (avatar, cohort, overall %, in-progress count, last active), cohort filter chips, per-member node-level drill-down sheet, stuck alerts per §1.11 (14+ days without roadmap activity — logins don't count), CSV export of the filtered list, and module analytics (starts vs completions vs rate). `useAdminData` hook; admin nav link appears only for admins (demo mode grants admin so the founder can preview offline). Deviations: resource-level completion/abandonment approximated at module level (we don't track per-resource completion); Discord DM nudge from panel deferred until a bot exists. Cohort labels are set via SQL for now (`update profiles set cohort_label='S1' where …`) — a UI for this can ride along with a later phase. Also this pass: copy/UI declutter (paths cards slimmed, tags/footnote removed).

- `/admin` (role-gated): member list w/ overall %, path breakdown, last active; cohort filter (S1/S2/P1/P2); individual node-level drill-down.
- Stuck detection per §1.11 (14-day rules) — computed view or scheduled function; flagged list at `/api/admin/stuck`.
- CSV export per cohort/member; resource analytics (completion vs abandonment).

**Done when:** admin flow of spec §1.3 works; non-admins get 404/redirect.

## Phase 5 — Public tree, polish, launch (owner: `stacc-qa` sweep + main session) — ✅ CODE SHIPPED 2026-07-07 · deploy pending (founder)

> Shipped: `/tree` — statically generated public skill tree (structure only per §1.9, semantic HTML, canonical URL, conversion CTAs), generated OG image (`opengraph-image.tsx`, brand rail motif), `metadataBase` + Twitter card, `sitemap.ts`, `robots.ts` (disallows /admin /dashboard /auth), branded 404, Vercel Analytics, README rewritten for the real product. Remaining (founder, in Vercel dashboard): push repo to GitHub → import to Vercel → set the two `NEXT_PUBLIC_SUPABASE_*` env vars → attach `app.getstacc.org` → add prod URLs to Supabase Auth (Site URL + redirect). PostHog deferred (add key later if wanted).

- Public read-only skill tree (structure only) server-rendered for SEO + "log in to track progress" conversion prompt.
- Metadata/OG, PostHog + Vercel Analytics (mirror landing setup), error/empty/loading states.
- Deploy to Vercel as `app.getstacc.org`; env in Vercel prod+preview; auth redirect URLs updated.
- Full QA pass against spec §1.12 metrics instrumentation.

**Done when:** production URL live, `stacc-qa` checklist green.

---

## Working agreement

- Every phase ends with `npm run check` + a visual verification (dev server, walk the affected flow).
- Schema/API shapes follow the spec unless the spec conflicts with what's learned in build — deviations get noted at the top of this file.
- Design decisions defer to landing-page DNA; content decisions defer to `03_products.md`.
