---
name: podium-setup
description: Run initial Podium setup. Bootstraps deps, asks the user which role to activate, writes active-role.yaml, auto-runs /podium-verify, and ends with a usage summary. Triggers on "podium setup", "install podium", "configure podium", or first-time Podium setup requests.
---

# Podium Setup

Run setup steps automatically. Only pause when user input is required (role choice). At the end, verify health and print a clear usage summary.

## 0. Bootstrap (deps check)

Run `./setup.sh` and parse the `BOOTSTRAP` status block.

- `PYTHON_OK: false` → ask the user to install Python 3.10+, re-run.
- `DEPS_OK: false` → read `logs/setup.log`, try `pip install -r runtime/requirements.txt -r requirements-dev.txt`. If PEP-668 blocks system install, the script falls back to a venv at `.venv/` — remind the user to `source .venv/bin/activate` for subsequent commands.
- `CLAUDE_CLI: missing` → ask the user to install Claude Code (https://claude.ai/download) and re-run.

## 1. Choose Role

Ask the user which role to activate. Use `AskUserQuestion` with these options:

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

## 4. Auto-Run /podium-verify

Invoke `/podium-verify` directly in this same session. Do NOT defer to the user — run it now and surface the result inline.

If the probe succeeds, show the latency and a trimmed response preview. Move to step 5.

If the probe fails, diagnose and recommend a specific fix before ending:

| Failure signal | Likely cause | Recommended fix |
|---|---|---|
| `claude` binary not found during probe | PATH issue | `export PATH="$HOME/.local/bin:$PATH"` and retry `/podium-verify` |
| `claude -p` exits non-zero, stderr mentions auth | Not logged in | Run `claude login`, then `/podium-verify` |
| Timeout after 30s | Network or model cold start | Retry `/podium-verify` once; if still red, check internet |
| Response present but keyword missing | Identity file thin/empty | Open `roles/<role>/identity/constitution.md` — fill in or restore from git |
| `ModuleNotFoundError: yaml` in engine.py | Wrong Python picked up deps | `source .venv/bin/activate` then retry |

Always point to `logs/setup.log` as the last-resort diagnostic.

## 5. Closing Summary

Once the probe is green, print this summary verbatim (substituting the chosen role):

```
✅ Podium is live. Active role: <role>

── How to use the agent ────────────────────────────
• Ask from this Claude Code session: just talk naturally — the role context is loaded.
• Or run one-shot from terminal:
    python runtime/engine.py --message "your question here"
• Re-check health any time:
    /podium-verify

── How to personalize this role ────────────────────
• Voice and tone:       roles/<role>/identity/style.yaml
• Behavior and purpose: roles/<role>/identity/constitution.md
• Memory and context:   roles/<role>/memory/
• Schedule/cron jobs:   roles/<role>/schedule.yaml  (v0.2)
After any edit, re-run /podium-verify to confirm the change lands.

── How to build a new role ─────────────────────────
1. Copy an existing role as a starting template:
     cp -r roles/<role> roles/<your-role>
2. Edit identity/constitution.md and identity/style.yaml for your voice.
3. Replace skills/base/* with the capabilities your role needs
   (each skill is one SKILL.md with frontmatter).
4. Activate it:
     python -m setup --step install --role <your-role>
5. Run /podium-verify.

The workshop/design-template.md walks the full design conversation.
```

Do not add anything after this summary — let the user take the next step.
