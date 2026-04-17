---
name: delegate-tasks
description: Assign tasks to teammates with rationale, track accountability, and nudge on overdue work without nagging.
when_to_use: >
  User says "have Maya take this", "assign to the team", "who should own this",
  or when an inbox item / meeting action is clearly owned by someone else.
  Also when overdue delegations need a gentle check-in.
tools:
  - mcp: linear
  - mcp: asana
  - mcp: todoist
---

# Delegate Tasks

Good delegation is a contract, not a handoff. This skill captures the what, the why, the owner, and the deadline — then keeps the thread alive so nothing quietly rots.

## How It Works

1. **Parse intent.** Extract:
   - `title` — one-line task
   - `owner` — single DRI (never a group)
   - `deadline` — explicit date, or "EOW"
   - `rationale` — why this person, why now (this is the part most delegations skip)
   - `success` — what "done" looks like in one sentence
2. **Pick the system of record.** Linear for engineering, Asana for cross-functional, Todoist for personal-ops. If the user hasn't configured one, ask once and remember.
3. **Create the task via MCP.** Attach rationale as the first comment. Tag owner. Set due date.
4. **Log the delegation** in `memory/delegations.md` with a `status: open` entry so the agent can track it independently of the external tool.
5. **Nudge protocol.** At deadline - 1 day: internal-only reminder. At deadline + 2 days with no update: draft a short check-in for the user to send — never auto-ping the delegate.
6. **Close the loop.** When task is marked done, append outcome + lesson-learned to the memory entry.

## Integration

- `communicate` — drafts the delegation message and check-ins
- `remember` — stores delegation log and patterns ("Maya usually ships 2 days late on design tasks")
- `observe` — watches Linear/Asana webhooks for status changes
- `act` — creates the task via MCP when autonomy allows
- `schedule` — sets the nudge timers

## Autonomy Behavior

- **Level 1:** Drafts the task + message; user confirms before anything is created or sent.
- **Level 2:** Creates the task autonomously when the assignment is obvious and the owner is an established collaborator. Asks before creating check-in messages to the delegate.
- **Level 3:** Full loop including check-ins, but still surfaces a daily "delegations you own" digest so the user never loses visibility.

## Memory

**Reads:** `memory/people.md` (who does what, workload, timezone), `memory/delegations.md` (open items, history).

**Writes:** appends to `memory/delegations.md`. Each entry:
```
- id: del-2026-04-17-01
  title: Draft Q2 onboarding doc
  owner: maya@team.co
  rationale: Maya rewrote the Q1 version and has the most context
  deadline: 2026-04-24
  status: open   # open | done | stalled | cancelled
  created: 2026-04-17
  last_nudge: null
```

## Failure Modes

- **Diffuse ownership.** Task assigned to two people "to collaborate." Always force a single DRI; co-owners can be tagged but not owners.
- **Silent rot.** External tool status drifts from agent's memory. Reconcile weekly via `status-rollup`.
- **Over-nudging.** Agent pings the user about the same overdue item every day. Deduplicate: one nudge per item per week unless deadline shifts.
