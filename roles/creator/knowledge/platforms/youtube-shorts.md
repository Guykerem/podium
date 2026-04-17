# YouTube Shorts

## Specs

- **Aspect**: 9:16 (1080x1920); 1:1 also works as Short
- **Ideal length**: 15-40s
- **Max length**: 3 min (180s, since Oct 2024)
- **Format**: same as standard YouTube — H.264, AAC
- **Discovery**: `#Shorts` in title/description helps indexing
- **No custom thumbnail** — first frame matters; design cover frame deliberately

## Culture

- **More long-play-aware** than TikTok — YouTube pulls Shorts watchers toward the creator's long content
- **Title-as-hook** strategy — Shorts show the title; treat it like a TikTok caption hook
- **Search-friendly** — Shorts rank in Google + YouTube search, unlike TikToks
- **Muted auto-play** during browse; **unmuted** in Shorts feed

## Hook rules

- **0-1s = swipe-away decision** — faster than TikTok
- **First frame designed** — this becomes the thumbnail
- **Title does work** — include promise keywords

## What works

- Niche-specific educational Shorts with strong titles
- Pull-quotes from long-form videos (drives traffic to main channel)
- Pattern-interrupt visual opens
- Tutorial Shorts ("30 seconds to learn X")

## What flops

- Direct TikTok crossposts with watermarks (YouTube de-ranks)
- Vague titles
- Content that doesn't lead to long-form (wastes the funnel)

## Title patterns

- "[Action] in 30 seconds"
- "The [specific] [category] mistake"
- "[Number] words that changed [domain]"
- "Why [common belief] is wrong"

## API

- **YouTube Data v3** `videos.insert` — same endpoint as long-form; mark as Short via aspect + length
- **YouTube Analytics v2** — separate Shorts metrics (swipe-away rate, Shorts feed vs Browse)

## Posting

- Same channel as long-form; Shorts shelf groups them
- First frame = thumbnail (no custom) — compose accordingly

## Anti-patterns

- TikTok watermarks (YouTube filters for these)
- No hook in first second
- Low-res or wrong aspect
- Treating Shorts as only a distribution format without learning loops back to long-form
