---
name: habit-nudge
description: Tiny-habit protocol (BJ Fogg) — anchor-based nudges, streak tracking without guilting misses.
when_to_use: >
  User wants to build a small recurring behavior — stretching after coffee,
  a 2-minute tidy after dinner, one push-up after brushing teeth.
  Only activates when the user explicitly defines an anchor + tiny action.
---

# Habit Nudge

Based on BJ Fogg's Tiny Habits: behavior happens when motivation, ability, and a prompt converge. The prompt is an existing routine (the anchor); the action is small enough that motivation barely matters. This skill handles the prompt.

## How It Works

1. **Define a habit with the user in one exchange:**
   - `anchor` — an existing daily event ("after my morning coffee", "when I close my laptop")
   - `action` — tiny, specific, <2 minutes ("write one sentence about yesterday", "two slow breaths")
   - `celebration` — how the user acknowledges completion ("fist pump", "say 'nice'") — optional but encouraged per the protocol
   - `cue` — how the agent prompts (notification, calendar ping, quiet log), and whether to prompt at all
2. **Detect anchor occurrence.** If the anchor is calendar-visible (first meeting of the day, end of workday), the agent knows. If not, the agent prompts at a user-chosen time or relies on user self-report.
3. **Prompt once at anchor time.** One short line: "coffee's done — one sentence?"
4. **Log completion.** The user responds yes / skip / done. Silent responses count as skip.
5. **Track a streak, but softly.** Display current streak in user-initiated views only. Never lead a nudge with the streak. Missed days do not reset to zero with shame framing — instead: "back to it today?" with no counter comment.
6. **Weekly view (user requests):** shows a grid of dots (done / skipped / not prompted). That's it.

## Integration

- `schedule` — anchor-time prompts
- `observe` — calendar for anchor detection when possible
- `remember` — habit definitions and log
- `communicate` — the one-line prompt

## Autonomy Behavior

- **Level 1:** User chooses to view habit status; agent only nudges when explicitly configured.
- **Level 2:** Nudges at anchor time as configured. Weekly view on Sunday if opted in.
- **Level 3:** Same as L2. No escalation, no "you've missed 4 days, try harder". The whole protocol breaks if the agent becomes a coach.

## Memory

**Reads:** `memory/habits/config.yaml` (habit definitions).

**Writes:** appends to `memory/habits/log.md`:
```
- habit: morning-sentence
  date: 2026-04-17
  status: done   # done | skipped | not-prompted
  note: null
```

And habit definitions:
```
habits:
  - id: morning-sentence
    anchor: after-morning-coffee
    action: write one sentence about yesterday
    celebration: "say nice"
    cue: notification
    created: 2026-04-03
```

## Failure Modes

- **Guilt framing.** "You've broken a 12-day streak." Never. Missed = "back to it today?" or silence.
- **Anchor too abstract.** "When I feel like it" is not an anchor. During setup, reject non-specific anchors and propose concrete alternatives.
- **Drift into coaching.** Agent starts suggesting the habit should grow ("now try 5 sentences"). The Tiny Habits protocol explicitly forbids this. Growth happens organically or not at all — the agent stays at the stated action size unless the user explicitly redefines it.
