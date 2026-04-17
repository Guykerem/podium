---
name: time-advisor
description: Analyze how time maps to priorities — grounded in the user's own axioms, never generic advice
when_to_use: User says "how's my week looking", "am I overcommitted", "what should I cut". Also fires weekly (retrospective) and when manage-calendar detects >N hours of meetings in peak hours for 2+ consecutive days.
---

# Time Advisor

The reflective layer. The assistant's answer to "am I spending my time on the right things." Every observation it makes is anchored in axioms the user has explicitly stored — peak hours, top-3 goals, non-negotiables, shutdown ritual. Without axioms, this skill stays silent; it refuses to produce generic "you should block deep work" advice.

## How It Works

### The four axioms (required before this skill activates)

Stored in `memory/axioms.md` — a plain prose document, not a schema. This skill parses out four specific anchors:

1. **Peak hours** — when cognitive ceiling is highest (also in `memory/energy-patterns.yaml`).
2. **Top-3 goals** — the quarterly commitments everything else competes against (from `memory/goals.md`).
3. **Non-negotiables** — recurring blocks the user protects regardless of demand (pickup, workout, family dinner).
4. **Shutdown ritual** — what a finished workday looks like.

If any of these is missing, the skill surfaces "I can't give you time advice until we capture your [axiom] — want to do that now?" rather than defaulting to templates.

### Analysis patterns

**Priority-to-time ratio.** For the trailing 7 days:
```
time_on(top_goal_1) / total_work_hours   → expected vs actual
time_on(reactive / meetings) / total     → tolerance threshold
time_in(peak_hours) on top-3 goals       → the key ratio
```
If `time_in_peak_hours_on_top3 < 40%` of peak hours, this is the primary finding.

**Overcommitment flags.** For the forward 7 days:
- Meetings occupying >60% of any workday → flag.
- Zero ≥90min deep-work blocks on a day → flag.
- Peak hours booked with meetings on 3+ days → flag.
- Non-negotiable violated (meeting during pickup time) → flag immediately, not weekly.

**Framing the finding.** Every output follows this shape:
```
Observation (what the data shows)
Axiom it bumps against (quoted from memory/axioms.md)
Options (2-3 concrete moves, not "reduce meetings")
The one you'd do if you only did one
```

Example:
> Observation: 4 of 5 mornings next week are meetings in your peak hours.
> Axiom: "I only get 3 good peak hours a day — spending them reactive is the single biggest leak."
> Options:
>   - Move the Tues/Thurs standups to 1pm (standing proposal to the team).
>   - Block 9-10:30 as Focus on M/W/F, default-decline invites.
>   - Drop the Fri architecture review to biweekly.
> If you only do one: Tuesday standup move — it unblocks the most peak hours for the least social cost.

### What it refuses to say

- "You should do deep work." (generic — not tied to an axiom)
- "Consider time-blocking." (generic)
- "Here's a productivity tip." (never)
- Any advice that would contradict a stated non-negotiable.

## Integration

- **remember** — central to this skill; axioms are the input.
- **manage-calendar** — source of forward and backward time data.
- **manage-tasks** — source of what the user is actually working on (completion history).
- **relationship-coach** — feeds in commitments to people that constrain calendar choices.
- **communicate** — every finding renders through communicate's voice so it reads as a thoughtful peer, not a coach algorithm.

## Autonomy Behavior

- **Level 1:** Analyzes on explicit request only. Presents findings; never proposes calendar edits directly — hands off to manage-calendar with user approval.
- **Level 2:** Runs the weekly retrospective autonomously and surfaces findings in Friday's daily-brief Needs Attention. Proposes specific calendar moves for the user to approve.
- **Level 3:** Runs continuously. When the forward-week analysis crosses two or more flags, auto-drafts calendar moves (but doesn't execute), surfaces as a single attention-layer check-in mid-week: "Here's what next week looks like against your axioms, and here are three moves I'd make — approve any or all?"

## Memory

- **Reads:** `memory/axioms.md` (primary), `memory/goals.md`, `memory/energy-patterns.yaml`, `memory/non-negotiables.yaml`, `memory/task-history.jsonl`.
- **Writes:** `memory/time-retrospectives.jsonl` — weekly snapshots of ratios. Feeds the long-arc "am I drifting from my stated priorities over months" view.

## Failure Modes

- **Axiom-free advice drift** — temptation to offer wisdom when axioms aren't captured. Avoid by hard-gating: no axioms → no output, only a prompt to capture them. This is the skill's defining discipline.
- **Retrospective-only bias** — only looking back, never flagging forward overcommitment in time to change it. Avoid by running both trailing and forward analyses on every activation.
- **Axiom staleness** — using a peak-hours definition from a year ago when the user's schedule has fundamentally shifted. Avoid by re-confirming axioms quarterly and whenever the trailing-7-day pattern diverges sharply (>2σ) from stored expectations.
