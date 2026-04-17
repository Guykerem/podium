---
name: setup-schedule
description: Guide user through setting up cron jobs and scheduled agent behavior
when_to_use: >
  User wants their agent to do things on a schedule — daily summaries,
  weekly reviews, periodic checks, or any time-based automation.
tier: extension
---

# Setup Schedule

An extension skill that guides the user through configuring scheduled behavior for their agent.

## Key Topics

- When scheduling makes sense — recurring tasks with predictable timing
- Configuring `schedule.yaml` — cron syntax, job definitions, parameters
- Common patterns: daily digest, weekly review, periodic knowledge refresh
- Autonomy implications — scheduled tasks at high autonomy run without approval
- Cron syntax basics — minute, hour, day, month, weekday
- Testing schedules — dry runs before going live

## Files to Reference

- `roles/agent-architect/schedule.yaml` (role-level schedule)
- `runtime/scheduler.yaml` (global scheduler configuration)
- `agent/skills/core/schedule/SKILL.md` (the core scheduling skill)

## Activation

This is an extension skill. Activate when the user understands their agent's capabilities and wants to add time-based automation.
