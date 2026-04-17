# Mastery Modeling

Distinct from spaced repetition, which schedules *when* a card comes back. Mastery modeling estimates *how much a student understands* a concept — a number the `assess-progress` and `learning-plan` skills act on.

## Four Approaches

### Bayesian Knowledge Tracing (BKT)

Per-skill Hidden Markov Model with four parameters:
- `p(L_0)` — prior probability of prior mastery
- `p(T)` — transition probability (learn on each opportunity)
- `p(G)` — guess (correct while not mastered)
- `p(S)` — slip (incorrect while mastered)

Each attempt updates the posterior `p(L_n | observations)` via Bayes' rule. State per skill per student: one tuple.

**Use when:** you want per-skill mastery with interpretable parameters and minimal data. Reference: [pyBKT](https://github.com/CAHLR/pyBKT).

Typical defaults: `p(L_0)=0.3, p(T)=0.1, p(G)=0.2, p(S)=0.1`. Tune per domain when you have data.

### Deep Knowledge Tracing (DKT)

LSTM over interaction sequences. Learns embeddings for each skill and predicts correctness on the next item. +15-25% AUC over BKT on some benchmarks ([Piech et al. 2015](https://stanford.edu/~cpiech/bio/papers/deepKnowledgeTracing.pdf)).

**Trade-offs:** needs thousands of interactions to train per model. Loses interpretability entirely. Overkill for single-student scenarios without transfer training.

**Use when:** shared model across many students and data is plentiful. Skip for a personal tutor.

### Performance Factors Analysis (PFA)

Logistic regression: `logit(correct) = β_skill + γ * successes + ρ * failures`.

Per skill per student, store: `{β, successes, failures}`. Plus three global weights `γ, ρ` fit from history (`γ` is typically larger than `ρ`).

**Pros over BKT:** credits evidence from *both* successes and failures; generally stronger on benchmarks ([Pavlik et al. 2009](https://eric.ed.gov/?id=ED506305)).

**Use when:** enough history to fit `γ, ρ` (≥ ~50 interactions per student). Default upgrade path from BKT in this role.

### Item Response Theory (IRT)

Models *items* separately from *students*. 1PL (Rasch) assigns each item a difficulty `b`; probability of correct = `sigmoid(ability - b)`. 2PL adds per-item discrimination `a`.

**Use when:** you want to calibrate item difficulty independently from student ability — critical for comparing mastery across different question banks, or for generating calibrated quizzes.

**In this role:** pair PFA for student model + 1PL for item calibration.

## Recommended Default: BKT → PFA with 1PL IRT

- **Module 0 / first 50 interactions:** BKT. Simple, interpretable, useful from interaction 1.
- **After ~50 interactions per concept:** switch to PFA; keep BKT estimate as a prior.
- **Item side:** 1PL IRT from the start; log `b` for every generated item based on empirical correct rate across students (or an initial LLM estimate if no data).

## What to Persist

`memory/mastery/<concept_id>.md` front-matter:

```yaml
concept_id: <slug>
# BKT state
bkt:
  p_L_current: 0.68
  p_T: 0.1
  p_G: 0.2
  p_S: 0.1
# PFA state (kicks in once successes + failures ≥ 20)
pfa:
  beta: 0.4
  successes: 14
  failures: 5
# Current mastery (best available)
mastery: 0.72
mastery_source: pfa    # pfa | bkt | hybrid
# Review state (from SRS) kept alongside
stability: 12.3
retrievability: 0.88
```

## Computing the Mastery Estimate

When both BKT and PFA are available:
- If PFA successes + failures ≥ 20: `mastery = sigmoid(pfa.beta + γ*successes + ρ*failures)`, source `pfa`.
- Else: `mastery = bkt.p_L_current`, source `bkt`.

This keeps the estimate stable in early data and upgrades when evidence supports it.

## Updating on a Graded Response

```
on_graded_response(concept_id, correct, difficulty_b):
    load state
    # BKT update
    if correct:
        evidence = p_L * (1 - p_S) / (p_L * (1 - p_S) + (1 - p_L) * p_G)
    else:
        evidence = p_L * p_S / (p_L * p_S + (1 - p_L) * (1 - p_G))
    p_L_after_evidence = evidence
    p_L_current = p_L_after_evidence + (1 - p_L_after_evidence) * p_T

    # PFA update
    if correct: successes += 1
    else: failures += 1

    # IRT item update (small learning rate)
    b += lr * (prediction_error)  # simplified

    save state
```

## Calibration Checks

Monthly, run a calibration check:
- Bin items by predicted correctness (0.1 bins).
- For each bin, compute actual correct rate.
- Plot predicted vs. actual; well-calibrated = diagonal.

Large deviations (> 0.15 on a well-populated bin) mean the model is off — tune `γ, ρ` or revisit priors.

## Transfer Mastery vs. Item Mastery

A student who gets item X right may not have learned the *concept*; they may just have memorized X. True mastery shows in transfer — correctness on items they haven't seen that test the same concept.

This is why `quiz`'s stretch items and `weakness-targeting`'s transfer items matter. They're the real mastery check.

## References

- [Corbett & Anderson (1995), BKT](https://www.learnlab.org/research/wiki/images/1/17/Corbett95knowledge.pdf)
- [Piech et al. (2015), DKT](https://stanford.edu/~cpiech/bio/papers/deepKnowledgeTracing.pdf)
- [Pavlik et al. (2009), PFA](https://eric.ed.gov/?id=ED506305)
- [Knowledge Tracing Survey (arXiv 2105.15106)](https://arxiv.org/html/2105.15106v4)
- [pyBKT](https://github.com/CAHLR/pyBKT)
