---
name: manage-email
description: Triage Gmail via an Eisenhower matrix tuned to the user's own urgency examples
when_to_use: User says "what's in my inbox", "draft a reply to X", "summarize this thread", "clear my inbox". Activates on scheduled sweeps (morning, post-lunch, end-of-day) and when a VIP sender lands in the inbox.
tools:
  - mcp: gmail
---

# Manage Email

The inbox layer. The goal isn't zero — it's clarity. Every message gets classified into one Eisenhower quadrant and routed to exactly one action. The classification is tuned continuously against examples the user provides, so "urgent" means what the user means, not what a generic model assumes.

## How It Works

1. **Fetch.** `gmail.search_threads(query="in:inbox -label:triaged newer_than:2d")` — threads, not messages, so replies are evaluated in context.

2. **Classify into Eisenhower quadrants.**
   ```
                  Urgent              Not urgent
   Important    | Q1: DO NOW        | Q2: SCHEDULE
   Not imp.     | Q3: DELEGATE/DECLINE | Q4: ARCHIVE
   ```
   Signals feeding the classifier:
   - **Urgent**: explicit deadline in body, sender in VIP list, thread-age × waiting-on-me, calendar-tied ("before our 3pm"), regex match against `urgency_examples` from memory.
   - **Important**: sender relationship score, topic match with active projects/goals, action-required phrasing.

3. **Route per quadrant.**
   - **Q1 (Now)** — surface immediately as attention-layer check-in with a one-line summary and "draft reply" button. If user is in quiet hours, still drafts so the reply is ready when they open the app.
   - **Q2 (Schedule)** — create a Todoist task `Reply to <sender>: <subject>` with due date matching the thread's implicit deadline, label `@email`. Archive the message with label `triaged/scheduled`.
   - **Q3 (Delegate/Decline)** — draft a polite decline or a delegation handoff; leave in drafts for user review. Template: "Thanks for thinking of me — <reason>. <alternative>." Never auto-sends at any autonomy level.
   - **Q4 (Archive)** — archive with label `triaged/archived`. Newsletters, notifications, FYIs. Never surfaced in daily-brief.

4. **Draft replies.** Three-part scaffold matching the user's stored style (from `memory/communication-style.md`):
   - Acknowledge the core ask in one sentence.
   - Respond to it (answer, propose, decline).
   - Close with next step or none.
   No "I hope this finds you well." No "just circling back." Length mirrors inbound length within ±30%.

5. **Summarize threads.** For threads ≥4 messages, `get_thread(id)` then collapse into: what was asked, what was decided, what's pending, who's waiting on whom.

## Integration

- **remember** — reads VIP list, urgency examples, communication style, active projects; writes classification outcomes (user overrides are training data).
- **observe** — feeds new-mail events into check-in scoring.
- **communicate** — draft composition leans on communicate's voice model.
- **act** — executes archive/label/draft MCP calls.
- **manage-tasks** — Q2 routing creates tasks.
- **manage-calendar** — meeting-request emails get handed off.

## Autonomy Behavior

- **Level 1:** Classifies and proposes. Every archive, label, and draft requires approval. Shows the full classification reasoning ("I tagged this Q3 because the sender isn't a VIP and the ask is 'optional intro' — agree?") to build the user's trust in the model.
- **Level 2:** Auto-archives Q4. Auto-drafts Q2 and Q3 replies into Gmail Drafts (never sends). Q1 always interrupts for confirmation before reply. Tracks override rate per quadrant and surfaces drift monthly.
- **Level 3:** Auto-archives Q4 and Q2 after task creation. Sends Q1 replies matching established patterns (confirmations, short factual answers to known collaborators) — but never sends anything over 2 sentences without confirmation, and never sends to non-VIPs. Maintains a 7-day undo window by labeling auto-sent as `triaged/auto-sent`.

## Memory

- **Reads:** `memory/vip-contacts.yaml`, `memory/urgency-examples.md` (user-curated list of what "urgent" actually looks like), `memory/communication-style.md`, `memory/projects.md`.
- **Writes:** `memory/email-classifications.jsonl` — `{thread_id, quadrant, confidence, user_override}` — every override retrains the classifier weighting.

## Failure Modes

- **Tone mimicry theater** — drafting replies that sound "like the user" but miss the user's actual relational context (warmer to some, terse with others). Avoid by storing per-contact tone notes in relationship-coach and reading them before drafting.
- **VIP staleness** — the VIP list reflects the user's world from 6 months ago. Avoid by flagging VIPs with zero inbound for 90 days ("still a VIP?") and proposing additions when a non-VIP hits 5+ threads in a month.
- **Auto-send regret** — L3 sends a confirmation that turns out to need nuance. Avoid by the 2-sentence cap, the VIP-only rule, and the `triaged/auto-sent` undo window with a daily review prompt.
