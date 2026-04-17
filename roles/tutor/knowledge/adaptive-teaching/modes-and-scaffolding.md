# Adaptive Teaching — Modes and Scaffolding

How the tutor chooses *how* to teach, not just *what* to teach. Drives `adapt-style` and `run-session`.

## The Three Core Modes

### Worked Example (Direct Instruction)
- Full solution shown, annotated, discussed.
- Student reproduces with a variation (novel surface, same structure).
- **Best for mastery < 0.3.**
- Evidence: worked-example effect (Sweller, Cooper, Chi).

### Guided Practice (I-do / We-do / You-do)
- Teacher demonstrates (I-do).
- Teacher and student solve together (We-do).
- Student solves independently (You-do).
- **Best for mastery 0.3 – 0.7.**
- Evidence: gradual release of responsibility (Pearson & Gallagher, 1983).

### Socratic / Discovery
- Teacher asks; student reasons and produces.
- No direct instruction — student discovers the structure.
- **Best for mastery > 0.7.**
- Evidence: stronger retention when students construct understanding; ineffective for true novices.

## Expertise-Reversal Effect

The mode that works for a novice can *hurt* an expert, and vice versa. A highly mastered student doesn't need a worked example — the structure slows them down. A novice shown a Socratic probe for a concept they've never heard of just flounders. **Adapting the mode to the student's mastery is more important than picking the "best" mode.**

## Scaffolding and Its Fading

Scaffolding (Wood, Bruner, Ross, 1976) = temporary support structures that enable the student to do what they couldn't do alone. Key property: **they fade.** Scaffolds that don't fade become crutches.

**What to scaffold:**
- Vocabulary: provide plain-language definitions on first use.
- Steps: show the steps first, then let the student identify them, then let them recall them.
- Examples: many and diverse at first, then fewer, then none provided.
- Feedback: immediate and detailed at first, then delayed, then student self-evaluates.

**How to fade:**
- Explicit: "last time I showed you the steps. This time, I'll name them and you fill in. Next time, you name and do."
- Signal the fade so the student expects the change.

## Zone of Proximal Development — Operational

Vygotsky's ZPD: tasks just beyond current independent ability but within reach with help.

**How the agent targets it:**
- Start an item at difficulty = `mastery + 0.1`.
- If solved independently → raise to `mastery + 0.2`.
- If solved with minimal scaffold → stay near `mastery + 0.1`.
- If scaffold needed throughout → drop to `mastery` (the current edge) and hold there.

## Chunking for Cognitive Load

Working memory ≈ 4 chunks. A concept with 3 prerequisites the student hasn't mastered + 2 new ideas = 5 chunks = overload.

**Rules of thumb:**
- No more than 3 new concepts in a session.
- Don't introduce two new concepts that depend on each other in the same chunk — space them.
- Break a compound problem into sub-problems explicitly if the student shows load signs (long latency, hesitation, partial answers).

## Microlearning

Sessions of 5-15 minutes retain more per minute than 60-minute marathons. The cognitive-load benefit is part of it; motivation and habit formation are the rest.

**Operational rules:**
- Default session chunk: 10 minutes. Configurable per student.
- Hard cap: 25 minutes per continuous block.
- Mandatory break: 5 minutes minimum after any 25-minute block.
- Across a day: 3-5 short sessions outperform 1 long one for most learners.

## Mode Flipping During a Session

If a student is stuck in one mode for > 5 minutes with no progress, switch. Don't double down.

- Stuck in Socratic → drop to Guided, give a worked example.
- Stuck in Worked Example → switch modality entirely (diagram, code trace, analogy from their domain).
- Stuck in Guided → shorter step, simpler subproblem, confidence re-set with a win first.

## Modality Switching

Five modalities the tutor can select among:
1. Written prose (explainer, synthesis).
2. Worked example (step-by-step trace).
3. Diagram / concept map.
4. Dialogue (Socratic or conversational).
5. Audio (podcast via NotebookLM pipeline).

When retention on a concept is low despite multiple attempts in one modality, switch. Two failed attempts in the same modality → different modality. Track which modalities land for this student and bias future choices accordingly (see `adapt-style`).

## Interleaving — Variable Switching

Within a review session:
- Alternate concepts (A B C A C B A…) rather than mass (A A A A B B B B).
- Interleaving builds *discrimination* — the skill of recognizing which concept applies.
- Feels worse in the moment (student errors increase); retains better.

**When to block:** during initial acquisition. A student encountering concept A for the first time needs focus, not mixing. Block until mastery > 0.3, then start interleaving.

## The Session Envelope

A well-shaped session has four parts:

1. **Open** (~10%): greet, orient, reference last session, state the plan.
2. **Work** (~65%): teach in the chosen mode.
3. **Retrieve** (~20%): interleaved quiz on current + prior concepts.
4. **Close** (~5%): honest delta, one reflection question, state the next session's topic.

Skipping Retrieve leaves knowledge weak. Skipping Close leaves motivation weak.

## References

- Vygotsky (1978), *Mind in Society*
- Wood, Bruner, Ross (1976), "The role of tutoring in problem solving"
- Sweller, Cooper (1985), worked examples
- Pearson, Gallagher (1983), gradual release
- Kalyuga et al. (2003), expertise-reversal effect
- Chi (2009), active-constructive-interactive framework
- [Interleaved practice review (Springer 2021)](https://link.springer.com/article/10.1007/s10648-021-09613-w)
