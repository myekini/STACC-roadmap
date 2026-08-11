# Stacc Architecture and Scale Decisions

**Status:** Current architecture plus approved implementation sequence  
**Scale target:** Tens of thousands of registered learners; bursty, self-paced usage  
**Principle:** Prefer user-triggered work, database constraints, and lazy loading over background infrastructure.

## Product boundary

Stacc has two deliberately different learning environments:

- **Foundations:** short inline Python, SQL, and knowledge checkpoints. No GitHub project is required.
- **Specializations:** one cumulative GitHub project per track. Every build milestone adds a meaningful commit to the same repository until it becomes an end-to-end portfolio project.

The specialization loop is `Learn → Practise → Implement → Sync commit → Verify milestone → Continue`.

## Connected-project MVP

### V1 — build this

1. The learner creates a repository from a Stacc track template.
2. The learner installs the Stacc GitHub App for only that repository.
3. Stacc stores stable repository metadata: GitHub repository ID, owner, name, default branch, and installation ID.
4. A module's build action becomes **Check my work**.
5. On that explicit action, the server creates a short-lived GitHub installation token, reads the latest commit and required paths, and records one submission for the task.
6. Objective checks complete automatically. Subjective rubric items remain visible for self, peer, or admin review.

This design performs GitHub API work only when a learner requests verification. It needs no polling workers and remains predictable at tens of thousands of users.

### V1 permissions

- Metadata: read
- Contents: read
- Pull requests: read only when a milestone explicitly requires a PR

Do not request repository administration, organization access, or write access to learner code. Installation tokens remain short-lived and are never persisted.

### GitHub App configuration

Register a public GitHub App with:

- Setup URL: `https://app.getstacc.org/api/github/setup`
- Webhooks: disabled for V1
- Repository permissions: Metadata read, Contents read
- Installation scope: any account; learners should choose only the repository created for the track

Set `GITHUB_APP_SLUG`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` as server-only deployment environment variables. The private key must
retain PEM newlines or encode them as `\\n`. Never prefix these values with `NEXT_PUBLIC_`.

### Defer

- Push webhooks and real-time synchronization
- AI code review
- Automatic qualitative grading
- Stacc-authored commits or pull requests
- Multi-repository tracks
- GitHub Actions generation
- Repository analytics dashboards

Add webhooks only if explicit sync becomes a demonstrated usability problem. At current scope, webhooks add signature verification, retries, delivery deduplication, event retention, installation lifecycle handling, and operational monitoring without improving the learning outcome.

## Data model

- `projects`: one repository per `(user_id, path_id)` with stable GitHub identity and connection state.
- `project_submissions`: one current submission per `(user_id, task_id)`, containing commit identity, branch, objective check results, and review state.
- `tasks.project_requirements`: content-owned objective checks such as required paths, headings,
  and commit-vs-PR submission mode. Specialization build tasks are cumulative project milestones.
- `task_completions`: remains the source of progress truth; a verified project submission authorizes completion.

GitHub repository IDs—not URLs or repository names—are the durable identity. URLs and names can change.

## Scale characteristics

| Area | Design | Scale behavior |
|---|---|---|
| Curriculum reads | Supabase tables + CDN/browser caching | Read-heavy and cacheable |
| Progress writes | Transactional RPCs | Small indexed writes |
| GitHub verification | User-triggered | Cost follows active learning, not total accounts |
| Repository credentials | Short-lived installation tokens | No token database or refresh workers |
| Project submissions | One row per task | Bounded by curriculum size |
| Inline code | Browser WASM | Compute cost stays on the learner's device |
| Public portfolios | Read-only RPC | Cache candidate once traffic requires it |

## Heavy-feature register

| Component | Cost | Decision | Reason |
|---|---|---|---|
| React Flow roadmap canvas | Large client bundle and interaction complexity | **Archived** | The progression list is clearer across devices and removes a second navigation model plus its dependency. |
| Monaco editor | Large client runtime | **Keep** | It creates a credible coding environment and is dynamically loaded only for challenges. |
| Pyodide | Large first Python download | **Keep, isolated** | It avoids server execution cost and security risk. Show download state and cache through the browser. |
| sql.js | WASM download | **Keep, isolated** | Same benefit as Pyodide with a smaller runtime. |
| Framer Motion | Cross-route JavaScript | **Keep temporarily** | Removal touches most surfaces. Stop adding decorative motion and remove opportunistically during route rewrites. |
| Recharts | Library for one admin chart | **Remove** | CSS bars provide the same decision signal with much less code and bundle weight. |
| PWA service worker | Cache/versioning responsibility | **Keep** | Useful for mobile installation and inexpensive while restricted to the app shell/offline fallback. |
| localStorage demo mode | Duplicated product logic | **Defer removal** | Useful for development today, but should become development-only before broad launch. Supabase must be the sole production source of truth. |
| Resource ratings | Schema and UI complexity with weak early signal | **Archive from UI** | Reconsider only after enough learners produce meaningful sample sizes. |
| Real-time GitHub webhooks | Operational infrastructure | **Defer** | Explicit verification is simpler and sufficient. |
| AI review/assistant | Cost, trust, evaluation, and product noise | **Do not build** | It is not required for progression and conflicts with the current product decision. |

## Operational guardrails

- Apply migrations before deploying code that depends on them.
- Index every external stable identifier used for lookup.
- Verify GitHub App callback state and repository installation ownership server-side.
- Validate webhook signatures if webhooks are introduced later.
- Rate-limit project verification per user and task.
- Never accept a client-supplied commit as verified without fetching it through the installation.
- Store compact check results, never repository contents or webhook payload archives.
- Keep GitHub failures recoverable: project progress remains intact if the app is suspended or uninstalled.

## Implementation sequence

1. ✅ Land the connected-project schema (`0009_connected_track_projects.sql`).
2. **External setup:** register the GitHub App and configure server-only credentials.
3. ✅ Build the installation callback and one-new-repository selection rule.
4. ✅ Replace pasted evidence with **Check my work** and protect against commit reuse.
5. ✅ Add initial Data Engineering file requirements (`0010_project_verification.sql`).
6. Validate the verification rubric with real learners.
7. Expand milestone definitions across each approved track curriculum.
8. Add webhooks only if evidence shows explicit sync is inadequate.
