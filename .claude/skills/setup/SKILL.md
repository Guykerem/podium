---
name: setup
description: Run initial Podium setup. Bootstraps deps, asks the user which role (flavor) to activate, writes active-role.yaml, and hands off to /verify for a live probe. Triggers on "setup", "install", "configure podium", or first-time setup requests.
---

# Podium Setup

Run setup steps automatically. Only pause when user input is required (role choice).

## 0. Bootstrap (deps check)

Run `./setup.sh` and parse the `BOOTSTRAP` status block.

- `PYTHON_OK: false` → ask the user to install Python 3.10+, re-run.
- `DEPS_OK: false` → read `logs/setup.log`, try `pip install -r runtime/requirements.txt -r requirements-dev.txt`. If PEP-668 blocks system install, the script falls back to a venv at `.venv/` — remind the user to `source .venv/bin/activate` for subsequent commands.
- `CLAUDE_CLI: missing` → ask the user to install Claude Code (https://claude.ai/download) and re-run.

## 1. Choose Role

Ask the user which role (flavor) to activate. Use `AskUserQuestion` with these options:

- **agent-architect** — Designer: helps you craft your own agent
- **assistant** — Personal assistant: tasks, calendar, email
- **tutor** — Private tutor: research, learning plans, quizzes
- **creator** — Content creator: scripts, transcripts, platform formatting

## 2. Install

Run `python -m setup --step install --role <chosen>` and parse the `INSTALL` status block.

- `STATUS: success` → continue.
- `STATUS: invalid_role` → re-ask for role.
- `STATUS: claude_cli_missing` → same remediation as bootstrap.
- `STATUS: deps_failed` → show log path, try reinstall.

## 3. Verify Boot

Run `python -m setup --step verify` and parse the `VERIFY` status block.

- `BOOT_STATUS: success` → proceed.
- Otherwise → report which role and why; user can pick a different role.

## 4. Hand Off to /verify

Invoke the `/verify` skill (or run it in the background via `Bash(run_in_background=true)`):

```
python runtime/engine.py --message "In one short sentence: who are you?"
```

Tell the user:
> "Setup complete — role <X> is active. A live probe is running in the background; /verify will surface the result."

## 5. Next Step

Point the user at two commands:
- `python runtime/engine.py --message "<your message>"` — single-turn chat
- `/verify` — re-run health check any time
