# Stacc Roadmap Tracker — Supabase setup

Schema lives in `migrations/`, content in `seed.sql`. Types: `src/lib/database.types.ts` (keep in sync).

## Fresh project setup

1. Create a project at [database.new](https://database.new) (or `supabase init && supabase start` locally with the CLI).
2. Run `migrations/0001_init.sql` — SQL Editor, or `supabase db push` / `supabase db reset` with the CLI.
3. Run `seed.sql` (idempotency note: it assumes empty content tables — re-running duplicates rows, so reset first).
4. Enable the **Discord** OAuth provider (Authentication → Providers) and add the app's callback URL
   (`http://localhost:3000/auth/callback` in dev, `https://app.getstacc.org/auth/callback` in prod).
5. Copy the project URL + anon key into `.env.local` (see `.env.example`).

## Design decisions

- **Public vs authed (spec §1.9):** `paths`, `nodes`, `node_prerequisites` are world-readable (SEO tree);
  `resources`/`tasks` need any authenticated user; progress/completions/ratings are own-rows (+admin read).
- **Server-owned XP:** there are NO insert/update policies on `user_progress`, `task_completions`, or
  `resource_ratings`. All writes go through security-definer RPCs: `start_node(slug)`,
  `complete_task(task_id)`, `rate_resource(resource_id, rating)`. A trigger on `profiles` reverts any
  client attempt to change `xp`/`rank`/`role`/`cohort_label`.
- **Gating:** node-level prerequisites via `node_prerequisites` (fan-in supported — deviation from the
  spec's single `parent_id`); path-level gates via `paths.requires_paths` (AI-Engineering and MLOps
  require every DE and DS node complete). `node_is_unlocked()` checks both; `locked`/`available` are
  derived, only `in_progress`/`complete` are stored.
- **Ranks:** Bronze <500 ≤ Silver <1500 ≤ Gold <3000 ≤ Platinum <6000 ≤ Diamond (`calc_rank`).
- **Admin:** promote a user with `update public.profiles set role = 'admin' where id = '<uuid>';`
  (must run as service role / SQL editor — the protection trigger blocks clients).

## Local validation

The migration + seed are smoke-tested against vanilla Postgres by stubbing the `auth` schema
(`auth.users` table + settable `auth.uid()`) — see the Phase 1 notes in `docs/EXECUTION_PLAN.md`.
Checks: content counts, lock gates (node + path level), single XP award, no double-award on
re-completion, client XP writes neutralized, rating aggregates.
