---
name: adapt-style
description: Monitor engagement and retention per format and mode; adjust delivery to what actually works for this student
when_to_use: >
  Nightly on the style-sync cron, after every session (quick update), and
  on-demand when the student complains that something "isn't landing" or
  when a format-switch decision is needed mid-session.
tier: base
---

# Adapt Style

Runs the loop that makes this tutor *yours*. Watches format retention, engagement signals, session performance by time-of-day, and mode effectiveness (Socratic vs. direct vs. worked example). Updates the style model. Tells the other skills which levers to pull.

## How It Works

### 1. Maintain the Style Model
Two layers:

**Declared** — `memory/style-preferences/profile.md`, built from onboarding and explicit corrections. Stable; changes only on the student's word.

**Observed** — `memory/style-preferences/observed.md`, rebuilt nightly from the learning log. A table per dimension:

```
format_effectiveness:
  reading:             {retention_at_24h: 0.72, n: 38}
  worked_examples:     {retention_at_24h: 0.81, n: 22}
  socratic_dialogue:   {retention_at_24h: 0.64, n: 16}
  quizzes:             {retention_at_24h: 0.88, n: 71}   # always high — retrieval effect
  podcasts:            {retention_at_24h: 0.55, n: 9}
  diagrams:            {retention_at_24h: 0.76, n: 12}

time_of_day_performance:
  morning_7_10:        {correct_rate: 0.79, latency_z: -0.4, n: 34}
  midday_11_14:        {correct_rate: 0.71, latency_z: 0.0, n: 21}
  afternoon_15_18:     {correct_rate: 0.67, latency_z: 0.3, n: 28}
  evening_19_23:       {correct_rate: 0.74, latency_z: -0.1, n: 45}

session_length_sweet_spot: 18 minutes    # derived from completion/outcome curve

challenge_response:
  accepts_stretch:     true
  time_pressure_cost:  -0.15 correct_rate under explicit timing
```

### 2. Apply the Expertise-Reversal Rule
When `learning-plan` asks "how should I teach concept X?", respond with a **mode** based on current mastery:
- `mastery < 0.3` → `worked_example` (direct instruction; show then do).
- `0.3 ≤ mastery < 0.7` → `guided_practice` (I-do / we-do / you-do ladder).
- `mastery ≥ 0.7` → `socratic` (ask, don't tell).

Override if observed data contradicts (e.g. student at 0.2 mastery performs better in Socratic — rare, but respect evidence over heuristic).

### 3. Pick the Format
For a given concept slot, rank formats by observed retention for *this* student, subject to:
- Never repeat the same format 3× in a row on the same concept (variety boosts discrimination).
- Rotate low-n formats in to keep sample sizes growing.
- Respect declared preferences as a soft prior; override only when observed retention diverges by ≥ 0.15 with n ≥ 20.

### 4. Calibrate Chunk Size
Default `chunk_minutes: 10`. Adjust:
- If session-length sweet spot drifts (median completed-and-retained session length), update default.
- Hard cap any single block at 25 minutes; force a break afterward.
- Pair with microlearning heuristic: more short blocks > fewer long ones.

### 5. Tune Feedback Posture
`feedback_style` (declared: `hint-ladder` by default) adjusts on evidence:
- If hint-ladder usage > 70% → concept difficulty is above mastery; *don't* change feedback style, change the concept's difficulty target.
- If student bounces off hints ("just tell me") → switch to `direct-correct` for that session and log.
- If student asks for more challenge → tick `challenge_level` up; if overwhelmed → down.

### 6. Watch for Format Fatigue
- Same format ≥ 4 consecutive sessions + declining retention → switch (even if observed retention for that format is high overall).
- This is interleaving at the format level: same variety-vs.-monotony trade-off as at the concept level.

### 7. Handle Disengagement Signals
When `assess-progress` flags disengagement, adapt-style proposes the intervention:
- **Reduce**: shorter sessions, fewer new concepts, more review (confidence rebuild).
- **Switch modality**: try podcast / diagram / project-based instead of more of the same.
- **Change rhythm**: shift session timing to stronger time-of-day windows.
- Never propose more than one change per week — confounds evidence.

### 8. Write Back
- Update `memory/style-preferences/observed.md` nightly.
- Append significant changes (mode flips, format drops, chunk-size shifts) to `learning/adaptations.md` with reason and evidence.
- Surface changes to the student in the weekly review: "I noticed X was working better than Y for you, so I'm leaning that direction. Feel right?"

## Composition

- Reads everything `remember` surfaces about sessions.
- Advises `quiz` (feedback style), `learning-plan` (chunk size, interleave), `synthesize` (complexity tier calibration), `podcast-pipeline` (format-effectiveness gates).

## Autonomy Behavior

- **L1 — Supervised.** Agent proposes style adjustments; student approves each. Observed table updates automatically (reads don't need permission), but writes to declared preferences don't happen without explicit consent.
- **L2 — Assisted.** Routine tuning (chunk size, format rotation) applied automatically. Mode flips and feedback-style changes proposed for approval.
- **L3 — Autonomous.** Full style adaptation. Weekly review still includes a "here's what changed" block so the student can object.

## Failure Modes

- **Overfitting to noise.** Small-n effects treated as signal. Counter: require n ≥ 20 and divergence ≥ 0.15 before overriding a declared preference.
- **Premature convergence.** Agent locks into "this student is a Socratic learner" after 5 sessions and never tries other formats. Counter: keep rotating low-n formats in; revisit the table monthly.
- **Over-adaptation.** Every week, a different style. Student can't settle. Counter: one change per week cap.
- **Ignoring declared preferences.** Observed data says one thing, student says another. Counter: declared preferences are a soft prior; tie-break always goes to declared unless evidence is strong.
- **Silent style creep.** Agent adapts without telling the student. Counter: weekly review surfaces changes; always explain the why.

## Cognitive Analogy

**Transfer-appropriate processing** (Morris, Bransford, Franks). Memory is better retrieved when retrieval conditions match encoding conditions. A broader implication: different students have different encoding strengths — some encode visually, some verbally, some kinesthetically. The adapt-style skill is the agent's model of *this* student's encoding preferences, built from evidence rather than stereotype. It's the opposite of the popular "learning styles" myth (which doesn't hold up empirically as a fixed trait); it's an empirical, per-student, per-concept optimization.
