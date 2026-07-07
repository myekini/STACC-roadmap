# Stacc — Roadmap Tracker (app.getstacc.org)

The Roadmap Tracker product for Stacc, a data-career community ("Not learning. Just shipping."). AI-integrated visual skill tree with curated resources, tasks, XP, and progress tracking. This is the **app** repo — the marketing site lives in the separate `myekini/STACC` repo (getstacc.org).

- **Product spec:** `03_products.md` (Part 1 = this product; Part 2 "The Ladder" is future, do not build).
- **Team agents:** `.claude/agents/` — design-engineer, data-platform, ai-engineer, qa specialists.
- All five build phases (design DNA → data platform → member experience → admin → launch) shipped 2026-07-07; history in git log.
- **Founder decisions in force:** no AI features in the product (removed, don't reintroduce unasked); gamification stays minimal — completion %, streak, heatmap, plain milestones; XP/rank exist in the DB schema but are never surfaced in UI.

## Stack & commands

- Next.js 14 (App Router), React 18, TypeScript strict, Tailwind 3, Radix primitives, Framer Motion, Zustand, TanStack Query, Supabase (Discord OAuth).
- `npm run dev` / `npm run lint` / `npm run typecheck` / `npm run build` / `npm run check` (lint+typecheck+build — run before finishing any task). No test suite — verify visually.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). **Without env the app runs in localStorage demo mode** — every data feature must degrade gracefully to it (see `src/hooks/useUserData.ts` for the dual-mode pattern).

## Architecture map

- `src/app/` — routes: `/` (app landing), `/paths` (path selection), `/roadmap` (skill tree + node detail + assistant), `/dashboard` (XP, quests, heatmap, badges), `/auth/callback` (Supabase OAuth).
- `src/config/roadmapData.ts` — static path/node/resource/quiz content (source of truth until the Supabase data platform ships in Phase 1; then it becomes the seed source).
- `src/components/` — `layout/` (AppLayout, Sidebar, TopBar, BottomBar), `roadmap/` (RoadmapCanvas, StudyAssistant), `progress/` (heatmap, chart, quests), `ui/` (shadcn-style primitives), `providers/`.
- `src/hooks/useUserData.ts` — all user state (profile, XP/rank, active path, completed nodes, quests, heatmap) with Supabase-or-localStorage branching. XP thresholds: Bronze <500 < Silver <1500 < Gold <3000 < Platinum <6000 < Diamond.
- `src/store/useUiStore.ts` — UI-only state (Zustand).

## Design DNA (inherited from the landing page — match it)

- Aesthetic: **Modern Technical Brutalism** — terminal/mono, `rounded-none`, uppercase mono micro-labels, `// comment`-style captions, bento-box grids.
- Colors: deep navy surfaces; **orange** = primary action; **cyan** = signal/focus/progress energy. Style via CSS-var design tokens in `globals.css`, never hardcoded hex in components.
- Fonts: Geist Sans + Geist Mono, loaded locally from `src/app/fonts/` (never Google Fonts links).
- Motion: intentional, not decorative. Always pair custom motion with `prefers-reduced-motion` fallbacks.
- Icons: component SVGs (lucide), never icon-font ligature strings.

## Conventions & gotchas

- Prerequisite gating is core product logic: node status = `locked | available | in_progress | complete`; AI-Engineering and MLOps paths unlock only after DE + DS (spec §1.5).
- Public vs authed split (spec §1.9): tree *structure* is public (SEO), node details/resources/tasks/progress/assistant require auth, admin surfaces require admin role.
- Keep client-trusted XP writes out of new code — XP/rank should be computed server-side once the Phase 1 schema lands.
- Deploy target: Vercel, `app.getstacc.org` (not yet provisioned).
