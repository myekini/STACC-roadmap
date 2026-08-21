# Stacc documentation

This directory contains the durable product, engineering, and curriculum references for Stacc.
Keep implementation details close to the code when they are directory-specific; keep cross-product
decisions here.

## Sources of truth

| Document | Purpose | Update when |
| --- | --- | --- |
| [`PRODUCT.md`](PRODUCT.md) | Product scope, founder decisions, user flows, shipped features, data model, UI rules, and delivery risks | Product behavior or an in-force decision changes |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Scale boundaries, connected-project architecture, operational guardrails, and production readiness | Infrastructure, integration, or scale decisions change |
| [`CURRICULUM_STANDARD.md`](CURRICULUM_STANDARD.md) | Employability standard, resource policy, evidence rubric, track outcomes, and curriculum rollout rules | The curriculum operating model changes |
| [`CURRICULUM_DATA_ENGINEERING.md`](CURRICULUM_DATA_ENGINEERING.md) | Detailed Data Engineering track blueprint and lesson-level source recommendations | The Data Engineering track is researched or revised |
| [`DESIGN.md`](DESIGN.md) | Canonical visual system, tokens, components, responsive rules, and interaction patterns | The interface system or its implementation rules change |

## Repository-level references

- [`../README.md`](../README.md) is the project entry point and local-development guide.
- [`../CLAUDE.md`](../CLAUDE.md) contains agent instructions and must remain at the repository root.
- [`../supabase/README.md`](../supabase/README.md) stays beside the migrations and seed it explains.

## Documentation rules

- Record current truth, not a diary of completed work.
- Delete scratch audits after their decisions are implemented; Git preserves their history.
- Do not duplicate product decisions across documents. Link to `PRODUCT.md` instead.
- Keep track-specific curriculum detail separate from the cross-track curriculum standard.
- Update code comments and directory-local READMEs when the guidance only applies to that code.
