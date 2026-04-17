---
name: daily-brief
description: Morning summary that curates, never dumps — five sections, each skips if empty
when_to_use: Scheduled once per morning at `memory/preferences.yaml:brief_time` (default 07:30 local). Also on demand — "give me the brief", "what's today look like".
---

# Daily Brief

The single start-of-day artifact. Everything the user needs to walk into the day prepared; nothing they don't. The brief is a curation decision, not a feed. If a section would be noise, it's omitted entirely — an empty section is a form of clutter.

## How It Works

Fixed section order. Each section renders only if it has non-trivial content. Total target length: fits on one phone screen (roughly 250 words).

### 1. Needs Attention

Zero to three items. Only things that will actively break or slip if ignored today. Each is one line:
- What it is
- Why it's in this section (deadline, blocker, VIP waiting)
- The one action to resolve

If nothing meets the bar, the section doesn't render. This is load-bearing — users learn that seeing "Needs Attention" means actually needing attention.

### 2. Today's 3 Priorities

Exactly three (or fewer if the day is thin). Each includes the **why** — tied to a stored goal or commitment, not just the task text:
```
1. Draft Q2 OKR — Sarah blocked on this for her Thursday planning
2. 45min deep work on the onboarding redesign — your top-3 quarterly goal, last touched 4d ago
3. Reply to Priya re: conference talk — promised a yes/no by Friday, today is Thursday
```

The WHY comes from `memory/goals.md`, `memory/commitments.md`, or relationship-coach state. No why → not a priority.

### 3. Calendar

Chronological, with prep inline rather than as a separate section. Format:
```
10:00  Standup (30m)
11:00  Priya 1:1 (30m) — last time: discussed conference invite, she was considering; open: her ask about Q3 roadmap
14:00  [Focus] Onboarding redesign (90m)
16:00  Review draft with Sarah (30m) — draft in Docs, section 3 still TBD
```

Back-to-back stretches >2h flagged. Conflicts flagged first with proposed resolution.

### 4. Inbox Highlights

Maximum seven items. Newsletters, receipts, calendar confirmations filtered out entirely. Related items combined (three messages on the same thread → one line). Each:
- Sender, subject
- One-line what-they-want
- Proposed action (Q1/Q2/Q3 from manage-email)

If fewer than three messages meet the bar, inline into "Needs Attention" and skip the section.

### 5. Today's Tasks

Next-action queue for today, pulled from manage-tasks. P1 and P2 due today only. P3/P4 never appear here. Grouped by context label (`@computer`, `@errand`, `@calls`) if 5+ items.

## Integration

- **remember** — reads goals, commitments, VIPs, and user's brief preferences (length, sections to always include/skip).
- **manage-tasks** — source of priority 1-3 and today's task list.
- **manage-calendar** — source of calendar section, with prep lookups.
- **manage-email** — source of inbox highlights, already pre-classified.
- **relationship-coach** — enriches calendar lines with "last time" context.
- **communicate** — final render; tone is crisp, factual, warm in ≤1 place per brief.
- **schedule** — morning trigger.

## Autonomy Behavior

- **Level 1:** Drafts the brief and pauses for user approval before any follow-on action (e.g., creating reply drafts referenced in Inbox Highlights). The brief itself is always shown unmodified.
- **Level 2:** Brief renders as-is. Follow-on drafts (Q2/Q3 email replies, task creations referenced in the brief) are pre-prepared. The user sees what's proposed.
- **Level 3:** Brief includes a "Already done this morning" footer: Q4 emails archived (count), focus blocks confirmed, routine Q1 confirmations sent. Keeps the user in loop on autonomous actions without cluttering the main sections.

## Memory

- **Reads:** everything — this skill is a composer. Specifically `memory/goals.md`, `memory/commitments.md`, `memory/relationships.yaml`, `memory/preferences.yaml:brief_time`, `memory/axioms.md`.
- **Writes:** `memory/brief-history.jsonl` — each section rendered and its content summary. Feeds the "what did I focus on last week" retrospective.

## Failure Modes

- **The wall-of-text brief** — section gating fails and everything renders. Avoid by enforcing hard caps per section (3 priorities, 7 inbox items, 3 needs-attention) at composition time.
- **The why-less priority** — a priority appears without a stored reason, so the user feels dictated to. Avoid by refusing to place any item in Priorities without a resolvable link to goals/commitments; if none exists, demote to Tasks.
- **Calendar prep echo** — prep notes restate event titles instead of adding context. Avoid by only including a prep line if it contains information the user couldn't infer from the event title alone.
