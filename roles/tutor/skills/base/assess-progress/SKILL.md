---
name: assess-progress
description: Analyze quiz results, session logs, and engagement signals to build a living model of what the student actually understands
when_to_use: >
  Weekly review (Sundays by default), monthly deep report, after every
  session as a quick delta check, or on demand when the student asks
  "how am I doing?" or "what should I focus on?"
tier: base
---

# Assess Progress

Looks across all the data the agent has been logging — quiz results, response latencies, hint use, session outcomes, source consumption — and produces an honest picture of where the student actually stands. Surfaces gaps with evidence, identifies patterns, and proposes concrete next steps. Refuses to do praise inflation or confirmation bias.

## How It Works

### 1. Aggregate Evidence
Pull from memory:
- `memory/mastery/*.md` — current mastery, stability, retrievability per concept.
- `memory/learning-log/*.md` — session records, signals, outcomes.
- Question bank results — correctness, hints used, misconception tags.
- `memory/style-preferences/observed.md` — format retention, engagement windows.

### 2. Compute the Mastery Landscape
- **Per concept**: current mastery, delta since last assessment, variance over recent attempts.
- **Per milestone**: aggregate mastery (min, mean, median across concepts).
- **Per domain**: trend line — rising, plateaued, regressing.

Tier concepts into four buckets:
- **Mastered** (mastery ≥ `advance_threshold` AND retrievability ≥ `retention_threshold`)
- **Learning** (advancing, below mastery)
- **Stuck** (3+ sessions, mastery not advancing by > 0.05)
- **Fading** (previously mastered, retrievability dropping)

### 3. Detect Patterns
Look for things a glance at individual items wouldn't show:
- **Recurring misconceptions** — the same misconception tag firing across multiple concepts (points to a shared conceptual flaw).
- **Format mismatch** — consistently lower performance in one modality despite high mastery in another (Socratic-only learner, or vice versa).
- **Time-of-day effects** — performance swings by session time. Flag the weak windows.
- **Interference** — concepts that are each mastered alone but conflict when interleaved (common in language grammar, in comparison-heavy domains).
- **Calibration drift** — self-rated confidence diverging from performance. Either overconfident (dangerous) or underconfident (demoralizing).
- **Engagement decay** — session duration shrinking, latencies rising, follow-up questions dropping. Pre-disengagement warning.

### 4. Run the Disengagement Rule Check
Trigger an intervention if any of:
- 3+ consecutive sessions < 50% of baseline duration.
- Quiz abandonment rate ≥ 30% in the last 7 days.
- Response latency on mastered items rising > 50% week-over-week.
- Scheduled sessions skipped 3+ times with no rescheduling.

Intervention is not a push — it's a question. "I noticed X. Too much? Wrong time? Something else?"

### 5. Compose the Report
Format depends on cadence:

**Session-end delta** (after every session):
- One paragraph: what was covered, one thing that went well, one thing to watch.

**Weekly review** (Sundays):
- Mastery deltas per active concept.
- Three concrete "focus this week" items, ranked.
- Any pattern flags (format mismatch, calibration drift, etc.).
- Proposed plan adjustments (passed to `learning-plan` on approval).

**Monthly report**:
- Mastery trend chart (text or Mermaid).
- Milestone progress.
- Retention analysis (which concepts from month 1 still stick).
- Long-running gaps with root-cause analysis.
- Suggested revisions to path, style, or schedule.

### 6. Surface the Report
- Deliver through the student's preferred channels (`onboarding.channels`).
- Keep language honest and specific — "you've plateaued on X since <date>" beats "keep going!" Evidence tied to specific quiz items wherever possible.
- End with exactly one question for the student: the single most useful thing to clarify.

### 7. Close the Loop
- If the student approves plan adjustments → hand to `learning-plan`.
- If the student reports a cause the agent missed ("I was sick", "new job started") → log to style-preferences and adjust disengagement thresholds.
- Log the full report to `memory/learning-log/<date>-assessment.md`.

## Composition

- Reads everything `remember` and `observe` can surface.
- Feeds `learning-plan` (plan revisions), `adapt-style` (format-effectiveness updates), and `quiz` (recurring misconceptions inform distractor generation).

## Autonomy Behavior

- **L1 — Supervised.** Reports go to the student; plan adjustments are proposals only. Nothing changes without explicit approval.
- **L2 — Assisted.** Weekly reports delivered without prompt. Minor plan adjustments (review-cadence tuning, session-ratio tweaks) applied automatically; milestone changes still require approval.
- **L3 — Autonomous.** Reports continue but become summaries of changes already made. Agent still waits for student on consequential revisions (goal changes, new domains).

## Failure Modes

- **Confirmation bias.** "You're doing great!" because the signals are ambiguous. Counter: require at least one surfaced weakness in every weekly report.
- **Overfitting to noise.** Small sample sizes in early weeks. Counter: refuse to declare patterns until ≥ 10 data points.
- **Analysis paralysis.** Reports so dense the student stops reading. Counter: three-item focus lists; not ten.
- **Miscalibrated disengagement detection.** False alarms from life events. Counter: always ask before intervening, never assume cause.
- **Silent regressions.** A fading concept not flagged because it's below threshold but not zero. Counter: the "fading" bucket catches this specifically.

## Cognitive Analogy

**Metacognition** — the student's eventual ability to monitor their own understanding, notice when they don't know, and allocate study effort accordingly. Most students don't have this calibration yet. The assessment skill externalizes metacognition until the student internalizes it: "here's what you know, here's what you think you know, here's the gap between them." Over months, the questions you ask in assessments become the questions the student asks themselves, and they graduate from needing the external check.
