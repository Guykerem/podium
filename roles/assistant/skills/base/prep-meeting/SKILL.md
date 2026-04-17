---
name: prep-meeting
description: One-hour-before meeting prep — attendees, thread history, open actions, relevant docs on one screen
when_to_use: Fires automatically 60 minutes before any calendar event with ≥2 attendees or marked `prep: true`. Also on demand — "prep me for my 3pm", "what do I need for the Priya meeting".
tools:
  - mcp: google-calendar
  - mcp: gmail
  - mcp: notion
  - mcp: linear
---

# Prep Meeting

The "walk-in-ready" layer. Sixty minutes before a meeting starts, assembles a single-screen brief: who's coming, what happened last time, what's pending, what might come up. The brief is opinionated — it chooses what matters, doesn't dump everything available.

## How It Works

### Trigger

Scheduled heartbeat checks the next 75 minutes of calendar. For each event matching:
- `attendees.length ≥ 2` (excludes solo focus blocks and personal blocks)
- OR `description contains "[prep]"` or event has `prep: true` metadata

…it runs prep at T-60min. Re-runs at T-15min if any new signal arrived (new email from an attendee, new linked doc edit).

### Brief structure (one screen)

```
## <Meeting title>   <time>  ·  <duration>  ·  <location/link>

### Who
- <attendee 1> — <role/relationship>, last talked <date> about <summary>
- <attendee 2> — ...

### Last time / thread context
<1-3 sentence recap of most recent related thread or meeting>

### Open action items
- [<owner>] <item> — <age>
- [<owner>] <item> — <age>

### Likely agenda
<inferred from subject/description + recent thread — explicitly marked "inferred" if no agenda was sent>

### Relevant docs
- <title> — <notion/linear URL> — <why>
```

Missing sections collapse. If no prior thread exists with any attendee, "Last time" is skipped rather than padded with filler.

### Data gathering

Parallel fetches:
1. **Attendees** — for each, query relationship-coach for entry. Non-tracked attendees get a lightweight lookup: name, domain, most recent email exchange subject.
2. **Thread history** — `gmail.search_threads(query=f"from:{email} OR to:{email} newer_than:60d")` filtered to most-recent thread relevant to meeting subject (simple topic match).
3. **Open action items** — query manage-tasks for items tagged with attendee name, any Linear issues assigned across attendees, any Notion pages in shared projects with unchecked todos.
4. **Relevant docs** — search Notion and Linear for pages/issues matching meeting subject keywords, filtered to those edited in the last 14 days OR linked from the calendar event description.

### Opinion layer

The skill is opinionated about what goes in:
- Action items older than 30 days → demoted to "stale" footnote, not top-level.
- Docs no one has opened in 30+ days → skipped.
- Threads with >10 messages → compressed to "last decision: X; open: Y."
- If an attendee is in VIP list, their open item with the user is surfaced even if low-urgency — VIPs get anticipation.

## Integration

- **manage-calendar** — source of the triggering event.
- **manage-email** — thread fetch and compression.
- **relationship-coach** — attendee context and tone cues.
- **manage-tasks** — open action items across Todoist/Linear/Notion.
- **observe** — the heartbeat that fires T-60min and the re-check trigger.
- **communicate** — renders the brief; tone is informational and direct, not advisory.

## Autonomy Behavior

- **Level 1:** Generates and surfaces the brief as a progress-layer message at T-60min. If user hasn't acknowledged by T-15min, escalates to attention layer. No external actions taken.
- **Level 2:** Same surfacing. Also pre-drafts any needed follow-ups the brief reveals (e.g., "you owe Priya an answer on the roadmap question before this meeting") into Gmail Drafts.
- **Level 3:** Surfaces the brief. If the brief reveals a blocker the user can resolve in <5 minutes (send a file, confirm a time, forward a thread), auto-executes with a notification. For anything else, pre-drafts.

## Memory

- **Reads:** `memory/relationships.yaml`, `memory/projects.md` (topic → docs mapping), `memory/vip-contacts.yaml`, `memory/preferences.yaml` (brief lead time — default 60min).
- **Writes:** `memory/meeting-prep-log.jsonl` — which briefs were opened, which were ignored, which led to an action. Feeds tuning of what to include.

## Failure Modes

- **The everything-brief** — pulling every email and doc that matches loosely, drowning the user at T-60. Avoid by strict recency and relevance gates (14d docs, topic match ≥0.6) and hard caps (5 attendees, 5 docs, 5 action items).
- **The wrong-meeting prep** — misidentifying which thread is "the one" because two threads with the same person are active. Avoid by matching on subject keywords from the calendar event title/description first; if ambiguous, show top 2 threads labeled rather than guessing.
- **Silent misses** — skipping prep for a meeting because attendees list was empty on the event (common with externally-invited meetings). Avoid by falling back to title + description parsing for email-looking strings before concluding "no attendees."
