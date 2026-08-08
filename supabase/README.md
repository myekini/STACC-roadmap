# Stacc Roadmap Tracker — Supabase setup

Schema lives in `migrations/`, content in `seed.sql`. Types: `src/lib/database.types.ts` (keep in sync).

## Fresh project setup

1. Create a project at [database.new](https://database.new) (or `supabase init && supabase start` locally with the CLI).
2. Run the migrations **in order** — SQL Editor, or `supabase db push` / `supabase db reset` with the CLI:
   `migrations/0001_init.sql`, `migrations/0002_evidence.sql` (evidence-shipping columns on
   `task_completions`, the updated `complete_task` signature, and the public `get_public_profile` RPC),
   `migrations/0003_username_uniqueness_and_discord.sql` (username uniqueness + `rename_username` RPC),
   `migrations/0004_projects.sql` (per-path `projects` table + `set_project` RPC — see below),
   `migrations/0005_challenges.sql` (`challenge` task type + `tasks.challenge` jsonb column — see below).
3. Run `seed.sql` (idempotency note: it assumes empty content tables — re-running duplicates rows, so reset first).
4. Enable the **Discord** OAuth provider (Authentication → Providers) and add the app's callback URL
   (`http://localhost:3000/auth/callback` in dev, `https://app.getstacc.org/auth/callback` in prod).
5. Copy the project URL + anon key into `.env.local` (see `.env.example`).

## Design decisions

- **Public vs authed (spec §1.9):** `paths`, `nodes`, `node_prerequisites` are world-readable (SEO tree);
  `resources`/`tasks` need any authenticated user; progress/completions/ratings are own-rows (+admin read).
- **Server-owned XP:** there are NO insert/update policies on `user_progress`, `task_completions`, or
  `resource_ratings`. All writes go through security-definer RPCs: `start_node(slug)`,
  `complete_task(task_id, evidence_url?)` (evidence is required server-side for `build`-type tasks —
  migration `0002`), `rate_resource(resource_id, rating)`. A trigger on `profiles` reverts any
  client attempt to change `xp`/`rank`/`role`/`cohort_label`.
- **Public portfolio:** `get_public_profile(handle)` is a security-definer RPC callable by anon —
  it's the only public read path into a member's shipped work (username, avatar, shipped nodes,
  evidence links, activity-by-day). It deliberately never returns XP/rank/role/email. Handle
  resolution is case-insensitive username matching with no uniqueness constraint yet — see
  `docs/PRODUCT.md` §12 for that known gap.
- **Gating:** node-level prerequisites via `node_prerequisites` (fan-in supported — deviation from the
  spec's single `parent_id`); path-level gates via `paths.requires_paths` (AI-Engineering and MLOps
  require every DE and DS node complete). `node_is_unlocked()` checks both; `locked`/`available` are
  derived, only `in_progress`/`complete` are stored.
- **Ranks:** Bronze <500 ≤ Silver <1500 ≤ Gold <3000 ≤ Platinum <6000 ≤ Diamond (`calc_rank`).
- **Projects (migration `0004`):** each `(user, path)` can have one `projects.repo_url`, set once via
  `set_project(path_id, repo_url)` and immutable afterwards. Once set, `complete_task` requires every
  `build`-task evidence URL on that path to be a prefix-match under the repo (a commit/PR/tree link
  inside it, not equality) — the point is a specialization's build tasks accumulate into one running
  project instead of N disconnected links. `get_public_profile` exposes `projects` (path_id → repo_url)
  so `/u/[handle]` can render each path as a build-log timeline.
- **Challenge tasks (migration `0005`):** `tasks.type` gains `'challenge'`; `tasks.challenge` jsonb
  holds `{prompt, starterCode, testCode}`. Entirely client-executed — a Pyodide (WASM CPython)
  interpreter loaded from CDN on first use runs the member's code then `testCode`'s `assert`
  statements in the same interpreter; passing (no exception) completes the task. No new RPC —
  the pass/fail decision never touches the server, only the resulting `complete_task` call does.
- **Admin:** promote a user with `update public.profiles set role = 'admin' where id = '<uuid>';`
  (must run as service role / SQL editor — the protection trigger blocks clients).

## Local validation

The migration + seed can be smoke-tested against vanilla Postgres by stubbing the `auth` schema
(`auth.users` table + settable `auth.uid()`). Checks worth running after any schema change:
content counts, lock gates (node + path level), single XP award, no double-award on
re-completion, client XP writes neutralized, rating aggregates, evidence required on build-task
completion, `get_public_profile` never leaking XP/rank/role.
