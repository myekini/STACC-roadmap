# Stacc Roadmap Tracker — Supabase setup

Schema lives in `migrations/`, content in `seed.sql`. Types: `src/lib/database.types.ts` (keep in sync).

## Fresh project setup

1. Create a project at [database.new](https://database.new) (or `supabase init && supabase start` locally with the CLI).
2. Run the migrations **in order** — SQL Editor, or `supabase db push` / `supabase db reset` with the CLI:
   `migrations/0001_init.sql`, `migrations/0002_evidence.sql` (evidence-shipping columns on
   `task_completions`, the updated `complete_task` signature, and the public `get_public_profile` RPC),
   `migrations/0003_username_uniqueness_and_discord.sql` (username uniqueness + `rename_username` RPC —
   filename predates the GitHub switch, still just the uniqueness logic),
   `migrations/0004_projects.sql` (per-path `projects` table + `set_project` RPC — see below),
   `migrations/0005_challenges.sql` (`challenge` task type + `tasks.challenge` jsonb column — see below),
   `migrations/0006_sync_foundations_challenges.sql` (content-only: converts the 3 Foundations
   checkpoint quizzes that became challenges — safe to run against a live DB with real members),
   `migrations/0007_github_auth.sql` (Discord → GitHub sign-in — see below),
   `migrations/0008_foundations_no_evidence.sql` (Foundations build exercises require no repo), and
   `migrations/0009_connected_track_projects.sql` (stable GitHub repository identity + milestone submissions), and
   `migrations/0010_project_verification.sql` (commit reuse protection + Data Engineering milestone checks).
3. Run `seed.sql` on a **fresh** project only (idempotency note: it assumes empty content tables —
   re-running duplicates rows). On an existing project with real member data, apply `0006` instead
   of re-running `seed.sql`.
4. Enable the **GitHub** OAuth provider (Authentication → Providers) — register an OAuth App under
   the GitHub account/org that owns this project (GitHub → Settings → Developer settings → OAuth
   Apps → New OAuth App), set its callback URL to the **Supabase** callback shown on that provider's
   config page (`https://<project-ref>.supabase.co/auth/v1/callback`, not the app's own
   `/auth/callback`), then paste the OAuth App's Client ID + Secret into Supabase. Discord is no
   longer a supported provider — see migration `0007`.
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
  resolution is case-insensitive and protected by migration `0003`'s lowercased uniqueness index.
- **Gating:** node-level prerequisites via `node_prerequisites` (fan-in supported — deviation from the
  spec's single `parent_id`); path-level gates via `paths.requires_paths` (AI-Engineering and MLOps
  require every DE and DS node complete). `node_is_unlocked()` checks both; `locked`/`available` are
  derived, only `in_progress`/`complete` are stored.
- **Ranks:** Bronze <500 ≤ Silver <1500 ≤ Gold <3000 ≤ Platinum <6000 ≤ Diamond (`calc_rank`).
- **Projects (migrations `0004`, `0008`, `0009`):** each `(user, path)` can have one project. The
  legacy/manual records may store only `projects.repo_url`, set once via
  `set_project(path_id, repo_url)` and immutable afterwards. Once set, `complete_task` requires every
  specialization `build`-task evidence URL to be a prefix-match under the repo (a commit/PR/tree link
  inside it, not equality) — the point is a specialization's build tasks accumulate into one running
  project instead of N disconnected links. Foundations are exempt. Migration `0009` adds stable
  GitHub repository identity, content-owned `tasks.project_requirements`, and service-written
  `project_submissions` for the **Check my work** flow. `get_public_profile` exposes projects
  so `/u/[handle]` can render each path as a build-log timeline.
- **Challenge tasks (migration `0005`):** `tasks.type` gains `'challenge'`; `tasks.challenge` jsonb
  is a discriminated union on `language`. `{language:'python', prompt, starterCode, testCode}` runs
  in a Pyodide (WASM CPython) interpreter loaded from CDN — member's code then `testCode`'s
  `assert` statements in the same interpreter, no exception = pass.
  `{language:'sql', prompt, starterCode, setupSql, expectedRows}` runs in sql.js (WASM SQLite,
  also CDN-loaded) — `setupSql` seeds a fresh in-memory db, the member's query runs against it,
  and the result rows must exactly match `expectedRows` in order. Both are entirely
  client-executed — no new RPC, the pass/fail decision never touches the server, only the
  resulting `complete_task` call does. Live on the three Foundations topics that are genuinely
  code-testable (Python Basics, Statistics Basics, SQL Basics) — Git/CLI/AI Literacy stay quizzes.
- **GitHub sign-in (migration `0007`):** replaces Discord as the only OAuth provider.
  `handle_new_user()` now reads GitHub's metadata shape (`user_name`/`preferred_username` for the
  handle, `provider_id`/`sub` for the immutable id) instead of Discord's, and `profiles` gains
  `github_id`/`github_username` (the old `discord_id` column is left in place, just unused going
  forward). Members who signed up via the old Discord flow are a distinct `auth.users` identity
  from their GitHub one — re-authing via GitHub creates a new profile, it doesn't merge with the
  old one. `github_username` is what the admin panel's member drilldown links to
  (`github.com/<username>`). Connected project verification uses a separate GitHub App installation
  with repository-scoped read permissions; OAuth identity tokens are not reused for repository access.
- **Admin:** promote a user with `update public.profiles set role = 'admin' where id = '<uuid>';`
  (must run as service role / SQL editor — the protection trigger blocks clients).

## Local validation

The migration + seed can be smoke-tested against vanilla Postgres by stubbing the `auth` schema
(`auth.users` table + settable `auth.uid()`). Checks worth running after any schema change:
content counts, lock gates (node + path level), single XP award, no double-award on
re-completion, client XP writes neutralized, rating aggregates, evidence required on build-task
completion, `get_public_profile` never leaking XP/rank/role.
