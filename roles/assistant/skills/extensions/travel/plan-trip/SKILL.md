---
name: plan-trip
description: Multi-leg itinerary planning — flights, hotels, calendar blocks, packing checklist.
when_to_use: >
  User says "I'm going to X", "plan my trip", shares a flight confirmation, or
  a calendar event appears in a different city/timezone than usual.
tools:
  - mcp: google-calendar
  - mcp: gmail
  - mcp: web
---

# Plan Trip

Trip planning is a tree of decisions. This skill turns a vague "I'm going to Berlin in May for 5 days, 2 work days + vacation" into a concrete, bookable itinerary — without deciding things the user should decide.

## How It Works

1. **Elicit the trip frame.** If not provided, ask in one message:
   - `destinations` — ordered list (can be multi-leg)
   - `dates` — firm, flexible-by-N-days, or window
   - `purpose` — work / personal / mixed (affects hotel area, daily pacing, packing)
   - `constraints` — budget band, airline preference, dietary, mobility
2. **Research in parallel.**
   - Flights: 3 options per leg (cheapest, fastest, best-compromise). Show total time + connection risk + price.
   - Hotels: 3 options per city anchored to the purpose (near office for work days, near old town for leisure). Include walkable score and breakfast included.
3. **Propose the itinerary** as a day-by-day table. Do not book anything.
4. **On user approval,** the user books (agent never charges cards). Agent parses confirmations from email via Gmail MCP.
5. **Calendar blocks** get created: flights, check-in/out, work sessions, "open" blocks for wandering.
6. **Packing checklist** generated from: destination weather (7-day forecast close to travel), duration, purpose. Format: `essentials / clothing / work / personal / documents`.
7. **Handoff to `manage-itinerary`** once trip is locked.

## Integration

- `communicate` — presents options and asks only the necessary questions
- `remember` — writes to `memory/trips/<trip-id>.md`
- `observe` — watches email for confirmations after user books
- `act` — creates calendar events once the user confirms
- `schedule` — sets reminders (booking deadlines, check-in windows)

## Autonomy Behavior

- **Level 1:** Research only. User chooses every option. User books. User confirms before any calendar event is created.
- **Level 2:** Agent makes default choices inside stated constraints, shows a single recommended itinerary for approval, auto-creates calendar blocks once user books.
- **Level 3:** Same as L2 but pre-drafts booking links, parses confirmations silently, and only surfaces exceptions (price jumps, schedule risks).

## Memory

**Reads:** `memory/preferences.md` (airlines, seat type, hotel style, dietary), `memory/trips/` (past destinations), `memory/calendar-patterns.md`.

**Writes:** `memory/trips/2026-05-berlin.md`:
```
id: 2026-05-berlin
destinations: [berlin]
dates: [2026-05-12, 2026-05-17]
purpose: mixed
work_days: [2026-05-13, 2026-05-14]
bookings:
  flight_out: LH401 JFK-BER 2026-05-12 18:10
  hotel: Michelberger, 2026-05-12 to 2026-05-17
budget_cap_usd: 2400
status: locked
```

## Failure Modes

- **Over-research.** Presenting 12 flight options paralyzes the user. Always curate to 3.
- **Silent assumption.** Assuming "vacation" means the user wants a packed itinerary — some people want unstructured time. Ask purpose + pacing preference.
- **Stale weather.** Packing lists generated 8 weeks before trip based on current weather are wrong. Regenerate 5 days before departure.
