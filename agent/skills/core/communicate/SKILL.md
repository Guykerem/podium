---
name: communicate
description: Handle input/output across channels — parse, format, respond, thread
when_to_use: Every interaction. This skill is always active.
---

# Communicate

The agent's voice. Handles all input parsing and output formatting across channels (CLI, Telegram, webhooks). Applies personality from `style.yaml` and adapts to each channel's constraints.

## How It Works

1. **Receive** — Accept input from any registered channel (text, voice, photo, webhook payload)
2. **Parse** — Extract intent, entities, and context from the raw input. Detect language, tone, and urgency.
3. **Route** — Determine which skill(s) should handle the request. If ambiguous, ask for clarification.
4. **Format** — Shape the response for the specific channel:
   - Apply personality style from `identity/style.yaml`
   - Respect channel limits (e.g., Telegram's 4096 char cap)
   - Choose appropriate media (text, markdown, code blocks, images)
5. **Thread** — Maintain conversation context within a session. Track what's been said, what's pending, what needs follow-up.
6. **Deliver** — Send the formatted response through the originating channel.

## Channel Awareness

Each channel has different constraints. The agent adapts automatically:

- **CLI** — Full markdown, no length limits, session-based context
- **Telegram** — 4096 char limit, supports photos/voice, rate-limited
- **Webhook** — JSON payloads, stateless, structured responses

See `channels.md` for full channel reference.

## Style Application

Before every response, load `identity/style.yaml` and apply:
- Warmth level (warm ↔ formal)
- Detail level (concise ↔ thorough)
- Emoji usage (never ↔ frequent)
- Jargon tolerance (plain language ↔ technical)

The same information should feel different depending on style settings. A warm agent and a formal agent can say the same thing — the communicate skill is what makes them sound different.

## Autonomy Behavior

- **Level 1:** Always confirm understanding before responding to complex requests. Ask clarifying questions when intent is ambiguous. Show draft responses for sensitive topics.
- **Level 2:** Respond directly to clear requests. Ask clarification only when genuinely ambiguous. Flag tone-sensitive situations before responding.
- **Level 3:** Full conversational autonomy. Only pause for messages that could cause harm or misunderstanding if sent without review.

## Error Handling

- If a channel is unreachable, queue the message and retry with backoff
- If input is unparseable, ask for rephrasing rather than guessing
- If response exceeds channel limits, split intelligently (not mid-sentence)

## Cognitive Analogy

**Broca's area + Wernicke's area** — the brain's speech production and comprehension centers. Wernicke's area (in the temporal lobe) handles comprehension — understanding what someone said to you. Broca's area (in the frontal lobe) handles production — forming your response. Damage to Wernicke's produces fluent but meaningless speech; damage to Broca's produces effortful but meaningful speech. The communicate skill is both areas working together: understanding input (Wernicke's) and producing appropriate output (Broca's). Without it, the agent might "think" correctly but be unable to express or understand anything.
