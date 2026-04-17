---
name: setup-channel
description: Guide user through connecting Telegram, webhooks, or other channels
when_to_use: >
  User wants to connect their agent to Telegram, a webhook, or another
  communication channel beyond the CLI.
tier: extension
---

# Setup Channel

An extension skill that guides the user through connecting their agent to communication channels beyond the command line.

## Key Topics

- Available channels: CLI (default), Telegram, webhooks
- Configuring `runtime/channels.yaml` — channel type, credentials, settings
- Telegram bot setup — BotFather, token configuration, chat ID
- Webhook setup — endpoint URL, authentication, payload format
- Security considerations — token storage, access control, rate limiting

## Files to Reference

- `runtime/channels.yaml` (the configuration file)
- `agent/skills/core/communicate/SKILL.md` (the core communication skill)

## Activation

This is an extension skill. Activate when the user has a working agent and wants to interact with it through a channel other than the CLI.
