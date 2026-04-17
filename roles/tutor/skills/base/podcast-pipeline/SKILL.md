---
name: podcast-pipeline
description: Bundle curated sources into NotebookLM-ready podcast packets targeted at the student's current gaps
when_to_use: >
  Scheduled podcast-push windows (see schedule.yaml), when ≥ 3 curated
  sources have accumulated on a gap concept, or when the student requests
  "give me something to listen to on X."
tier: base
---

# Podcast Pipeline

Turns curated source material into podcasts the student can actually listen to — via NotebookLM's Audio Overview feature. **Reality check (2026)**: consumer NotebookLM has no public API. The default flow is manual-with-scaffolding — the agent prepares a podcast packet the student can paste into NotebookLM themselves. An optional Playwright-based automation exists as an extension for users who want hands-off generation.

## How It Works

### 1. Decide Whether to Generate
A podcast is worth making only if:
- Target is a **gap concept** (mastery < `advance_threshold`, stuck for ≥ 1 week, OR flagged in the latest `assess-progress` report).
- At least **3 curated sources** (CRAAP ≥ 4) have accumulated on or adjacent to the concept.
- The sources are **coherent** — they address related aspects of the same concept, not a grab-bag.
- The student has declared podcasts as a preferred format (or declared "test all formats"). Don't push audio on someone who hates audio.

If any check fails, don't generate. Log the reason; try again next cycle.

### 2. Compose the Packet
A podcast packet is a structured directory: `memory/sources/_podcasts/<YYYY-MM-DD>-<concept_id>/`:

```
packet.yaml              # metadata
sources/                 # copies or URL manifest of the 3-7 source files
framing.md               # synthesis of the concept at the student's level
prompt.md                # what to ask the NotebookLM hosts to emphasize
expected-duration.md     # target length (8-15 min for focus gap; 20-25 for deep)
quiz-seeds.md            # 3-5 retrieval questions to ask after listening
```

**packet.yaml** includes: `concept_id`, `target_bloom`, `student_mastery`, `gap_reason` (why this podcast now), `source_ids[]`.

**framing.md** = a `synthesize`-produced explainer at the student's complexity tier. Gives NotebookLM context beyond the raw sources.

**prompt.md** = the "Deep Dive customization" prompt. Pattern:
```
Emphasize: {concept_name}, specifically {sub-aspects the student is stuck on}.
Assume the listener knows: {prerequisites the student has mastered}.
Avoid: {terms not yet introduced OR terms the student has asked us to avoid}.
Include: {at least one worked example, at least one counterexample}.
Length: {target}.
```

### 3. Route to NotebookLM
Three paths, in order of preference:

**A. Manual-with-scaffolding (default).** Agent delivers the packet to the student's channel with:
- Step-by-step instructions to upload the sources to a new NotebookLM notebook.
- The `prompt.md` contents ready to paste into "Customize" on the Audio Overview.
- A link to retrieve the result back to the agent later.

**B. Playwright automation (opt-in).** If the student has enabled the NotebookLM credential extension (`roles/tutor/skills/extensions/` if enabled), drive the browser to upload and generate. Fragile — log every step; fail loudly rather than silently.

**C. NotebookLM Enterprise API (institutional only).** If the runtime is configured with Enterprise API credentials, use `notebooks.audioOverviews.create`. Rare in a student repo.

### 4. Retrieve and Register
Once the podcast is generated:
- Download or link to the audio file.
- Store as an artifact: `memory/sources/_podcasts/<packet>/podcast.mp3` + `podcast.transcript.md` if available.
- Register it as a source in `memory/sources/` with `type: podcast` and quality score derived from the input sources.
- Tag to the same `concept_id`s.

### 5. Follow Up
After the student reports listening:
- Run a short `quiz` using the `quiz-seeds.md` items — retrieval practice on the just-consumed material.
- Update the concept's mastery record with a `format: podcast` entry.
- Ask one calibration question: "on a 1-5 scale, how useful was this podcast for filling the gap?" Log to `adapt-style`'s format-effectiveness table.

### 6. Learn
`adapt-style` watches format-effectiveness: if podcasts consistently land for this student, generate more; if they don't, throttle and try an alternative (written synthesis, worked examples, diagrams). Two consecutive "not useful" ratings → pause podcast generation for 2 weeks and re-ask.

## Composition

- Uses `synthesize` for framing and quiz seeds.
- Uses `research-loop` indirectly (consumes its curated output).
- Feeds `quiz` (post-listen retrieval items) and `adapt-style` (format-effectiveness updates).
- Delegates delivery to `communicate` (core).

## Autonomy Behavior

- **L1 — Supervised.** Agent composes the packet and asks the student to approve before delivery. Every packet is shown in full first.
- **L2 — Assisted.** Agent composes and delivers packets on schedule. Student reviews before pasting to NotebookLM. Playwright automation requires explicit per-packet approval.
- **L3 — Autonomous.** Agent runs the full pipeline (packet → NotebookLM → retrieval → quiz seeds) for routine gap-filling. Surfaces only the finished podcast + seed quiz.

## Failure Modes

- **Grab-bag bundling.** Sources don't cohere — podcast is rambling. Counter: coherence check before generation; abort if sources don't share ≥ 2 tags.
- **Stale sources.** Packet built from 6-month-old material in a fast-moving field. Counter: respect the concept's `currency_weight` from CRAAP scoring; prefer recent sources when volatility is high.
- **Audio quality degradation.** NotebookLM produces a weak overview — names mispronounced, wrong emphasis. Log as a format-effectiveness hit and consider written alternative.
- **Podcast as substitute.** Student listens instead of doing retrieval practice. Counter: always pair with `quiz-seeds.md` follow-up; don't treat listening as mastery.
- **Silent API failure.** Playwright path breaks when NotebookLM UI changes. Counter: verify every step; fall back to manual path on any exception.

## Cognitive Analogy

**Cognitive offloading + dual coding.** A well-made podcast offloads the cognitive cost of reading three papers onto passive listening — good for background exposure and for students whose commute or exercise time is otherwise unused for learning. Paired with retrieval practice, dual-coding (hearing + recall) strengthens the trace more than either alone. A podcast with no follow-up retrieval is just entertainment with domain vocabulary; the pipeline's value depends on the quiz that comes after.
