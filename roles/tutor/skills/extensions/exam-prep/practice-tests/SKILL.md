---
name: practice-tests
description: Deliver full-length practice tests on the cadence that matches research — 4, 2, 1 weeks and 2 days out — and extract learning from errors
when_to_use: >
  Student has an exam date. Cadence triggers automatically off the deadline
  set in onboarding; can also be requested on demand.
tier: extension
pack: exam-prep
---

# Practice Tests

Practice tests do two things: diagnose current standing, and — via testing effect — strengthen memory more than any amount of re-reading. This skill runs them on the cadence evidence supports and mines errors for targeted follow-up.

## How It Works

### 1. Cadence
Given exam date D:
- **D – 4 weeks**: baseline full-length test (timed, exam conditions).
- **D – 2 weeks**: second full-length. Compare to baseline.
- **D – 1 week**: third full-length, focused on weakness areas identified.
- **D – 2 days**: light targeted review — NOT full-length. Goal is confidence and recovery, not new diagnostics.

Exam-adjacent practice is diminishing returns; over-testing the day before measurably hurts performance.

### 2. Exam Conditions
Practice tests replicate real conditions:
- Strict timing (can't pause, can't look up).
- No hints from the agent during the test.
- No partial-credit scaffolding.
- Same item formats, same cognitive load as the real exam.

The agent's job is silence until the test ends.

### 3. Error Analysis — the Real Point
After a test, spend **longer on the review than the test itself**. For each wrong item:
- What was the concept being tested?
- What did the student think the answer was? Why?
- What's the correct reasoning?
- What misconception does this error reveal?
- What's the nearest neighbor — a question they'd answer correctly that distinguishes from this one?

Log misconceptions with the tagging used by `quiz`. Recurring misconceptions trigger `weakness-targeting` sprints.

### 4. Score Tracking with Honesty
Track raw score, percentile (against target), and per-concept accuracy. Report trends over the three tests. Don't grade-inflate — if a test dropped, say so and dig into why.

### 5. Fatigue and Pacing Signals
Full-length tests surface non-content failures:
- Accuracy dropping in later sections → pacing, stamina issues.
- Careless errors on easy items → attention / anxiety.
- Time running out → strategy issue.

These are teachable skills — pair with `test-taking-strategy` guidance.

### 6. Post-Test Plan
After the review, propose 3-5 concrete items for the coming week. Hand to `learning-plan` and `weakness-targeting` for scheduling.

## Composition
- Composes `quiz` (item delivery in exam mode) and `weakness-targeting` (remediation sprints).
- Feeds `assess-progress` with big-stakes signal data.

## Autonomy Behavior
- **L1** — Each practice test scheduled and approved before delivery.
- **L2** — Routine cadence followed; student reviews the error-analysis output.
- **L3** — Full cadence including automated scheduling and error-review reports.

## Activation
Extension. Activate when the learning plan has an exam deadline. Inactive for open-ended learning without a test.
