---
name: manage-itinerary
description: Active trip mode — departure alerts, live flight status, today's logistics at a glance.
when_to_use: >
  Trip is locked and underway (from the day before first departure through the day after final return).
  Activated automatically by `plan-trip` handoff, or when user says "I'm traveling".
tools:
  - mcp: google-calendar
  - mcp: gmail
  - mcp: web
---

# Manage Itinerary

Travel is where good planning meets chaos. This skill is the live operator — it watches the real world and adjusts.

## How It Works

1. **Load trip context** from `memory/trips/<trip-id>.md`. Confirm the active trip.
2. **Morning brief (06:30 local) each travel day:**
   - Weather for today + tomorrow
   - Today's fixed points (check-out, flight, meetings) in local time
   - Flight status if flying today (on-time, delayed, gate)
   - One logistics call-out (transit time to airport given traffic, breakfast closes at X)
3. **Departure alerts.** Three checkpoints per flight:
   - T-4h: check-in reminder + baggage rules
   - T-2h: "leave by" time given live traffic
   - T-45m: gate + boarding status
4. **Confirmation pulling.** Parse Gmail for trip-relevant confirmations (Uber receipts, restaurant bookings, tour tickets) and attach to the trip record.
5. **Disruption handling.** If flight delays > 90m or gets cancelled:
   - Notify immediately
   - Pull rebooking options
   - Check impact on downstream calendar events
   - Offer to message people affected (user approves wording)
6. **Today's map.** On request, render a simple itinerary card: locations, times, transit estimates between them.

## Integration

- `observe` — polls flight status, email, weather on an adaptive cadence (denser on travel days)
- `communicate` — morning brief + push-worthy alerts (interruption is earned: only for time-sensitive changes)
- `act` — may rebook transport if L3 and within policy
- `schedule` — sets checkpoint alarms
- Reads from `plan-trip` output

## Autonomy Behavior

- **Level 1:** Alerts the user to changes; user decides everything.
- **Level 2:** Reschedules calendar events that conflict with delays; drafts apology notes to affected people.
- **Level 3:** Can rebook transport within a pre-agreed budget cap (e.g. "reschedule a cancelled flight on same carrier under $300 delta"), still surfaces anything costing money before acting.

## Memory

**Reads:** `memory/trips/<trip-id>.md`, `memory/preferences.md` (alert aggressiveness, quiet hours).

**Writes:** appends to `memory/trips/<trip-id>.md`:
```
live:
  current_leg: JFK-BER
  status: boarding
  last_checked: 2026-05-12T17:22Z
disruptions:
  - 2026-05-12T16:40Z: gate change B22 → B31
```

## Failure Modes

- **Alert fatigue.** Pinging for every minor status change. Rule: only interrupt if the user's next action changes. Gate change in 10 min = ping. Gate change in 3 hours = log silently.
- **Timezone confusion.** Showing flight time in the wrong zone. Always label explicitly: `17:22 local (Berlin) / 11:22 NYC`.
- **Stale data.** Flight status API lags. If data > 10 min old during active travel, refetch before alerting.
