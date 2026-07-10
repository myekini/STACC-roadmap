# Known Issues & Suggested Fixes

Companion to `docs/PRODUCT.md` §12 — that section stays a one-line summary per issue; this file
is the actionable version: what's wrong, why it matters, and a concrete fix. Ordered by
priority. Update this file (don't let it drift) whenever an item is fixed or a new one is found.

---

## P0 — Fix before more members join

### 1. Username collisions silently break the public portfolio
**Issue:** `/u/[handle]` resolves by case-insensitive username match; `get_public_profile`
picks "oldest profile wins" on a tie. There's no DB uniqueness constraint and no UI to change a
username after signup (Discord OAuth sets it once from `global_name`/`full_name`).
**Impact:** Two members named "Alex" — the second one's public profile link silently shows the
*first* Alex's data, or 404s depending on match order. This gets more likely, not less, as the
community grows, and it fails silently (no error, just wrong content).
**Suggested fix:**
1. New migration: `create unique index profiles_username_lower_idx on public.profiles (lower(username));`
   — but first audit and de-dupe any existing collisions (`select lower(username), count(*) from
   profiles group by 1 having count(*) > 1`), since the index will fail to create otherwise.
2. Update `handle_new_user()` (migration `0001_init.sql`) to fall back to `Scholar-<short-id>`
   or similar when the OAuth-provided name collides, instead of relying on `on conflict do
   nothing` against the primary key only.
3. Add a minimal settings affordance — doesn't need a full page, a rename field in the Sidebar's
   profile area is enough — backed by a new RPC (`rename_profile(new_username)`) that checks
   uniqueness server-side and returns a clear error on collision.
4. Demo mode: `LS.profile` already stores `{ username }` locally — just needs the same rename
   entry point wired to `writeLS`.
**Effort:** M (one migration + one RPC + one small UI affordance).

### 2. Verify migration `0002_evidence.sql` is actually applied in production
**Issue:** Evidence shipping (`complete_task`'s new `p_evidence` arg) and the entire public
portfolio (`get_public_profile`) depend on it. It was written and committed but never confirmed
run against the live Supabase project.
**Impact:** If unapplied, every build-task completion and every `/u/[handle]` visit 500s in
production while working fine in local demo mode — the worst kind of gap, invisible until a
real user hits it.
**Suggested fix:** Run it now — SQL Editor or `supabase db push` against the `stacc` project —
then smoke-test one build-task completion and one `/u/[handle]` load against production. Add a
one-line check to whatever pre-deploy routine exists (even just "did today's migrations run?"
in the PR description) so this can't happen again.
**Effort:** S (five minutes, but must be done by someone with production DB access).

---

## P1 — High-value, bounded scope

### 3. Admin: no way to act on a stuck member
**Issue:** `docs/PRODUCT.md` §1.11-equivalent spec'd a one-click Discord DM nudge from the
stuck-alerts panel; today the admin can only *see* who's stuck (`src/hooks/useAdminData.ts`),
not reach them from the panel.
**Impact:** Stuck detection is only half a feature without the action — an admin still has to
alt-tab to Discord and manually find the person.
**Suggested fix (MVP, no bot required):**
1. Discord OAuth already gives you the member's Discord user ID in
   `auth.users.raw_user_meta_data` (the `sub`/`provider_id` field) — persist it onto `profiles`
   at signup time (extend `handle_new_user()`).
2. Add a "nudge" button in `MemberDrilldown` (`src/app/admin/page.tsx`) that opens
   `discord.com/users/<id>` in a new tab (zero-infra) as a first pass, or POSTs to a small
   Vercel Edge Function that calls a Discord bot token to actually send the DM (needs a bot
   application + the bot sharing a server with the member — more setup, real automation).
3. Log the nudge (timestamp + admin) somewhere simple — even a `nudged_at` column on
   `user_progress` or a new `admin_nudges` table — so "stuck 14 days, already nudged 2 days ago"
   is visible instead of re-nudging blindly.
**Effort:** S for the open-profile MVP; M–L for the real bot-DM version.

### 4. Admin: only node-level analytics, spec asked for resource-level
**Issue:** `ModuleChart`/`useAdminData` track starts/completions **per node**. The spec's ask
was completion-vs-abandonment **per resource link** (e.g. "this dbt video has a 40% drop-off").
**Impact:** Admins can see a module is struggling but not *which curated resource* is the
problem — the actionable signal for content curation is one level too coarse.
**Suggested fix:**
1. Add a lightweight `resource_opens` table (`user_id`, `resource_id`, `opened_at`) — insert on
   the resource link's `onClick` in `NodeSheet.tsx` (fire-and-forget, doesn't need to block
   navigation).
2. Abandonment proxy = opened but the node was never subsequently completed within some window,
   or simpler: opens vs. that resource's existing `rating_count` as a rough "engaged" signal.
   Exact-open-to-completion attribution is genuinely hard — ship the simple version first.
3. Surface it as a new "Resources" tab in `AdminShell` next to "Module Analytics," same table
   pattern as the existing one.
**Effort:** M.

---

## P2 — Instrumentation & process

### 5. §9 success metrics (WAU%, completion rates, rating coverage) aren't measured
**Issue:** The targets exist in `docs/PRODUCT.md` §9; nothing computes them. Vercel Analytics
covers pageviews only.
**Impact:** No way to know if the product is actually working without eyeballing the admin
member table by hand.
**Suggested fix:** These are almost entirely derivable from tables that already exist — no new
tracking needed for most of them:
- Node/path completion rate → `user_progress` (completions ÷ starts, already computed per-node
  in `nodeAnalytics`; just aggregate).
- Rating coverage → `resources` where `rating_count > 0` ÷ total resources.
- Avg time per node vs. `est_hours` → `completed_at - started_at` in `user_progress` vs.
  `nodes.est_hours`.
- WAU% needs an actual activity timestamp query (`profiles.last_active_at` or `user_progress`
  activity within 7 days ÷ total signups) — already have the data, just need the query.
Ship this as a fifth `AdminShell` section ("Metrics") reusing the existing stat-card pattern,
not a new analytics platform.
**Effort:** M.

### 6. No CI
**Issue:** `npm run check` (lint + typecheck + build) is a manual, human-remembered gate — it's
not enforced on push or PR.
**Impact:** Works today because of discipline; the first rushed push breaks that, silently,
with no one told.
**Suggested fix:** One `.github/workflows/check.yml` running `npm ci && npm run check` on push
and pull_request to `main`. No deploy step needed — Vercel's own git integration already
handles that; this just gates the merge.
**Effort:** S.

---

## P3 — Optional / low priority

### 7. Progress export is CSV-only
Spec said "CSV or PDF" — CSV already satisfies that. Only worth doing if an admin explicitly
asks for a printable report.

### 8. "Full Stack" path from an early flow sketch
Never built, not on the roadmap. Documented in `docs/PRODUCT.md` §2 as an intentional cut, not
an open issue — listed here only so it doesn't get rediscovered and treated as a bug.
