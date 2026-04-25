---
name: podium-setup
description: Run the full Podium v0.2 setup — preflight, pick a role, choose skills, seed memory from onboarding, configure channels, design routines, install runtime, optional service, verify. Uses TaskCreate to track 9 steps (~15 min). Triggers on "podium setup", "install podium", "configure podium", or first-time Podium setup requests.
---

# Podium Setup

You are the orchestrator. Run each step in order. Track progress via TaskCreate. Never mark a task complete on a non-success STATUS. At the end, auto-invoke `/podium-verify` and print a personalized summary.

## 0. Open with the heads-up

Before anything else, say this (verbatim):

```
Podium setup takes ~15 minutes. I'll walk you through 9 steps and track
progress as we go. You can stop any time — your state saves per step.
```

Then call `TaskCreate` once, creating these 9 tasks in order. Use clear, user-facing titles:

1. Preflight check (Node, Docker, timezone, claude CLI)
2. Pick your role
3. Choose your skills
4. Onboarding questions
5. Connect a channel
6. Design recurring routines
7. Install runtime
8. Set up background service (optional)
9. Verify and meet your agent

Keep all 9 task IDs in memory — you'll `TaskUpdate` them by ID.

## Conventions

Every step emits a status block of the form:

```
=== PODIUM SETUP: <NAME> ===
KEY: value
...
STATUS: success|<failure_code>
=== END ===
```

Parse it. On `STATUS: success`, `TaskUpdate` the step to `completed` and continue. On anything else, use the failure table in the matching section to diagnose, remediate with the user's help, and retry. Do NOT mark completed until retry succeeds.

---

## Step 1 — Preflight

TaskUpdate #1 → `in_progress`.

Run:
```
bash setup.sh
```

Parse the `BOOTSTRAP` block. Cache `PLATFORM`, `TZ`, `DOCKER_RUNNING`, `NODE_VERSION`, `CLAUDE_CLI` — later steps use these.

| Failure | Fix |
|---|---|
| `STATUS: node_missing` | Ask user to install Node ≥20 (https://nodejs.org or `brew install node`). Retry. |
| `NODE_OK: false` with old version | Same — Node ≥20 required. |
| `CLAUDE_CLI: missing` | Ask user to install Claude Code (https://claude.ai/download). Retry. |
| `DOCKER_PRESENT: false` | Not a failure — note it. Step 7 will use the native path. |
| `DOCKER_PRESENT: true, DOCKER_RUNNING: false` | Note it. Step 7 will ask whether to start Docker or fall back. |

TaskUpdate #1 → `completed` once STATUS is success.

---

## Step 2 — Pick your role

TaskUpdate #2 → `in_progress`.

Run:
```
npx tsx setup/role-select.ts --mode list
```

Parse `PREVIEW` block → extract the `DATA:` JSON. It contains all 4 roles with `display_name`, `blurb`, and `example_skills`.

Present to the user via `AskUserQuestion` (single-select). For each role, build an option with:
- `label` = `display_name`
- `description` = `blurb + "\n" + 3 example_skills one-liners`

After the user picks, cache the selected `role_id`. Don't commit yet — the skill list comes from step 3.

---

## Step 3 — Choose your skills

TaskUpdate #3 → `in_progress`.

From the PREVIEW DATA, extract `all_skills` for the chosen role. Use `AskUserQuestion` with `multiSelect: true`:

- Question: `"Which skills should your ${display_name} start with? You can change these later."`
- Options: one per skill, `label` = skill name, `description` = skill's one-liner from SKILL.md frontmatter.

At least 1 skill must be selected. If the user selects 0, re-ask.

Once selected, commit:
```
npx tsx setup/role-select.ts --mode commit --role <role_id> --skills "<comma,separated>"
```

Parse `ROLE_CHOICE` block.

| Failure | Fix |
|---|---|
| `STATUS: invalid_role` | Re-run step 2 (role-select --mode list) and reask. |
| `STATUS: invalid_skill` | `INVALID_SKILLS:` lists the offenders. Show them and re-ask. |

TaskUpdate #2 → `completed` AND TaskUpdate #3 → `completed` when success.

---

## Step 4 — Onboarding questions

TaskUpdate #4 → `in_progress`.

Run:
```
npx tsx setup/onboarding.ts --mode list
```

Parse `ONBOARDING` block → extract `DATA:` JSON → `questions[]`. For each question, present via `AskUserQuestion`:
- `type: text` → no options, user enters text
- `type: choice` → single-select from `options`
- `type: multi` → multi-select from `options`

Required questions must have an answer (don't accept empty). Optional ones can be skipped.

Collect answers into a JSON map keyed by `id`. Commit:
```
npx tsx setup/onboarding.ts --mode commit --answers '<json>'
```

Parse ONBOARDING block. `MEMORY_PATH:` confirms the seed landed.

| Failure | Fix |
|---|---|
| `STATUS: missing_required` | `MISSING_REQUIRED:` lists IDs. Re-ask those questions. |
| `STATUS: invalid_answer` | Show which answer was malformed, re-ask. |
| yaml parse error on questions.yaml | Log path, tell user to inspect `roles/<role>/onboarding/questions.yaml`. |

TaskUpdate #4 → `completed` on success.

---

## Step 5 — Connect a channel

TaskUpdate #5 → `in_progress`.

Run:
```
npx tsx setup/channel.ts --mode list
```

Parse `CHANNEL` block. Available channels today are `cli` (always on) and `telegram` (opt-in).

`AskUserQuestion` (multi-select):
- `cli` — default, always on. Include as a pre-checked option.
- `telegram` — description: "Chat with your agent via Telegram. Needs a bot token from @BotFather."

Build a comma list from the selection. Commit:
```
npx tsx setup/channel.ts --mode commit --channels "<list>"
```

If `telegram` is included, the block shows `TELEGRAM_PENDING: true`. Invoke `/add-telegram` inline — that skill collects the bot token, writes `.env`, hits `getMe` for verification, and flips `runtime/channels.yaml`.

| Failure | Fix |
|---|---|
| `STATUS: unknown_channel` | Re-ask with only valid options. |
| `/add-telegram` reports `auth_failed` | Bot token rejected by Telegram. Re-enter. |
| `/add-telegram` reports `network_error` | Check internet, retry. |

TaskUpdate #5 → `completed` when channel commit succeeds AND (if telegram was chosen) /add-telegram completed.

---

## Step 6 — Design recurring routines

TaskUpdate #6 → `in_progress`.

Run:
```
npx tsx setup/routine.ts --mode list
```

Parse `ROUTINE` block → `DATA.starters[]` (3 role-tailored starter prompts). Show them as examples, then ask the user:

- `AskUserQuestion`: `"What should your agent do for you on a recurring basis? Describe one routine, or skip."`
- Options: `["Tell me one I should set up", "Skip for now"]`
  - If "Tell me one", show the starter prompts as a single-select; user picks → pipe that text into generate.
  - If "Skip for now", jump to skip mode.

For each routine the user describes:
```
npx tsx setup/routine.ts --mode generate --description "<text>"
```

Parse `ROUTINE` block → show the `DATA.routine` YAML to the user. `AskUserQuestion`:
- `Approve` — add to collection
- `Edit` — offer to tweak `when`, `what`, `inputs` via follow-up questions
- `Discard` — drop it
- `Add another` — loop back

When the user is done (or picked "Skip"), commit:
```
npx tsx setup/routine.ts --mode commit --routines '<json array>'
```
or if skipping:
```
npx tsx setup/routine.ts --mode skip
```

| Failure | Fix |
|---|---|
| `STATUS: generation_failed` | LLM couldn't produce valid YAML — show error, ask user to rephrase. |
| `STATUS: invalid_schema` | Schema validation failed on edited routine. Show what's wrong, offer edit. |

TaskUpdate #6 → `completed` on success (including skip).

---

## Step 7 — Install runtime

TaskUpdate #7 → `in_progress`.

Run:
```
npx tsx setup/install.ts --mode detect
```

Parse `INSTALL` block → `RUNTIME` = `docker` or `native`.

If `RUNTIME: docker` AND `DOCKER_RUNNING: true` → proceed silently.
If `DOCKER_AVAILABLE: true, DOCKER_RUNNING: false` → `AskUserQuestion`: "Docker's installed but not running. Start Docker and retry, or fall back to the native Node runtime?" Options: `["Fall back to native", "I'll start Docker — retry"]`. If native, set env `PODIUM_RUNTIME=native` for the next call.
If `DOCKER_AVAILABLE: false` → proceed silently with native.

Run the install:
```
npx tsx setup/install.ts --mode install
```

Docker path may take 3-5 minutes (image build). Tell the user. Native path is usually < 30s.

| Failure | Fix |
|---|---|
| `STATUS: docker_build_failed` | Show `LOG: logs/docker-build.log`. Fall back to native with user ok. |
| `STATUS: npm_install_failed` | Show last 20 lines of `logs/npm-install.log`. Likely network issue; retry. |

TaskUpdate #7 → `completed` on success.

---

## Step 8 — Set up background service (optional)

TaskUpdate #8 → `in_progress`.

Run:
```
npx tsx setup/service.ts --mode list
```

Parse `SERVICE` block. Show `SERVICE_MANAGER` and `SERVICE_FILE` (where it would write).

`AskUserQuestion`:
- `"Install a background service now?"` — options: `["Skip for now (recommended for v0.2 — routine executor lands in v0.3)", "Install it"]`

If skip → TaskUpdate #8 → `completed` with no action.
If install:
```
npx tsx setup/service.ts --mode install
```
Parse SERVICE block. Note that `SERVICE_LOADED: false` is expected — v0.2 doesn't auto-load.

TaskUpdate #8 → `completed` on success.

---

## Step 9 — Verify and meet your agent

TaskUpdate #9 → `in_progress`.

Invoke `/podium-verify` directly in this same session. That skill runs `npx tsx setup/verify.ts --mode full`, parses the VERIFY block, and reports.

If the probe succeeds AND `PROBE_PERSONALIZED: true` → TaskUpdate #9 → `completed`, move to closing summary.

| Failure | Fix |
|---|---|
| `BOOT_STATUS: failed, REASON: role_dir_missing` | Re-run step 2. |
| `BOOT_STATUS: failed, REASON: invalid_skills` | Re-run step 3. |
| `PROBE_STATUS: skipped, REASON: memory_not_present` | Re-run step 4. |
| `PROBE_STATUS: timeout` | Network or cold start. Retry `/podium-verify` once. |
| `PROBE_PERSONALIZED: false, REASON: memory_not_loaded_by_runtime` | Check `roles/<role>/memory/context.md` exists and is valid YAML frontmatter. Show the file path. |
| `runtime/engine.ts` error: `claude` not found | `export PATH="$HOME/.local/bin:$PATH"` and retry. |
| `claude -p` stderr mentions auth | `claude login` and retry. |

---

## Closing summary

Read the final state to build the summary:

- `role` + `skills_enabled` + `channels` + `runtime` from `agent/memory/active-role.yaml`
- `name` from the frontmatter of `roles/<role>/memory/context.md`
- `LATENCY_MS` from the VERIFY block
- A short excerpt (first 120 chars) of the probe response

Print this (substitute variables):

```
✅ Podium is live, <name>. Your <display_name> is ready.

Role:      <display_name>
Skills:    <skills_enabled joined with ", ">
Channels:  <channels joined with ", ">
Runtime:   <runtime>
Response:  "<probe response excerpt>..." (<latency_ms> ms)

── Talk to your agent ──────────────────────────────
• Live chat (recommended):
    npm run chat
• One-shot from terminal:
    npx tsx runtime/engine.ts --message "your question"
• Re-check health any time: /podium-verify
• Start over cleanly: /podium-uninstall, then /podium-setup

── Personalize ─────────────────────────────────────
• Voice & tone:       roles/<role>/identity/style.yaml
• Purpose & values:   roles/<role>/identity/constitution.md
• Memory:             roles/<role>/memory/context.md
• Routines:           roles/<role>/schedule.yaml  (executor lands in v0.3)
After any edit, re-run /podium-verify.

── Build your own role ─────────────────────────────
1.  cp -r roles/<role> roles/<your-role>
2.  Edit identity/constitution.md + identity/style.yaml for your voice.
3.  Replace skills/base/* with your capabilities (each is one SKILL.md).
4.  Activate:
      npx tsx setup/role-select.ts --mode commit --role <your-role> --skills "..."
5.  /podium-verify.

The workshop/design-template.md walks the full design conversation.
```

Do not add anything after the summary. Let the user take the next step.

---

## Cross-cutting behaviors

**TaskUpdate discipline.** Every step enters `in_progress` at start and exits `completed` on STATUS: success. On partial/failed, keep `in_progress` until fixed. Never skip a step silently.

**Interrupt handling.** If the user says "stop" or "pause" mid-flow, acknowledge, leave the current task `in_progress`, and explain that running `/podium-setup` again will resume from where state indicates (`active-role.yaml` presence, memory file presence, etc.).

**Non-destructive retries.** Every step is idempotent. Re-running a successful step should not corrupt state — the underlying modules (M1-M9) are all designed that way.

**Don't over-narrate.** Between steps, a one-line status like "Role captured. Next: skills." is enough. The TaskCreate list is the primary visibility affordance.
