---
target: "https://app.getstacc.org/paths"
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-08-15T11-26-38Z
slug: src-app-paths-page-tsx
---
# Paths UI/UX Critique

Method: dual-agent (A: paths_design_review · B: paths_technical_evidence)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Active/locked/progress states are visible, but filter result state is absent. |
| 2 | Match system / real world | 2 | The prerequisite roadmap is flattened into a course catalog. |
| 3 | User control and freedom | 2 | Filters have no clear/reset path and selecting immediately navigates away. |
| 4 | Consistency and standards | 3 | Components are coherent, but the marketplace model conflicts with the roadmap model. |
| 5 | Error prevention | 2 | Gates prevent invalid choices, but empty filter combinations have no recovery. |
| 6 | Recognition rather than recall | 2 | Users must infer dependency order and audience fit. |
| 7 | Flexibility and efficiency | 2 | Three filtering mechanisms are overhead for only five paths. |
| 8 | Aesthetic and minimalist design | 1 | Excessive hero, filter, recommendation, labels, and spacing bury the decision. |
| 9 | Error recovery | 1 | No empty-results message or clear-filters action. |
| 10 | Help and documentation | 2 | One generic recommendation exists, but no meaningful path comparison aid. |
| **Total** | | **20/40** | **Acceptable, but major improvement needed** |

## Design Specificity Verdict

The page is product-specific in copy and visual tokens but category-interchangeable in composition. “Learn / Build / Ship,” mono labels, cyan/orange accents, progress, module counts, and prerequisite gates fit Stacc. Structurally, however, it is an oversized promotional hero followed by tag browsing, search, a recommendation banner, and equal-weight catalog cards. This does not express the core progression model: Foundations first, then available specializations, with AI Engineering and MLOps unlocked only after Data Engineering plus Data Science.

The detector returned zero findings for `src/app/paths/page.tsx`. This means no configured static anti-pattern triggered; it does not invalidate the source-backed layout, accessibility, contrast, and interaction defects below.

## Overall Impression

The page spends too much vertical space preparing the learner to choose from only five options. The biggest opportunity is to replace catalog browsing with a compact, dependency-aware chooser that puts startable paths in the first viewport and visually separates future locked paths.

## What's Working

- Real curriculum metadata—hours, modules, progress, gates—adds trust.
- Active and locked states are text-backed rather than communicated only with color.
- Responsive primitives, semantic articles/headings, reduced-motion support, and global coarse-pointer touch sizing are already present.

## Priority Issues

### [P1] Premature three-column layout does not account for the app sidebar

At the 1024px `lg` breakpoint, the expanded shell removes 256px before page padding and gaps, yet the grid switches to three columns and the hero adds its right-side illustration. Cards can be roughly 200px wide, creating cramped content, awkward wraps, and the observed alignment failure. Hold two columns until the available content canvas is genuinely wide or use container queries.

### [P1] Too much chrome and vertical space before the actual choice

The hero, filter area, optional recommendation, outer spacing, and generous padding can consume 350–500px before the first path card. On mobile and common laptops the core decision begins below the fold. Compress the hero to a one-line orientation, merge or remove the recommendation, and surface paths immediately.

### [P1] Information architecture hides the prerequisite model

Foundations is removed from the list, all five specializations appear as peers, and advanced dependencies are disclosed only through a locked button. Show Foundations status first, group paths into “Choose now” and “Unlock later,” and expose the DE + DS gate before users encounter a disabled action.

### [P1] Non-wrapping locked CTA can clip inside narrow cards

The shared button enforces `whitespace-nowrap`, while the full-width locked action contains long text such as “Complete Data Engineering + Data Science first.” Global horizontal overflow hiding masks the failure instead of solving it. Keep the button label short and move prerequisite explanation into card content.

### [P2] Filtering is disproportionate and creates hidden scroll

Search, level selection, and a horizontally scrolling tag strip solve a five-item inventory. The tag strip hides its scrollbar and has no overflow cue, while combined filters can produce a blank grid with no message or reset. Remove most filters or keep one compact control with a visible result count and clear action.

### [P2] Hierarchy and card alignment are noisy

Repeated “CAREER TRACK” labels, level markers, variable tag counts, descriptions, status badges, progress, metadata, and CTAs compete at similar weights. Description clamping hides decision-critical differences while tags create uneven internal landmarks. Prioritize title/outcome, learner fit or shipped project, duration/modules, and action; demote or remove the rest.

### [P2] Filter accessibility and light-mode contrast are weak

The search and level select lack persistent/programmatic labels; selected tag buttons do not expose `aria-pressed`. Small cyan text uses `#0284c7`, which measures about 4.10:1 on white and 3.91:1 on the light background—below WCAG AA for normal text. Add labels/states and use a darker signal token for small light-mode text.

## Persona Red Flags

- **Jordan, first-timer:** cannot see why two paths are locked, how Foundations relates to the choice, or why Data Analysis is recommended beyond a generic sentence.
- **Sam, accessibility-dependent:** unlabeled search/select controls, no `aria-pressed` on tag filters, very small metadata, and weak cyan contrast increase navigation and reading difficulty.
- **Casey, mobile user:** must scroll through hero, chips, filters, and recommendation before reaching tall cards; hidden horizontal scrolling and long locked actions compound the friction.
- **Self-directed Stacc learner:** the page answers hours and module counts but not the primary questions “what can I start now?”, “which path matches my goal?”, and “what will I ship?”

## Minor Observations

- Nested shell and page gutters waste horizontal space beside the sidebar.
- Locked cards remain nearly as prominent as available paths.
- The Learn/Build/Ship illustration disappears below `lg`, confirming that it is decorative rather than essential.
- Motion is restrained and reduced-motion aware, but it polishes an unresolved hierarchy.

## Questions to Consider

- If there are only five choices, why does the page need search, tags, and level filtering?
- What if the first viewport answered only: “Which path can I start now, and what will I ship?”
- Should locked advanced tracks remain full cards, or become a compact future-goals section?
- Is Data Analysis genuinely recommended for every learner, or should guidance derive from the learner's goal?
