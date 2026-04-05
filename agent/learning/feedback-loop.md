# Feedback Loop

How Podium learns from your use.

## The Cycle

```
You use a skill → You rate the output → The agent records what worked → It adjusts next time
```

## How To Give Feedback

After any interaction, you can tell the agent:

- **"That was great"** — the agent notes what it did and reinforces that approach
- **"That wasn't helpful"** — the agent asks what was wrong and records the issue
- **"Too much detail" / "Not enough detail"** — adjusts the detail level for future responses
- **"Wrong tone"** — adjusts personality settings toward your preference
- **"I needed X instead"** — records what you actually wanted for future pattern matching

You don't have to give feedback every time. But the more you do, the faster the agent adapts to you.

## What Gets Tracked

- Which skills you use most (signals what matters to you)
- Which outputs you rated positively or negatively
- Patterns in your preferences (you tend to want more examples, or shorter answers, etc.)
- Topics you return to (signals depth of interest)

## Where Feedback Lives

- `adaptations.md` — a running log of changes the agent has made based on your feedback
- `context.md` (in memory/) — updated preferences and learned patterns
- `style.yaml` (in identity/) — personality settings that may shift based on your feedback

## Privacy

All feedback is stored locally in this repo. Nothing is sent anywhere. You own your data. You can read, edit, or delete any feedback record at any time.
