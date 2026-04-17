---
name: learning-plan
description: Design and maintain the student's progressive learning path — concept graph, milestones, review schedule
when_to_use: >
  End of onboarding (initial plan), when a domain is added or dropped,
  after weekly/monthly assess-progress reviews, when the student hits a
  milestone, or when a prerequisite gap is detected that requires a replan.
tier: base
---

# Learning Plan

Owns the structure of *what gets taught when*. Maintains a concept graph (nodes = concepts with prerequisites), a milestone sequence aligned to the student's stated goal, and a per-card review schedule computed by the spaced-repetition algorithm. Everything the tutor teaches either advances a node, reinforces an earlier node, or closes a gap.

## How It Works

### 1. Build the Concept Graph (initial + per-domain)
- Seed from `roles/tutor/knowledge/` domain maps when available; otherwise generate from curriculum surveys pulled by `research-loop`.
- Each node = a **concept**. Store in `memory/mastery/<concept_id>.md` using the schema in `.gitkeep`.
- Every concept has: a short definition, prerequisites (edges), Bloom target for "mastery achieved," 1-3 atomic cards for SRS.

### 2. Sequence to a Goal
- Decompose the goal (from onboarding) into 3-7 **milestones**. Each milestone is a testable competency, not a topic heading.
- Topologically sort concepts within each milestone by prerequisite depth.
- Respect cognitive load: avoid more than 3 new concepts per session; space dependencies at least one session apart when possible.

### 3. Schedule Reviews (Spaced Repetition)
The scheduler defaults to **SM-2** for transparency; upgrades to **FSRS** after ~200 reviews when the weight-optimization pays off.

SM-2 state per card: `{ef: 2.5, interval_days: 0, repetition: 0, last_review: null, last_quality: null}`.

Update after each graded response (quality `q` ∈ {0..5} from `quiz.grade-response`):
- If `q < 3`: repetition=0, interval=1.
- Else if repetition == 0: interval=1, repetition=1.
- Else if repetition == 1: interval=6, repetition=2.
- Else: interval = round(prev_interval * EF), repetition += 1.
- `EF' = max(1.3, EF + 0.1 - (5 - q)*(0.08 + (5 - q)*0.02))`.

FSRS (when upgraded) uses `{stability, difficulty, retrievability}` and the 21-weight optimizer from `fsrs4anki`.

Target retention is user-configurable in `style.yaml > mastery.retention_threshold` (default 0.85; 0.9 for exam prep).

### 4. Compose a Session
When the student shows up or a scheduled slot fires, assemble a session from:
- **Due reviews** (cards with `next_review ≤ now`) — highest priority.
- **Stretch item** — one card from the next unmastered node.
- **Optional new concept** — only if review queue is small and engagement signals are good.

Default ratio: `new_vs_review` from style (0.4 = 40% new / 60% review). Block new concepts together; interleave review items across concepts (`interleave: true`).

### 5. Enforce the Path
- Don't let the student jump to a concept whose prerequisites show mastery < `advance_threshold` — warn and offer the prerequisite path instead.
- The student can always override ("I want to learn X now anyway"), but the override is logged and the agent flags the likely friction.

### 6. Revise
Trigger a plan revision when:
- A milestone is hit → mark done, sequence forward.
- A concept stays below `advance_threshold` for 3+ sessions → insert remediation (extra worked examples, modality switch).
- Weekly `assess-progress` surfaces a pattern (bottom-quartile cluster → schedule a focused sprint).
- The student changes the goal or adds/drops a domain.

All revisions write to `memory/learning-log/YYYY-MM-DD-plan-revision.md` with the before/after and reason.

## Composition

- Uses `remember` to read/write mastery records and plan state.
- Uses `observe` to consult the knowledge base for domain maps.
- Orchestrates `quiz` (selects which items to present) and feeds `assess-progress` (which evaluates against the plan).

## Autonomy Behavior

- **L1 — Supervised.** Agent drafts the plan and shows it for approval before teaching starts. Every revision is proposed, not applied.
- **L2 — Assisted.** Agent maintains the plan autonomously for routine updates (review-schedule mutations, ordering within a milestone). Milestone changes and goal revisions still require approval.
- **L3 — Autonomous.** Full plan ownership. Agent surfaces a rolling 2-week look-ahead weekly and a monthly summary, but doesn't ask permission for each revision.

## Failure Modes

- **Scope creep.** Plan swells as curiosity branches out; nothing gets mastered. Enforce a cap (e.g., ≤ 3 active milestones).
- **Prerequisite skipping.** Student pushes past foundations; later concepts collapse. Prerequisite-gap warnings must be firm.
- **Dead milestones.** The goal changed but the plan didn't. Revisit on every weekly review — if a milestone has had no progress in 2 weeks and no planned push, retire or merge it.
- **Over-spaced review.** If intervals grow so long the student has truly forgotten, retrievability drops fast. Cap EF growth (FSRS handles this natively; SM-2 benefits from a retention-floor rule).

## Cognitive Analogy

**The multi-store memory model + executive function.** Working memory (current session) has strict capacity limits; the plan is the agent's executive function deciding what enters working memory, in what order, and how often it returns from long-term storage for retrieval practice. Without executive function, learning is driven by whatever is loudest in the moment — curiosity without direction. The plan is the external scaffold for the metacognitive control the student is still building.
