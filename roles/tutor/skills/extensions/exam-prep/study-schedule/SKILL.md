---
name: study-schedule
description: Build and maintain an exam-countdown study schedule — phases, blocks, review density increasing toward exam day
when_to_use: >
  Student sets an exam deadline in onboarding or mid-plan. Also when the
  current schedule isn't working — too sparse, too crammed, wrong mix.
tier: extension
pack: exam-prep
---

# Study Schedule

Turns an exam date and a set of target concepts into an actionable, week-by-week schedule with increasing review density as the exam approaches.

## How It Works

### 1. Parameter Gathering
From onboarding + ongoing conversation:
- Exam date.
- Concept scope (syllabus, past papers, official guide).
- Current mastery baseline (from the first practice test or `assess-progress`).
- Available hours per week.
- Blackout dates (work deadlines, travel).

### 2. Three-Phase Structure
- **Foundation** (weeks N → N-4): cover the syllabus. Mastery-first, not coverage-first. Blocked practice within concept.
- **Integration** (weeks N-4 → N-1): interleaved review across concepts; practice-tests start; weakness sprints.
- **Taper** (final week): reduce new material; high-retrieval, low-intensity. Day before: review summaries and rest.

### 3. Weekly Templates
Each week has a canonical shape:
- 60% target concepts (new + review).
- 25% weakness targeting (bottom-quartile concepts).
- 10% mixed retrieval (interleaved).
- 5% strategy / wellness.

Templates adjust phase-to-phase: foundation-phase weeks are 70% new; taper weeks are 5% new, 85% review.

### 4. Daily Blocks
Sessions respect the `session_length_sweet_spot` from `adapt-style` — typically 25-50 min blocks, with mandatory breaks. No 4-hour cram sessions; evidence is clear they underperform.

### 5. Deadline-Aware SRS
Override SRS defaults near the exam: cards due *after* the exam are pulled in; cards not yet scheduled are front-loaded if mastery is below threshold. Target retention raises from default 0.85 to 0.9 in the final two weeks.

### 6. Visible Schedule
Surface the schedule to the student through whichever channels they picked (calendar integration if enabled, email digest, CLI). Include:
- This week's shape.
- Milestone list with dates.
- Blackout days respected.
- A single "today's priorities" view.

### 7. Adapt on Signals
After each session / practice test, adjust:
- Weaker than expected → reallocate time from strongest concepts to weakest.
- Stronger than expected → pull the next milestone forward; open time for interleaving.
- Burnout signals (from `assess-progress`) → lighten the week, do not add.

## Composition
- Composes `learning-plan` (content sequencing), `weakness-targeting` (sprint scheduling), `practice-tests` (cadence fit).
- Orchestrates `schedule` (core) to drop sessions onto the student's calendar.

## Autonomy Behavior
- **L1** — Full schedule proposed; student approves every week's template.
- **L2** — Schedule auto-generated; student reviews Sunday.
- **L3** — Full autonomy; schedule silently rebalances as mastery shifts, weekly diff surfaced.

## Activation
Extension. Activate when an exam date is set. Pair mandatorily with `practice-tests` and `weakness-targeting` — they form one coherent kit.
