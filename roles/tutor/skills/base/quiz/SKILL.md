---
name: quiz
description: Generate and grade targeted questions calibrated to mastery and Bloom's level; update the mastery model
when_to_use: >
  Scheduled quiz windows (see schedule.yaml), on-demand retrieval practice,
  end-of-session check, or when a synthesis ends with a retrieval hook.
  Also called internally by learning-plan when assembling a session.
tier: base
---

# Quiz

Generate questions that actually teach. Grade them honestly. Update the mastery model with evidence. A quiz in this role is a *formative* instrument — it exists to strengthen memory and diagnose gaps, not to assign a score.

## How It Works

### 1. Pick Items From the Review Queue
Given a target session length (e.g. 5-10 items):
1. Pull due cards from `learning-plan`'s review queue, highest-priority first.
2. Add one stretch card from the next unmastered concept.
3. **Interleave** across concepts (mix, don't batch).
4. **Vary Bloom's level** across the set. Target level for any given card:
   `target_bloom = min(6, 1 + floor(mastery * 5))` — clamp at the highest Bloom the student can currently reach.

### 2. Generate or Retrieve the Item
For each card, either retrieve a prior item from the question bank (if unseen this week) or generate a new one with the **two-stage pipeline**:

**Stage A — Generate 3 candidates.** For each:
```
Concept: {concept_name}
Key idea: {one_sentence_from_synthesis}
Target Bloom level: {level}          # stems: {level_stems}
Student mastery: {mastery}
Difficulty target (IRT b): {b}       # ~mastery for calibrated challenge
Forbidden stems: {prior_stems}       # avoid repetition
Forbidden words in stem: {answer_keywords}   # anti-leak
Format: {mcq | short_answer | scenario | generative}
Return JSON: {
  question,
  answer,
  explanation,
  distractors: [{text, misconception}, ...],   # for MCQ
  rubric: [...],                               # for short_answer / generative
  bloom_level,
  difficulty_b
}
```

**Stage B — Critique and pick best.** Run each candidate through `validate-question` (see below). Pick the highest-scoring; if all fail, regenerate once with the failure reasons as feedback. If regeneration fails, skip the card this session rather than ship a bad question.

### 3. Validate Every Question
`validate-question` is a self-check pass, not a separate skill. Fail any candidate that:
- Contains answer keywords in the stem (anti-leak).
- Is answerable without the target concept (tests trivia instead of the concept).
- Has distractors that are synonyms of the answer or wildly implausible.
- Has mismatched Bloom level vs. the stem pattern (e.g. "Define X" on an Analyze target).
- Is ambiguous (multiple defensible answers, or the "correct" answer is debatable).

### 4. Present + Observe
- Deliver one question at a time (interleaved).
- Log `{timestamp, question_id, response, response_latency_ms, used_hint, correct}` to `memory/learning-log/<session>.md`.
- Never reveal the answer until the student commits. If they ask "is this right?" without committing, use hint-ladder instead (see `adapt-style`).

### 5. Grade
- **MCQ / short-answer with canonical answer**: deterministic match with fuzzy tolerance for typos + synonyms.
- **Generative / scenario**: rubric-based. Each rubric point scored {0, 0.5, 1}. Partial credit is real.
- Assign a quality score `q ∈ {0..5}` (Anki-style):
  - 5 = perfect, no hesitation, no hint
  - 4 = correct after small hesitation
  - 3 = correct with effort or after one hint
  - 2 = correct after bottom-out hint; hasn't internalized
  - 1 = wrong, recognized the area
  - 0 = wrong, blank, or abandoned

### 6. Update the Mastery Model
Two updates per item:

**SM-2 card state** (see `learning-plan` for formula) — mutates `ef`, `interval_days`, `repetition`, `next_review`.

**PFA concept mastery**: `logit(mastery') = β_concept + γ * successes + ρ * failures`, where a success is `q ≥ 3` and a failure is `q < 3`. Store `{successes, failures, last_mastery}` per concept. Update β, γ, ρ weights weekly via the `assess-progress` cycle.

### 7. Feedback to the Student
- If correct and confident → one-line affirmation, move on.
- If correct but slow / hinted → explain the reasoning, flag for earlier review.
- If wrong → use **hint ladder**:
  1. Socratic redirect ("what's the thing that makes this case different?")
  2. Partial prompt (name the relevant concept)
  3. Near-bottom-out (show the setup, not the answer)
  4. Bottom-out worked solution.
- After any bottom-out, schedule a near-term re-quiz on the same concept with a different surface (novel example).

### 8. Persist
- Store the question + rubric + misconception tags in `memory/sources/_questions/<concept_id>.md` (the question bank).
- Track which misconceptions are recurring — they feed `assess-progress` pattern detection.

## Composition

- Uses `synthesize` for the one-sentence key idea and forbidden stems.
- Uses `remember` to read the student's misconception history and write item + grading data.
- Calls `adapt-style` to pick hint-ladder vs. direct-correct based on `feedback_style`.
- Feeds `learning-plan` (mastery updates) and `assess-progress` (misconception data).

## Autonomy Behavior

- **L1 — Supervised.** Agent proposes the quiz set; student approves before delivery. All generated questions shown for student review.
- **L2 — Assisted.** Agent composes and delivers routine quizzes autonomously. Flags for approval if the student is in a low-engagement window, or if the planned set spikes difficulty.
- **L3 — Autonomous.** Full delivery. Only surfaces quizzes for approval when a consequential regression is detected (mastery drop > 15% on a previously solid concept).

## Failure Modes

- **Leaked answers** — validator must catch, regeneration must try different phrasing, skip rather than ship.
- **Bloom monoculture** — all questions at "remember" level. Track Bloom distribution in the last 20 items; warn if > 60% in one bucket.
- **Miscalibrated difficulty** — if correct-first-try rate is >90% or <40% across a week, adjust `difficulty_b` targeting.
- **Praise inflation** — "great job!" on a wrong answer. Feedback should name the wrongness, kindly.
- **Over-hinting** — student climbs the ladder every time. If hint-ladder usage > 70% for a concept, that concept is above current mastery; send it back to `learning-plan` for remediation.

## Cognitive Analogy

**Retrieval practice + desirable difficulty** (Bjork). The act of recalling strengthens the memory more than re-reading. A question is a deliberate bit of forgetting friction — hard enough that retrieval is an act of reconstruction, not a lookup. Grading is the agent's judgment of how *reconstructive* the retrieval was: a fast, confident answer is a strong memory; a slow, hinted answer is a weak one. The mastery model is a running estimate of the strength of each trace.
