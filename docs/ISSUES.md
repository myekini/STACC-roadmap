# Known Issues & Suggested Fixes

Companion to `docs/PRODUCT.md` §12 — that section stays a one-line summary per issue; this file
is the actionable version: what's wrong, why it matters, and a concrete fix. Ordered by
priority. Update this file (don't let it drift) whenever an item is fixed or a new one is found.

---

## P0 — Fix before more members join

### 1. Username collisions silently break the public portfolio — RESOLVED (migration `0003`)
Fixed: `profiles_username_lower_idx` unique index, `handle_new_user()` falls back to a random
4-hex suffix on collision, `rename_username` RPC + `/settings` page for self-service renaming
(demo mode too, via `LS.profile`). Left here so the fix stays discoverable in context; delete
this entry the next time this file gets a real edit pass.

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

### 2b. Migrations `0004`–`0007` (projects, challenges, content sync, GitHub auth) not yet
verified in production, and `0007` needs a manual step no migration can do
**Issue:** Same category as #2, compounded — `0007_github_auth.sql` also depends on registering
a GitHub OAuth App and enabling the GitHub provider in the Supabase dashboard (Authentication →
Providers), since Discord's provider config doesn't carry over automatically.
**Impact:** Until both the migrations run and the provider is enabled, sign-in is broken in
production (Discord button removed from the UI, GitHub provider not yet configured server-side)
— members can't sign in at all in that gap window. Deploy the dashboard/provider change and the
`0007` migration together, not the code first.
**Additional consequence:** any existing Discord-authenticated member on production is now
sign-in-orphaned — GitHub is a distinct `auth.users` identity, re-authing creates a new profile
rather than recovering the old one. If there are real members already, this needs a conscious
call (manual linking, export, or accept the loss), not something to discover after the fact.
**Suggested fix:** Run `supabase/README.md`'s setup steps in order (provider first, then
migrations 4-7); if production already has real members, check the P0 orphaning consequence
above before flipping the switch.
**Effort:** S for the migrations themselves; the OAuth App registration and any account-linking
decision are the real work here, and only the founder can do the former.

---

## P1 — High-value, bounded scope

### 3. Admin: no way to act on a stuck member (partially resolved)
**Issue:** `docs/PRODUCT.md` §1.11-equivalent spec'd a one-click nudge from the stuck-alerts
panel. The open-profile MVP is now shipped — `MemberDrilldown` (`src/app/admin/page.tsx`) links
to the member's GitHub profile via `profiles.github_username` (migration `0007`). What's still
missing is any *automated outreach* — GitHub has no DM mechanism at all, unlike the
Discord-bot route this replaced, so there's no equivalent to build toward here anymore. If
outreach automation is wanted again, it'd have to be a different channel entirely (email, or a
re-added Discord *webhook* — not sign-in — purely for admin-side notifications).
**Suggested fix (remaining piece):** Log the profile-link click (timestamp + admin) somewhere
simple — even a `nudged_at` column on `user_progress` or a new `admin_nudges` table — so "stuck
14 days, already checked 2 days ago" is visible instead of re-checking blindly.
**Effort:** S.

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

### 8. "Full Stack" path from an early flow sketch — RESOLVED
Had actually been implemented in `roadmap.ts` despite being documented as an intentional cut;
removed. Left here so it doesn't get silently reintroduced without an explicit ask.
