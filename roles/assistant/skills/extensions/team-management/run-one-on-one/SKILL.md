---
name: run-one-on-one
description: Prep and follow-up for 1:1 meetings — pulls context, drafts agenda, captures action items.
when_to_use: >
  A 1:1 is on the calendar in the next 24 hours, the user asks "what's on deck with X",
  or immediately after a 1:1 ends (to capture outcomes).
tools:
  - mcp: google-calendar
  - mcp: gmail
  - mcp: linear
---

# Run One-on-One

A 1:1 is a high-leverage conversation that usually gets winged. This skill turns 10 minutes of real prep into a better meeting — and 2 minutes of post-meeting capture into actual follow-through.

## How It Works

### Pre-meeting (24h before)

1. **Identify the counterpart** from the calendar event.
2. **Gather context** in parallel:
   - Last 1:1 notes from `memory/one-on-ones/<person>.md`
   - Open feedback threads from `memory/feedback-log.md`
   - Recent Linear activity (tickets they closed, opened, commented)
   - Recent wins mentioned in Slack / email (last 14 days)
   - Blockers surfaced in standups or DMs
3. **Draft an agenda** with three sections:
   - **Carry-over** — open items from last 1:1
   - **Recent** — wins, blockers, signals
   - **Forward** — decisions to make, feedback to give/ask for
4. **Surface one judgment call.** If there's a hard conversation pending (missed deadline, scope concern), flag it — don't schedule it silently.

### Post-meeting

1. Ask the user for a 60-second debrief. Two prompts only: "what got decided?" and "what's the next step?"
2. Parse debrief into `action_items: [{owner, task, due}]`.
3. Create tasks via `delegate-tasks` if the counterpart owns them, or as personal todos if the user does.
4. Append to `memory/one-on-ones/<person>.md` with date + summary + action items.

## Integration

- `remember` — owns the 1:1 history file per person
- `observe` — watches calendar for upcoming 1:1s
- `communicate` — drafts the agenda and debrief prompts
- `schedule` — fires 24h-before prep and immediately-after debrief
- Composes with `delegate-tasks` for action-item ownership

## Autonomy Behavior

- **Level 1:** Sends prep to user; user decides what to bring to the meeting.
- **Level 2:** Sends prep to user AND drops the agenda in the calendar event description (with user's initial consent for this pattern).
- **Level 3:** Also auto-creates action-item tasks post-debrief; still never messages the counterpart without approval.

## Memory

**Reads:** `memory/one-on-ones/<person>.md`, `memory/feedback-log.md`, `memory/people.md`.

**Writes:** appends a timestamped block to `memory/one-on-ones/<person>.md`:
```
## 2026-04-17
Carry-over: shipped Q1 review; still open on promo conversation
Wins: landed the auth migration ahead of schedule
Blockers: unclear priority between growth and reliability for Q2
Decisions: Guy to clarify Q2 priority by Monday
Actions:
  - guy: write Q2 priority memo (by 2026-04-21)
  - maya: draft auth post-mortem (by 2026-04-24)
```

## Failure Modes

- **Agenda theater.** Generating an agenda with no substance because nothing real surfaced. If context is thin, say so and suggest skipping prep rather than fabricating topics.
- **Sensitive topics exposed.** Never put "discuss performance concern" in the shared calendar event. Performance-sensitive items stay in user-only memory.
- **Stale history.** If `memory/one-on-ones/<person>.md` hasn't been updated in 90 days, treat person as "re-establishing context" and ask the user to orient rather than pretending to remember.
