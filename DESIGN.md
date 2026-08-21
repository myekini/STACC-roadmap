---
name: Stacc
description: A precise, evidence-led learning workspace for data professionals who learn, practise, prove, and ship.
colors:
  dark-background: "#0d1117"
  dark-surface: "#12263f"
  dark-surface-low: "#101b2c"
  dark-surface-high: "#1a2744"
  light-background: "#f8fafc"
  light-surface: "#ffffff"
  light-surface-low: "#f8fafc"
  light-surface-high: "#f1f5f9"
  action-orange-dark: "#d9622e"
  action-orange-light: "#ea580c"
  signal-cyan-dark: "#00d9ff"
  signal-cyan-light: "#0369a1"
  success-dark: "#10b981"
  success-light: "#047857"
  warning-dark: "#f59e0b"
  warning-light: "#b45309"
  error-dark: "#f87171"
  error-light: "#b91c1c"
  text-dark: "#e0e3e5"
  text-dark-muted: "#8395ac"
  text-light: "#0f172a"
  text-light-muted: "#475569"
typography:
  display:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.08em"
  label-compact:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.08em"
  control:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  visualization-caption:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  structural: "0"
  control: "4px"
  overlay: "6px"
  circular: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
  section-lg: "64px"
components:
  button-primary:
    backgroundColor: "{colors.action-orange-dark}"
    textColor: "{colors.dark-background}"
    typography: "{typography.label}"
    rounded: "{rounded.structural}"
    padding: "12px 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.structural}"
    padding: "12px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.structural}"
    padding: "24px"
  input:
    backgroundColor: "{colors.dark-surface-low}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
---

# Design System: Stacc

## Overview

**Creative North Star: “The Technical Field Manual”**

Stacc uses **Modern Technical Brutalism** to make a demanding learning journey feel precise, credible, and navigable. It borrows the discipline of terminal interfaces, field manuals, and operational dashboards without imitating their friction. Structure is visible, states are explicit, and every highlighted element must help a learner decide, act, recover, or understand progress.

The marketing surface may be expressive; the authenticated member and admin surfaces are operational and quieter. Brand character comes from sharp geometry, restrained mono labels, exact borders, purposeful signals, and evidence-led language—not from ornamental glow, excessive badges, or decorative motion.

This file is the visual source of truth. Product behavior and feature scope remain governed by `docs/PRODUCT.md`. Removed or deferred concepts—including visible XP/rank systems, The Ladder, an AI Study Assistant, and Discord authentication—must not be inferred from older visual documents.

**Key characteristics:**

- Dark-first but fully designed for light and dark mode.
- Sharp structural surfaces with selectively softened controls.
- Orange commits; cyan guides; semantic colors report state.
- Geist Sans carries reading; Geist Mono carries system meaning.
- Dense enough for serious work, never cramped enough to obscure it.
- GitHub evidence and shipped work are product truth, not decorative gamification.

## Colors

Stacc uses cool layered surfaces and two deliberately separate accents. All UI must consume semantic tokens; page-level components must not invent theme-specific hex values.

### Primary

- **Commit Orange** (`--orange`): the main consequential action—start, continue, save, submit, connect, or publish. Use once per decision region when possible.
- **Signal Cyan** (`--cyan`): navigation state, focus, progress, links, selection, and technical guidance. Cyan is not a substitute primary CTA.

### Functional

- **Verified Green** (`--success`): completion or a positively verified state.
- **Attention Amber** (`--warning`): caution, blocked progress, or required review.
- **Failure Red** (`--error`, `--error-action`): errors and destructive actions only.

### Neutral surfaces

- `--background` is the page canvas.
- `--surface-card` is the default panel.
- `--surface-container-low`, `--surface-container`, and `--surface-container-high` create depth without routine shadows.
- `--foreground` and `--fg-muted` are the readable text pair.
- `--border-subtle` separates ordinary surfaces; cyan borders indicate interaction or focus, not decoration.

### Light and dark contract

Dark mode uses luminous signals against deep navy-charcoal surfaces. Light mode uses darker, lower-chroma versions of the same signals to preserve contrast against white and slate. A component must use the same semantic role in both modes; do not maintain separate light-only and dark-only class structures.

**The Two-Accent Rule.** Orange represents commitment. Cyan represents orientation and system feedback. Never make both compete as primary actions in one region.

**The Status Truth Rule.** Green, amber, and red require a real state and must be paired with text or an icon where meaning matters. Color alone never carries status.

## Typography

**Display and Body Font:** Geist Sans, loaded locally with a system sans-serif fallback.
**System and Data Font:** Geist Mono, loaded locally with a monospace fallback.

Geist Sans keeps curriculum, guidance, and admin content calm and readable. Geist Mono gives labels, code, evidence, identifiers, and compact system feedback a technical signature. Mono is an accent language, not the default voice for long reading.

### Hierarchy

- **Display** (700, 40–64px, 1.05): marketing hero only.
- **Page headline** (700, 32–48px, 1.12): one principal heading per page.
- **Section headline** (600–700, 24–32px, 1.25): major content groups.
- **Card title** (600–700, 16–20px, 1.3): concise, outcome-led titles.
- **Body** (400, 16px, 1.5): instructions and primary reading, normally capped near 70ch.
- **Supporting body** (400, 14px, 1.45): descriptions and metadata with sufficient contrast.
- **System label** (600, 11–12px, 0.08em): uppercase Geist Mono labels.

**The Eleven-Pixel Floor.** Interactive labels and meaningful metadata must not be smaller than 11px. Ten-pixel text is reserved for non-essential visualization annotations; 9px UI text is prohibited.

**The Mono Ration Rule.** Use mono for data and system language. Do not render long descriptions, explanations, or every heading in mono.

## Layout

The application is mobile-first and container-aware. Layout must respond to the content width remaining after navigation—not merely the browser viewport.

- **Mobile:** below 768px; one primary column, 16px horizontal gutter, bottom navigation where applicable.
- **Tablet:** 768–1199px; one or two columns based on usable content width.
- **Desktop:** 1200px and above; persistent navigation and up to three content columns when each card remains comfortably readable.
- **Wide:** 1440px and above; added breathing room, never stretched prose.

Use the 4px base rhythm: 4, 8, 12, 16, 24, 32, 48, and 64px. Standard card padding is 16px on compact mobile surfaces and 24px on larger screens. Major authenticated pages should fit their primary task into the initial viewport whenever content permits; introductory chrome must not push the task below the fold.

Avoid nested horizontal page gutters, arbitrary fixed-height workspaces, and page-plus-panel scroll traps. Horizontal scrolling is limited to inherently tabular or timeline content and must have an obvious affordance.

## Elevation & Depth

Stacc is flat by default. Depth comes from tonal surface layering, borders, and controlled overlays. Ordinary cards and buttons do not need shadows.

- **Structural surfaces:** no shadow.
- **Dropdowns, dialogs, sheets, and floating mobile navigation:** one restrained shadow is allowed to establish separation.
- **Focus:** a visible cyan ring, never a decorative ambient glow.
- **Status glow:** allowed only for a small live or verified status dot.
- **Backdrop blur:** reserved for navigation overlays and modal scrims; never used to decorate ordinary cards.

**The Earned Elevation Rule.** A shadow must explain that an element floats above something. If it does not, remove it.

## Shapes

Structural geometry is sharp: cards, curriculum workspaces, stat panels, alerts, and major navigation surfaces use square corners. Small controls may use a 4px radius when it improves affordance. Dialogs and menus may use up to 6px. Avatars, status dots, switches, and other inherently circular objects remain fully rounded.

Do not neutralize shape semantics by making every object square or every object pill-shaped. Pills are reserved for toggles and compact binary or status controls—not general badges, buttons, tabs, or cards.

## Components

### Buttons

- Minimum height: 44px; 48px for prominent actions.
- Primary: Commit Orange background with accessible dark action text; one principal action per decision region.
- Secondary: bordered neutral surface; cyan border/text may be used when the action is navigational or exploratory.
- Ghost: no persistent surface; appears on hover/focus.
- Destructive: error treatment with explicit confirmation for irreversible actions.
- Loading: preserve the label width, set `aria-busy`, disable repeat submission, and use the shared Spinner.
- Focus: 2px cyan ring with background offset.

### Badges and labels

Badges communicate status, category, or a short constraint. Use 11–12px Geist Mono uppercase type, restrained padding, and a border. Do not decorate every title with a badge or repeat information already visible nearby.

### Cards and containers

Cards use a semantic surface, a subtle border, and 16–24px internal padding. Hover treatment is reserved for clickable cards. Static cards must not move on hover. Card content hierarchy is title → outcome/context → essential metadata → action.

### Inputs and fields

Inputs use a persistent visible label, 44px minimum touch height, semantic surface, and 4px radius. Placeholder text supplements a label; it never replaces one. Focus uses cyan. Errors remain adjacent to the affected field and include recovery guidance.

### Progress

Progress is cyan by default and green only when verified complete. The standard track is 4px in dense contexts or 8px when it is a primary dashboard signal. Progress always includes a textual value or meaningful accessible label.

### Navigation

Navigation uses Geist Mono sparingly, clear active-state contrast, and consistent naming across desktop and mobile. Desktop side navigation and mobile bottom navigation expose the same primary destinations. Route changes use a lightweight global transition only when the next view cannot appear immediately; content queries prefer local skeletons.

### Loading and feedback

- Use a spinner inside a button for an action initiated by that button.
- Use a skeleton when the shape of incoming content is known.
- Use a compact page loader only for route-level uncertainty.
- Use alerts for persistent, contextual information.
- Use toast for brief confirmation or non-blocking failure.
- Use an alert dialog for consequential or destructive confirmation.

### Avatars and theme control

Avatars are circular, image-first, and always provide a readable fallback. Presence/status badges require accessible adjacent meaning when operationally important. The theme switch is the canonical global light/dark control and must not be reimplemented per page.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens so every component works in both themes.
- **Do** let orange identify commitment and cyan identify navigation, focus, and progress.
- **Do** keep authenticated and admin surfaces quieter than the landing page.
- **Do** use visible labels, strong focus states, 44px targets, and reduced-motion fallbacks.
- **Do** build new patterns as shared primitives before repeating them across pages.
- **Do** prioritize the learner's next action, evidence, and recovery path over promotional copy.

### Don't:

- **Don't** reintroduce visible XP, ranks, The Ladder, AI-assistant claims, or Discord authentication from obsolete specifications.
- **Don't** use 9px interface text or depend on low-contrast microcopy.
- **Don't** stack badges, borders, glow, shadow, blur, and motion on one element.
- **Don't** use cyan and orange as competing primary CTAs in the same region.
- **Don't** create page-specific theme toggles, loaders, alerts, avatars, buttons, or dialog styles when a shared primitive exists.
- **Don't** use hover-only actions; every action must work with touch and keyboard.
- **Don't** create decorative gradients or animations inside task-focused member and admin workflows.
