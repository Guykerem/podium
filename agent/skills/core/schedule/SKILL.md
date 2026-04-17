---
name: schedule
description: Create and manage recurring tasks — heartbeats, checks, periodic actions
when_to_use: When the agent needs to do something on a timer or recurring basis
---

# Schedule

The agent's internal clock. Creates and manages recurring tasks — periodic checks, scheduled actions, heartbeat patterns. Turns a reactive agent into one that acts on its own rhythm.

## How It Works

1. **Load** — On startup, read the role's `schedule.yaml` for registered jobs
2. **Register** — Add each job to the runtime scheduler with its cron expression
3. **Execute** — When a job triggers:
   - Wake up
   - Check current state (observe + remember)
   - Decide if action is needed
   - Execute the action or go back to sleep
   - Log the result
4. **Report** — If the action produced something worth sharing, communicate it through the appropriate channel
5. **Adapt** — If a scheduled task consistently produces no useful action, suggest reducing its frequency

## The Universal Heartbeat Pattern

Every scheduled task follows the same loop:

```
wake → check state → decide → execute or sleep → log
```

This is the fundamental pattern. A daily summary, a 30-minute check-in, and a weekly review all follow this exact loop — they differ only in frequency and what "check state" and "execute" mean.

### Example: Daily Morning Summary

```
wake (8:00 AM)
→ check state (read calendar, check pending tasks, scan news)
→ decide (anything worth reporting?)
→ execute (compose and send summary)
→ log (recorded: morning summary sent, 3 items)
```

### Example: Heartbeat Check

```
wake (every 30 min)
→ check state (any new messages? any pending tasks overdue?)
→ decide (nothing new)
→ sleep
→ log (recorded: heartbeat, no action needed)
```

## Schedule Configuration

Jobs are defined in the role's `schedule.yaml`:

```yaml
jobs:
  - name: morning-summary
    cron: "0 8 * * *"          # Daily at 8 AM
    skill: communicate
    action: daily-summary
    enabled: true

  - name: heartbeat
    cron: "*/30 * * * *"       # Every 30 minutes
    skill: observe
    action: check-state
    enabled: true
```

See `cron-patterns.md` for cron syntax reference and common patterns.

## Autonomy Behavior

- **Level 1:** Schedule is defined but no jobs run automatically. The agent presents what it would do and when, and waits for the user to approve each execution. Essentially a "what should I check?" prompt.
- **Level 2:** Routine scheduled tasks run automatically (heartbeats, summaries). The agent asks before executing tasks that produce outward-facing actions (sending messages, creating tasks). Reports results in the next conversation.
- **Level 3:** Full scheduling autonomy. All jobs run on schedule. The agent only interrupts if something requires human judgment. Adapts frequency based on results (reduces if consistently no-action, increases if catching important things).

## Cognitive Analogy

**Circadian rhythm + executive scheduling** — Your body runs on a ~24-hour clock governed by the suprachiasmatic nucleus (SCN) in the hypothalamus. It doesn't wait for you to decide to feel sleepy — it releases melatonin on schedule. But you also have executive scheduling: your prefrontal cortex plans when to eat, work, exercise. The schedule skill combines both. The cron jobs are the circadian rhythm — automatic, reliable, always running. The heartbeat check-decide-act loop is executive scheduling — waking up with purpose and deciding what to do. Together, they give the agent a sense of time and rhythm, not just reaction.
