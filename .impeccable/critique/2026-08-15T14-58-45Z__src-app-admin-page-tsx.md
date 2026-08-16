---
target: Admin experience
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
timestamp: 2026-08-15T14-58-45Z
slug: src-app-admin-page-tsx
---
# Admin UI/UX Critique

Method: dual-agent (A: admin_design_review · B: admin_technical_evidence)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | Curriculum saves lack durable saved/failed state. |
| 2 | Match system / real world | 3 | Language is operational, but overview does not prioritize real admin work. |
| 3 | User control and freedom | 2 | Blur triggers writes; no dirty-state or discard model. |
| 4 | Consistency and standards | 2 | Admin shell and curriculum editor use conflicting visual systems. |
| 5 | Error prevention | 2 | Confirmation exists for deletion, but live edits are under-protected. |
| 6 | Recognition rather than recall | 2 | Hover-only actions and dense editor structure hide capabilities. |
| 7 | Flexibility and efficiency | 1 | No sorting, bulk action, keyboard operation, or direct attention queue. |
| 8 | Aesthetic and minimalist design | 2 | Dense bordered surfaces compete at similar weight. |
| 9 | Error recovery | 2 | Curriculum mutations toast errors, but query/export failures are not surfaced. |
| 10 | Help and documentation | 1 | No contextual help for high-impact editing or stuck-member resolution. |
| **Total** | | **19/40** | **Poor — major UX work required** |

## Design Specificity Verdict

The admin is recognizably Stacc in typography, color, and sharp-border language, but its overview is a generic KPI dashboard and its curriculum surface is a fixed three-pane editor rather than a calm, task-oriented operational workflow. The curriculum content is product-specific; the interaction model is not production-ready.

The detector returned zero static findings. This does not cover the verified responsive, keyboard, hover, scroll, and information-architecture failures below.

## What's Working

- Member rows become dedicated mobile cards instead of a forced horizontal table.
- The independent admin shell establishes clear section context and a persistent theme control.
- Attention detection uses understandable operational language and curriculum mutations have confirmation/toast handling.

## Priority Issues

### [P1] Curriculum is clipped and effectively desktop-only

The page nests a fixed 70vh/min-520px manager inside `overflow-hidden`. The manager uses a non-wrapping 208px track rail, 256px module rail, and editor. On phones the editor is fully offscreen with no scroll recovery; on tablets it is severely compressed. Replace this with responsive master-detail navigation: track list → module list → editor, using drawers/back navigation on narrow screens and dvh-based sizing.

### [P1] Core actions are hover-only and below touch target size

Track edit/delete, module delete, and task actions only become visible on group hover. Touch users cannot reliably reveal them and keyboard focus does not expose them. Several icon actions are roughly 20–22px. Use always-visible overflow menus on touch, `focus-within` visibility on desktop, labels, and 44px controls.

### [P1] Selection and reordering are mouse-only

Desktop member table rows use `<tr onClick>` without keyboard behavior. Curriculum modules are clickable `<li>` elements, and reordering relies on native drag events. Convert member/module selection to semantic buttons or links and provide keyboard-accessible move up/down controls.

### [P1] Autosave-on-blur is unsafe and unclear

Name, subtitle, hours, description, and skills save when focus leaves the field. The only feedback is a transient global “Saving…” state. Introduce explicit Save/Discard or a durable dirty/pending/saved/failed model with retry and navigation protection.

### [P1] Overview does not support the main admin outcome

Four equal KPI cards and two large navigation teasers report status but do not help the operator act. Lead with a ranked attention queue showing learner, inactivity duration, current node, blockage, and direct GitHub/contact action. Demote aggregate KPIs.

### [P2] Member filters become crowded and lack recovery

Status buttons, every cohort, fixed-width search, and export compete in one wrapping toolbar. Use a labeled search, cohort select/combobox, active-filter summary, result count, clear-all action, and recovery CTA in empty states.

### [P2] Nested scroll regions create spatial fatigue

The page scrolls around a fixed-height manager whose tracks, modules, and editor each scroll independently, with analytics below. Move analytics to its own section and give the editor one coherent viewport.

### [P2] Query and export errors are hidden

Overview, cohorts, members, and analytics have loading states but no query-error presentation. Export uses `try/finally` without user-facing failure feedback. Add specific error/retry states and distinguish failure from an empty dataset.

### [P2] Theme and component geometry drift

The admin shell is sharp and token-driven, while CurriculumManager mixes rounded-xl/rounded-lg and hard-coded red/amber utilities. Consolidate on shared semantic tokens, one radius policy, and shared controls.

### [P2] Forms lack durable labels and status

Several editor inputs use placeholder-only identification; the estimated-hours label is not associated with its control. Add persistent labels, ids, descriptions, validation, and field-level save/error status.

## Persona Red Flags

- **Alex, power admin:** no sorting, bulk selection, selected export, shortcuts, or direct attention handling; curriculum work requires excessive pointer movement.
- **Sam, keyboard/low-vision admin:** hover-only controls, clickable non-interactive rows, mouse-only drag reorder, 9–11px metadata, and unlabeled inputs block efficient operation.
- **Casey, mobile admin:** curriculum editor is clipped, actions are hover-dependent, filters wrap heavily, and drilldown provides no sticky next action.
- **Community Operator:** member drilldown exposes raw node status but not the learner’s current blockage, last meaningful activity, or a clear resolution workflow.

## Questions

- If stuck-member recovery is the primary job, why is the first screen dominated by equal-weight aggregate counts?
- Does Curriculum need three simultaneous navigation levels, or should it be a responsive master-detail editor?
- Is leaving a field intentionally equivalent to publishing a curriculum change?
- What concrete action should complete a stuck-member investigation?
