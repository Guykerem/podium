---
name: add-telegram
description: Register Telegram as a Podium channel. Collects a bot token, verifies it via Telegram's getMe API, writes it to .env (gitignored), and flips telegram.enabled in runtime/channels.yaml. Triggers on "add telegram", "enable telegram channel", "configure telegram bot", or after `/podium-setup` committed telegram in the CHANNEL step.
---

# Add Telegram Channel

This skill finishes Podium's Telegram registration. It assumes the user already
selected `telegram` during the channel step of `/podium-setup` (or will use it
standalone afterwards). CLI always works on its own — Telegram is additive.

The skill is forked from NanoClaw's `add-telegram` but trimmed for Podium:
- No code merge. Podium's runtime already knows how to read `TELEGRAM_BOT_TOKEN`.
- One verification path: a live `getMe` call to the Telegram Bot API.
- Writes secrets to `.env` only — which is in `.gitignore`. Never `git add .env`.

## Phase 1 — Collect the bot token

Use `AskUserQuestion` to ask:

> Do you already have a Telegram bot token, or should I walk you through creating one?

If the user doesn't have one, give them this 30-second recipe:

> 1. Open Telegram and search `@BotFather`.
> 2. Send `/newbot`, pick a display name, then a username ending in `bot`.
> 3. BotFather replies with a token shaped like `123456789:ABCdef-Ghijkl_MNOpqr-stuVwx0123456789`.
> 4. Paste the whole line back here.

Wait for them to provide the token. Then use `AskUserQuestion` a second time to
capture the token itself. The token must match the regex `^\d{6,}:[A-Za-z0-9_-]{30,}$`;
if it doesn't, ask again and explain what a valid token looks like.

## Phase 2 — Write the token to `.env`

`.env` lives at the repo root. `.gitignore` already covers `.env`, so the token
never reaches git.

If `.env` does not exist, create it. If it already has a `TELEGRAM_BOT_TOKEN=`
line, replace it. Use Edit for an existing file, Write for a fresh one. Do not
run `git add .env` under any circumstance.

Minimal `.env` shape:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdef-Ghijkl_MNOpqr-stuVwx0123456789
```

## Phase 3 — Verify via Telegram's getMe API

Shell out to curl (the token is NOT printed to the transcript — use shell var):

```bash
TELEGRAM_BOT_TOKEN="$(grep '^TELEGRAM_BOT_TOKEN=' .env | cut -d= -f2-)" \
  curl -sS -w "\nHTTP_STATUS:%{http_code}\n" --max-time 10 \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe"
```

Parse the JSON. Four outcomes:

| Response                                                            | Classify            | Do                                                                                     |
|---------------------------------------------------------------------|---------------------|----------------------------------------------------------------------------------------|
| `{"ok": true, "result": {"username": "...", ...}}` with HTTP 200    | success             | Continue to Phase 4.                                                                   |
| `{"ok": false, "error_code": 401, "description": "Unauthorized"}`   | `auth_failed`       | Tell the user the token looks wrong, offer to re-collect it (back to Phase 1).         |
| `{"ok": false, "error_code": 429, ...}` or HTTP 429                  | `rate_limited`      | Ask the user to wait 30–60s (BotFather/API rate limit) and re-run /add-telegram.       |
| curl exit code non-zero, timeout, or HTTP_STATUS empty               | `network_error`     | Ask them to check network / firewall; `api.telegram.org` must be reachable over HTTPS. |

If the token was obviously invalid (didn't match the regex in Phase 1) before we
even called the API, classify as `token_missing` and bounce back to Phase 1.

## Phase 4 — Update `runtime/channels.yaml`

On a successful `getMe`:

1. Extract `result.username` from the JSON — this is the bot username without
   the leading `@`. Store it exactly as returned.
2. Read `runtime/channels.yaml`. Use Edit to change the telegram block:
   - `enabled: false` → `enabled: true`
   - `bot_username: ""` → `bot_username: "<username>"`
   - Leave `chat_id` as `""`; the runtime populates it during the first inbound
     message handshake. Do NOT invent a chat id here.
3. Add `telegram` to the top-level `enabled: [...]` list if it isn't there yet.

`runtime/channels.yaml` is checked into git — that's intentional. Only the
token lives in `.env`.

## Phase 5 — Report

Emit a short human-readable summary. Example success:

```
Telegram channel registered.
  TELEGRAM_BOT: @podium_example_bot
  TOKEN_LOCATION: .env (gitignored — do not commit)
  CHANNELS_ENABLED: cli, telegram
  CHAT_ID: (pending — send your bot any message to finalize)
```

Example partial failure:

```
Telegram channel NOT registered.
  STATUS: auth_failed
  HINT: Token was rejected by Telegram (401 Unauthorized). Re-copy the token
        from BotFather and re-run /add-telegram. Nothing was written to .env.
  CLI still works — Telegram is optional.
```

Return to the caller (usually `/podium-setup` or the user's shell). The caller
can re-invoke this skill to retry.

## Guard rails

- **Never** echo the full token back in chat. When summarizing, print the first
  6 characters followed by `…` if you must reference it at all.
- **Never** run `git add .env`, `git commit` on `.env`, or stage anything
  containing the token. `.env` is already in `.gitignore`; keep it that way.
- **Never** print the token into status blocks or logs.
- If `.env` has *other* keys already, leave them alone; only manage the
  `TELEGRAM_BOT_TOKEN=` line.

## Troubleshooting quick table

| Symptom                                           | Likely cause                   | Fix                                                                 |
|---------------------------------------------------|--------------------------------|---------------------------------------------------------------------|
| `401 Unauthorized`                                | Wrong token or extra chars     | Re-copy from BotFather, no quotes, no leading space.                |
| `404 Not Found`                                   | Token path typo                | Usually means `.env` has malformed value; ensure `TELEGRAM_BOT_TOKEN=123:ABC…` on one line. |
| `429 Too Many Requests`                           | Rate limit                     | Wait 60s, retry. BotFather also rate-limits bot creation.           |
| curl exits 6/7/28                                 | DNS / connection / timeout     | Check network; corporate firewalls sometimes block `api.telegram.org`. |
| `getMe` succeeds but bot never replies            | Privacy mode / unstarted chat  | Open the bot in Telegram and send `/start` once to open the channel. |
