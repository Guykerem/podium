# Personal Assistant Role — Integration Notes

Notes for the integration step when this worktree is merged alongside the
other role worktrees (tutor, creator, agent-architect).

The role itself (identity, 8 base skills, 5 extension packs, knowledge,
schedule, onboarding questions, success criteria) is complete and scoped
entirely to `roles/assistant/`. No files outside this directory were
modified.

Below are the cross-cutting gaps observed during alpha smoke-testing. They
are **not** scoped to this role — they surfaced because testing this role
exposed them. They almost certainly affect the other role worktrees too
and are worth resolving centrally at integration time rather than
duplicating per role.

## Tier 1 — Repo does not deliver "clone and it works"

Fix these or the "out of the box" promise fails for every role, not just
this one.

1. **`agent/memory/active-role.yaml` is missing.**
   `runtime/engine.py:resolve_active_role()` reads this file to determine
   which role to load. Without it, the engine falls through to a hardcoded
   `agent-architect` default. An alpha user who picked any other role
   during onboarding has to set `PODIUM_ROLE=<role>` in the environment
   manually. Fix: write `active-role.yaml` at the end of the onboarding
   flow (or seed it with `agent-architect` and teach the architect's
   `recommend-role` skill to update it).

2. **Extensions are invisible to the engine.**
   `discover_skills()` in `runtime/engine.py` only walks `core/` and
   `base/`. Every extension pack written across every role is dead weight
   until (a) the engine discovers them and (b) there is a per-user
   activation mechanism. Proposal: store activated extensions in
   `agent/memory/active-extensions.yaml` (list of `<role>/<pack>/<skill>`
   identifiers), extend `discover_skills()` to include them, and let the
   architect's `customize-role` skill or an onboarding question set the
   initial list.

3. **Model version in `runtime/providers.yaml` is stale.**
   Currently pins `claude-sonnet-4-20250514`, which is retired. Real API
   calls would 404. Bump to `claude-sonnet-4-6` (or whatever the current
   default is when integrating).

4. **No message loop.**
   `runtime/engine.py` prints a config summary and exits. The `TODO`
   comments at lines ~146–147 are load-bearing — without the LiteLLM
   completion loop, channel I/O, and scheduler wiring, the runtime can't
   actually run *any* role. A minimal CLI read-loop is enough for alpha.

## Tier 2 — Needed for a real alpha, not just boot

5. **Scheduler disabled and unwired.**
   `runtime/scheduler.yaml` has `enabled: false` and the engine has no
   APScheduler integration. The seven cron jobs in
   `roles/assistant/schedule.yaml` (morning brief, heartbeat, check-in
   sweep, meeting-prep watch, weekly reviews, evening shutdown) will
   never fire until this lands. Proactive behavior is the whole promise
   of the assistant role; without the scheduler it reduces to a
   reactive chatbot.

6. **Onboarding is a spec, not a runner.**
   `roles/assistant/onboarding/questions.yaml` defines 11 questions but
   nothing reads them and nothing writes the answers to
   `memory/preferences/`. Every role worktree likely has the same gap.
   Proposal: one shared onboarding runner in `onboarding/runner.py` that
   reads `roles/<active-role>/onboarding/questions.yaml`, asks each
   question via the active channel, and writes structured output to
   `agent/memory/preferences.yaml`.

7. **`role.yaml` schema is undefined.**
   `runtime/engine.py:load_role_overlay()` looks for
   `roles/<role>/role.yaml` but no role has one and no spec documents
   what belongs in it. Suggest: autonomy overrides, activated extensions,
   role-scoped feature flags. Define the schema once during integration
   and generate stub `role.yaml` files for every role.

## Tier 3 — Honest but deferrable

8. Telegram and webhook channels are config stubs only — no transport
   code.
9. The `tutor/` and `creator/` role directories are empty `.gitkeep`
   placeholders. Users who pick those roles during onboarding will hit a
   wall. (Note: those worktrees may have delivered content — check
   before integrating.)
10. No memory persistence layer. Skills across roles describe reads/writes
    to `memory/` subdirectories, but no code implements them. Each role
    assumes YAML/markdown file I/O; a minimal helper module would prevent
    every skill from reinventing it.
11. `CLAUDE.md` references a `guides/` directory for student-facing
    getting-started material. Directory does not exist.

## What This Role Did NOT Touch

All gaps above live outside `roles/assistant/`. Fixes belong in
`runtime/`, `agent/`, `onboarding/` (a repo-level directory, not the
role-scoped one), and potentially a new shared helper module. Addressing
them inside a single role worktree would have forked the solution for
every other role.

## Suggested Integration Order

1. Bump model version in `providers.yaml` (trivial, unblocks real API
   calls).
2. Define `role.yaml` schema + generate stubs for all roles.
3. Seed `active-role.yaml` default + extend `discover_skills()` for
   extensions.
4. Write the onboarding runner once, shared by all roles.
5. Wire the minimal CLI message loop in `engine.py`.
6. Wire APScheduler and flip `scheduler.yaml:enabled` to true.

Steps 1–5 get the repo to "clone and it works." Step 6 gets the
assistant role to its full proactive promise; other roles may or may
not care about the scheduler, which is itself a useful signal for
where each role's value actually lives.
