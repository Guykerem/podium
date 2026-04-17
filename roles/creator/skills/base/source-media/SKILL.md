---
name: source-media
description: Find stock footage, images, and music from licensed sources that match the content's tone
when_to_use: >
  The script calls for b-roll, a hero image, background music, or SFX the
  creator isn't shooting themselves. Also used to populate moodboards for
  creative-brief. Respects licensing per memory/tool-preferences/licensing.yaml.
tier: base
---

# Source Media

Find and license visual and audio assets without making the creator hunt. Output includes the asset, the license, and the attribution string.

## Purpose

Stock sourcing is the grunt work of production. Creators burn hours scrolling Pexels. The agent takes a script or brief, generates specific queries, fetches candidates, filters for tone, and returns 3-5 options per asset slot with license metadata attached.

## How It Works

1. **Parse need list** — From `script.md` or `brief.md`, extract:
   - B-roll slots (`[B-ROLL: typing on keyboard]`)
   - Hero / thumbnail image needs
   - Music needs (mood, tempo, length)
   - SFX needs (whoosh, stinger, chime)
2. **Map to searchable queries** — For each slot, generate 3 query variants:
   - Literal (`"person typing on laptop"`)
   - Emotional (`"focus flow state writing"`)
   - Visual-metaphor (`"cursor blinking on screen"`)
3. **Pick providers** — From `memory/tool-preferences/licensing.yaml`:
   - **Strict commercial** → Artlist, Epidemic Sound (music); Storyblocks, Adobe Stock (footage)
   - **Standard** → Pexels + Pixabay + Unsplash (free with near-CC0 licenses)
   - **Personal** → anything goes, still tag attribution
4. **Fetch candidates** — Call APIs:
   ```bash
   # Pexels video (vertical b-roll)
   curl -H "Authorization: $PEXELS_KEY" \
     "https://api.pexels.com/videos/search?query=typing&orientation=portrait&size=medium&per_page=10"

   # Unsplash images
   curl -H "Authorization: Client-ID $UNSPLASH_KEY" \
     "https://api.unsplash.com/search/photos?query=focus&orientation=portrait&per_page=12"

   # Pixabay audio
   curl "https://pixabay.com/api/?key=$PIXABAY_KEY&q=cinematic+uplifting&media_type=music"
   ```
5. **Filter for tone** — Reject:
   - Overused clichés (stopwatch, handshake, generic "business meeting")
   - Watermarked previews (Storyblocks, Shutterstock comp versions)
   - Poor resolution for target platform (4K source required for zooming in short-form)
   - Wrong orientation for target platform
6. **Match to brand style** — If `memory/creative-style/mood-board.md` exists, rank by similarity (color palette, lighting direction, composition density).
7. **Download + attach metadata** — Each asset gets:
   ```yaml
   # asset.meta.yaml
   file: pexels-12345.mp4
   source: pexels
   id: 12345
   photographer: Jane Doe
   license: pexels-license
   attribution_required: false
   attribution_string: "Video by Jane Doe on Pexels"
   commercial_use: true
   downloaded_at: 2026-04-17T10:32:00Z
   query: "typing on laptop vertical"
   ```
8. **Trigger download endpoint where required** — Unsplash API requires calling `photo.links.download_location` per guidelines. Do this automatically.
9. **Emit** to `memory/content-log/<slug>/assets/`:
   ```
   assets/
     broll/
       shot_01_typing.mp4
       shot_01_typing.meta.yaml
     images/
       hero.jpg
       hero.meta.yaml
     music/
       bed.mp3
       bed.meta.yaml
     ATTRIBUTIONS.md
   ```
10. **ATTRIBUTIONS.md** auto-compiled — ready for show notes / descriptions.

## Provider quick-reference

| Provider | Type | Auth | Rate | License notes |
|---|---|---|---|---|
| Pexels | video + photo | `Authorization: KEY` | 200/hr | Free commercial, no attribution required |
| Pexels Videos | video | same | same | 4K-capable, search by orientation |
| Pixabay | photo + audio + video | `?key=KEY` | 100/60s | Pixabay License (~CC0) |
| Unsplash | photo | `Client-ID KEY` | 5000/hr prod | Attribution encouraged; trigger download endpoint |
| Epidemic Sound | music | OAuth (enterprise API) | varies | YT-monetization safe, requires subscription |
| Artlist | music + footage | no public API | — | Plugin-only (Premiere/FCP/AE) |
| Uppbeat | music | limited API | — | Free w/ attribution; Pro tier |
| YouTube Audio Library | music | web-only | — | Free, attribution varies per track |

## Matching tone heuristics

- **Tech / business content** — avoid stopwatch / handshake / "diverse hands over laptop" stock clichés. Look for second-page results, or shoot.
- **Emotional / personal** — prefer Unsplash curated collections; avoid stock with actors acting-out-emotion.
- **Cinematic / documentary** — go Artlist or Pond5 4K if licensing allows; downgrade to Pexels 4K otherwise.
- **Music for voice-over** — prefer instrumental, low-vocal presence, 120-140 BPM for energetic, 70-90 BPM for reflective.

## Autonomy behavior

- **Level 1** — Present 3-5 candidates per slot with thumbnails and attribution notes. Creator picks.
- **Level 2** — Auto-pick the top-ranked candidate per slot; present the set for approval before downloading.
- **Level 3** — Auto-source, auto-download, auto-attach. Creator reviews in edit.

Never charge a paid provider (Storyblocks, Artlist) without explicit confirmation.

## Integration

- Input: `script.md`, `brief.md`, or a raw request ("find me sad piano music")
- Composes **act** (API calls) + **remember** (writes assets + meta + attributions)
- Downstream: `edit-video`, `design-thumbnail`, `mix-podcast`, `generate-visuals` (when stock isn't enough → generate)

## Failure modes

- **Cliché overuse** — if top 3 candidates are all the overused shot, rerun with a different query register
- **Attribution forgotten** — the ATTRIBUTIONS.md is the contract; never ship without it compiled
- **License mismatch** — if the creator's profile says "strict commercial" and only Pexels/Unsplash are enabled, flag the gap before downloading
- **Rate limit hit** — queue + retry with exponential backoff; cache queries in `memory/` so rerunning is free
