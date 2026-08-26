# Stacc — Roadmap Tracker

![Next.js](https://img.shields.io/badge/Next.js-14-111827?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-1d4ed8?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-0f766e?logo=tailwindcss)

The Roadmap Tracker for [Stacc](https://www.getstacc.org), a data-career community — *"Not learning. Just shipping."*
A visual skill tree that answers the three questions that stop most learners: **What do I learn next? Am I on track? What does ready look like?**

- 41 modules across Foundations + 5 specialization paths (DE, DA, DS, AI Engineering, MLOps)
- Responsive roadmap list, sequenced learning material, real tasks, and Foundation coding challenges
- Prerequisite gating — modules unlock in order; AI Engineering and MLOps unlock after DE + DS
- Foundations practise inline; each specialization accumulates into one GitHub portfolio project
- Repository-scoped GitHub App connection with explicit commit verification—no pasted evidence URLs
- Public portfolio at `/u/[handle]` — shipped modules + evidence, no login required
- Progress tracking with streaks, a consistency heatmap, and milestones
- Admin panel: cohort progress, stuck-member alerts, CSV exports, module analytics

## Product surfaces

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Landing with the live roadmap rail |
| `/tree` | public | Server-rendered full skill tree (SEO) |
| `/paths` | member | Path selection |
| `/roadmap` | member | Responsive learning roadmap |
| `/roadmap/[slug]` | member | Focused step-by-step module workspace |
| `/dashboard` | member | Progress, streak, heatmap, milestones |
| `/u/[handle]` | public | Member's shipped-work portfolio |
| `/admin` | admin | Cohort health, stuck alerts, exports |

## Stack

Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind 3 · Radix · Framer Motion · Zustand · TanStack Query · Supabase (Postgres + GitHub OAuth).

## Quick start

```bash
npm install
npm run dev
```

Without env vars the app runs in **localStorage demo mode** — full product, progress saved on-device.
For the real backend, copy `.env.example` to `.env.local` and follow [`supabase/README.md`](supabase/README.md)
(migrations, seed, GitHub OAuth).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run check` | Lint + typecheck + production build (run before shipping) |
| `npm run start` | Serve the production build |

## Repo map

- `docs/README.md` — documentation index and ownership rules
- `docs/PRODUCT.md` — product scope and founder decisions (product source of truth)
- `docs/ARCHITECTURE.md` — scale, GitHub integration, and production-readiness decisions
- `docs/CURRICULUM_STANDARD.md` — curriculum quality and evidence standard
- `docs/CURRICULUM_*.md` — reviewed lesson-level track blueprints
- `docs/DESIGN.md` — canonical visual system
- `src/config/roadmap.ts` — the content engine (mirrors `supabase/seed.sql`)
- `src/hooks/useUserData.ts` — all user state; Supabase RPCs or localStorage with identical semantics
- `supabase/` — schema migrations, seed, setup guide; XP-safe RPCs + RLS

## Deploy

Live on Vercel at `app.getstacc.org`. The two `NEXT_PUBLIC_SUPABASE_*` env vars must be set in
the Vercel project, and the production URL must be in Supabase Auth's redirect list. The
marketing site lives in the separate `myekini/STACC` repo.
