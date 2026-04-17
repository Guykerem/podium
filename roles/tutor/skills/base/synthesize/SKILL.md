---
name: synthesize
description: Transform curated sources into level-calibrated explainers, concept maps, and comparisons the student can actually use
when_to_use: >
  Student asks an explanatory question ("what is X?", "how does Y work?",
  "compare X and Y"), OR learning-plan needs fresh teaching material for a
  concept, OR assess-progress surfaces a gap that needs a focused write-up.
tier: base
---

# Synthesize

Take curated material from `memory/sources/` and turn it into something digestible: an explainer, a concept map, a comparison, a worked example. Everything is calibrated to the student's current mastery on the concept — not too basic, not too technical — and every non-trivial claim is cited back to a source.

## How It Works

### 1. Load Inputs
- The target concept(s) from the learning plan, with current mastery.
- All sources tagged `primary` or `adjacent` to those concepts (see `research-loop`).
- Student's style preferences (declared + observed) from `memory/style-preferences/`.
- Any prior synthesis on this concept (don't repeat; elaborate or update).

### 2. Calibrate Complexity
Map student mastery to a complexity tier:

| Mastery | Tier | Style |
|---|---|---|
| < 0.3 | `plain` | Everyday language. Zero jargon without a plain-language unpack. One idea per paragraph. Heavy use of analogy. |
| 0.3 – 0.6 | `intermediate` | Domain vocabulary introduced deliberately. Analogies paired with technical terms. Worked examples prominent. |
| 0.6 – 0.85 | `technical` | Assumes vocabulary. Short on analogy, long on precision. Structural comparisons, edge cases, failure modes. |
| > 0.85 | `expert` | Peer-level density. Focuses on nuance, research frontiers, contested points. |

Style preferences can pull the tier down (if the student prefers plain language even at high mastery).

### 3. Choose a Format
Pick based on the question and observed retention-by-format:
- **Explainer** — narrative prose, 200-800 words. Good for "what is" and "how does."
- **Concept map** — nodes and edges, often rendered as a simple text outline or Mermaid. Good for relationships and hierarchies.
- **Comparison table** — when the question is "X vs. Y" or "when do I use which?"
- **Worked example** — step-by-step trace of a problem. Strong for novices (worked-example effect).
- **Steelman + critique** — for contested topics: best case for each position, then your assessment.

### 4. Compose
- Open with what matters — the one-sentence "if you remember nothing else…"
- Sequence from concrete → abstract for novices, abstract → concrete for experts.
- Use analogies from the student's declared interests when they help the idea land.
- Cite every non-obvious claim inline: `[source_id]`.
- Surface disagreement honestly — if two high-quality sources conflict, say so and show both.
- Do not fill space. A 150-word synthesis that lands beats a 600-word one that doesn't.

### 5. Attach a Retrieval Hook
End every synthesis with a single retrieval-style question the student can answer to check understanding. This is the seed for a future quiz item — log the question + expected answer + misconceptions it probes into the concept's mastery record.

### 6. Record
- Write to `memory/sources/_synthesis/<concept_id>_<YYYY-MM-DD>.md`.
- Update the concept's mastery record: `last_synthesis_at`, `complexity_tier_used`.

## Composition

- Uses `remember` (core) to load prior syntheses and style preferences.
- Uses `observe` (core) only if curated sources are insufficient for the concept — triggers a targeted `research-loop` pass first, rather than pulling from raw web.
- Feeds `learning-plan` (material for session slots) and `podcast-pipeline` (syntheses become podcast packet framing notes).

## Autonomy Behavior

- **L1 — Supervised.** Agent drafts the synthesis, presents it for review, student requests edits before it's used in teaching.
- **L2 — Assisted.** Agent produces synthesis and teaches from it. After session, agent asks "did the level feel right?" and logs the answer.
- **L3 — Autonomous.** Agent produces, uses, and silently updates syntheses as the student's mastery shifts. Only surfaces the synthesis when the student explicitly asks to see the source notes.

## Failure Modes

- **Miscalibration.** Too technical, too simple, too much jargon. Primary signal: student's follow-up question. If they ask "what does X mean?" where X is a term the synthesis used without unpacking, tier was too high. If they say "I already know this," tier was too low. Log and recalibrate.
- **Hallucinated citations.** Never cite a source you haven't actually loaded from `memory/sources/`. If no source supports a claim, either remove the claim or mark it "uncited" and flag for research-loop follow-up.
- **Synthesis becomes substitute for primary.** The point of synthesis is to *direct* the student to primary sources, not replace them. Always link back.
- **Stale synthesis.** When the underlying sources update (re-sweep finds v2 of a paper), the synthesis must be flagged for refresh.

## Cognitive Analogy

**Consolidation in long-term memory.** Raw experience (source material) is noisy, redundant, and contextually sticky. Consolidation during sleep reorganizes it — extracts regularities, links to prior knowledge, prunes redundancy. Synthesis is the agent's version of this: it compresses many overlapping sources into a structure that can actually be taught from. A student who reads ten articles has information; a student who reads the synthesis has knowledge.
