# feat: Personal Assistant role

Adds the Personal Assistant role — a proactive comms strategist that
manages time, tasks, relationships, and email — as one of four role
overlays for the Podium agent boilerplate.

Scoped entirely to `roles/assistant/`. No files outside this directory
were modified.

## Summary

- **Identity** — constitution (values: curate don't dump, interruption is
  earned, axioms before advice, integrity as identity) + style.yaml
- **8 base skills** — check-in, manage-tasks, manage-calendar,
  manage-email, daily-brief, relationship-coach, time-advisor,
  prep-meeting (last one added from research)
- **5 extension packs / 15 skills** — team-management, travel, finance,
  knowledge-capture, health-and-habits (last two added from research)
- **8 knowledge docs** across task-management, communication, calendar,
  and crm — named frameworks (GTD, Eisenhower, MoSCoW, Newport's deep
  work, Loehr-Schwartz energy, Dunbar layers)
- **schedule.yaml** — 7 recurring jobs (30-min heartbeat → evening
  shutdown)
- **learning/success-criteria.md** — per-skill rating rubrics + role-level
  monthly success and failure signals
- **onboarding/questions.yaml** — 11 axiom-gathering questions

## Research

See `roles/assistant/RESEARCH.md` for the synthesis that shaped the role.
Key informants: Khoj/Leon/OpenClaw patterns, USENIX SOUPS'22 four-layer
proactive-assistant model, Dex/Clay/Monica personal CRM cadence logic,
Eisenhower email triage with user-tuned examples, Loehr-Schwartz energy
management, MCP as the 2026 integration substrate.

## Verification

- All 23 `SKILL.md` files pass frontmatter check (name, description,
  when_to_use) and length check (60–150 lines).
- Runtime smoke test (`PODIUM_ROLE=assistant python3 runtime/engine.py`)
  loads the role cleanly: 5 core + 8 base skills, Anthropic provider, CLI
  channel.

## Cross-cutting gaps surfaced during smoke testing

Alpha testing exposed several gaps that are **out of scope for this
role** but affect every role worktree. They are committed in
`roles/assistant/INTEGRATION-NOTES.md` for the integration step to
resolve centrally (so each role worktree doesn't fork its own fix).

### Tier 1 — blocks "clone and it works"
- `agent/memory/active-role.yaml` missing → role selection requires env
  var hack
- Extensions invisible → `runtime/engine.py:discover_skills()` doesn't
  walk extension packs
- `runtime/providers.yaml` pins a retired model (`claude-sonnet-4-20250514`)
- Engine has no message loop — prints config and exits

### Tier 2 — needed for real alpha
- Scheduler disabled and unwired — `schedule.yaml` cron jobs never fire
- Onboarding is a spec, not a runner — nothing reads `questions.yaml`
- `role.yaml` schema undefined — engine loads it but no role has one

### Tier 3 — deferrable
- Channel transports beyond CLI are config-only
- `tutor/` and `creator/` role directories may still be stubs (check
  sibling worktrees)
- No shared memory persistence helper
- `guides/` directory referenced in CLAUDE.md but doesn't exist

Full context and suggested integration order in
`roles/assistant/INTEGRATION-NOTES.md`.

## Test plan

- [ ] Integration step lands Tier 1 fixes
- [ ] `PODIUM_ROLE=assistant python3 runtime/engine.py` boots cleanly
      (already verified in this worktree)
- [ ] Onboarding runner (when built at integration) walks through
      `roles/assistant/onboarding/questions.yaml` and writes
      `memory/preferences.yaml`
- [ ] APScheduler (when wired at integration) loads the 7 jobs from
      `roles/assistant/schedule.yaml`
- [ ] Morning simulation: 07:30 fires `daily-brief` with fixture
      calendar/inbox/tasks and produces a curated 5-section brief
      (sections skip if empty, hard caps honored)
