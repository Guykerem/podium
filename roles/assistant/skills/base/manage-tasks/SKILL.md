---
name: manage-tasks
description: Capture, prioritize, and track tasks across Todoist, Linear, and Notion with GTD discipline
when_to_use: User says "add to my list", "what's on my plate", "what should I work on", "weekly review". Also activates when the assistant observes a commitment in conversation ("I'll send that by Friday") and on scheduled weekly-review cadence.
tools:
  - mcp: todoist
  - mcp: linear
  - mcp: notion
---

# Manage Tasks

The task layer of the assistant. Captures anything the user commits to, maintains a single cross-tool view, and answers the GTD question "what's the next action?" without making the user hunt. Tasks live where they already live — Todoist for personal, Linear for engineering, Notion for project notes — this skill is the unified lens, not a fourth silo.

## How It Works

1. **Capture (inbox-first).** Anything caught in conversation lands in the Todoist Inbox project with `@inbox` label. Structure enforced:
   ```
   {
     content: "Draft Q2 OKR doc",
     due: null,                 // captured tasks never get dates at capture time
     labels: ["@inbox"],
     description: "from: chat 2026-04-17 — context: Sarah asked for a draft before Wed standup"
   }
   ```
   Dates, projects, and priorities get assigned during review — not capture.

2. **Classify.** On next review (or immediately at L3), move each inbox item to its home:
   - Work/engineering with an owner or sprint → Linear (create issue, link Todoist task to issue URL).
   - Project-attached research or drafting → Notion page in the relevant project.
   - Personal or cross-cutting → Todoist project.

3. **Prioritize.** Four-level scheme matching Todoist priorities:
   - P1 = today, blocks someone else
   - P2 = this week, promised
   - P3 = this month, valuable
   - P4 = someday / may discard

4. **Surface.** Three standard queries:
   - `next_action(context)` — "I have 20 minutes and I'm at my desk" → P1/P2 items matching `@computer` or context label.
   - `overdue()` — anything past `due_date` by >24h, grouped by age.
   - `weekly_review()` — dumps inbox count, overdue count, P1/P2 for the week, stale P3s (>30 days untouched).

5. **Close the loop.** Completed tasks with linked commitments (from `memory/commitments.md`) mark the commitment resolved and notify the relationship-coach if the commitment was to another person.

## Integration

- **remember** — reads `memory/commitments.md`, `memory/projects.md`; writes task-outcome history for priority calibration.
- **observe** — detects commitment phrases in chat and in outgoing email (via manage-email hook) to auto-propose captures.
- **communicate** — frames weekly review as a conversation, not a dump.
- **act** — performs the actual MCP writes against Todoist/Linear/Notion.
- **schedule** — weekly-review reminder, daily overdue sweep.

## Autonomy Behavior

- **Level 1:** Never creates a task without confirmation. Detected commitments surface as "I heard you say you'd send the draft by Friday — add to Todoist?" Classification and prioritization always ask.
- **Level 2:** Auto-captures to inbox without asking. Classification stays assistive — proposes the destination ("this feels like a Linear issue on the onboarding project, confirm?"). Auto-completes tasks when linked PRs merge.
- **Level 3:** Full inbox-to-classified pipeline runs autonomously. Weekly review is pre-drafted with proposed re-prioritizations; the user reviews and edits rather than builds from scratch. Stale P3s auto-demote to P4 after 60 days with a log entry.

## Memory

- **Reads:** `memory/projects.md` (current active projects and their homes), `memory/commitments.md`, `memory/preferences.yaml` (preferred review day, context labels like `@computer` / `@errand` / `@deep`).
- **Writes:** `memory/task-history.jsonl` for completion rates per priority and per project — feeds overcommitment detection in time-advisor.

## Failure Modes

- **Inbox infinity** — capturing without ever classifying, turning Todoist Inbox into a junk drawer. Avoid by hard-capping inbox at 25 items; at 26, the next capture triggers a forced mini-review.
- **Cross-tool drift** — a Linear issue gets closed but its Todoist shadow lingers. Avoid by linking via external URL at classification time and polling linked items daily.
- **Priority inflation** — everything becomes P1. Avoid by enforcing a per-day P1 cap of 3 (user-configurable); a 4th P1 proposal triggers "something here needs to drop to P2 — which?"
