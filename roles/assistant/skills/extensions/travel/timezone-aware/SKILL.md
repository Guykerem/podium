---
name: timezone-aware
description: Cross-timezone scheduling that respects sleep, daylight, and multi-party sanity.
when_to_use: >
  User schedules a call with someone in a different timezone, is traveling,
  or asks "what time would work for X in London and Y in Tokyo".
tools:
  - mcp: google-calendar
---

# Timezone-Aware

Scheduling across timezones with `UTC` in your head is a recipe for 3 AM meetings. This skill treats timezones as a first-class constraint, not an afterthought.

## How It Works

1. **Establish participants.** For each, resolve:
   - `name`
   - `home_tz` — IANA timezone (e.g. `Europe/London`)
   - `traveling_tz` — override if currently elsewhere (checked against `memory/trips/`)
2. **Fetch free/busy** for the next 2 weeks via Google Calendar for the user; for others, ask or use stated working hours from `memory/people.md`.
3. **Score candidate slots** on:
   - `inside_working_hours` per participant (default 09:00–18:00 local)
   - `unsociable_penalty` — slot before 08:00 or after 20:00 local for anyone = hard warning; before 07:00 / after 22:00 = never suggest
   - `deep_work_protection` — penalize slots that fragment a 2h+ focus block for the user
4. **Rank and present top 3.** Each slot shows all participants' local times side-by-side.
   ```
   Option A:
     Wed 15:00 NYC / 20:00 London / 05:00 Tokyo  ← Aiko: unsociable
   Option B:
     Thu 08:00 NYC / 13:00 London / 22:00 Tokyo  ← Aiko: late
   Option C:
     Fri 07:00 NYC / 12:00 London / 21:00 Tokyo  ← best compromise
   ```
5. **When user is traveling,** adjust check-in and routine times: morning brief shifts to local, but deadline reminders stay in the deadline's zone (a NYC deadline stays NYC when user is in Berlin).
6. **For recurring meetings,** warn when DST transitions cause the relative time to shift (US and EU DST don't align).

## Integration

- `remember` — caches timezones per person in `memory/people.md`
- `observe` — watches for travel overlays
- `communicate` — renders the side-by-side comparison
- `schedule` — creates the event once user picks a slot
- Composes with `manage-itinerary` (traveling_tz) and `plan-trip`

## Autonomy Behavior

- **Level 1:** Suggests slots; user picks and invites.
- **Level 2:** Sends calendar invites to external parties after user picks a slot.
- **Level 3:** For internal teammates with known calendars and no unsociable conflicts, picks and sends automatically within stated working-hours window. Always asks for external or cross-continent cases.

## Memory

**Reads:** `memory/people.md` (home_tz, working_hours, dst_observance), `memory/trips/` (active overrides), `memory/preferences.md` (quiet hours, deep work windows).

**Writes:** updates `memory/people.md` when new timezones are confirmed:
```
- id: aiko
  name: Aiko Tanaka
  home_tz: Asia/Tokyo
  working_hours: [09:00, 18:00]
  dst_observance: none
  last_confirmed: 2026-04-17
```

## Failure Modes

- **Stale tz.** Person moved cities and agent still thinks they're in London. Re-confirm timezone if no interaction in 60 days before auto-scheduling.
- **DST blind spot.** 13:00 London → 08:00 NYC in standard time becomes 13:00 → 09:00 in the transition week. Always compute from live IANA data, never hardcode offsets.
- **Unsociable minimization theater.** Mathematically "fair" slot that still puts someone at 6 AM. Name the tradeoff explicitly rather than hide it in a score.
