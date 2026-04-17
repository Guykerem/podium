# Cron Patterns Reference

Cron syntax and common scheduling patterns for agent tasks.

## Cron Syntax

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

| Symbol | Meaning              | Example          |
|--------|----------------------|------------------|
| `*`    | Every value          | `* * * * *` = every minute |
| `*/n`  | Every n-th value     | `*/30 * * * *` = every 30 min |
| `n`    | Specific value       | `0 8 * * *` = at 8:00 AM |
| `n,m`  | Multiple values      | `0 8,20 * * *` = 8 AM and 8 PM |
| `n-m`  | Range                | `0 9-17 * * *` = every hour 9-5 |

## Common Patterns

| Pattern              | Cron Expression    | Use Case                    |
|----------------------|--------------------|-----------------------------|
| Every 30 minutes     | `*/30 * * * *`     | Heartbeat, quick checks     |
| Every 3 hours        | `0 */3 * * *`      | Moderate monitoring         |
| Every 6 hours        | `0 */6 * * *`      | Research sweeps, digests    |
| Daily at 8 AM        | `0 8 * * *`        | Morning summary             |
| Daily at 10 PM       | `0 22 * * *`       | End-of-day review           |
| Weekdays at 9 AM     | `0 9 * * 1-5`      | Workday briefing            |
| Weekly on Monday     | `0 9 * * 1`        | Weekly review               |
| Monthly on the 1st   | `0 9 1 * *`        | Monthly report              |

## Role Defaults

Suggested default schedules by role type:

### Architect
- **Default schedule:** None (reactive only)
- **Rationale:** Design work is triggered by need, not time

### Assistant
- **Default schedule:** 30-minute heartbeat
- **Pattern:** `*/30 * * * *`
- **Rationale:** Stay responsive, catch pending items

### Tutor
- **Default schedule:** 6-hour research sweep
- **Pattern:** `0 */6 * * *`
- **Rationale:** Periodic check for new material, student progress review

### Creator
- **Default schedule:** Reactive (no fixed schedule)
- **Rationale:** Creative work follows inspiration, not clocks
- **Exception:** May schedule publishing or review windows

## Guidelines

- Start with less frequent schedules and increase if needed
- Every scheduled job should have a clear "why" — if you can't explain why it runs at that frequency, it's too frequent
- Log every execution, even no-ops (helps tune frequency later)
- Respect the user's timezone — all times should be in the user's local time
- Avoid scheduling during typical sleep hours unless explicitly requested
