# Podium Specs

Architecture and design decisions, ranked by current relevance.

## Read first (current)

- [`agent-boilerplate-spec.md`](./agent-boilerplate-spec.md) — the canonical architecture: shared agent skeleton, role overlays, skill tiers, autonomy. Start here if you want the system model.
- [`podium-setup-v0.2.md`](./podium-setup-v0.2.md) — the setup flow design: nine steps, status blocks, failure recovery. Mirrors what `/podium-setup` orchestrates.

## Reference (deeper detail)

- [`podium-setup-v0.2-decomposition.md`](./podium-setup-v0.2-decomposition.md) — milestone-by-milestone breakdown of the v0.2 hard-fork from Python to Node/TS. Useful as a record of how the current shape was reached.
- [`podium-spec.md`](./podium-spec.md) — earlier high-level pitch and scope. Largely subsumed by `agent-boilerplate-spec.md`; kept for the framing arguments.

## Historical

- [`podium-agent-detailed.md`](./podium-agent-detailed.md) — early detailed design notes from before the boilerplate spec consolidated. Some sections are now outdated; use only as context.

## See also

- `CLAUDE.md` (repo root) — the live repo map, kept in sync with code.
- `LEGACY.md` (repo root) — how to roll back to the v0.1 Python implementation if needed.
