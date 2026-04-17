---
name: creative-brief
description: Given a topic, capture, or intent, produce a complete creative brief — format, hook options, visual treatment, references, shooting notes
when_to_use: >
  User has an idea and wants a concrete plan before production. Also used
  after triage-captures recommends advancing a capture, before write-script
  or any shooting/recording. The brief is the production blueprint.
tier: base
---

# Creative Brief

A shared source of truth for a piece of content — enough detail to shoot, edit, or produce without needing to ask another question.

## Purpose

Most bad content dies in the gap between "I have an idea" and "I'm producing." The brief forces specificity: what platform, what hook, what visuals, what references, what success looks like. It's the handoff document from thinking to making.

## How It Works

1. **Gather inputs**:
   - The raw idea (from the user or `triage.md`)
   - Target platform(s) — check `memory/platform-preferences/`
   - Creator's voice reference (from onboarding `voice_references`)
   - Any constraints (length, sponsor, timeline, equipment)
2. **Sharpen the angle** — Ask ONE question if the idea is vague: *"What's the tension here? What does the audience get wrong about this?"* Keep it to one. If the creator can answer, you have an angle.
3. **Generate 3-5 hook variants** — Use `knowledge/craft/hook-formulas.md`. Each variant targets a different emotional register (curiosity / contrarian / specific / personal / stakes).
4. **Choose format** — Based on source material and platform:
   - Voice-only capture → short vertical w/ b-roll, or podcast clip
   - Talking-head video → reframed short OR YouTube long-form
   - Written thought → LinkedIn, X thread, newsletter
   - Step-by-step → tutorial video OR carousel
5. **Visual treatment** — Concrete direction:
   - B-roll sources (Pexels/Pixabay search terms, or "shoot yourself")
   - Typography / caption style (reference `knowledge/platforms/<platform>.md`)
   - Thumbnail direction (face + emotion + word)
   - Music reference (mood, tempo, source — Pixabay/Uppbeat/Artlist)
6. **Shooting / recording notes** — If human capture needed:
   - Environment (wall, lighting, frame size)
   - Wardrobe (if it matters)
   - Gear (phone OK / lav needed / screen record?)
   - Expected raw duration (2-3x final length)
7. **References** — 2-3 specific pieces of content the creator admires in this format. Link them.
8. **Success definition** — What does "worked" mean for this piece? (views? saves? a specific comment? a reply?)
9. **Emit `brief.md`** in the capture folder.

## brief.md template

```markdown
# Creative Brief — {slug}

## Core
- **Topic**: {topic}
- **Angle / tension**: {one-line angle}
- **Audience**: {who this is for}
- **Platform(s)**: {primary, secondary}
- **Format**: {short vertical | YouTube long | carousel | thread | newsletter | etc.}
- **Target length**: {e.g., 30-45s, 8-10 min, 200-word post}

## Hook — pick one
1. {variant 1} — register: {curiosity/contrarian/etc.}
2. {variant 2}
3. {variant 3}

## Structure
{beat-by-beat outline}
- 0:00-0:03 — hook
- 0:03-0:08 — context
- ...

## Visual treatment
- **Background / location**: {spec}
- **B-roll**: {search terms or "shoot"}
- **Captions**: {style ref — e.g., "Submagic word-by-word, Inter Bold, yellow highlight"}
- **Thumbnail**: {concept — face + emotion + text}
- **Music**: {mood + BPM range + source}

## Shooting / recording notes
- {env, gear, wardrobe, duration}

## References
1. {creator + specific piece + what's great about it}
2. {creator + piece + note}

## Success definition
{specific signal — e.g., "1000 saves," "10 DMs asking for the tool," "90% completion rate"}

## Next step
{write-script | record | source-media | edit}
```

## Autonomy behavior

- **Level 1** — Produce the brief; discuss hook variants with creator; iterate until they pick one before any production starts.
- **Level 2** — Produce the brief with a recommended hook; creator approves or swaps.
- **Level 3** — Produce brief + auto-advance into next skill with chosen hook. Creator reviews at script/shoot time.

## Integration

- Input: `triage.md` from `triage-captures`, or fresh user prompt
- Composes **remember** (reads voice/style memory) + **act** (LLM for variants)
- Downstream: `write-script`, `source-media`, `shorts-factory/variant-spray`, `long-form/write-article`, anything production-side

## Failure modes

- **Vague angle** — don't write a brief if there's no tension. Push back: "What's the real thing here?"
- **Hook variants are all the same register** — force spread: at least one contrarian, at least one specific/tactical, at least one personal
- **Success definition = 'go viral'** — reject. Force a specific, measurable signal
- **Copying the reference instead of learning from it** — references inform tone, not content
