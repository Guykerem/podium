# Content Creator Role

A production pipeline for a single creator — turns raw captures (voice memos, clips, ideas, screenshots) into platform-ready content across video, image, and audio. Elevates your voice; never replaces it.

Built for solo creators who want leverage without losing their own taste — the role handles transcription, segmentation, scripting, captioning, formatting, and analytics; the human still owns the creative call.

## Structure

```
identity/
  constitution.md                Values — your voice is the asset, the pipeline serves the voice
  style.yaml                     Personality + tone sliders

skills/
  base/                          Always-active core capabilities
    triage-captures                Ingest raw captures and route each into a format direction with a hook hypothesis
    creative-brief                 Translate a fuzzy idea into a structured brief — angle, audience, success metric
    transcribe-media               Audio/video → timestamped, speaker-labeled transcript
    segment-transcript             Identify quotable moments, pull-quotes, and natural cut points
    write-script                   Transform a transcript or brief into a platform-appropriate script with hook + pacing
    source-media                   Find b-roll, music, and visual references aligned with brief
    caption-video                  Burned-in captions tuned for sound-off scrolling, platform-aware
    format-for-platform            Aspect ratios, captions, lengths, metadata across multiple platforms
    review-performance             Post-publish analytics — what hit, what flopped, which hook patterns repeat
  extensions/                    Opt-in specialization packs
    shorts-factory                  Vertical-first cadence, hook libraries, repurposing loops
    long-form                       YouTube/podcast structure, chapters, thumbnail ideation
    video                           Edit-list generation, scene planning, transition libraries
    audio                           Podcast cleanup, music bed selection, ducking patterns
    image                           Static post composition, carousel scripting
    avatar                          On-camera framing, wardrobe consistency, presence coaching
    analytics                       Cohort analysis, hook A/B patterns, retention deep-dives

knowledge/                       Frameworks the creator operates from
  hook-patterns/                   Open-loop, contrarian, contradiction, stakes
  platform-grammars/               TikTok, YouTube, Instagram, LinkedIn — what each rewards
  audio-craft/                     Loudness, ducking, EQ basics
  copy-craft/                      CTA structure, retention beats, captions

memory/                          Grows per creator
  brand-voice/                     Captured tone, vocabulary, phrases the creator does and doesn't use
  hook-library/                    Hooks that worked for this creator specifically
  performance-history/             What's published, what hit, what to learn from

schedule.yaml                    Capture sweep, weekly review, performance digest

onboarding/
  questions.yaml                 Voice, audience, platforms, cadence, no-go topics
```

## Activation

Pick this role if you want:

- A pipeline that respects your voice — captures your phrasing, not generic AI cadence.
- Multi-platform leverage from a single capture — one voice memo into three formats.
- Performance feedback that points at patterns, not vanity metrics.

## What It Doesn't Do

- **Ghostwrite as someone else.** The creator keeps the byline; the role drafts and you approve.
- **Auto-publish.** Even on autonomy level 2+, posting is gated on creator approval. Reputation isn't worth the speed.
- **Optimize for engagement at any cost.** Hooks have to match the actual content — bait-and-switch erodes trust the role exists to protect.

## See Also

- `agent/skills/core/*` — the five core skills every role inherits
- `agent/program.md` — how roles are composed onto the base agent
- [`roles/creator/RESEARCH.md`](./RESEARCH.md) — the research that informed this role
