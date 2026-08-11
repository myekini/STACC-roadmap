# Foundations — Resource Curation

Working doc for re-curating the 2 resources per Foundations node against a stricter bar: no
hub-links (a course catalog, a whole-site link with no pointer to the relevant part), and every
resource says exactly what to consume — not "watch it all." Once a node's entry here is final,
it gets transcribed into `src/config/roadmap.ts` (and `supabase/seed.sql` to match — see
`docs/PRODUCT.md` §12 gap 7, they're already out of sync and this will widen that gap further
until both get updated together). This file itself is never read by the app — pure scratch
space for getting the content right before touching code.

Editorial rule stays: exactly 2 resources per node (`src/config/roadmap.ts` header comment) —
this doc is about precision on those two, not about adding a third.

---

## Python Basics — ✅ audited
**Skills:** Python syntax · Functions · Pandas intro · **Est. hours:** 12

### Resource 1 — Primary: Python for Everybody — Full Course (video, YouTube — freeCodeCamp)
- **URL:** https://www.youtube.com/watch?v=8DvywoWv6fI
- **Why this one:** Dr. Chuck Severance's course (the video companion to the py4e.com book) —
  the most-watched free from-scratch Python course on the internet, no prerequisites, steady
  pace. Verified the chapter list against freeCodeCamp's own writeup rather than guessing.
- **What to actually watch (~8–9h of the 14h video) — chapters 1–11:** Installing Python, Why
  Program?, Variables/Expressions/Statements, Conditional Execution, Functions, Loops and
  Iterations, Strings, Files, Lists, Dictionaries, Tuples.
- **Skip (~5–6h, not Basics-level) — chapters 12–17:** Regular Expressions, Network
  Programming, Using Web Services, Object-Oriented Programming, Databases, Data Visualization.
  These belong to later specialization nodes (databases/networking → Data Engineering;
  visualization → Data Analysis) — assigning them here duplicates content members will hit
  again, more rigorously, downstream.

### Resource 2 — Reference: Pandas Getting Started Guide (documentation, pandas.pydata.org)
- **URL:** https://pandas.pydata.org/docs/getting_started/index.html
- **Why this one:** official docs, always current, and — importantly — the video above never
  touches pandas at all, so this genuinely is the pandas intro, not a redundant second source.
- **What to actually read:** "What kind of data does pandas handle", "How do I read and write
  tabular data", "How do I select a subset of a DataFrame" — the getting-started pages, not the
  full user guide.
- **Skip:** MultiIndex, time series, extension types, and anything else past "getting started"
  — not Basics-level.

---

## SQL Basics — ⚠️ confirmed gap, needs a product decision
**Skills:** SELECT & joins · Aggregation · Window functions · **Est. hours:** 10

Confirmed: Kaggle's *Intro to SQL* micro-course covers BigQuery setup, `SELECT`/`WHERE`,
`GROUP BY`/`HAVING`, `ORDER BY`, and `JOIN` — it stops there. Window functions live in Kaggle's
separate *Advanced SQL* course (analytic functions, partitioning). So "Window functions" is a
skill this node claims to teach but its resources never cover — not a wording problem, an actual
content gap. Two ways to close it, your call:
1. **Swap resource 2** from SQLBolt to Kaggle's *Advanced SQL* — but that pulls a genuinely
   intermediate topic into a "Basics" node, and est_hours would need to go up.
2. **Drop "Window functions" from this node's skill list** — keep SQL Basics to SELECT/joins/
   aggregation (what its resources actually teach), and introduce window functions properly in
   a later node where it belongs (e.g. as a Data Engineering or Data Analysis skill, alongside
   resources that actually teach it). I'd lean this way — it keeps "Basics" honest about scope.

SQLBolt itself stays as resource 2 either way (interactive, scoped, fine).

## Git & GitHub — ⚠️ confirmed fix
**Skills:** Commits & branching · Pull requests · Merge conflicts · **Est. hours:** 6

*Pro Git ch. 1–3* is fine as-is (a named, scoped chapter range). *GitHub Skills* was the
hub-link problem — it pointed at GitHub's course catalog (Actions, Pages, Copilot, a dozen
unrelated tracks), not a specific module.

**Fix:** swap the URL to the actual module —
`https://github.com/skills/introduction-to-github` — a hands-on, <1-hour exercise (fork a repo,
work through repositories/branches/commits/pull requests with automated feedback via GitHub
Actions) that maps directly onto this node's three skills. Name can stay "GitHub Skills" or
become "GitHub Skills: Introduction to GitHub" for clarity that it's the specific module.

## Command Line — ✅ looks fine as-is
**Skills:** Navigation & pipes · Permissions · Shell scripts · **Est. hours:** 5

*The Missing Semester: Shell* (one MIT lecture, already scoped) + *Linux Command Line Basics*
(a single Ubuntu tutorial article, already scoped). Neither is a hub-link. Low priority to
revisit.

## Statistics Basics — ⚠️ confirmed fix, one swap needed
**Skills:** Distributions & sampling · Hypothesis testing · Correlation vs causation · **Est. hours:** 10

*Seeing Theory* is genuinely scoped — its six chapters (Basic/Compound Probability,
Probability Distributions, Frequentist Inference, Bayesian Inference, Regression Analysis)
already cover distributions *and* hypothesis testing directly. *Khan Academy: Statistics* is
the hub-link problem: it points at KA's entire stats-and-probability library with no pointer to
a relevant unit — and it's redundant with Seeing Theory on the two skills Seeing Theory already
owns.

**Fix:** swap resource 2 to KA's *Study design* unit specifically —
`https://www.khanacademy.org/math/statistics-probability/designing-studies` — since that's the
one skill (correlation vs. causation, observational vs. experimental design) Seeing Theory
doesn't really cover on its own. One precise link doing a job the vague one wasn't, not three
links stacked (the 2-resources-per-node cap stays — see editorial rule at the top of
`roadmap.ts`).

## AI Literacy — ✅ looks fine as-is
**Skills:** Prompt engineering · How LLMs work · Cursor/Copilot fluency · **Est. hours:** 6

*Prompt Engineering Guide* (promptingguide.ai) and Karpathy's *Intro to Large Language Models*
are both single, well-scoped resources already. Low priority to revisit.

---

## Status
All 6 Foundations nodes now have a researched, verified position — 3 already fine
(Python Basics, Command Line, AI Literacy), 3 with a confirmed, specific fix (Git & GitHub:
swap URL; Statistics Basics: swap URL; SQL Basics: needs your call on the skill-list question,
not just a link swap).

## Next steps
1. **Decide the SQL Basics question** (swap in Advanced SQL and raise est_hours, vs. drop
   "Window functions" from the skill list) — the only remaining open call, everything else here
   is ready to transcribe.
2. Transcribe into `src/config/roadmap.ts` (and `supabase/seed.sql` to match) — the resource
   `name`/`url` fields mostly just get swapped/renamed; the "what to actually watch/skip"
   guidance is new content — decide whether it lives in the node `description`, a note appended
   to the resource `name`, or (if this pattern holds across other tracks too) a proper new field
   — worth deciding once, not per-node.
3. Once Foundations is transcribed and live, repeat this same audit for one specialization
   track next (Data Engineering is the natural pick — it's what most other specializations
   gate behind) rather than doing all 5 at once.
4. Do this per-track, Foundations first (smallest surface, gates everything else) — hold off
   scaling to Data Engineering/Analysis/Science/AI-Eng/MLOps until the format is proven here.
