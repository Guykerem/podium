---
name: mood-check
description: Optional two-question daily check-in on mood and energy — tracks trends without clinical framing.
when_to_use: >
  User has opted in to a daily rhythm. Fires once per day at the user's chosen time.
  Never triggered unsolicited. Skippable with a single word.
---

# Mood Check

A tiny ritual for self-observation. This is not therapy, not diagnosis, not a wellness score. It's a two-question journal the agent keeps on your behalf so patterns become visible.

## How It Works

1. **Prompt (once per day at configured time):**
   - "How's your mood, 1–5?"
   - "How's your energy, 1–5?"
   That's the entire check. No follow-up questions unless the user volunteers something.
2. **Accept loose input.** "fine", "3", "meh", "pretty good" all parse. If ambiguous, pick nearest integer and reflect it ("calling that a 3 — say again if off").
3. **Accept a skip.** "skip", "not today", or no response within 2 hours = skipped, no reminder, no guilt.
4. **Store** to `memory/health/mood-log.md`.
5. **Weekly reflection (user-initiated only).** If the user asks "how's my week been", show a simple view:
   - 7-day mini chart (mood, energy)
   - optional correlation notes if sleep / calendar-load data exists AND the user opted into correlation
6. **Never interpret.** The agent does not say "you seem stressed" or "you've been down". It shows numbers the user interprets.

## Integration

- `communicate` — the prompt, kept minimal
- `remember` — writes the log
- `schedule` — fires the daily prompt
- Composes with `sleep-journal` and calendar observation, but only reads them if user opted in to correlation

## Autonomy Behavior

- **Level 1:** Prompt only. User explicitly requests any aggregation or view.
- **Level 2:** Same prompt. Offers a weekly reflection on Sundays if user opted in.
- **Level 3:** Same as L2 — this skill's autonomy is deliberately flat. The whole point is non-escalation. Nothing here ever pushes harder.

## Memory

**Reads:** `memory/health/config.yaml` (opted-in, prompt time, correlation flags).

**Writes:** appends to `memory/health/mood-log.md`:
```
- date: 2026-04-17
  mood: 3
  energy: 4
  note: null   # only if user volunteers one
  skipped: false
```

## Failure Modes

- **Clinical drift.** Language sliding toward "symptoms", "concerning trend", "you might want to consider". Never. This is a journal, not an assessment. If the user asks for interpretation, say: "I can show you the numbers; making sense of them is yours or a professional's."
- **Nagging.** Asking twice if skipped. One prompt per day, ever. If skipped three days in a row, do not escalate — silently pause and wait for the user to restart.
- **Over-correlation.** Reporting "your mood drops on Tuesdays" from 4 data points is noise dressed as insight. Require ≥ 6 weeks of data and ≥ 20 non-skipped entries before any pattern observation is surfaced, and always frame as "a pattern the numbers show" not "a thing about you".
- **Gamification creep.** No streaks, no badges, no "you're doing great this week!" affirmations. The ritual is the point; performance metrics corrupt it.

## Design Notes for Students

This skill is deliberately the simplest in the role. It exists as a teaching example: sometimes the right answer is *two questions, a file, and nothing else*. Resist the instinct to add sentiment analysis, automatic coping suggestions, or a chart dashboard. Each addition makes the ritual heavier and less likely to survive a bad week — which is exactly when it matters most.

If you want to extend this, add *integrations that serve the user's self-understanding*, not features that interpret on their behalf. A line that shows "you logged 14 days this month" is fine. A line that says "you seem to be struggling" is not.
