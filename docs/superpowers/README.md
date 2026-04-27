# docs/superpowers

Internal planning artifacts — design specs and step-by-step implementation plans created during build-out. Useful for understanding *how* the repo arrived at its current shape, not as a guide for *using* it.

## What's here

- `specs/` — design documents that defined a feature before implementation.
- `plans/` — task-by-task execution plans agentic workers used to build features.

## Reading order

If you're a fresh cloner, you probably don't need anything in this directory. Start with:

- `README.md` (repo root) — what Podium is.
- `CLAUDE.md` (repo root) — the live repo map.
- `spec/README.md` — current architecture and design decisions, ranked.
- `guides/TROUBLESHOOTING.md` — for setup problems.

If you're a contributor or curious about history:

- Each plan/spec includes a header indicating whether it is current or historical.
- v0.1 docs (April 2026) describe the original Python implementation. Podium hard-forked to Node/TypeScript in v0.2 — see `LEGACY.md`.
- Hackathon-related docs (web editor, voting, website redesign) are current and describe the live `hackathon/` site.
