---
name: project-mentor
description: Guide the student through building a real project via spiral progression — make it work, make it right, make it fast
when_to_use: >
  Student wants to "build something," learning-plan milestones include
  project deliverables, or mastery on related concepts is high enough that
  transfer practice is the next step.
tier: extension
pack: coding-tutor
---

# Project Mentor

Turn concept mastery into working artifacts through a spiral curriculum: build the same project three times with increasing constraints. The first pass is about getting it to work at all. The second is about doing it well. The third is about doing it efficiently — or robustly, or beautifully, depending on the domain.

## How It Works

### 1. Pick the Project
Scope is the hardest part. Use three sizing rules:
- **Small enough to finish in 3-5 sessions.** Ambition stretches quickly; bounded projects get completed.
- **Exercises 3-5 concepts from the plan** at their current mastery level. Not a mastery-transfer stretch on every dimension.
- **The student can state in one sentence what "done" looks like.** If they can't, the scope is wrong.

### 2. Pass 1 — Make It Work
- Accept ugly. Hard-coded values are fine. Copy-paste is fine.
- The only bar: does it do the thing, end-to-end, on at least one realistic input?
- Review with `code-review` when they claim done. Catch only correctness issues, not style.

### 3. Pass 2 — Make It Right
- Same project, same feature set, but refactored for clarity and structure.
- Identify 2-3 specific improvements — *not* a rewrite. Extract a function, name a variable honestly, remove a duplication.
- The student explains what they changed and why. Explanation is the evidence.

### 4. Pass 3 — Make It Fast (or Robust, or…)
- Domain-appropriate stretch. For scripts: handle bad input. For algorithms: optimize or add tests. For web: handle concurrent users. For data: make it reproducible.
- This pass is where mastery cements through transfer.

### 5. Milestone Check
At each pass transition, run an `assess-progress` delta on the concepts the project exercises. Low-mastery concepts that the project surfaced go back to the review queue.

### 6. Log the Project
`memory/learning-log/projects/<project-slug>.md` — scope, passes completed, concepts exercised, retros (what the student would do differently).

## Composition
- Orchestrates `code-review` (each pass end) and `quiz` (on newly-exposed patterns).
- Updates `learning-plan` milestones and `assess-progress` records.

## Autonomy Behavior
- **L1** — Scope, pass plan, and each review cycle proposed for approval.
- **L2** — Routine orchestration; agent surfaces scope drift, stuck points, and milestone transitions.
- **L3** — Full ownership of project cadence; weekly surfacing of progress.

## Activation
Extension. Activate when the student has working-level mastery on relevant concepts and the plan calls for applied practice. Don't activate for pure-reading learners unless transfer is explicitly a goal.
