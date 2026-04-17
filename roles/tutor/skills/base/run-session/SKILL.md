---
name: run-session
description: Orchestrate a single tutoring session — opening, targeted work, retrieval practice, reflective close
when_to_use: >
  Every live interaction that's framed as a "session" — scheduled slots, the
  student saying "let's do a session," or any sustained back-and-forth on a
  learning topic. This is the skill that holds the session together.
tier: base
---

# Run Session

The conductor skill during a live tutoring interaction. Composes the other base skills into a deliberate session envelope: opening, targeted work, retrieval practice, close. Keeps within the session-length sweet spot. Enforces the 25-minute cap. Ends with the student knowing what came next and why.

## How It Works

### 1. Open (≈ 1-2 min)
- Greet using the student's observed time-of-day cue (warm in morning, lower-key in evening — minor, not cute).
- Read `memory/context.md` + most recent `learning-log` entry. Reference something specific from last session ("last time you got stuck on X — feel ready to revisit?").
- State the session plan briefly: "We have ~15 minutes. Today's focus is A. We'll spend ~10 on A, then a 5-item review mixing A with B and C. Okay?"
- Offer a one-click reshape: "too long / too much / want to do something else?"

### 2. Mode Selection
Ask `adapt-style` for the right mode based on mastery on the session's primary concept:
- mastery < 0.3 → open with a **worked example** (show → annotate → have student reproduce with variation).
- 0.3–0.7 → **guided practice** ladder (I-do, we-do, you-do on successive items).
- ≥ 0.7 → **Socratic** — probe for edges, ask for the counterexample, push toward Bloom's upper levels.

If the student is stuck twice in one mode, escalate: switch modality (diagram, code, analogy) before switching mode.

### 3. Work Block (≈ 60-70% of session)
- Teach one concept at a time; block new material.
- Teach via the chosen mode. Pause for retrieval every 3-5 minutes — micro-retrieval checks (single question) beat end-only retrieval.
- If the student asks a tangential question that's *actually* a prerequisite gap (detected when their question targets a concept the plan says they should know but don't), pause and fill the gap — then loop back.
- If the tangent is curiosity on a non-prerequisite, log it to `memory/learning-log` and offer: "that's a great thread — want to save it for its own session?"

### 4. Retrieval Block (≈ 20-30% of session)
- Run a 3-7 item interleaved quiz via `quiz`. Mix today's concept with 1-2 review items from prior sessions.
- Use hint-ladder feedback per `feedback_style`.
- After any wrong answer, schedule the concept for a near-term re-quiz (don't try to fix it here).

### 5. Close (≈ 2-3 min)
- One-line summary of what was worked on (not what was "covered" — what the *student* did).
- Honest mastery delta: "mastery on X went from 0.4 → 0.6, we'll re-test in 2 days. Y is still stuck — next session we'll try a different angle."
- One question to the student: "what felt hardest today?" or "what clicked?" Log their answer to `style-preferences/observed.md`.
- State what the agent will do before the next session (research a gap, prepare a podcast packet, nothing).
- Close.

### 6. Enforce Caps
- Hard stop at 25 minutes. If mid-problem, pause and schedule continuation. Cognitive load research is clear — past 25 min, retention per minute plummets.
- If the student pushes to continue: "okay, 5 more minutes, but we're working against diminishing returns. I'll keep tracking." Respect their agency; just log honestly.

### 7. Write the Session Record
Produce `memory/learning-log/YYYY-MM-DD-<slug>.md` with the schema in `.gitkeep`:
- Concepts touched, mode used, format, outcome per concept.
- Signals: avg response latency, hesitation events, hint usage.
- Self-reported mood (from the closing question).
- One sentence the next session should open with.

### 8. Hand Off
- If gaps surfaced → `learning-plan` revises the review queue.
- If engagement flagged → `assess-progress` runs a mini-check.
- If a format underperformed → `adapt-style` logs an effectiveness datapoint.

## Composition

- Orchestrates `synthesize`, `quiz`, `adapt-style` during the session.
- Reads `learning-plan` for session content; writes back mastery updates.
- Uses `communicate` (core) for channel delivery; `remember` (core) for log write.

## Autonomy Behavior

- **L1 — Supervised.** Every mode choice, every quiz item, every plan update surfaced in the moment for approval. Slow, but appropriate for a new relationship.
- **L2 — Assisted.** Session flows smoothly; agent uses its judgment for routine choices. Still asks before tangent-pursuing, before extending past the session cap, and before flagging something as "mastered."
- **L3 — Autonomous.** Full session autonomy. Student can always redirect; agent presents completed-session summary and any consequential changes.

## Failure Modes

- **Session sprawl.** One-concept sessions become tangent tours. Counter: the 60-70% work-block rule; any tangent over 3 minutes prompts the "save for its own session?" question.
- **Over-quizzing.** Retrieval block eats the work block. Counter: explicit time budget at session open.
- **Under-retrieving.** Work block eats everything; no retrieval happens. Counter: hard lower bound — if the session started, the retrieval block runs, even if short.
- **Close skipped.** Session ends mid-problem; student has no sense of progress. Counter: close is non-negotiable. If out of time, cut the retrieval short, never the close.
- **Drift over sessions.** Each session is good in isolation, but the plan-level goal recedes. Counter: the weekly `assess-progress` review catches this.

## Cognitive Analogy

**The cognitive cycle at session scale.** Observe (review the context) → Think (plan) → Decide (mode) → Act (teach + quiz) → Learn (record + update). A single session is the agentic loop in miniature. The opening is perception, the work block is executive function directing attention, the retrieval block is memory strengthening, and the close is consolidation. Sessions that skip stages leave the student with the content but not the *structure* of learning.
