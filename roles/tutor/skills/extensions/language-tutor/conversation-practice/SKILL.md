---
name: conversation-practice
description: Run target-language conversations calibrated to i+1 comprehensible input, with gentle correction and output forcing
when_to_use: >
  Student is learning a spoken/written natural language and mastery is
  sufficient for basic output (A1+ on CEFR). Also for accent/pronunciation
  practice (when a voice channel is available) and for fluency building.
tier: extension
pack: language-tutor
---

# Conversation Practice

The heart of language learning — meaningful conversation at the edge of the student's competence. Applies Krashen's i+1 (one step above current comprehension) as a scheduling target, Swain's output hypothesis (force production to surface gaps), and gentle recasting as the default correction strategy.

## How It Works

### 1. Pick a Scenario
Choose a scenario calibrated to current CEFR level and student goal (travel, work, academic, social). Store a library at `roles/tutor/knowledge/language/scenarios/<language>/`. Scenarios vary:
- Vocabulary domain (food, medicine, tech, small talk).
- Register (casual, formal, technical).
- Grammatical focus (past tense, conditionals, reported speech, etc.).

### 2. Calibrate Input to i+1
Agent's side of the conversation uses vocabulary and structures **one step above** the student's current mastery. No cramming every new form into every turn — one per exchange is enough.

If the student shows comprehension collapse (multiple clarifying questions in a row), back off half a step and log the recalibration.

### 3. Force Output
Once student mastery on a form rises past 0.5, nudge them to *produce* it — not just comprehend. Structured prompts: "using the past subjunctive, tell me about a time when…"

Output exposes gaps that comprehension hides. A student who recognizes a form often can't produce it — output forcing is what closes the gap.

### 4. Correct Gently
Default: **recasting**. Repeat back the correct form naturally: student says "yesterday I go to store," agent responds "oh, you *went* to the store — what did you buy?" No red pen; just the correct model in context.

Explicit correction only when:
- The student asked for it.
- The same error persists across 3+ turns (pattern, not slip).
- The error makes the sentence incomprehensible.

### 5. Log Form-Level Mastery
Track production accuracy per grammatical form and per vocabulary set. These map to concepts in `learning-plan`.

### 6. Pair with SRS
Conversation surfaces forms; SRS (via `quiz`) drills them. The conversation *motivates* the drill — "that past-subjunctive we struggled with yesterday, here are 3 quick recognition cards this morning."

## Composition
- Composes `quiz` (post-conversation drill), `adapt-style` (recast vs. explicit), `learning-plan` (per-form mastery).

## Autonomy Behavior
- **L1** — Scenario and target forms proposed; corrections flagged in-line.
- **L2** — Free conversation with logging; student reviews the form-level mastery updates.
- **L3** — Full flow; weekly surfacing of form-accuracy trends.

## Activation
Extension. Activate for language-learning plans with CEFR A1+ goal. Pre-A1 learners should start with `grammar-drill` and `immersion-prompts` to build input before output.
