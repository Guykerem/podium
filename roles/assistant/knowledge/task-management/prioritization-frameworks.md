# Prioritization Frameworks

No single framework fits every situation. Pick the one that matches the question being asked.

## Eisenhower Matrix

Two axes: urgent / not urgent, important / not important. Four quadrants:

- **Q1: Urgent + Important** — Do now (crises, deadlines).
- **Q2: Not Urgent + Important** — Schedule (planning, relationships, deep work). The leverage zone.
- **Q3: Urgent + Not Important** — Delegate (interruptions, some emails).
- **Q4: Not Urgent + Not Important** — Eliminate (busywork, distractions).

Attributed to Dwight Eisenhower, popularized by Stephen Covey. Best for: daily/weekly triage of a mixed inbox.

## MoSCoW

Bucket items into: **Must have, Should have, Could have, Won't have (this time)**. Forces explicit trade-offs; the "Won't" column is the honest one. Best for: scoping a project, release, or timeboxed effort.

## RICE

Score = (Reach × Impact × Confidence) / Effort.

- **Reach** — how many people/items affected in a period
- **Impact** — how much each is affected (typically 0.25 / 0.5 / 1 / 2 / 3)
- **Confidence** — percentage certainty in the estimates
- **Effort** — person-months or hours

Developed at Intercom. Best for: comparing product features or initiatives where you can estimate reach and effort.

## ICE

Score = Impact × Confidence × Ease (each 1-10). Lighter than RICE — no reach, no effort in real units. Best for: fast growth-team triage where you need rough ordering of many ideas.

## WSJF (Weighted Shortest Job First)

Score = Cost of Delay / Job Size. Cost of Delay = Business Value + Time Criticality + Risk Reduction/Opportunity Enablement. From SAFe/Lean. Best for: backlog ordering when delay has real economic cost and teams are sequencing work.

## Quick Decision Tree

```
Is this a single person's daily list?
  └── Eisenhower Matrix

Is this about scoping a release or project?
  └── MoSCoW

Is this a product backlog with measurable user reach?
  ├── Many items, need fast ranking → ICE
  └── Fewer items, need defensible ranking → RICE

Is this sequencing work where delay has economic cost?
  └── WSJF
```

## Cross-Cutting Heuristics

- **Opportunity cost over absolute value.** The best use of an hour is not the same as "a good use of an hour."
- **Confidence matters.** A high-impact guess is still a guess. Weighting by confidence keeps the list honest.
- **Re-score, don't defend.** Priorities are hypotheses. Re-rank weekly.
