# Podium Setup v0.2 — Decomposition

**Source spec:** `spec/podium-setup-v0.2.md`
**Purpose:** Parallelizable modules with interface contracts, dependency graph, and per-session briefs ready for pickup.

---

## Dependency Graph

```
                    M0 (legacy tag)
                         │
                         ▼
        ┌────────────────┼────────────────┐
        │                │                │
     M1 boot          M2 runtime       M12 uninstall
     + status           port              (independent)
        │                │
        ├────────┬───────┼───────┐────────┐
        ▼        ▼       ▼       ▼        ▼
      M4 role   M6 ch  M3 docker M13 svc
      select   step
        │        │       │
        ▼        │       │
      M5 onb ◄───┘       │
        │                │
        ▼                │
      M7 rout            │
        │                │
        │     ┌──────────┘
        ▼     ▼
         M8 install
              │
              ▼
         M9 verify
              │
              ▼
         M10 SKILL integration
              │
              ▼
         M11 test migration (ongoing, finalized here)
```

**Critical path:** M2 → M3 → M8 → M9 → M10. Everything else fans out in parallel.

---

## Parallel Waves

| Wave | Modules | Can run in parallel | Notes |
|---|---|---|---|
| 0 | M0 | — | Tag legacy branch; trivial, seconds. |
| 1 | M1, M2, M12 | yes, 3 agents | Foundations. No cross-deps. |
| 2 | M3, M4, M6, M13 | yes, 4 agents | All depend on wave 1 outputs but not each other. |
| 3 | M5, M8 | yes, 2 agents | M5 needs M4; M8 needs M2+M3. |
| 4 | M7, M9 | yes, 2 agents | M7 needs M5; M9 needs M2+M5. |
| 5 | M10, M11 | sequential-ish | Integration + final test migration. |

With 4 parallel agents, this is realistically 5 sessions of wall-clock work.

---

## Interface Contracts (the invariants across modules)

Any module may assume these are stable; don't break them without coordinating.

### C1 — Status block format

All steps emit:
```
=== PODIUM SETUP: <STEP_NAME> ===
KEY: value
KEY: value
STATUS: success|<failure_code>
=== END ===
```
Steps: `BOOTSTRAP, PREVIEW, ROLE_CHOICE, ONBOARDING, CHANNEL, ROUTINE, INSTALL, VERIFY`.
Library: `setup/status.ts` exports `emitStatus(step: string, fields: Record<string, string|number|boolean>)`.

### C2 — Step runner contract

All step modules export:
```ts
export async function run(args: Record<string, unknown>): Promise<number>
```
Exit code: 0 success, >0 failure (step-specific codes documented in module).
Invoked via `npx tsx setup/index.ts --step <name>`.

### C3 — Active state file

`agent/memory/active-role.yaml` — single source of truth for active role.
Shape:
```yaml
role: assistant
skills_enabled: [communicate, remember, summarize-email]
channels: [cli, telegram]
timezone: America/New_York
installed_at: 2026-04-18T14:02:11Z
```

### C4 — Memory seed file

`roles/<role>/memory/context.md` — written by onboarding, read by engine at every message.
First section is YAML frontmatter with onboarding answers; body is markdown notes.

### C5 — Role overlay shape

A role directory must contain (for setup to accept it):
```
roles/<role>/
  role.yaml                        # display name, blurb, 3 example skills
  identity/constitution.md
  identity/style.yaml
  skills/base/<skill>/SKILL.md     # ≥1
  onboarding/questions.yaml
  memory/context.md                # seeded during install
  schedule.yaml                    # written by routine designer
```

### C6 — Runtime invocation

`npx tsx runtime/engine.ts --message "<text>"` → prints LLM response to stdout, exits 0 on success. Supports `--dry-run` (prints context, skips LLM).

### C7 — TaskCreate checklist

The `podium-setup` SKILL must call `TaskCreate` once at start, one task per wave step. Subsequent steps `TaskUpdate` to `in_progress` on entry and `completed` on exit. Failure → keep `in_progress` and surface error.

---

## Module Briefs

Each brief is designed so you can drop it into a fresh session and the agent can pick it up cold.

---

### M0 — Preserve legacy Python v0.1

**Size:** XS (5 min)
**Depends on:** nothing
**Unblocks:** everything
**Isolation:** direct on main

**Goal:** Tag current Python implementation so we can roll back if v0.2 goes sideways.

**Tasks:**
1. `git branch legacy/python-v0.1 main`
2. `git tag v0.1-final`
3. Push both.
4. Add `LEGACY.md` note at repo root explaining how to check out v0.1 if needed.

**Acceptance:** `git branch -a | grep legacy/python-v0.1` returns a result. Tag visible on origin.

**Session brief:**
> You're preserving the current Python implementation before Podium hard-forks to Node/TS. Create a branch `legacy/python-v0.1` and tag `v0.1-final` pointing at current `main`. Push both to origin. Add a short `LEGACY.md` with a two-line "how to restore" recipe. No other changes.

---

### M1 — Fork NanoClaw bootstrap + status + platform + timezone

**Size:** M (half-day)
**Depends on:** M0
**Unblocks:** M3, M4, M6, M8, M9, M13
**Isolation:** worktree `feat/setup-v0.2-m1-bootstrap`

**Goal:** Port NanoClaw's preflight layer (bash bootstrap, status-block emitter, platform detection, timezone detection) into Podium.

**Files in:**
- `setup.sh` — fork from `~/git/ally-references/references/nanoclaw/setup.sh`. Adapt: Node check (≥20), Docker check (optional, emit presence), timezone detect, claude CLI check, WSL/root detection.
- `setup/status.ts` — copy verbatim, change brand string.
- `setup/platform.ts` — copy verbatim.
- `setup/timezone.ts` — adapt: IANA detection via `Intl.DateTimeFormat().resolvedOptions().timeZone`; fallback prompt list.
- `package.json` at repo root with `tsx`, `typescript`, relevant types.
- `tsconfig.json` — standard Node 20 config.

**Status block contract:**
```
=== PODIUM SETUP: BOOTSTRAP ===
PLATFORM: macos|linux|wsl|unknown
IS_ROOT: true|false
NODE_VERSION: 22.1.0
NODE_OK: true|false
DOCKER_PRESENT: true|false
DOCKER_RUNNING: true|false
TZ: America/New_York
CLAUDE_CLI: /path/to/claude|missing
STATUS: success|node_missing|deps_failed
LOG: logs/setup.log
=== END ===
```

**Acceptance:**
- `./setup.sh` runs clean on reference mac.
- Emits well-formed BOOTSTRAP block.
- Absent Docker → `DOCKER_PRESENT: false`, `STATUS: success` (no failure).
- Absent Node → `STATUS: node_missing`, exit 2.

**Session brief:**
> Hard-forking Podium's installer from NanoClaw (~/git/ally-references/references/nanoclaw). Your job: port the *preflight* layer — setup.sh, setup/status.ts, setup/platform.ts, setup/timezone.ts — from TS/bash. Don't touch role, skill, or onboarding logic. Read NanoClaw's setup.sh and setup/ to understand the pattern, then adapt: check Node ≥20 (not just present), detect Docker but don't require it, emit BOOTSTRAP status block per the contract in spec/podium-setup-v0.2-decomposition.md §C1. Add package.json + tsconfig.json so `tsx` runs. Don't delete existing Python yet — another module handles that.

---

### M2 — Port Python runtime to Node/TS

**Size:** L (full day)
**Depends on:** M0
**Unblocks:** M3, M8, M9, M13
**Isolation:** worktree `feat/setup-v0.2-m2-runtime`

**Goal:** Replace `runtime/engine.py`, `runtime/context.py`, `runtime/llm_client.py` with Node/TS equivalents that preserve CLI surface.

**Files in:**
- `runtime/engine.ts` — port of engine.py. Same CLI: `--message`, `--dry-run`.
- `runtime/context.ts` — port of context.py. Assembles role system prompt from identity + skills + memory.
- `runtime/llm_client.ts` — port of llm_client.py. `ClaudeCodeClient` shells out to `claude -p`.
- `runtime/providers.yaml` — unchanged (read by engine).
- `runtime/channels.yaml` — unchanged.
- `runtime/scheduler.yaml` — unchanged.

**Removes:** `runtime/*.py` (move to `legacy/` subdir first, delete at M11).

**Interface:**
```
$ npx tsx runtime/engine.ts
  → boot summary (role, skills, provider)
$ npx tsx runtime/engine.ts --message "hello"
  → LLM response text
$ npx tsx runtime/engine.ts --message "hello" --dry-run
  → assembled context, no LLM call
```

**Acceptance:**
- `npx tsx runtime/engine.ts` prints the existing boot summary fields (role, skills counts, provider, channel, scheduler).
- `--dry-run` output includes constitution, style, and seeded memory if present.
- `--message` gets a real reply via `claude -p` (live test, optional under CI flag).

**Session brief:**
> Port runtime/engine.py, runtime/context.py, runtime/llm_client.py to TypeScript. Preserve every CLI flag and every field in the boot summary. Read current Python files carefully — the context assembly (identity + style + skills + memory) is subtle. LLMClient is a simple shell-out to `claude -p`. Use `yaml` npm package for YAML loading. Add vitest unit tests for context assembly with a fixture role. Don't delete Python files yet — move them to legacy/runtime/ so rollback is easy.

---

### M3 — Fork Docker container

**Size:** M
**Depends on:** M2
**Unblocks:** M8
**Isolation:** worktree `feat/setup-v0.2-m3-container`

**Goal:** Podium agent runs inside Docker when Docker is present.

**Files in:**
- `container/Dockerfile` — fork from nanoclaw/container/Dockerfile. Base `node:22-slim`. Install claude CLI. Non-root `node` user. Workdir `/app`.
- `container/entrypoint.sh` — reads a message from stdin (JSON `{"message": "..."}`) and invokes `npx tsx runtime/engine.ts --message ...`. Echoes result as JSON to stdout.
- `container/build.sh` — `docker build -t podium-agent:latest .`
- Volume mount strategy: `/workspace/roles` (ro), `/workspace/agent` (rw for memory).

**Acceptance:**
- `container/build.sh` produces image `podium-agent:latest`.
- `echo '{"message":"hi"}' | docker run -i --rm -v $(pwd)/roles:/workspace/roles:ro podium-agent:latest` returns a JSON reply.

**Session brief:**
> Fork NanoClaw's container setup (~/git/ally-references/references/nanoclaw/container/). Adapt: base image still node:22-slim, but entrypoint invokes our runtime (npx tsx runtime/engine.ts) not NanoClaw's. Mount roles/ read-only and agent/ read-write. No Baileys, no WhatsApp deps. Verify by building and piping a JSON message through docker run.

---

### M4 — Role preview + role/skill picker

**Size:** M
**Depends on:** M1
**Unblocks:** M5
**Isolation:** worktree `feat/setup-v0.2-m4-picker`

**Goal:** User sees what each role does before picking, then ticks which skills to enable.

**Files in:**
- `setup/role-preview.ts` — renders 4 role cards: name, 1-line purpose, 3 highlighted example skills.
- `setup/role-select.ts` — step that wraps role choice + skill checklist. Uses Claude Code's `AskUserQuestion` with `multiSelect: true` for skills.
- `roles/<role>/role.yaml` — add/update each role file to include `display_name`, `blurb`, `example_skills` (array of `{name, one_liner}`).
- Writes: `agent/memory/active-role.yaml` with `role` + `skills_enabled`.

**Status blocks:**
```
=== PODIUM SETUP: PREVIEW ===
ROLES_SHOWN: 4
STATUS: success
=== END ===

=== PODIUM SETUP: ROLE_CHOICE ===
ROLE: assistant
SKILLS_ENABLED: communicate,remember,summarize-email,schedule
SKILLS_AVAILABLE: 6
STATUS: success
=== END ===
```

**Acceptance:**
- Each of the 4 roles renders a card with the required fields.
- Skill checklist shows every `roles/<role>/skills/base/*` folder.
- Selection persisted in active-role.yaml per §C3.

**Session brief:**
> Build the role preview + picker step. Read all 4 role.yaml files under roles/. Render a preview with display_name, blurb, and 3 example skills. Use Claude Code AskUserQuestion for role selection, then a second AskUserQuestion (multiSelect) to let the user tick which base skills to enable — show the SKILL.md one-line description per skill as the option description. Write active-role.yaml per §C3 contract. Emit PREVIEW and ROLE_CHOICE status blocks. You'll need to add a `blurb` and `example_skills` field to each existing role.yaml.

---

### M5 — Onboarding runner + memory seeding

**Size:** M
**Depends on:** M4
**Unblocks:** M7, M9
**Isolation:** worktree `feat/setup-v0.2-m5-onboarding`

**Goal:** Ask questions from the role's `onboarding/questions.yaml` and persist answers into memory.

**Files in:**
- `setup/onboarding.ts` — loads `roles/<role>/onboarding/questions.yaml`; iterates; each question becomes an `AskUserQuestion` call.
- Writes: `roles/<role>/memory/context.md` with YAML frontmatter (onboarding answers) and a markdown body ("The user told us during setup…").
- Refines question schema in all 4 roles' `onboarding/questions.yaml` to a consistent shape: `id`, `prompt`, `type` (text|choice|multi), `options?`, `required`, `memory_key`.

**Memory file template:**
```
---
name: <from answer>
pronouns: <from answer>
primary_goal: <from answer>
timezone: <from bootstrap>
captured_at: <iso>
---

# What I know about you

<role-specific summary sentence>

Key goals:
- <from answers>

Preferred interaction style:
- <from answers>
```

**Status block:**
```
=== PODIUM SETUP: ONBOARDING ===
ROLE: assistant
ANSWERS: 5
MEMORY_PATH: roles/assistant/memory/context.md
STATUS: success
=== END ===
```

**Acceptance:**
- Every question in questions.yaml gets asked.
- Skipping optional questions works (user presses enter / "skip").
- Memory file exists with valid YAML frontmatter.
- Running the runtime after onboarding → dry-run context contains the memory content.

**Session brief:**
> Build the onboarding runner. Load roles/<role>/onboarding/questions.yaml (exists already, see current schema), normalize to: id, prompt, type (text/choice/multi), options?, required, memory_key. For each question, use AskUserQuestion. Collect answers. Write roles/<role>/memory/context.md with YAML frontmatter and markdown body per the template in spec/podium-setup-v0.2-decomposition.md §M5. Ensure the runtime (M2) picks up this file — coordinate if not.

---

### M6 — Channel step (CLI + Telegram)

**Size:** M
**Depends on:** M1
**Unblocks:** (parallel to others; feeds M10)
**Isolation:** worktree `feat/setup-v0.2-m6-channel`

**Goal:** User picks channels. CLI is always on. Telegram dispatches to a skill that collects token, authenticates, and registers.

**Files in:**
- `setup/channel.ts` — step that shows channel options (CLI, Telegram). Multi-select.
- `.claude/skills/add-telegram/SKILL.md` — new skill forked from NanoClaw's add-telegram. Collects bot token via AskUserQuestion, writes `.env`, does a `/start` handshake, updates `channels.yaml`.
- `runtime/channels.yaml` — schema clarified: `enabled: [cli, telegram]`.

**Status block:**
```
=== PODIUM SETUP: CHANNEL ===
CHANNELS: cli,telegram
TELEGRAM_BOT: @podium_example_bot
STATUS: success
=== END ===
```

**Acceptance:**
- User can pick CLI only → no secrets prompted.
- User can add Telegram → bot token stored in .env (gitignored), `/start` returns a reply from the bot.

**Session brief:**
> Build the channel step. CLI is always enabled (implicit). Telegram is opt-in. If chosen, delegate to a new /add-telegram skill that forks nanoclaw's equivalent (~/git/ally-references/references/nanoclaw/.claude/skills/add-telegram/SKILL.md). That skill: collects bot token, writes .env, hits the Telegram getMe API to verify, registers a default chat. Out-of-scope v0.2: WhatsApp, Slack, Discord.

---

### M7 — Routine designer

**Size:** M
**Depends on:** M5
**Unblocks:** (feeds M10)
**Isolation:** worktree `feat/setup-v0.2-m7-routines`

**Goal:** Ask the user what the agent should do for them on a recurring schedule. Generate a structured routine spec.

**Files in:**
- `setup/routine.ts` — step that asks 1-3 prompts: "What should the agent do for you regularly?", optionally "When?", "What inputs does it need?". Sends to an LLM (via runtime) to structure into a routine YAML. Shows the generated YAML. Lets the user approve/edit/skip.
- `schemas/routine.schema.yaml` — JSON schema for a routine: `id`, `name`, `when` (cron or interval), `what` (prompt), `inputs` (array), `enabled`.
- **Overwrites**: `roles/<role>/schedule.yaml` (note: this file ships with example routines as a template; routine designer replaces its content with user-generated routines).

**Example generated routine:**
```yaml
routines:
  - id: morning-inbox
    name: Morning inbox summary
    when: "0 8 * * *"
    what: "Summarize my unread email from the last 24 hours, group by sender, flag anything time-sensitive."
    inputs: [gmail]
    enabled: true
```

**Status block:**
```
=== PODIUM SETUP: ROUTINE ===
ROUTINES_CREATED: 1
SCHEDULE_PATH: roles/assistant/schedule.yaml
STATUS: success
=== END ===
```

**Acceptance:**
- User can skip (0 routines, still success).
- User can create 1-3 routines; each passes schema validation.
- File is valid YAML.
- LLM does NOT auto-commit — user sees and approves.

**Session brief:**
> Build the routine designer. Ask the user (natural language) what they want the agent to do on a recurring basis. Use the runtime to structure the answer into a routine YAML matching schemas/routine.schema.yaml. Show the generated YAML and ask the user to approve / edit / skip. Write to roles/<role>/schedule.yaml. No executor in v0.2 — just capture. Ensure the YAML schema is strict enough that a future executor can consume it safely.

---

### M8 — Install step (Docker build or venv)

**Size:** M
**Depends on:** M2, M3
**Unblocks:** M9
**Isolation:** worktree `feat/setup-v0.2-m8-install`

**Goal:** Commit to a runtime (Docker or native Node) and prepare the machine.

**Files in:**
- `setup/install.ts` — decision logic: if BOOTSTRAP reported `DOCKER_RUNNING: true`, invoke `container/build.sh`. Else ensure `npm install` completes and record `RUNTIME: native`.
- `setup/runtime.ts` — small helper: `resolveRuntime(): 'docker' | 'native'` based on `DOCKER_RUNNING` env.
- Writes: `agent/memory/active-role.yaml` extended with `runtime: docker|native`.

**Status block:**
```
=== PODIUM SETUP: INSTALL ===
RUNTIME: docker
IMAGE: podium-agent:latest
STATUS: success
=== END ===
```

**Acceptance:**
- With Docker: image builds, status block shows image tag.
- Without Docker: `npm install` completes, status block shows `RUNTIME: native`.
- Either way: `runtime: <x>` written to active-role.yaml.

**Session brief:**
> Build the install step. If Docker is running (check via `docker info` exit code, or read the BOOTSTRAP status from an env var), shell out to container/build.sh (M3). Else run `npm install` if needed. Record the runtime choice in active-role.yaml. Keep it idempotent — re-runs must be safe.

---

### M9 — Verify with personalized probe

**Size:** S
**Depends on:** M2, M5
**Unblocks:** M10
**Isolation:** worktree `feat/setup-v0.2-m9-verify`

**Goal:** End-to-end health check that uses the seeded memory, not a generic self-ID.

**Files in:**
- `setup/verify.ts` — port & extend existing verify logic. Steps: (a) role dir exists, (b) identity files present, (c) skills_enabled are a subset of available, (d) memory/context.md exists, (e) fire one live probe using a prompt that *must* reference onboarding data.
- `.claude/skills/podium-verify/SKILL.md` — minor edits: probe prompt becomes "Greet me by name and summarize what you know about me in one sentence."
- Probe success = response contains the user's name from memory.

**Status block:**
```
=== PODIUM SETUP: VERIFY ===
ROLE: assistant
BOOT_STATUS: success
PROBE_STATUS: success
PROBE_PERSONALIZED: true
LATENCY_MS: 2412
STATUS: success
=== END ===
```

**Acceptance:**
- Probe reply contains the name captured in onboarding.
- If probe misses personalization, `PROBE_PERSONALIZED: false` + remediation hint.
- Latency reported.

**Session brief:**
> Port setup/verify.py to setup/verify.ts. Add one step: the probe's success now requires the response to mention the user's name from roles/<role>/memory/context.md. If missing, diagnose: is context.md being loaded by runtime/context.ts? Report PROBE_PERSONALIZED as its own field. Also update .claude/skills/podium-verify/SKILL.md so the probe prompt is "Greet me by name…".

---

### M10 — Rewrite `/podium-setup` SKILL

**Size:** M
**Depends on:** M4, M5, M6, M7, M8, M9 (interfaces stable)
**Unblocks:** done
**Isolation:** worktree `feat/setup-v0.2-m10-skill`

**Goal:** One cohesive orchestration that uses every module above, with TaskCreate visibility and time heads-up.

**Files in:**
- `.claude/skills/podium-setup/SKILL.md` — full rewrite. Order:
  1. Print heads-up: "This takes ~15 min. 9 steps."
  2. `TaskCreate` — 9 tasks, one per step.
  3. Run `./setup.sh` (M1).
  4. `npx tsx setup/index.ts --step role-select` (M4).
  5. `--step onboarding` (M5).
  6. `--step channel` (M6).
  7. `--step routine` (M7).
  8. `--step install` (M8).
  9. `--step verify` (M9).
  10. Auto-invoke `/podium-verify`.
  11. Print usage summary.
- Each step entry: `TaskUpdate in_progress`; on success: `completed`; on fail: diagnose and stop.
- Failure remediation table (forked from current SKILL) updated for Node/TS.

**Acceptance:**
- In a fresh clone, invoking `/podium-setup` produces a visible TaskCreate list, each step marked in order, ending with a personalized probe reply.
- Total wall-clock ≤ 20 min on reference mac.

**Session brief:**
> You're the integration agent. Every other module is built. Rewrite .claude/skills/podium-setup/SKILL.md as the single orchestrator. At start: print "~15 min, 9 steps", then TaskCreate with 9 items. Walk each step: update to in_progress → run → parse status block → update to completed. Rebuild the failure remediation table for Node/TS (replace pip/venv rows with npm/node/docker rows). End with automatic /podium-verify and the usage summary (retain current format but swap Python paths for TS paths).

---

### M11 — Test migration

**Size:** L (ongoing; finalize last)
**Depends on:** M1-M9 individually (each module adds tests as it lands)
**Unblocks:** green CI
**Isolation:** a single test-suite worktree `feat/setup-v0.2-m11-tests` (or per-module as work lands)

**Goal:** Replace pytest with a Node test framework; preserve the four test layers.

**Files in:**
- `package.json` scripts: `test`, `test:l1`, `test:l2`, `test:l3`, `test:contracts`.
- `vitest.config.ts` (or `jest.config.ts` — pick one early).
- `tests/contracts/role-contract.test.ts` — port 9 assertions × 4 roles.
- `tests/l1_boot/*.test.ts` — port mocked YAML loader, skill discovery, role resolution.
- `tests/l2_setup/*.test.ts` — subprocess-driven, parses status blocks.
- `tests/l3_behavior/*.test.ts` — live, gated by `LIVE=1` env (replaces `@live`).
- Delete `tests/**/*.py` and `pytest.ini` as soon as parity achieved.

**Acceptance:**
- `npm test` exits 0 on reference mac.
- Each layer independently runnable.
- CI config updated (if present) to use npm test.

**Session brief:**
> Migrate the test suite from pytest to vitest. Keep the four-layer structure (contracts, l1_boot, l2_setup, l3_behavior). Port each test faithfully. L2 tests parse stdout status blocks — that shape is stable (see §C1). L3 tests shell to `claude -p`; gate with `LIVE=1`. Delete the Python tests only after the TS parity tests are green. Add `npm test` + per-layer scripts to package.json.

---

### M12 — Uninstall skill

**Size:** S
**Depends on:** M0 (optional)
**Unblocks:** independent
**Isolation:** worktree `feat/setup-v0.2-m12-uninstall`

**Goal:** Fix NanoClaw's "no rollback" gap.

**Files in:**
- `.claude/skills/podium-uninstall/SKILL.md` — new skill. Removes: docker image (`podium-agent:*`), systemd/launchd service (if M13 installed it), `.env`, `agent/memory/active-role.yaml`, generated `roles/<role>/memory/context.md`. **Restores** (not deletes) `roles/<role>/schedule.yaml` via `git checkout HEAD -- <path>` because that file is a shipped template M7 overwrites. Preserves identity/style/skills/knowledge/onboarding source so a re-install is clean.

**Acceptance:**
- Run on a fully-installed clone → a subsequent `/podium-setup` behaves like a fresh install.

**Session brief:**
> Build /podium-uninstall. Reverse every side-effect v0.2 setup made, preserving shipped role source. Explicit list of artifacts to nuke in spec/podium-setup-v0.2-decomposition.md §M12. Ask the user to confirm before deleting. Smoke-test: install → uninstall → install → verify.

---

### M13 — Service wiring (launchd/systemd)

**Size:** M
**Depends on:** M2
**Unblocks:** v0.3 scheduler execution
**Isolation:** worktree `feat/setup-v0.2-m13-service`

**Goal:** Lay groundwork so v0.3's scheduler has somewhere to run.

**Files in:**
- `setup/service.ts` — fork nanoclaw/setup/service.ts. Writes launchd plist on macOS, systemd unit on Linux.
- Service runs `npx tsx runtime/scheduler.ts` (stub for now — scheduler executor is v0.3).
- Skipped in v0.2 setup flow by default (flag `--with-service` to enable); spec is ready when v0.3 lands.

**Acceptance:**
- `--with-service` flag writes plist/unit file to correct location.
- `launchctl list | grep podium` or `systemctl status podium` shows the service.
- No-op without the flag.

**Session brief:**
> Fork nanoclaw's service wiring. Build setup/service.ts that installs a launchd plist (macOS) or systemd unit (Linux). The service target is `npx tsx runtime/scheduler.ts` — fine if that script is a stub today; it lands for real in v0.3. Opt-in via `--with-service` flag; default off.

---

## Checkpoints

After each wave, do this in the main thread (not in a worktree):

1. Merge completed worktrees to `feat/setup-v0.2`.
2. Run `npm test` — all green.
3. Refresh `spec/podium-setup-v0.2.md` "Status" header if a goal shifted.
4. Update this decomposition doc's module status (add 🟢/🟡/🔴 beside each).

---

## Handoff-ready session table

| Module | Size | Agent brief | Worktree branch |
|---|---|---|---|
| M0 | XS | §M0 | direct |
| M1 | M | §M1 | `feat/setup-v0.2-m1-bootstrap` |
| M2 | L | §M2 | `feat/setup-v0.2-m2-runtime` |
| M3 | M | §M3 | `feat/setup-v0.2-m3-container` |
| M4 | M | §M4 | `feat/setup-v0.2-m4-picker` |
| M5 | M | §M5 | `feat/setup-v0.2-m5-onboarding` |
| M6 | M | §M6 | `feat/setup-v0.2-m6-channel` |
| M7 | M | §M7 | `feat/setup-v0.2-m7-routines` |
| M8 | M | §M8 | `feat/setup-v0.2-m8-install` |
| M9 | S | §M9 | `feat/setup-v0.2-m9-verify` |
| M10 | M | §M10 | `feat/setup-v0.2-m10-skill` |
| M11 | L | §M11 | `feat/setup-v0.2-m11-tests` |
| M12 | S | §M12 | `feat/setup-v0.2-m12-uninstall` |
| M13 | M | §M13 | `feat/setup-v0.2-m13-service` |

**Total:** 14 modules, 13 parallelizable, 5 waves.
