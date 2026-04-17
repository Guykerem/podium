---
name: segment-transcript
description: Cluster a transcript into semantically coherent segments (hook, beats, payoff) with topic, emotion, and quotability scores
when_to_use: >
  After transcribe-media completes, before any cutting, scripting, or
  repurposing. Anytime the agent needs to operate on "moments" rather than raw
  text. Subroutine for write-script, clip-extractor, create-thread, show-notes.
tier: base
---

# Segment Transcript

Turn a flat transcript into a structured sequence of moments the editor can reason about.

## Purpose

A transcript is a wall of text. A segmented transcript is an outline the agent can cut against. Every downstream skill — clipping, scripting, chaptering, threading, repurposing — works on segments, not raw text.

## How It Works

1. **Input** — `transcript.json` (with word timings) from `transcribe-media`.
2. **Coarse segmentation** — Detect topic boundaries:
   - Silence ≥ 2s (often a natural break)
   - Speaker change (if diarized)
   - Semantic shift — LLM pass with `"Split this transcript at places where the topic meaningfully changes. Preserve timestamps."`
3. **Per-segment annotation** — For each segment, LLM labels:
   - `topic` — 2-4 word label
   - `beat_type` — one of: `hook`, `context`, `story`, `insight`, `example`, `tangent`, `payoff`, `cta`, `filler`
   - `emotion` — one of: `curious`, `excited`, `serious`, `reflective`, `humor`, `tension`, `resolution`
   - `quotability` — 1-5 score (5 = "I'd put this on a poster")
   - `self_contained` — true/false (can stand alone as a clip?)
   - `hook_potential` — 1-5 (could this segment open a short?)
4. **Assemble narrative arc** — Produce a one-screen timeline:
   ```
   [0:00-0:12] hook — "if you do X, you're losing hours"     q=4 hp=5
   [0:12-0:45] context — background on the problem           q=2 hp=1
   [0:45-2:10] story — a specific example                    q=3 hp=4
   [2:10-2:35] insight — the one-line takeaway               q=5 hp=5
   [2:35-3:10] payoff — what to do Monday morning            q=4 hp=3
   [3:10-3:30] cta — follow / subscribe                      q=1 hp=1
   ```
5. **Emit** `segments.json` and `segments.md` to `memory/content-log/<slug>/`.

## Segment schema

```json
{
  "id": "seg_003",
  "start": 45.2,
  "end": 130.7,
  "duration": 85.5,
  "text": "So what I learned from that experience was...",
  "topic": "lesson from failure",
  "beat_type": "insight",
  "emotion": "reflective",
  "quotability": 5,
  "self_contained": true,
  "hook_potential": 5,
  "speaker": "host",
  "word_range": [412, 701],
  "tags": ["lesson-learned", "story"]
}
```

## Heuristics

- **Good hooks land in 2-12s.** Flag anything longer as a candidate hook *after* trimming.
- **Good clips are 15-90s self-contained.** Shorter feels fragmented; longer loses attention.
- **Payoff ≤ hook.** If the insight takes longer than the setup, it's a long-form, not a short.
- **Filler is fine in long-form, fatal in short-form.** Mark and flag.

## Output structure

```
memory/content-log/<slug>/
  segments.json         # machine-readable
  segments.md           # human timeline view
  arc.md                # proposed narrative structure + recommendations
```

## Autonomy behavior

- **Level 1** — Produce segmentation, present top-3 hook candidates and top-5 clips. Creator picks before anything is cut.
- **Level 2** — Auto-segment, auto-pick top clip candidates based on memory preferences. Show for approval before cutting.
- **Level 3** — Auto-segment, auto-advance the highest-scoring clip candidates into `edit` with creator review at render-time.

## Integration

- Input: `transcript.json` from `transcribe-media`
- Composes **act** (LLM call for labeling)
- Downstream: `write-script` (use as scaffold), `caption-video` (trim to segments), `shorts-factory/reframe-vertical`, `long-form/create-thread`, `podcast-pack/highlight`, `repurpose-content`

## Failure modes

- **Over-segmentation** — splitting at every sentence. Minimum segment duration: 8s.
- **Under-segmentation** — one blob for a 30-min podcast. Force minimum N segments proportional to duration (e.g., ≥ 1 per 3 min).
- **LLM hallucinating content** — segments must quote the actual transcript, never paraphrase. Verify `text` field matches `transcript.json` verbatim.
- **Missed hooks** — if top hook_potential < 3 across all segments, flag: "No strong hook candidate — the capture may not be content-ready."
