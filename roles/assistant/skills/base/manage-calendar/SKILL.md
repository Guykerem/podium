---
name: manage-calendar
description: Read, create, and adjust Google Calendar events — conflict-aware and energy-aware
when_to_use: User says "schedule", "when am I free", "move my 3pm", "block focus time", "find a time with X". Also activates on meeting-request emails (handoff from manage-email) and when time-advisor flags an overcommitted day.
tools:
  - mcp: google-calendar
---

# Manage Calendar

The scheduling layer. Treats the calendar as a reflection of the user's attention, not a container for it. Every scheduling decision weighs three things: does this conflict, does this respect energy patterns, and does this protect the blocks the user has told us matter. Defaults to declining or deferring rather than defaulting to yes.

## How It Works

1. **Read.** `google-calendar.list_events(time_min, time_max, calendars=[primary, ...shared])` — canonicalize to a flat list with `{id, title, start, end, attendees, response_status, location, conference_url, description, source_calendar}`.

2. **Detect conflicts.** Overlapping events on the primary calendar → hard conflict. Overlap with a `focus` or `deep-work` block (from `memory/energy-patterns.yaml`) → soft conflict flagged for user decision.

3. **Respect energy patterns.** Stored shape:
   ```yaml
   peak_hours: { mon-thu: "09:00-12:00", fri: "09:00-11:00" }
   meeting_ok: "13:00-17:00"
   no_meetings: ["fri_afternoon"]
   deep_work_min_block: 90    # minutes
   ```
   Scheduling proposals for meetings inside `peak_hours` require explicit override; default slots land in `meeting_ok`.

4. **Suggest times.** For external scheduling ("find 30 min with Priya next week"):
   - Call `suggest_time(duration, participants, preferred_window)`.
   - Filter candidate slots against energy patterns and stored non-negotiables (lunch, school pickup, etc.).
   - Return top 3 slots with short rationales ("Tuesday 2pm — mid-afternoon, post-standup, keeps your Wed peak clean").

5. **Block focus time.** A `block_focus(duration, window)` call creates a calendar event titled `[Focus] <current top-3 goal>` with `busy` status, `private` visibility, and description linking to the goal from `memory/goals.md`. Focus blocks auto-re-propose if displaced by an accepted meeting.

6. **Create/adjust.** Creates default to `guestsCanSeeOtherGuests: false`, Google Meet auto-attached for 2+ attendees, 10-min default reminder. Rescheduling always proposes the new slot before calling `update_event`, even at L3, because of the blast radius of a bad reschedule.

## Integration

- **observe** — watches the calendar stream for changes originated outside the assistant (someone else invited the user); triggers prep-meeting and daily-brief recalculation.
- **remember** — reads energy patterns, non-negotiables, and relationship cadence targets (from relationship-coach).
- **communicate** — narrates trade-offs when conflicts surface ("moving the 3pm frees your peak tomorrow but pushes Sarah's 1:1 to Thursday").
- **act** — executes the MCP writes.
- **schedule** — the heartbeat that triggers prep-meeting 60min before events.

## Autonomy Behavior

- **Level 1:** Reads freely. All writes (create/update/delete) require explicit user confirmation with the exact payload shown. No focus blocks created without approval.
- **Level 2:** Creates focus blocks autonomously during established patterns. Creates meetings when the user has explicitly delegated ("schedule a 30 min with Priya this week"). Reschedules flagged for user approval unless it's self-displacement (moving its own focus block to resolve a conflict).
- **Level 3:** Accepts routine meetings matching pre-declared rules (1:1s with direct reports, recurring team syncs). Proactively proposes reschedules when detecting energy-pattern violations — e.g., "your Wed has three back-to-backs in peak hours, want me to move the 10am to 2pm?"

## Memory

- **Reads:** `memory/energy-patterns.yaml`, `memory/non-negotiables.yaml`, `memory/goals.md` (for focus block titles), `memory/preferences.yaml` (meeting defaults — buffer time, conference tool).
- **Writes:** `memory/calendar-learnings.jsonl` — when the user accepts/rejects suggestions, what they reschedule, what they decline. Feeds pattern refinement.

## Failure Modes

- **Hidden-calendar blindness** — missing conflicts on a shared calendar the user forgot to connect. Avoid by listing all detected calendars on first run and asking which to include; re-verify quarterly.
- **Focus-block theater** — blocking time the user never actually defends, so invitees learn to override it. Avoid by tracking defend-rate; if under 50% over 30 days, surface "your focus blocks are being overridden — want to tighten the rules or drop them?"
- **Timezone silent errors** — creating an event in the wrong zone when the user is traveling. Avoid by always echoing the proposed time in the user's currently-stored zone AND the attendees' zones before writing.
