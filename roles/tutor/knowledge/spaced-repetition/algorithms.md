# Spaced Repetition — Algorithms

The tutor schedules retrieval practice using a spaced-repetition algorithm. This file specifies the three algorithms the role supports and when to use each.

## Why Spacing Works

The forgetting curve (Ebbinghaus, 1885) is roughly exponential: `retrievability(t) = e^(-t/S)` where `S` is the memory's *stability*. Each successful retrieval increases stability, lengthening the half-life. Scheduling reviews just before retrievability drops below a target is the compute-efficient approach to long-term retention.

The target retention is a design choice. 0.9 (default) means the student will recall 90% of items on review. Higher → more reviews; lower → faster schedule but more forgetting.

## Leitner (1972) — Teach-the-Concept MVP

Five boxes. A new card starts in box 1. Correct → move up one box. Wrong → back to box 1. Review cadence by box: box 1 daily, box 2 every 3 days, box 3 weekly, box 4 biweekly, box 5 monthly.

**State per card:** `{box: 1..5}`.

**Use when:** teaching the SRS *concept* to a student. Dead simple, visible, intuitive. Not optimal — use SM-2 or FSRS for actual scheduling.

## SM-2 (1987, Anki default until 2024) — Default Implementation

**State per card:**
```yaml
card_id: <slug>
ef: 2.5            # ease factor, range [1.3, ∞)
interval_days: 0
repetition: 0       # consecutive successes
last_review: <ISO>
last_quality: <0..5>
```

**Quality scale (q):**
- 5 — perfect, no hesitation
- 4 — correct after slight hesitation
- 3 — correct with effort
- 2 — wrong, remembered on reveal
- 1 — wrong, familiar
- 0 — blank, no recognition

**Update rules** after a review with quality `q`:

```
if q < 3:
    repetition = 0
    interval_days = 1
else:
    if repetition == 0: interval_days = 1
    elif repetition == 1: interval_days = 6
    else: interval_days = round(interval_days * ef)
    repetition += 1

ef = max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
next_review = last_review + interval_days
```

**Pros:** transparent, easy to explain, tiny state. Works from card #1 — no warm-up period.

**Cons:** EF updates are crude; hard cards can see exponential interval blow-up; no account of forgetting-curve shape per card.

**Use when:** starting out (fewer than ~200 reviews of history), when explanation matters more than optimization, or as the Module 0 default.

## FSRS (2023) — Upgrade Path

FSRS (Free Spaced Repetition Scheduler) is Anki's default since version 23.10 (2024). It models each card's retrievability as a function of time, stability, and difficulty, and optimizes interval selection against a user-chosen target retention.

**State per card:**
```yaml
card_id: <slug>
stability: <float>        # days; how long until R drops to e^-1 (~37%)
difficulty: <float>        # 0-10; higher = harder to retain
last_review: <ISO>
review_count: <int>
lapse_count: <int>          # times forgotten (q < 3)
```

**Retrievability model:**
```
R(t) = (1 + t / (9 * stability))^-1
```

The elapsed time `t` is in days. `R` is the probability of correct retrieval at time `t` since last review.

**Next-interval formula** for target retention `target` (typically 0.9):
```
interval = 9 * stability * (target^-1 - 1)
```

**State update:** uses 21 weights (`w_0` through `w_20`) fit per-user from review history. The weights parameterize how stability and difficulty change after a review of rating `g ∈ {again, hard, good, easy}`. Defaults ship with Anki/`fsrs4anki`; after ~200 reviews the optimizer fits per-user weights.

The full update is non-trivial; reference implementation: [fsrs4anki wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm).

**Pros:** accurate per-card; optimizer improves as history grows; principled target-retention knob.

**Cons:** more state; needs ~200 reviews to differentiate from SM-2; harder to explain.

**Use when:** history exceeds ~200 reviews, target retention is a meaningful variable (exam prep with strict deadlines), or the student is advanced enough to appreciate the optimization.

## Target Retention — the User-Facing Knob

Exposed in `style.yaml > mastery.retention_threshold`. Recommended values:
- 0.80 — casual learning, low stakes, prefer speed over depth
- 0.85 — default
- 0.90 — exam prep, fluency goals
- 0.95 — high-stakes (board exams, certifications)

Each 0.05 raise roughly doubles the review load. Warn the student when they ratchet upward.

## When to Re-Score a Card

Grade quality from `quiz.grade-response`:

| Quiz result | SM-2 q | FSRS rating |
|---|---|---|
| Correct, no hint, fast | 5 | easy |
| Correct, no hint, slow | 4 | good |
| Correct with hint 1 | 3 | good |
| Correct with hint 2 | 2 | hard |
| Correct only after bottom-out | 1 | again |
| Wrong | 0-1 | again |

## Lapses — Failures Matter

A lapse (q < 3) should not just reset the interval. Log it. If a card lapses > 3 times on different reviews, it's not a slip — it's a concept that needs a pedagogical intervention, not just more SRS. Trigger `weakness-targeting`.

## Exam-Deadline Overrides

When a hard deadline exists (< 4 weeks out) and a card's next_review falls *after* the exam:
- Pull the review forward to land at D - 3 days.
- Temporarily raise target retention to 0.9+.
- After the exam, reset to normal cadence.

## References

- [SM-2 original (SuperMemo.com)](https://www.supermemo.com/en/blog/supermemo-2-algorithm-details)
- [SM-2 explainer (RemNote)](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm)
- [fsrs4anki](https://github.com/open-spaced-repetition/fsrs4anki)
- [FSRS algorithm wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
- [Expertium — Abridged History of Spaced Repetition](https://expertium.github.io/History.html)
