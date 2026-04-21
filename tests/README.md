# Tests

Podium uses vitest. Four layers, matching the v0.1 pytest structure:

| Layer | Location | What it covers |
|---|---|---|
| contracts | `tests/contracts/` | Each role must satisfy the RoleContract — identity + onboarding + skills + schedule all present and well-formed. |
| l1_boot | `tests/l1_boot/` | Fast, subprocess-free. Parses BOOTSTRAP status block from `bash setup.sh`. |
| l2_setup | `tests/l2_setup/` | Subprocess-driven smoke tests on every `npx tsx setup/<step>.ts` module. |
| l3_behavior | `tests/l3_behavior/` | Live — shells out to `claude -p`. Gated by `LIVE=1`. |

## Run

```bash
npm test                 # all non-live layers
npm run test:contracts   # just RoleContract
npm run test:l1          # just boot
npm run test:l2          # just step smoke
npm run test:l3          # live (requires LIVE=1 and claude CLI)
npm run test:unit        # runtime/ + setup/ unit tests (module-owned)
npm run typecheck        # tsc --noEmit
```

## Principles

- Unit tests live next to the module they test (`runtime/__tests__/`, `setup/__tests__/`).
- Layer tests here are integration-flavored — they exercise the whole module or contract across the 4 roles.
- L3 never runs in CI by default. Use locally with `LIVE=1 npm run test:l3`.
