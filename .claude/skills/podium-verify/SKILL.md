---
name: podium-verify
description: Run Podium health check — confirm active role boots cleanly, send one live probe message, report health. Triggers on "podium verify", "podium health check", "is podium working", or after a Podium setup handoff.
---

# Podium Verify

Standalone health check for the active Podium role. Re-runnable any time.

## 1. Boot Check

Run `python -m setup --step verify` and parse the `VERIFY` status block.

- `BOOT_STATUS: success` → continue.
- `BOOT_STATUS: failed` → report the `REASON` field; ask if the user wants to switch role (if yes, hand back to `/podium-setup`).

## 2. Live Probe

Run:

```
python runtime/engine.py --message "In one sentence: who are you and what do you help with?"
```

Expect a response of 20–200 chars within 30s.

- Response contains the role's identity keyword (e.g. "learn" for tutor, "schedule" for assistant) → report ✅
- No response or timeout → show last 20 lines of `logs/podium-setup.log`, suggest re-running `/podium-setup` or checking `claude --version`.

## 3. Report

Summarize: `role: <X>, boot: <status>, probe: <ok|failed>, latency: <ms>`.
