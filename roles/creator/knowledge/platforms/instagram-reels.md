# Instagram Reels (+ Feed + Stories)

## Reels specs

- **Aspect**: 9:16 (1080x1920)
- **Ideal length**: 15-60s
- **Max length**: 90s (3 min allowed via linked feed; 15 min if longer)
- **Format**: MP4, H.264, AAC
- **Caption**: 2200 chars (first 125 visible before "more")
- **Cover**: 1080x1920, readable
- **Hashtags**: 3-10 niche; algo deprioritizes >5 spam

## Feed video specs

- **Aspect**: 1:1 (1080x1080) or 4:5 (1080x1350 — takes more screen)
- **Max length**: 60 min
- **Best-performing**: 4:5 short-form educational, 30-60s

## Stories specs

- **Aspect**: 9:16, 1080x1920
- **Max length**: 60s per story
- **Ephemeral**: 24hr (or saved to Highlights)

## Culture

- **Aesthetic matters** — visual consistency with feed counts more than TikTok
- **Carousel and document posts** (swipeable) are high-engagement formats
- **Saves** = strongest signal to the algorithm (above likes, shares, comments)
- **Cross-post detection** — Reels flags TikTok watermarks; down-ranks

## Hook rules

- **0-2s same as TikTok**
- **Muted autoplay** — visual + burn-in captions mandatory
- **Cover frame** displayed in feed browsing — design it

## What works

- Carousel posts with saveable educational content
- Reels that would have been TikToks but filmed native
- Behind-the-scenes + personal story (high IG-native engagement)
- Before/after transformations

## What flops

- TikTok cross-posts with visible watermarks
- Long feed videos without hooks
- Over-hashtagging (>10 is a smell)
- Low-quality compositing from square → vertical

## Hashtags

- 3-10 niche tags ideal (2024+ algorithm)
- Avoid generic tags (`#instagood #love`) — they don't help reach
- Mix 2-3 small (<10K posts), 3-5 mid (10K-500K), 1-2 large (500K-5M)

## API

- **Instagram Graph API v19+** — requires Business/Creator account + connected Facebook Page
- **Personal accounts cannot post via API** (limitation since 2018)
- `POST /me/media` + `POST /me/media_publish` (2-step: create container, then publish)
- Reels: `media_type=REELS`, `video_url=...`, `thumb_offset=...`

## Document posts (carousels as PDF)

- Upload PDF via feed post as "document"
- 10 slides typical, up to 300 pages
- Each slide 1080x1080 or 1080x1350
- Highest save-rate format on IG in 2026

## Anti-patterns

- Vertical Reel repurposed as 1:1 feed without re-editing
- TikTok watermarks
- Chasing too many hashtag trends
- Story content that doesn't tie to feed/Reels strategy
