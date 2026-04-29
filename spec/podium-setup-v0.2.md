# Podium Setup v0.2 — Spec

**Status:** Draft (for decomposition into parallel sessions)
**Owner:** Guy
**Related:** `spec/podium-spec.md`, `.claude/skills/podium-setup/SKILL.md`, `~/git/ally-references/references/nanoclaw`

---

## 1. Why

v0.1 setup installs a *generic* agent. It writes `active-role.yaml`, runs one self-identification probe, and hands the user a static text block. None of the agent's personalization surface (identity, skills, memory, knowledge, routines) is touched. The user never gets to see what the agent can do before picking it, and the agent never gets to learn anything about the user before responding.

v0.2 fixes that by **hard-forking NanoClaw's installer** and layering Podium's role/identity/skill/memory/routine system on top. The user walks away with an agent that knows (a) who they are, (b) which of its skills are turned on, (c) how to reach them, and (d) what it should do for them on a regular schedule.

---

## 2. Goals

1. **Fork, don't rebuild.** Adopt NanoClaw's bootstrap script, status-block emitter, platform/timezone/service/verify modules, Docker runtime pattern, and skill-based channel registration. Re-use every piece that isn't role-specific.
2. **Personalize during install.** Run the role's `onboarding/questions.yaml` during setup. Capture the answers into `roles/<role>/memory/context.md` so the agent's first message is already tailored.
3. **Make the agent's capabilities legible.** Before role choice, show previews. After role choice, show a checklist of base skills with short explanations. User ticks which to turn on.
4. **Give the user visibility.** Render a TaskCreate checklist at the start so the user sees every step and where they are. Surface the ~15-min total estimate up front.
5. **Invite proactivity.** Ask the user what the agent should do for them on a recurring schedule. Generate a personalized routine spec (not a canned one). Wire it into the scheduler.
6. **Default Docker, graceful fallback.** If Docker is present, run the agent in a container (parity with NanoClaw). If Docker is missing, fall back to the existing native venv path — no one is blocked.
7. **Auto-verify and hand off.** End with a live first interaction that exercises the personalized memory, not just a self-ID probe.

---

## 3. Non-Goals (explicit)

- **Not** building a GUI. The lecture-era GUI vision (`spec/podium-spec.md` §Platform) remains out of scope for v0.2. This is CLI + Claude Code skill surface only.
- **Not** shipping full messaging-channel support in v0.2 (WhatsApp / Slack / Discord). We scope to CLI + Telegram only; the NanoClaw channel-skill pattern is adopted so more can be added later with no rework.
- **Not** writing a runtime scheduler executor. v0.2 *captures* routine specs and writes them to `roles/<role>/schedule.yaml`. Execution lands in v0.3.
- **Not** preserving the Python runtime. The hard-fork decision means `runtime/engine.py`, `runtime/context.py`, `runtime/llm_client.py`, and `setup/*.py` are replaced by their Node/TS equivalents. Python tests migrate.
- **Not** supporting Windows natively in v0.2. WSL is accepted (NanoClaw pattern); native Windows defers.

---

## 4. Target User Journey

A first-time cloner on macOS with `node` and the `claude` CLI already installed. Typical install should feel like this:

```
1. git clone podium && cd podium
2. In Claude Code: /podium-setup

   Claude shows:
     "This takes ~15 minutes. I'll walk you through it."
     [TaskCreate list: 9 items, first one in_progress]

3. Preflight: Node 22+, Docker, claude CLI, timezone detected.
   Status block: BOOTSTRAP — all green.

4. Role preview: 4 role cards, each with 1-line purpose and 3 example skills.

5. Role choice: assistant (say).

6. Skill picker: 6 base skills for assistant, each a checkbox with a
   one-line preview. User ticks 4.

7. Onboarding Q&A (3-5 questions from roles/assistant/onboarding/questions.yaml):
   - What's your name and preferred pronouns?
   - What do you want this assistant to help with most?
   - What's your main email address?
   - When do you usually review your day?
   → Answers seeded into memory/context.md.

8. Channel: how do you want to talk to it?
   - CLI (default, always on)
   - Telegram (optional; collects bot token, runs /add-telegram)

9. Routines: what should it do for you regularly?
   LLM-assisted. E.g. "summarize my inbox each morning at 8am."
   → Generates schedule.yaml entry.

10. Install: runtime image build (Docker) or venv install (fallback).
    Status block: INSTALL — success.

11. Verify: /podium-verify auto-invokes.
    Probe message uses memory: "Hi <name>, here's what I understand about
    your goals: <...>. What should we do first?"

12. Summary: usage, edit surface, next steps.
```

---

## 5. Success Criteria (testable)

A v0.2 install is **successful** if and only if:

| # | Assertion | How to verify |
|---|---|---|
| 1 | `./setup.sh` exits 0 on a clean machine with Node ≥20 and Docker running. | Fresh VM smoke test; check `STATUS: success` in BOOTSTRAP block. |
| 2 | If Docker is absent, the installer offers the venv fallback without failing. | Remove Docker, re-run; expect `RUNTIME: venv` in INSTALL block. |
| 3 | `/podium-setup` invokes `TaskCreate` with ≥7 tracked steps, all completed by end of flow. | Parse TaskList at end of session; every step marked `completed`. |
| 4 | Selected role's chosen skills are the only ones enabled in `roles/<role>/skills/active.yaml`. | Read file, compare against picker selections. |
| 5 | Onboarding answers are persisted to `roles/<role>/memory/context.md` as structured YAML or markdown. | File exists, contains at least name + goal + timezone. |
| 6 | If user picked Telegram, `/add-telegram` ran to completion and bot responds to `/start`. | Live channel check; `.env` contains `TELEGRAM_BOT_TOKEN`. |
| 7 | `roles/<role>/schedule.yaml` contains ≥1 routine with `when`, `what`, `inputs` fields. | File schema validated against `schemas/routine.schema.yaml`. |
| 8 | Auto-run `/podium-verify` probe references at least one onboarding answer in its reply. | String match on probe response. |
| 9 | Full install, non-interactive pieces only, completes in ≤10 min wall-clock on the reference machine (MacBook Air M2, fresh clone, warm npm cache). | CI timing. |
| 10 | `pytest` has been replaced by `vitest`/`jest` suite; all 4 layers (contracts, L1 boot, L2 setup, L3 behavior) are green. | `npm test` exit 0. |
| 11 | `docker image ls` shows `podium-agent:latest` after a Docker install. | Shell check. |
| 12 | Removing Podium is documented (`/podium-uninstall` skill or doc) — NanoClaw's "no rollback" antipattern not inherited. | Skill exists, smoke-tested on a throwaway clone. |

---

## 6. Installer Architecture (forked from NanoClaw)

```
setup.sh                         # fork of nanoclaw/setup.sh (adapted: Python→Node)
setup/
  index.ts                       # step runner, fork of nanoclaw/setup/index.ts
  status.ts                      # status-block emitter (copy verbatim)
  platform.ts                    # OS/WSL/root detection (copy verbatim)
  timezone.ts                    # IANA timezone detection (copy + extend)
  environment.ts                 # adapted: check Node + claude CLI + roles/ dir
  runtime.ts                     # NEW: Docker-or-venv runtime selector
  role-preview.ts                # NEW: render role cards + skill previews
  role-select.ts                 # NEW: role + skill picker (AskUserQuestion)
  onboarding.ts                  # NEW: run questions.yaml, seed memory
  channel.ts                     # fork of nanoclaw channel-skill dispatcher
  routine.ts                     # NEW: LLM-assisted routine designer
  install.ts                     # NEW: image build OR venv install
  verify.ts                      # adapted: role + skills + memory + probe
  service.ts                     # NEW: launchd/systemd wiring (fork nanoclaw)
runtime/                         # NEW — replaces Python runtime
  engine.ts                      # Node port of engine.py
  context.ts                     # Node port of context.py
  llm_client.ts                  # Node port of llm_client.py
  providers.yaml                 # unchanged
  channels.yaml                  # unchanged
  scheduler.yaml                 # unchanged
container/
  Dockerfile                     # fork of nanoclaw/container/Dockerfile
  entrypoint.sh                  # fork of nanoclaw/container/entrypoint.sh
  build.sh                       # fork of nanoclaw/container/build.sh
.claude/skills/
  podium-setup/SKILL.md          # REWRITTEN — new orchestration flow
  podium-verify/SKILL.md         # MINOR edits — uses personalized probe
  podium-uninstall/SKILL.md      # NEW — address NanoClaw rollback gap
```

**Status blocks** (borrowed from NanoClaw):
- `BOOTSTRAP` — Node version, Docker presence, timezone, claude CLI, platform
- `PREVIEW` — emitted when role cards rendered (for test harness)
- `ROLE_CHOICE` — role, skills array
- `ONBOARDING` — answers_count, memory_written (path)
- `CHANNEL` — channels array (cli always present)
- `ROUTINE` — routines_count, schedule_path
- `INSTALL` — runtime (docker|venv), image (if docker), status
- `VERIFY` — role, boot, probe, latency, personalized (bool)

---

## 7. Open Questions (resolved inline; flag if you disagree)

| # | Question | Decision | Flagged? |
|---|---|---|---|
| Q1 | Fork depth? | Hard fork NanoClaw wholesale (user confirmed). | ✅ |
| Q2 | Docker required? | Default Docker, venv fallback (user confirmed). | ✅ |
| Q3 | Skill picker granularity? | Role first, then per-skill checkboxes (user confirmed). | ✅ |
| Q4 | Routines authorship? | LLM-assisted from user answers (user confirmed). | ✅ |
| Q5 | Runtime language after fork? | Node/TS (direct consequence of Q1). | 🟡 — confirm the Python migration cost is acceptable. |
| Q6 | Channel scope in v0.2? | CLI + Telegram only. WhatsApp/Slack/Discord deferred. | 🟡 — confirm minimal channel set. |
| Q7 | Install time hard budget? | Communicate ~15 min, CI budget 10 min non-interactive. | — |
| Q8 | Windows native support? | Defer. WSL accepted via NanoClaw pattern. | — |
| Q9 | Test framework after migration? | vitest (NanoClaw uses Node; matches TS). | 🟡 — confirm or stick with Jest if easier. |
| Q10 | Uninstall flow? | Ship `/podium-uninstall`. | — |

---

## 8. What We Are Not Copying From NanoClaw

Explicit antipatterns to avoid:
1. **No progress UI.** We add a TaskCreate checklist. (Goal 4.)
2. **Silent install-time.** We state ~15 min up front. (Goal 4.)
3. **No rollback.** We ship `/podium-uninstall`. (Success #12.)
4. **Hardcoded timezone list.** We detect from the OS first, validate against the IANA tz-data list.
5. **Channel-skill merges with no conflict handling.** v0.2 only ships 2 channels; pattern documented for later additions, conflict strategy tracked as a v0.3 issue.
6. **Best-effort telemetry pings in setup.sh.** We omit. No PostHog curl. If we want telemetry later, we do it explicitly with opt-in.

---

## 9. Migration & Cutover

- Keep Python v0.1 on a branch (`legacy/python-v0.1`) for 30 days in case we need to roll back.
- v0.2 lands behind a branch `feat/setup-v0.2`, merged in one squash after all contract tests pass.
- No user data to migrate — `active-role.yaml` is the only persisted state and its shape doesn't change.

---

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Node/TS migration drags on, blocks lecture prep | Medium | High | Decompose into parallel sessions; the runtime port (engine+context+client) is the single critical path. |
| Students on older laptops struggle with Docker | Medium | Medium | Venv fallback is built into v0.2 from day one; not an afterthought. |
| Telegram channel adds too much onboarding friction | Low | Medium | It's opt-in; CLI always works. |
| LLM-generated routine specs are low quality | Medium | Low | Show the generated spec and let the user edit before saving; don't auto-commit. |
| Tests suite migration introduces regressions | Medium | Medium | Port L1 first (fast, deterministic), then L2, then L3 with a golden transcript replay. |
