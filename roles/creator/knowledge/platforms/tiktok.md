# TikTok

## Specs

- **Aspect**: 9:16 (1080x1920)
- **Ideal length**: 21-34s (highest completion rate band)
- **Max length**: 60 min
- **Format**: MP4 or MOV, H.264/H.265, AAC 128k+, 48kHz
- **Size cap**: 500 MB short / 10 GB longer
- **Cover**: 1080x1920, readable text
- **Caption**: 2200 chars

## Culture

- **Sound-on default** (briefly) but most retention comes from **burn-in captions**
- **Trending sounds** give algorithmic boost — check Creative Center
- **Duets / stitches** are key distribution loops; design content that invites them
- **Direct, personal tone** — TikTok rewards vulnerability and specificity
- **Rapid cuts** — every breath. Kill dead air.

## Hook rules

- **0-2s = everything.** Swipe-away happens by second 2.
- **Visual + verbal hook together** — mute the video and ask "would someone stay?"
- **Pattern interrupt** — unusual angle, unexpected object, contradictory claim

## What works

- First-person storytelling
- Concrete specifics ("I spent $47 on..." beats "I spent money on...")
- POV content (you're showing the viewer something as if they were there)
- Contrarian takes in crowded niches
- Educational content with strong hooks

## What flops

- Over-produced intros (logo animations, title cards)
- "Hey TikTok, today we're going to..." preambles
- Recycled YouTube edits (pacing mismatch)
- Sponsored content without disclosure

## Hashtag strategy

- 3-5 niche tags
- Avoid `#fyp #foryou #viral` — read as spam by algorithm
- Mix: one broad niche + 2-3 specific + one trending (if relevant)

## Posting times (general — override with `audience-insights`)

- Weekdays: 7-9am, 12pm, 7-11pm ET
- Weekends: 11am-2pm, 7-9pm ET
- Your audience's schedule trumps averages

## API

- **Content Posting API v2** — `POST /v2/post/publish/video/init` (Direct Post for approved partners; Upload for drafts)
- **Business API** — analytics + Commercial Music Library access
- **Creative Center** — trending sounds / hashtags / creators (no official API; scrape structured public data)

## Music

- **Personal account**: full trending library available via the app; cannot be attached programmatically for most tracks
- **Business/Commercial account**: restricted to Commercial Music Library (CML); can reference `music_id` in API upload
- Attach via TikTok app after upload is the safest workflow for personal accounts

## Anti-patterns

- Uploading 16:9 with bars
- No captions
- Watermarked stock footage
- Cross-posted Reels (TikTok detects TikTok watermarks; down-ranks)
