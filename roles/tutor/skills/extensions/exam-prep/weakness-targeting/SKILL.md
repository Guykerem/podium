---
name: weakness-targeting
description: Identify bottom-quartile concepts and run focused remediation sprints with 3-5x oversampling until mastery clears threshold
when_to_use: >
  After every practice test (errors feed directly into targeting), weekly
  as part of the exam-prep review cycle, or when assess-progress identifies
  stuck concepts regardless of exam context.
tier: extension
pack: exam-prep
---

# Weakness Targeting

Applies the evidence-based principle that bottom-quartile concepts deserve 3-5× the practice of mid-tier concepts. Over-samples weaknesses until they clear the mastery threshold — then phases them back to normal review cadence.

## How It Works

### 1. Identify the Bottom Quartile
From the mastery model: concepts with `mastery < 25th percentile` of the student's own distribution (not an absolute cutoff — some students' bottom quartile is 0.5, others is 0.1; both need targeting).

Tie-break with:
- Exam weight (how much of the exam tests this concept?).
- Recency of errors (a fresh wrong answer > a stale one).
- Prerequisite role (concept is a foundation for many others = higher priority).

### 2. Diagnose Before Drilling
A low score on a concept is a symptom, not a diagnosis. Before oversampling, run a diagnostic:
- Is the student missing the *concept* or just the *execution*?
- Is this a prerequisite gap (earlier concept not mastered)?
- Is this a misconception (they believe something false about the concept)?
- Is this an encoding issue (they were taught in a modality that doesn't stick for them)?

Route per diagnosis:
- Prerequisite gap → `learning-plan` inserts the prerequisite review.
- Misconception → `synthesize` a targeted explainer addressing the specific wrong belief.
- Encoding issue → `adapt-style` switches modality.
- Execution only → proceed to drilling.

### 3. Run a Sprint
A sprint is a bounded, focused block: 3-5 sessions across 1-2 weeks, all emphasizing the target concept at 3-5× baseline frequency.

Sprint structure per session:
- Warm-up: one easy item to unstick confidence.
- Drill: 5-8 items on the target concept at varied Bloom levels and item formats.
- Transfer: one novel-context item to check real mastery (not just item-level recognition).
- Mixed review: 2-3 items on other concepts to keep interleaving honest.

### 4. Check and Graduate
After the sprint, re-test at a delay of 3-5 days (forgetting curve check). If retrievability holds above `retention_threshold`, graduate the concept back to normal review cadence. If not, second sprint — different diagnosis, different angle.

Graduation must include a **transfer item** — one the student hasn't seen that requires applying the concept in a new surface context. Mastery that doesn't transfer isn't mastery.

### 5. Don't Stay Stuck
Three sprints without graduation = the concept needs a different intervention. Options:
- Bigger prerequisite gap than the diagnosis found.
- Concept poorly taught in the source material (switch sources).
- Concept genuinely confusing; seek expert help (flag to student).

The agent does not keep hammering the same concept indefinitely. It admits when it's out of strategies.

### 6. Record
`memory/learning-log/sprints/<concept_id>-<date>.md` with diagnosis, structure, results, and graduation or escalation.

## Composition
- Composes `quiz` (sprint item delivery), `synthesize` (remediation explainer), `adapt-style` (modality switch), `learning-plan` (prerequisite insert).
- Feeds `assess-progress` with sprint outcomes.

## Autonomy Behavior
- **L1** — Each sprint proposed with diagnosis explained; student approves.
- **L2** — Routine sprints run automatically; escalations proposed for approval.
- **L3** — Full loop; escalation flags remain non-silent.

## Activation
Extension. Pairs with `practice-tests` and `study-schedule` in exam-prep. Also usable outside exam context — activate any time `assess-progress` surfaces stuck concepts.
