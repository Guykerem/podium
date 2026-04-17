# Thumbnail Principles

A thumbnail does half the work of a YouTube video. Read before every `generate-thumbnail` invocation.

## The five rules

1. **One face, one emotion** — Shock, confusion, or triumph. Eyes clearly visible. Face = 30-50% of canvas.
2. **Three elements maximum** — Face + object + 2-3 words. Anything more clutters at scale.
3. **High contrast** — The subject must pop off the background. Use the Color-Focus-Contrast rule.
4. **Curiosity gap** — Hint at the payoff. Don't resolve it. The thumbnail creates the question the video answers.
5. **Readable at 320x180** — Design for thumbnail scale, not design scale. Check on phone before publishing.

## The Color-Focus-Contrast rule (MrBeast-validated)

- **Color**: The subject has a different dominant hue than the background
- **Focus**: The subject is sharp; background can be blurred or flattened
- **Contrast**: Light-on-dark or dark-on-light between subject and background

If all three aren't present, the thumbnail won't pop in a feed of 8 thumbnails at small size.

## Emotional registers (pick one per thumbnail)

| Emotion | Face language | Use when |
|---|---|---|
| **Shock** | Open mouth, wide eyes | Surprising result, "you won't believe" content |
| **Confusion** | Furrowed brow, puzzled half-smile | Unresolved mystery, "what is this?" content |
| **Triumph** | Genuine smile, pointing at object | Positive outcome, "I did X" content |
| **Determination** | Serious, direct eye contact | Lessons, hard-won insights |
| **Horror / disgust** | Cringe, pulling back | Mistake content ("I made this terrible error") |

## Text rules

- **≤ 3 words** — Scannable in 0.3s
- **ALL CAPS or Title Case** — matches YouTube cultural norms
- **Heavy weight font** — Inter Black, Komika Axis, Bebas Neue, Anton
- **Heavy outline or box** — 4-8px black outline, or colored rectangle behind text
- **Avoid the face** — text on the opposite third from the face

## Color palettes that work

- **Yellow + black** (MrBeast) — highest contrast, always pops
- **Red + white** — urgency + stakes
- **Cyan + orange** — complementary, Michael Bay-core
- **White + dark blue** — professional / tech
- **Bright accent on dark BG** — common across categories

Check `memory/creative-style/brand.yaml` for creator's brand palette first.

## Anti-patterns

- **Cluttered scene** — if it takes more than 1 second to parse, skip it
- **Small face** — face under 20% of canvas = dead thumbnail
- **Unclear subject** — can a stranger glance and know the category?
- **Text over face** — blocks the emotion you designed for
- **Low contrast on mobile** — what looks fine on desktop disappears in a dark-mode feed
- **Reusing the exact same thumbnail style as last 5 videos** — pattern break on your own channel matters

## A/B testing protocol

1. Generate 3 variants with **different emotional registers** — not three variations of shock
2. Same title across all three (test thumbnail alone)
3. Use YouTube's native **Test & Compare** (Studio → Content → Test)
4. Wait for minimum 2000 impressions per variant
5. Winner = highest CTR × highest watch-time-per-click
6. Log to `memory/creative-style/thumbnail-winners.md`

## Platform variants

| Platform | Format | Notes |
|---|---|---|
| YouTube long-form | 1280x720 (16:9) | Custom thumbnail required |
| YouTube Shorts | First frame | No custom thumbnail; compose first frame deliberately |
| Podcast cover | 3000x3000 (square) | Apple/Spotify requires; episode art separate |
| Blog / OG | 1200x630 (1.91:1) | Social unfurl |
| LinkedIn doc post | 1080x1080 first slide | First slide is your thumbnail |
| Substack | 1456x816 (hero) | Social unfurls use this |

## Reference channels to study

- **MrBeast** — face + object + 2-3 words, always
- **Ali Abdaal** — consistent brand palette, clean typography
- **Veritasium** — curiosity gap, scientific objects
- **Ryan Trahan** — strong emotion + contextual prop
- **Thomas Frank** — personal + clear category signal

When the creator is picking thumbnail direction, reference creators in their actual competitive set, not these.

## How to use this file

- `generate-thumbnail` reads this to produce variants
- `review-performance` references this to diagnose thumbnail underperformance
- `ab-test-hooks` uses the testing protocol when running thumbnail tests
