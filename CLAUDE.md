# Stacc — Roadmap Tracker (app.getstacc.org)

The Roadmap Tracker product for Stacc, a data-career community ("Not learning. Just shipping.").
This is the **app** repo — the marketing site lives in the separate `myekini/STACC` repo
(getstacc.org). Live at app.getstacc.org.

**Full product spec + architecture reference: `docs/PRODUCT.md`.** Read it before any
non-trivial change — this file only holds what a session needs on every turn.

## Non-negotiable founder decisions

- **No AI features in the product.** Fully removed 2026-07-07 — no assistant, no teaser. Don't
  reintroduce unless explicitly asked.
- **Gamification stays minimal.** Completion %, streak, heatmap, plain milestones only. XP/rank
  accrue silently in the DB but are never surfaced in the UI — don't add an XP counter or rank
  badge back unasked.
- **Team agents** in `.claude/agents/` — design-engineer, data-platform, QA specialists.

## Stack & commands

- Next.js 14 (App Router), React 18, TypeScript strict, Tailwind 3, Radix primitives, Framer
  Motion, Zustand, TanStack Query, Supabase (Discord OAuth), React Flow for the skill tree
  canvas.
- `npm run dev` / `npm run lint` / `npm run typecheck` / `npm run build` / `npm run check`
  (lint+typecheck+build — run before finishing any task). No test suite — verify visually.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`).
  **Without env the app runs in localStorage demo mode** — every data feature must degrade
  gracefully to it (see `src/hooks/useUserData.ts` for the dual-mode pattern).

## Architecture map (quick reference — full detail in `docs/PRODUCT.md` §11)

- `src/app/` — routes: `/` (landing), `/paths`, `/roadmap` (skill tree + node sheet),
  `/dashboard`, `/admin`, `/u/[handle]` (public portfolio), `/tree` (public SEO tree),
  `/auth/callback`.
- `src/config/roadmap.ts` — static content, source of truth for demo mode; mirrors
  `supabase/seed.sql` exactly. Read the editorial rules at the top before adding content.
- `src/components/roadmap/` (SkillTreeCanvas, SkillTree, NodeSheet), `layout/` (AppLayout,
  Sidebar, TopBar, BottomBar), `admin/`, `ui/` (shadcn-style primitives).
- `src/hooks/useUserData.ts` — all member state, Supabase-or-localStorage. XP thresholds:
  Bronze <500 < Silver <1500 < Gold <3000 < Platinum <6000 < Diamond.
- `src/store/useUiStore.ts` — UI-only state (Zustand), persisted where it should survive refresh.

## Design DNA (inherited from the landing page — match it)

- Aesthetic: **Modern Technical Brutalism** — terminal/mono, `rounded-none`, uppercase mono
  micro-labels, `// comment`-style captions, bento-box grids. Dark-only, no light/dark toggle.
- Colors: deep navy surfaces; **orange** = primary action; **cyan** = signal/focus/progress
  energy. Style via CSS-var design tokens in `globals.css`, never hardcoded hex in components.
- Fonts: Geist Sans + Geist Mono, loaded locally from `src/app/fonts/` (never Google Fonts).
- Motion: intentional, not decorative. Always pair custom motion with `prefers-reduced-motion`
  fallbacks.
- Icons: component SVGs (lucide) via `src/components/ui/app-icon.tsx`'s name→icon map, never
  icon-font ligature strings — new icon names must be added to that map.

## Conventions & gotchas

- Prerequisite gating is core product logic: node status = `locked | available | in_progress |
  complete`, always derived; AI-Engineering and MLOps paths unlock only after DE + DS.
- Public vs authed split is load-bearing for SEO (`docs/PRODUCT.md` §6): tree structure is
  public, node details/resources/tasks/progress require auth, admin surfaces require admin role.
- Keep client-trusted XP writes out of new code — XP/rank are computed server-side only, inside
  security-definer RPCs (`supabase/migrations/`).
- Deploy target: Vercel, `app.getstacc.org` (live).
