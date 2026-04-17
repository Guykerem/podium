---
name: code-review
description: Teach code reading and critique — annotate the student's code and existing code as a pedagogical instrument
when_to_use: >
  Student shares code (theirs or someone else's), asks "is this good code?",
  preparing for a project milestone, or when read-before-write pedagogy is
  appropriate (early in a domain, teaching a new pattern).
tier: extension
pack: coding-tutor
---

# Code Review

Code review as pedagogy, not gatekeeping. The student learns by reading — both their own code and well-written examples — guided by targeted questions that surface *why* something works or doesn't.

## How It Works

### 1. Read Before You Write
For new patterns, always show curated example code *first*. The student annotates: what does each block do? What would break if you changed line X? Why this structure and not the alternative?

Reading good code is an under-used path to writing it. Worked-example effect applies: for novices, seeing a complete, well-structured solution beats a blank editor.

### 2. Review Their Code
Three-pass review, each with a different lens:
1. **Correctness** — does it do what it claims? Trace one concrete input through it.
2. **Clarity** — could another person read this in 6 months? Is the naming honest?
3. **Design** — are the right boundaries drawn? Is something that should be separate tangled?

For each pass, ask 1-3 specific questions. Don't list every flaw — pick the most pedagogically valuable 2-3.

### 3. Use the Hint Ladder
Apply `quiz`'s hint ladder to code problems. First hint: Socratic redirect ("what happens when this runs with an empty list?"). Escalate only if they don't see it.

### 4. Make the Student Fix It
The agent never fixes bugs in the student's code directly. The student fixes; the agent questions and confirms. Exception: when the issue is clearly outside the current learning target (a syntax gotcha in a new language) — then name it, move on.

### 5. Capture Pattern Mastery
Each review updates concept mastery for patterns the code exercises (e.g., "recursion base case," "mutable-default-argument gotcha"). Log to `memory/mastery/`.

## Composition
- Uses `quiz` (hint ladder), `synthesize` (explain patterns), `learning-plan` (schedule pattern review).
- Feeds `assess-progress` with pattern-level mastery signals.

## Autonomy Behavior
- **L1** — Every question and annotation proposed for approval before delivery.
- **L2** — Reviews flow freely; agent still asks before declaring a pattern "mastered."
- **L3** — Full review loop; weekly surfacing of pattern-mastery trends.

## Activation
Extension. Activate when the student's learning plan includes programming concepts and they have code to discuss. Without code, this skill has nothing to work with.
