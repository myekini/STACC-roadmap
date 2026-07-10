# Stacc — Roadmap Tracker

![Next.js](https://img.shields.io/badge/Next.js-14-111827?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-1d4ed8?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ecf8e?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-0f766e?logo=tailwindcss)

The Roadmap Tracker for [Stacc](https://www.getstacc.org), a data-career community — *"Not learning. Just shipping."*
A visual skill tree that answers the three questions that stop most learners: **What do I learn next? Am I on track? What does ready look like?**

- 38 modules across Foundations + 5 specialization paths (DE, DA, DS, AI Engineering, MLOps)
- Pan/zoom skill-tree canvas, curated free resources with community ratings, real tasks, checkpoint quizzes
- Prerequisite gating — modules unlock in order; AI Engineering and MLOps unlock after DE + DS
- Build tasks ship a public evidence URL instead of a checkbox — the roadmap doubles as a portfolio
- Public portfolio at `/u/[handle]` — shipped modules + evidence, no login required
- Progress tracking with streaks, a consistency heatmap, and milestones
- Admin panel: cohort progress, stuck-member alerts, CSV exports, module analytics

## Product surfaces

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Landing with the live roadmap rail |
| `/tree` | public | Server-rendered full skill tree (SEO) |
| `/paths` | member | Path selection |
| `/roadmap` | member | The skill tree + module workspace |
| `/dashboard` | member | Progress, streak, heatmap, milestones |
| `/u/[handle]` | public | Member's shipped-work portfolio |
| `/admin` | admin | Cohort health, stuck alerts, exports |

## Stack

Next.js 14 (App Router) · React 18 · TypeScript strict · Tailwind 3 · Radix · Framer Motion · Zustand · TanStack Query · Supabase (Postgres + Discord OAuth) · React Flow.

## Quick start

```bash
npm install
npm run dev
```

Without env vars the app runs in **localStorage demo mode** — full product, progress saved on-device.
For the real backend, copy `.env.example` to `.env.local` and follow [`supabase/README.md`](supabase/README.md)
(migration, seed, Discord OAuth — ~10 minutes).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run check` | Lint + typecheck + production build (run before shipping) |
| `npm run start` | Serve the production build |

## Repo map

- `docs/PRODUCT.md` — full product spec + architecture reference (single source of truth)
- `src/config/roadmap.ts` — the content engine (mirrors `supabase/seed.sql`)
- `src/hooks/useUserData.ts` — all user state; Supabase RPCs or localStorage with identical semantics
- `supabase/` — schema migrations, seed, setup guide; XP-safe RPCs + RLS

## Deploy

Live on Vercel at `app.getstacc.org`. The two `NEXT_PUBLIC_SUPABASE_*` env vars must be set in
the Vercel project, and the production URL must be in Supabase Auth's redirect list. The
marketing site lives in the separate `myekini/STACC` repo.
