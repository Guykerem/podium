# Feedback Loop

How the agent learns from your use.

## The Cycle

```
You use a skill → You react to the output → The agent records what worked → It adjusts next time
```

## Explicit Feedback

After any interaction, you can tell the agent directly:

- **"That was great"** — the agent notes what it did and reinforces that approach
- **"Too much detail"** — adjusts verbosity downward for future responses
- **"Wrong tone"** — adjusts personality settings toward your preference
- **"I needed X instead"** — records what you actually wanted for future pattern matching
- **"That wasn't helpful"** — the agent asks what was wrong and records the issue

You don't have to give feedback every time. But the more you do, the faster the agent adapts.

## Implicit Signals

The agent also learns from patterns in how you use it:

- **Skill usage frequency** — which skills you reach for most signals what matters to you
- **Accepted vs ignored suggestions** — if you consistently skip a type of suggestion, it's not landing
- **Return topics** — subjects you come back to signal depth of interest
- **Response speed** — how quickly you engage with outputs hints at relevance

## Where Feedback Lives

- `learning/adaptations.md` — a running log of changes the agent has made based on feedback
- `memory/context.md` — updated preferences and learned patterns about you
- `identity/style.yaml` — personality settings that may shift based on your feedback
- Role-specific memory — if the active role has its own memory files, feedback may update those too

## Privacy

All feedback is stored locally in this repo. Nothing is sent externally. You own your data. You can read, edit, or delete any feedback record at any time.
