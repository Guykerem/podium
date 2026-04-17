---
name: budget-alerts
description: Monitor category spending against targets and surface neutral, shame-free alerts.
when_to_use: >
  User has set monthly targets and wants proactive awareness.
  Fires automatically when category spend crosses threshold; also on request ("how's my month going?").
---

# Budget Alerts

Budgets fail when they feel like a parent. This skill is a dashboard, not a scolding — it reports facts, offers context, and lets the user decide.

## How It Works

1. **Load targets** from `memory/finance/budgets.yaml`:
   ```
   month: 2026-04
   targets:
     dining: 400
     groceries: 600
     transport: 200
     subscriptions: 150
     discretionary: 300
   ```
2. **Compute running totals** from `track-expenses` ledger for the current month.
3. **Compute pace.** At day D of a 30-day month, linear pace = (D / 30) × target.
4. **Threshold checks** — trigger an alert only at these crossings, max once per threshold per month:
   - 80% of target
   - 100% of target
   - 120% (over-budget)
5. **Alert wording template** — neutral, not moralizing:
   ```
   Dining: $340 / $400 (85%). 11 days left in month.
   ```
   Never: "you've overspent" / "you should cut back" / "try to slow down".
6. **Monthly close (1st of next month).** Summarize:
   - categories on target, under, over
   - deltas vs. 3-month rolling average
   - offer: "want to adjust targets for next month?" (user decides; agent doesn't suggest numbers unless asked)

## Integration

- `remember` — budgets and alert history (so thresholds don't re-fire)
- `observe` — watches ledger updates from `track-expenses`
- `communicate` — delivers the neutral alert
- `schedule` — monthly close on the 1st
- Reads from `track-expenses`

## Autonomy Behavior

- **Level 1:** Surfaces alerts in the agent's normal digest; no push.
- **Level 2:** Pushes 100% and 120% crossings as notifications; 80% stays in digest.
- **Level 3:** Same as L2, plus auto-generates month-end close summary. Never auto-adjusts targets.

## Memory

**Reads:** `memory/finance/budgets.yaml`, `memory/finance/ledger/YYYY-MM.md`, `memory/finance/alert-log.md`.

**Writes:** appends to `memory/finance/alert-log.md`:
```
- date: 2026-04-17
  category: dining
  threshold_crossed: 80
  month_total: 340
  month_target: 400
  days_remaining: 13
```

## Failure Modes

- **Moralizing drift.** Wording creeps from neutral to paternal over time. Periodically self-audit: if an alert contains "should", "need to", "try to", rewrite.
- **Threshold whiplash.** User adjusts target mid-month; old alerts re-fire. Alerts are keyed to (category, month, threshold) — never re-fire for the same triple.
- **Context-blind alerts.** Firing "80% dining" during a trip week when eating out is expected. If a trip is active in `memory/trips/`, tag the alert with trip context and soften framing.
