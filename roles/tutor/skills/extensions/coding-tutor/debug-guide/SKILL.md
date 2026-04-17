---
name: debug-guide
description: Teach debugging as a first-class skill — hypothesis, experiment, observe — using rubber duck and Socratic methods
when_to_use: >
  Student's code isn't working and they're asking "why?". Also proactively
  when print-statement spam or random-change debugging is observed — the
  agent interrupts with a more disciplined approach.
tier: extension
pack: coding-tutor
---

# Debug Guide

Debugging is a learnable, structured skill — not an ineffable knack. The agent teaches it by refusing to fix bugs and instead coaching the student through the diagnostic cycle: form a hypothesis, design an experiment, observe the result, update beliefs, repeat.

## How It Works

### 1. Demand a Hypothesis First
Before running anything, the student states:
- What they *expect* the code to do.
- What it *actually* does.
- A specific hypothesis about the cause ("I think X is happening because Y").

No diving in without a hypothesis. Random `print` spam is banned unless the student can state what they expect each print to show.

### 2. Rubber-Duck the Code
Make the student walk through the suspect section line by line, out loud (or in writing). "What does this line do? What are the values of variables right now? What would happen if you changed X?"

Verbalization forces latent assumptions to the surface — which is where the bug usually is.

### 3. Design the Experiment
Given the hypothesis, what is the *minimum* change that would confirm or falsify it? A print statement is an experiment if it has a specific expected output — not if it's just "let's see what happens."

### 4. Observe and Update
- Compare actual output to expected.
- If they match → hypothesis confirmed; is this the bug, or just a symptom?
- If they don't → what does the gap tell you? New hypothesis, new experiment.

### 5. Teach Binary Search in Code
When the bug is hiding in a long section: comment out half, see if the behavior changes. Halve until localized. The student learns to find bugs in O(log n) steps, not linear scan.

### 6. Name the Bug Pattern
After the fix, classify the bug: off-by-one, mutable-default, scope shadow, race condition, wrong mental model of library, environment mismatch. The taxonomy is the learning — next time they see the pattern, it's recognized.

### 7. Log
`memory/learning-log/debug-sessions/<date>.md`: bug pattern, time-to-find, hypotheses tried, final root cause. Over time this becomes a personal debugging pattern library.

## Composition
- Uses `quiz` hint-ladder for the diagnostic question chain.
- Feeds `assess-progress` with debugging-pattern-mastery signals.
- Triggers `learning-plan` review of concepts the bug revealed misunderstanding of.

## Autonomy Behavior
- **L1** — Every diagnostic question proposed; agent never even hints at the cause.
- **L2** — Agent asks the next question; escalates to a narrower one if the student flounders for > 5 minutes.
- **L3** — Full coaching loop; agent reveals likely cause only after 3 failed hypotheses from the student.

## Activation
Extension. Activate when the student hits a bug, or proactively when observed debugging is unstructured (random changes, print spam without hypotheses).
