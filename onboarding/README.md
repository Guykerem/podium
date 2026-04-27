# Onboarding

The shared onboarding runner — phase-based personalization that turns a freshly-cloned Podium into *your* Podium.

## Files

- [`flow.md`](./flow.md) — the six-phase onboarding UX, end to end. Read this to understand what `/podium-setup` is actually doing during the onboarding step.
- [`questions.yaml`](./questions.yaml) — shared baseline questions every role asks (name, pronouns, primary goal, timezone). Each role layers its own questions on top via `roles/<role>/onboarding/questions.yaml`.

## How it works

The runner reads `roles/<active-role>/onboarding/questions.yaml`, asks each question through the active channel, and writes structured answers to `roles/<active-role>/memory/context.md`. The runtime then assembles that memory into the role's system prompt at boot, so the agent greets you by name and aligns to the goal you stated.

## See also

- `setup/onboarding.ts` — the implementation.
- `roles/<role>/onboarding/questions.yaml` — role-specific question sets layered on top of the shared baseline.
- `agent/program.md` — how the assembled context becomes the running agent.
