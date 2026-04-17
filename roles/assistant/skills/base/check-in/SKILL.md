---
name: check-in
description: Proactive outreach when silence crosses a learned threshold — genuine curiosity, never nagging
when_to_use: Scheduled (every 15min heartbeat) and after work-state changes. Triggers when (importance × time-sensitivity × confidence) exceeds the user's interruption budget AND quiet hours are clear. Also fires when user returns from AFK, or when an external signal (meeting ended, PR merged, task deadline passed) suggests a natural pause.
---

# Check-In

The assistant's proactive voice. Reaches out only when silence is costing the user something — a slipping deadline, an unanswered question from a real person, a commitment that's about to break. Rooted in the principle "interruption is earned." A check-in that lands feels like a colleague who noticed something; one that misses feels like a notification.

## How It Works

Uses the USENIX four-layer status model to choose the lightest touch that conveys the signal:

1. **Ambient** — update a status dot, badge count, or tray icon. No words. Cost: near-zero attention.
2. **Progress** — one-line inline update in the current surface. "3 items need review." Cost: peripheral.
3. **Attention** — a framed message that expects acknowledgment. "Sarah's proposal deadline is 2 hours away — do you want to send the draft?" Cost: full interrupt.
4. **Summary** — deferred digest (wraps into daily-brief). Cost: zero until the user opens it.

Scoring rule (recomputed every heartbeat):

```
interrupt_score = importance (0-1) × time_sensitivity (0-1) × confidence (0-1)
if score < 0.25 → summary layer (defer)
if score < 0.55 → progress layer
if score < 0.80 → ambient layer escalates to attention if unread in 20min
if score ≥ 0.80 → attention layer now
```

Quiet hours (`memory/preferences.yaml` → `quiet_hours`) hard-block attention and progress layers; ambient and summary still accrue.

Message scaffold — every check-in must answer three questions:
- **What I noticed** (one line, concrete signal)
- **Why it might matter to you** (ties to a stored goal or commitment)
- **What I'd do / what I'm asking** (one proposed action or one question)

No opener pleasantries. No "just checking in." If the signal doesn't pass the score gate, stay silent.

## Integration

- **observe** — feeds the signals that generate scores (calendar drift, email age, task overdue, meeting ended).
- **remember** — reads goals, commitments, and quiet hours; writes every check-in and its outcome (useful / noise / ignored) for calibration.
- **communicate** — the voice layer; check-in picks the layer, communicate picks the words and tone.
- **schedule** — the 15-minute heartbeat and wake-on-signal hooks.

## Autonomy Behavior

- **Level 1:** Never interrupts unprompted. Every attention-layer candidate is queued for the next user-initiated turn and surfaced as "I noticed X — want me to flag that?" Summary layer still fills daily-brief.
- **Level 2:** Interrupts only on attention-layer signals with score ≥ 0.80 AND category in the user's approved list (deadlines, meeting prep, replies from named VIPs). Borderline cases defer to progress or summary.
- **Level 3:** Uses the full four-layer model autonomously. Tracks its own false-positive rate — if >15% of attention-layer interrupts are marked noise over 7 days, auto-tightens its threshold by 0.05 and logs the adjustment to `learning/adaptations.md`.

## Memory

- **Reads:** `memory/preferences.yaml` (quiet_hours, interruption_budget, vip_contacts), `memory/goals.md` (active commitments), `memory/axioms.md` (what the user considers worth interrupting for).
- **Writes:** `memory/check-in-log.jsonl` — one line per check-in: `{timestamp, layer, signal, score, outcome}`. Feeds the calibration loop.

## Failure Modes

- **The eager puppy** — interrupting on low-confidence signals because activity feels like helpfulness. Avoid by respecting the score gate; if confidence is below 0.6, downgrade a layer regardless of importance.
- **The timid librarian** — letting real fires slip into the summary layer because the model is uncertain. Avoid by treating time-sensitivity as a multiplier that can't be dampened; a 30-min-from-now deadline is never ambient.
- **The broken-record** — re-surfacing the same signal every heartbeat until acknowledged. Avoid by backing off exponentially (15m → 45m → 2h → summary) and never re-raising a signal the user has explicitly dismissed.
