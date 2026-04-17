---
name: generate-thumbnail
description: Design YouTube / social thumbnails — face + emotion + 2-3 word text at readable scale
when_to_use: >
  Long-form YouTube content needs a click-earning thumbnail. Also for blog
  hero images, LinkedIn document covers, podcast episode art. A/B variant
  testing supported.
tier: extension
---

# Generate Thumbnail

A thumbnail does half the work of a YouTube video. This skill designs thumbnails that obey proven heuristics and produces A/B variants for testing.

## Purpose

Produce 3 variants per thumbnail request, each testing a different emotional register. Each variant follows the MrBeast-validated rules: one face, one emotion, ≤3 elements, high contrast, ≤ 3 words, readable at 320x180.

## How It Works

1. **Inputs**:
   - Video title or topic
   - A photo of the creator (from `memory/creative-style/portraits/`) OR a source frame from the video
   - Brand style (colors, fonts, logo, past winners) from `memory/creative-style/thumbnail-winners.md`
2. **Propose 3 emotional registers**:
   - **Shocked / open-mouth** — "I can't believe this"
   - **Confused / puzzled** — "what is this?"
   - **Triumphant / pointing** — "you have to see this"
3. **Background generation** — Choose one per variant:
   - **Frame extraction** — pull a scene-change frame from the video:
     ```bash
     ffmpeg -i source.mp4 -vf "thumbnail,scale=1280:720" -frames:v 1 bg.jpg
     ```
   - **Generated background** — Flux / DALL-E / SDXL prompt for on-topic background:
     ```
     "Cinematic moody background for YouTube thumbnail about {topic}, high contrast,
      rule-of-thirds composition, 16:9, space for subject on the right, dark blue to orange gradient"
     ```
4. **Subject cutout** — Remove background from creator photo:
   ```bash
   curl -X POST https://api.remove.bg/v1.0/removebg \
     -H "X-Api-Key: $REMOVEBG_KEY" \
     -F image_file=@portrait.jpg \
     -F size=auto \
     --output creator_cutout.png
   ```
   Alternatives: Photoroom API, local `rembg` (Python), DeepLab, Apple Vision.
5. **Composite** — Use Figma API (if creator has a brand template) or render programmatically with PIL / Sharp / Remotion:
   - Background layer
   - Gradient / vignette for subject pop (optional)
   - Subject cutout, right-third, scaled to 40-50% of canvas height
   - Text layer (2-3 words max, Inter Black or Komika Axis, heavy outline or shadow)
   - Optional: emoji / icon next to text
   - Optional: subtle brand mark in a corner
6. **Validate**:
   - Downscale to 320x180 → is the text readable? Is the emotion readable?
   - Contrast check — WCAG AA ideal
   - Face visibility — eyes clearly visible
   - Text word count — ≤ 3 words
7. **Emit 3 variants** to `outputs/thumbnails/`:
   ```
   thumbnails/
     variant_shocked.jpg      1280x720
     variant_confused.jpg
     variant_triumphant.jpg
     meta.yaml                 # register, text, element list per variant
   ```
8. **A/B test setup** — If YouTube channel is connected, stage variants for YouTube's built-in Test & Compare (2024+). Otherwise, recommend TubeBuddy A/B or rotate manually.

## Design rules (from knowledge/craft/thumbnail-principles.md)

| Rule | Why |
|---|---|
| One face, eyes visible, 30-50% of canvas | Faces = attention |
| ≤ 3 words of text | Scannable at thumbnail scale |
| ≤ 3 elements total (face + object + text) | Clutter = skip |
| Color-Focus-Contrast: subject pops | Pattern interrupts feed |
| Different from your last 5 thumbnails | Pattern break on your own channel |
| Different from competitors in the recommended column | Stand out in feed |
| Curiosity gap — hint, don't reveal | Drives click |

## Thumbnail text formulas

- Shock noun: "THIS... BROKE ME"
- Contradiction: "STOP DOING THIS"
- Number + noun: "3 WORDS"
- Stakes: "$100K MISTAKE"
- Hidden truth: "NOBODY TELLS YOU"

## Autonomy behavior

- **L1** — Generate 3 variants, present in a contact sheet for creator to pick.
- **L2** — Generate 3, auto-select best by internal heuristics (face clarity + contrast + text legibility at 320x180), present for approval.
- **L3** — Generate 3, auto-stage in YouTube A/B test, report winner.

Never uploads the chosen thumbnail without explicit creator action.

## Integration

- Input: video or frame + title + creator portrait + brand style
- Composes **act** (image gen + remove.bg + compositor) + **remember** (thumbnail-winners library)
- Downstream: `publish` pack, or manual upload
- Upstream: `segment-transcript` (for title/topic), `review-performance` (which past thumbnails worked?)

## Cost notes

- DALL-E HD background: $0.080 × 3 = $0.24
- Flux Pro 1.1 background via fal: $0.06 × 3 = $0.18
- remove.bg: free tier 50/mo, then $0.20/credit
- Local `rembg`: free

## Failure modes

- **Uncanny valley composite** — subject lighting doesn't match background. Re-prompt the background to match the subject's lighting direction, or use a brand color fill instead of generated background
- **Text covering face** — composition rules: subject right, text left, or vice versa; never over face
- **All variants feel the same** — force emotional register spread (shock / confusion / triumph); reject if 2 variants test same emotion
- **Generic AI background** — if it looks AI-generated, use a scene frame from the actual video instead
