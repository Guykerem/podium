---
name: podium-uninstall
description: Reverse a Podium install cleanly — remove generated state (active-role, generated memory, .env, Docker image, installed service) while preserving all shipped role source. Triggers on "podium uninstall", "remove podium", "reset podium", "clean podium install", or when the user wants a fresh-install starting point.
---

# Podium Uninstall

Cleanly reverses a Podium v0.2 install. Addresses NanoClaw's "no rollback" gap. Leaves the repo in a state where `/podium-setup` behaves like a first-time install.

## Principles

- **Never touch shipped source.** Identity files, SKILL.md files, knowledge folders, onboarding questions, role.yaml — all preserved.
- **Restore, don't delete, tracked templates.** `schedule.yaml` ships with example routines. Uninstall uses `git checkout HEAD -- <path>` to reset it, not `rm`.
- **Confirm before destroying.** Inventory first, show the user, ask once.
- **Idempotent.** Running on a clean/never-installed repo says "nothing to remove" and exits success.
- **Per-platform awareness.** Don't try `docker` if Docker absent; don't `launchctl` on Linux.

## 1. Inventory scan

Detect what's installed. Emit a preview before any destruction. Collect each into a "will remove" list:

| Artifact | Check |
|---|---|
| Docker image | `docker image ls podium-agent --format '{{.ID}}'` → any output = present |
| Service (macOS) | `test -f ~/Library/LaunchAgents/com.podium.agent.plist` |
| Service (Linux) | `systemctl --user list-unit-files podium.service 2>/dev/null \| grep -q podium` |
| `.env` | `test -f .env` |
| Active role | `test -f agent/memory/active-role.yaml` |
| Generated memory | For each role in `roles/*/`: `test -f roles/<role>/memory/context.md` |
| Overwritten schedule | For each role in `roles/*/`: `git diff --quiet HEAD -- roles/<role>/schedule.yaml` → non-zero means modified |
| `.venv/` (legacy v0.1) | `test -d .venv` |
| `node_modules/` | `test -d node_modules` |
| Setup logs | `test -f logs/setup.log` |

If every check comes back empty → print "Nothing to uninstall. Podium is already in a fresh state." and exit 0.

## 2. Present the plan

Show the user the complete list of what will be removed (`rm`) vs restored (`git checkout`) vs preserved. Use a clear visual:

```
Podium uninstall plan
─────────────────────
Will REMOVE:
  • Docker image: podium-agent:latest  (420 MB)
  • launchd service: com.podium.agent
  • .env
  • agent/memory/active-role.yaml
  • roles/assistant/memory/context.md  (generated, 1.2 KB)
  • logs/setup.log

Will RESTORE to shipped template (git checkout):
  • roles/assistant/schedule.yaml

Will PRESERVE (shipped source, untouched):
  • All roles/*/identity/
  • All roles/*/skills/
  • All roles/*/knowledge/
  • All roles/*/onboarding/
  • All roles/*/role.yaml
  • agent/identity/, agent/skills/, agent/program.md, agent/autonomy.yaml
  • node_modules/  (large, ask separately below)
```

Then use `AskUserQuestion` with three options:

- **Proceed** — remove everything in the list above
- **Proceed + also remove node_modules** — adds `rm -rf node_modules` (asked only if node_modules present; not asked otherwise)
- **Cancel** — abort, no changes

If the user picks Cancel → print "Uninstall cancelled. No changes made." and exit 0.

## 3. Execute removal

Work through the list in this order. Skip any step whose artifact was absent in the scan. Log each action to stdout.

### 3a. Stop the service (if installed)

**macOS:**
```
launchctl unload ~/Library/LaunchAgents/com.podium.agent.plist 2>/dev/null || true
rm -f ~/Library/LaunchAgents/com.podium.agent.plist
```

**Linux:**
```
systemctl --user disable --now podium.service 2>/dev/null || true
rm -f ~/.config/systemd/user/podium.service
systemctl --user daemon-reload 2>/dev/null || true
```

### 3b. Remove Docker image (if Docker present and image exists)

```
docker rmi podium-agent:latest 2>/dev/null || true
# Also nuke any older tagged builds
docker image ls podium-agent --format '{{.Repository}}:{{.Tag}}' | xargs -r docker rmi 2>/dev/null || true
```

Do NOT prune all Docker resources — only the podium-agent image.

### 3c. Remove generated files

```
rm -f .env
rm -f agent/memory/active-role.yaml
rm -f logs/setup.log
```

### 3d. Remove per-role generated memory, restore per-role schedule

For each directory under `roles/`:

```
# Remove generated memory seed (not shipped)
rm -f roles/<role>/memory/context.md

# Restore shipped schedule.yaml template (overwritten by M7 routine designer)
git checkout HEAD -- roles/<role>/schedule.yaml 2>/dev/null || true
```

Guardrail: if `roles/<role>/memory/context.md` IS tracked by git (check with `git ls-files --error-unmatch`), restore via `git checkout HEAD --` instead of deleting. (Currently only `agent/memory/context.md` ships as a tracked template; role-level memory files are always generated. But checking is cheap insurance.)

### 3e. Remove legacy venv and optional node_modules

```
rm -rf .venv   # legacy from v0.1, always safe to remove
```

If the user chose "Proceed + also remove node_modules":

```
rm -rf node_modules
```

## 4. Summary

Print a summary block:

```
=== PODIUM SETUP: UNINSTALL ===
REMOVED_DOCKER_IMAGE: true|false|n/a
REMOVED_SERVICE: true|false|n/a
REMOVED_ENV: true|false|n/a
REMOVED_ACTIVE_ROLE: true|false|n/a
REMOVED_MEMORY_SEEDS: <count>
RESTORED_SCHEDULES: <count>
REMOVED_VENV: true|false|n/a
REMOVED_NODE_MODULES: true|false|skipped
PRESERVED_SHIPPED_SOURCE: true
STATUS: success
=== END ===
```

Then a human-readable closer:

```
✅ Podium uninstalled.

Shipped role source is untouched. To re-install:
  /podium-setup

To fully wipe the repo (including node_modules and any unused deps), run:
  rm -rf node_modules && ./setup.sh
```

## 5. Error handling

- Any single step failing (permission denied, Docker daemon off mid-run, etc.) → log the specific failure, continue with remaining steps, mark that field in the status block as `failed`, end with `STATUS: partial`.
- Never leave the repo in a half-destroyed state that blocks re-install. If unsure whether to proceed on an error, skip and report.
- If `git checkout HEAD -- <path>` fails (e.g., uncommitted repo state), surface the error and tell the user to inspect manually — don't blindly delete.

## 6. Safety rails

- **Never** touch: `roles/<role>/identity/`, `roles/<role>/skills/`, `roles/<role>/knowledge/`, `roles/<role>/onboarding/`, `roles/<role>/role.yaml`, `agent/identity/`, `agent/skills/`, `agent/knowledge/`, `agent/learning/`, `agent/program.md`, `agent/autonomy.yaml`, `agent/memory/context.md` (that is shipped template, not per-role generated memory), `spec/`, `runtime/`, `setup/`, `container/`, `.claude/skills/`, `tests/`, `workshop/`.
- **Never** run `rm -rf /`, `rm -rf ~`, or any command whose target is not a specific Podium-generated artifact.
- **Never** run `git reset --hard`, `git clean -fd`, or any operation that would clobber user work outside the known artifact list.
- Operate only within the repo root. Resolve the repo root via `git rev-parse --show-toplevel` before running any destructive command.

## Self-test

Three scenarios to verify before shipping this skill:

1. **After a Docker install**: `/podium-setup` (pick any role, minimal onboarding, enable routine) → `/podium-uninstall` → confirm image gone, .env gone, active-role.yaml gone, schedule.yaml back to shipped template. Then re-run `/podium-setup` and confirm it behaves like a first-time install.

2. **After a native/venv install**: same flow but with Docker absent. Uninstall should skip the Docker step gracefully, remove everything else, exit success.

3. **On a never-installed clone**: fresh `git clone`, run `/podium-uninstall`. Should print "Nothing to uninstall" and exit 0 without prompting for confirmation.
