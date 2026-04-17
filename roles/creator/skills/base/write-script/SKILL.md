---
name: write-script
description: Transform a transcript, brief, or raw idea into a platform-appropriate script with hook, structure, and pacing
when_to_use: >
  User has a brief (from creative-brief), a transcript (from transcribe-media),
  or a raw capture they want turned into a script. Also when rewriting an
  existing script to a different platform or length.
tier: base
---

# Write Script

Turn intent into language. The script is the blueprint for everything downstream — narration, captions, b-roll choices, cuts, thumbnail text.

## Purpose

A good script:
- Opens with a hook that earns the next 3 seconds
- Uses spoken language (short sentences, one idea per line)
- Paces to the platform (TikTok cuts every breath; YouTube long-form paces every 45-90s)
- Sounds like the creator, not like ChatGPT
- Is structured so an editor (human or agent) can cut directly against it

## How It Works

1. **Load context**:
   - `brief.md` (if it exists) — this is the source of truth
   - `segments.json` (if transcript-based) — pull structure + quotes
   - `memory/creative-style/voice-samples/` — past scripts the creator approved
   - `memory/platform-preferences/<platform>.yaml` — style, length, pacing defaults
2. **Pick a framework** — From `knowledge/craft/narrative-frameworks.md`:
   - **PAS** (Problem-Agitate-Solution) — short-form, high-conversion
   - **AIDA** — general-purpose
   - **StoryBrand** — long-form, positioning the viewer as hero
   - **Hero's Journey** — documentary / personal narrative
   - **MrBeast retention framework** — long YouTube
   - **Direct list** — tutorial / carousel content
3. **Draft the hook (first)** — Generate 3-5 variants using `knowledge/craft/hook-formulas.md`. Show them before writing the body. Do not write the body until a hook is locked.
4. **Draft the body** — Using the chosen framework:
   - Short sentences (≤ 15 words preferred for short-form)
   - Cut filler ("so", "basically", "I think that")
   - One idea per sentence
   - Platform-specific beats (see below)
5. **Add structural markers** for the editor:
   - `[VISUAL: wide shot, creator at desk]`
   - `[CUT]`
   - `[B-ROLL: typing on keyboard]`
   - `[ON-SCREEN TEXT: "87% of creators"]`
   - `[BEAT]` — pause, don't fill
6. **Time the script** — Estimate spoken duration at 150 WPM (slower for complex content, faster for energetic delivery). Flag if over target length.
7. **Platform pass** — If target is multiple platforms, produce platform-specific variants (same core, tuned opens/pacing).
8. **Emit** `script.md` and if multi-platform, `script.{tiktok,youtube,linkedin}.md` etc.

## Script.md template

```markdown
# Script — {slug}
- **Platform**: {platform}
- **Target length**: {seconds / words}
- **Framework**: {PAS / AIDA / etc.}
- **Hook register**: {curiosity / contrarian / stakes / etc.}

## Hook (0:00-0:03)
{line 1}
{line 2}
[VISUAL: {spec}]

## Body
{beat 1 — 0:03-0:10}
{line}
{line}
[B-ROLL: {spec}]

{beat 2 — 0:10-0:22}
...

## Close
{payoff line}
{CTA — platform-appropriate}

## Notes
- Estimated duration: {X}s at 150 WPM
- Tone: {creator's voice reference}
- On-screen text overlays: {list}
```

## Platform-specific beats

- **TikTok / Reels / Shorts**: Hook (0-2s) → Context (2-5s) → Dense value beats (every 1-3s w/ visual change) → Loop-back close (final frame ≈ opening frame)
- **YouTube long-form**: Cold open / hook (0-15s) → Promise (15-30s) → Proof (story/credibility, 30-60s) → Content (85%, with retention beats every 45-90s) → CTA + end screen (last 20-30s)
- **LinkedIn**: Line-1 hook (visible in preview) → blank line → insight → story → lesson → CTA/question. Single idea per line.
- **X thread**: First tweet is the hook + payoff tease. Each subsequent tweet = one idea, ≤ 260 chars. End with a CTA or summary.
- **Newsletter**: Subject line = hook. First 50 words = payoff preview. Body delivers. Close with one clear CTA.

## Voice-matching

Pull 2-3 past scripts from `memory/creative-style/voice-samples/` and include as few-shot examples in the LLM prompt. Track what the creator revised last time — those revisions ARE the style guide.

## Autonomy behavior

- **Level 1** — Present 3 hook variants, ask creator to pick. Then draft body. Present for revision before committing.
- **Level 2** — Pick the hook matching the register in the brief (or default register from memory), draft full script, present for one revision pass.
- **Level 3** — Draft full script end-to-end, present for approve/revise/reject. Always gated.

Never auto-publishes a script. The creator's voice is sacred — always requires approval.

## Integration

- Input: `brief.md`, `segments.json`, raw user prompt
- Composes **remember** (voice samples, preferences) + **act** (LLM draft)
- Downstream: `generate-voice` (audio/voiceover pack), `caption-video` (script = caption source), `edit-video` (cut against script), `format-for-platform` (generate variants)

## Failure modes

- **AI voice drift** — generic "As creators, we all know..." energy. Regenerate with tighter voice samples.
- **Hook that gives away the answer** — rewrite to tease, not resolve.
- **Too long for platform** — if TikTok script clocks 75s, either cut 50% or retarget to YouTube Shorts (3min).
- **CTA bolted on** — if the CTA doesn't flow from the content, drop it. A soft "follow for more" beats a forced pitch.
