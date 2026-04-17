---
name: sleep-journal
description: Capture bedtime, wake, and subjective quality — weekly pattern reflections, not prescriptions.
when_to_use: >
  User has opted in. Morning check-in at configured wake window.
  Also accepts a voluntary bedtime log in the evening.
tools:
  - mcp: apple-health
---

# Sleep Journal

A lightweight sleep log. If Apple Health is connected, the agent uses objective data and asks fewer questions. Otherwise, three short prompts do the job. The goal is awareness, not optimization.

## How It Works

1. **Morning check (at user's wake window, e.g. 07:00–09:00):**
   - If Apple Health MCP available: pull `sleep_analysis` for the prior night (bedtime, wake, in-bed vs asleep) and show the summary. Ask one question only: "quality 1–5?"
   - If not available: three questions — "bedtime?", "wake time?", "quality 1–5?"
2. **Evening bedtime log (optional):** user can say "heading to bed at 23:30" and agent timestamps it so the morning check can confirm actual sleep onset vs intent.
3. **Store** to `memory/health/sleep-log.md`.
4. **Weekly reflection (Sunday morning if opted in):**
   - Average bedtime, wake time, duration, quality
   - Consistency: standard deviation of bedtime (the most actionable sleep metric)
   - One pattern observation only if data is strong
5. **Wind-down suggestion.** If user has a configured `wake_target`, compute `windown_start = wake_target - 9h` as a gentle bedtime-approach cue. The agent can surface this at the user-chosen time. It's a pointer, not an alarm.

## Integration

- `observe` — reads Apple Health if configured
- `remember` — sleep log
- `communicate` — minimal morning check
- `schedule` — morning window + optional wind-down cue
- Composes with `mood-check` (correlation only with explicit opt-in) and `habit-nudge` (wind-down can be a habit anchor)

## Autonomy Behavior

- **Level 1:** Prompt only on user's schedule. No proactive suggestions.
- **Level 2:** Prompt + weekly reflection. Wind-down cue fires if configured.
- **Level 3:** Same as L2. This skill does not escalate into coaching — it stays a journal.

## Memory

**Reads:** `memory/health/config.yaml` (opted-in, wake_target, wind-down cue on/off).

**Writes:** appends to `memory/health/sleep-log.md`:
```
- date: 2026-04-17
  bedtime: 23:42
  wake: 07:08
  duration_hours: 7.4
  quality: 4
  source: apple-health   # or self-reported
```

## Failure Modes

- **Optimization creep.** Agent starts suggesting "try sleeping 15 min earlier". Not this skill's job. The pattern is surfaced; interpretation belongs to the user.
- **Data distrust.** Apple Health and self-report disagree. Show both, don't pick. "Phone says 6.8h, you logged 7.5h."
- **Missed day guilt.** If the user skips 3 days, do not say "you've missed 3 days". Just stop prompting for that stretch and resume silently when they re-engage. A streak counter would be wrong for this skill.
