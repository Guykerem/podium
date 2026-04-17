---
name: triage-captures
description: Ingest raw captures (voice notes, clips, screenshots, scraps) and route each into a format direction with a hook hypothesis
when_to_use: >
  User drops a voice memo, video file, URL, screenshot, or pastes a rough
  thought. Also triggers on the weekly `weekly-capture-check` schedule and on
  the stale-draft nudge. Use at the very start of any production pipeline.
tier: base
---

# Triage Captures

Turn raw input into a sortable content inventory. Every piece of content starts here — this skill is the on-ramp.

## Purpose

Creators capture more than they ship. The bottleneck is triage, not ideation. This skill looks at raw material and answers three questions fast:

1. **What is this?** (voice note / clip / screenshot / written thought / link / other)
2. **What format does it want to become?** (short, long video, thread, newsletter, carousel, still, podcast clip, *nothing*)
3. **What's the hook hypothesis?** (a specific line, frame, or angle worth testing)

An honest "not content" is a valid output. Force-matching captures to formats kills voice.

## How It Works

1. **Canonicalize input** — Normalize to a working file in `memory/content-log/<date>-<slug>/`:
   - Audio/video → `source.mp4` or `source.mp3` via FFmpeg
   - Text → `source.md`
   - URL → fetch readable content, save as `source.md` + metadata
   - Image → `source.png` + extracted text via OCR if relevant
2. **Metadata pass** — Use `ffprobe` for media (duration, resolution, codec, audio levels); word count + reading time for text.
3. **Classify format fit** — For each capture, propose 1-3 format directions. Consult `memory/platform-preferences/` for which platforms matter now.
4. **Draft hook hypothesis** — One sharp line that could open the piece. Borrow from `knowledge/craft/hook-formulas.md`.
5. **Tag quotability / shot-worthiness** — Score 1-5 on a `keep_confidence` metric.
6. **Write triage note** — `triage.md` in the capture folder with: classification, proposed formats, hook, next-step recommendation, discard vote if weak.
7. **Present batch** — Show the creator a one-line summary per capture and ask: advance which, discard which, park which.

## Output: triage.md template

```markdown
# Triage — {slug}
- **Captured**: {date}
- **Type**: {voice_note | clip | screenshot | thought | link | other}
- **Duration / length**: {duration or word count}
- **Raw topic**: {one-line summary}

## Format hypotheses
1. **{format}** — hook: "{hook line}" — why: {1 line}
2. **{format}** — hook: "{hook line}" — why: {1 line}

## Recommendation
{advance | park | discard} — {1-line reasoning}

## Next step if advancing
{skill to invoke next: transcribe-media, creative-brief, write-script, etc.}
```

## Tools / APIs

- `ffprobe` for media metadata
- `ffmpeg` for format normalization
- A small OCR tool (Tesseract or Apple Vision) for image text
- The core `remember` skill to persist the triage folder
- No network calls required — this is local-first

## Autonomy behavior

- **Level 1 (default)** — For every capture: present classification, hook hypothesis, recommendation. Creator approves advance/park/discard before any further skill runs.
- **Level 2** — Auto-classify, auto-park weak captures (keep_confidence ≤ 2). Present strong ones (≥ 3) for routing.
- **Level 3** — Auto-advance high-confidence captures (≥ 4) into the recommended next skill. Weekly digest of parked items.

Never auto-discards. Parked items stay in `memory/content-log/` forever.

## Integration

- Composes **observe** (watches for new captures) + **remember** (writes `memory/content-log/`)
- Triggers downstream: `transcribe-media` (if audio/video), `creative-brief` (if advancing to production), `write-script` (if hook is ready)
- Feeds `review-performance` over time — which triage decisions led to winning posts?

## Failure modes to watch

- **Forcing content out of every capture** — some voice notes are just thoughts. Say so.
- **Hook inflation** — if the hook hypothesis is "5 things about X," push back. Find the real angle or park it.
- **Losing captures** — never overwrite. Each capture gets its own folder with a date prefix.
