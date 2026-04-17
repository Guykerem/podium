# Platform Specs — Quick Reference

Consolidated specification table. Individual platform files (`tiktok.md`, `youtube.md`, etc.) go deeper; this is the at-a-glance.

## Video

| Platform | Aspect | Resolution | Ideal Len | Max Len | Codec | Audio | Size Cap |
|---|---|---|---|---|---|---|---|
| TikTok | 9:16 | 1080x1920 | 21-34s | 60min | H.264/H.265 | AAC 128k+ | 500MB (short) / 10GB |
| YouTube Shorts | 9:16 | 1080x1920 | 15-40s | 3min (180s) | H.264 | AAC 128k+ | platform default |
| Instagram Reels | 9:16 | 1080x1920 | 15-60s | 90s | H.264 | AAC 128k+ | platform default |
| Instagram Feed video | 4:5 or 1:1 | 1080x1350 / 1080x1080 | 30-60s | 60min | H.264 | AAC 128k+ | 4GB |
| Instagram Stories | 9:16 | 1080x1920 | 15-60s | 60s per | H.264 | AAC 128k+ | platform default |
| YouTube long-form | 16:9 | 1920x1080 or 3840x2160 | 8-15min (new) / 15-25min (est.) | 12hr / 256GB | H.264 (High) | AAC-LC 384k 48kHz | 256GB |
| LinkedIn native video | 1:1 or 9:16 | 1080x1080 / 1080x1920 | 30-90s | 10min | H.264 | AAC 192k+ | 5GB |
| X (Twitter) video | 16:9 or 9:16 | 1280x720+ | 30-60s | 2:20 (free) / 3hr (Premium) | H.264 | AAC 128k+ | varies |
| Podcast (audio) | — | — | 20-60min | unlimited | — | MP3 128k VBR | per-host |

## Image

| Platform | Aspect | Resolution | File Size | Notes |
|---|---|---|---|---|
| TikTok cover | 9:16 | 1080x1920 | <2MB | Shown during scroll |
| Reels cover | 9:16 | 1080x1920 | <2MB | — |
| IG feed single | 1:1 | 1080x1080 | <8MB | — |
| IG feed tall | 4:5 | 1080x1350 | <8MB | Takes most feed real estate |
| IG carousel | 1:1 or 4:5 | 1080x1080 / 1080x1350 | <8MB/slide | 2-10 slides |
| IG Story | 9:16 | 1080x1920 | <30MB | — |
| YouTube thumbnail | 16:9 | 1280x720 | <2MB | JPG/PNG |
| X post image | 16:9 | 1600x900 | <5MB | — |
| X single | 1:1 | 1200x1200 | <5MB | — |
| LinkedIn feed | 1:1 or 4:5 | 1200x1200 / 1080x1350 | <5MB | — |
| LinkedIn doc carousel | 1:1 or 4:5 | 1080x1080 / 1080x1350 | <100MB PDF | 1-300 pages |
| LinkedIn article cover | 3:1 | 1920x640 | <5MB | — |
| Substack hero | 16:9 | 1456x816 | <10MB | OG unfurl |
| Blog / Medium hero | 16:9 | 1500x844 | <2MB | OG unfurl |
| OG image (universal) | 1.91:1 | 1200x628 | <5MB | Social unfurl fallback |
| Pinterest pin | 2:3 | 1000x1500 | <10MB | Portrait preferred |
| Podcast cover (Apple) | 1:1 | 3000x3000 | <500KB JPG | Required spec |

## Text / character limits

| Platform | Caption/Post | Title/Headline | Description | Hashtag recommendation |
|---|---|---|---|---|
| TikTok | 2200 chars | N/A (caption = title) | — | 3-5 niche |
| Instagram Reel/post | 2200 chars (first 125 visible) | N/A | — | 3-10 niche (30 max) |
| YouTube Shorts | 100 (title) / 5000 (description) | 100 chars hard cap, ~60 visible | 5000 | include `#Shorts` |
| YouTube long | 100 (title) / 5000 (description) | 60 visible | 5000 | 3-5 relevant |
| LinkedIn post | 3000 chars (210 visible) | — | — | 3-5 max |
| LinkedIn article | — | 150 chars | 125K body | 3-5 |
| X post (free) | 280 chars | — | — | 2-3 |
| X post (Premium) | 25,000 chars | — | — | same |
| Substack subject | — | 150 chars | 2-5K body typical | — |

## Chapters (YouTube long-form)

- Must start at `00:00`
- Minimum 3 chapters
- Minimum 10s per chapter
- Each on its own line in description: `00:00 Intro`

## Captions

| Platform | Burn-in recommended? | Soft SRT supported? | Max cue duration |
|---|---|---|---|
| TikTok | Yes (word-by-word) | No (native captions exist but limited styling) | — |
| Reels | Yes | Limited | — |
| Shorts | Yes | Yes (via YouTube) | — |
| YouTube long | Optional | Yes (upload SRT) | 7s soft cap |
| LinkedIn | Yes (auto-play muted) | Yes | — |
| X | Yes | Limited | — |

## Metadata essentials

**YouTube long-form upload**:
- Title (≤60 visible), Description (5K chars), Tags (500 chars total), Category, Language, Made-for-kids flag
- Custom thumbnail, End screen elements, Cards, Chapters, Subtitles

**TikTok (Content Posting API)**:
- Caption (2200 chars), Hashtags (inline), Cover image, Privacy setting, Disable comments/duet/stitch, Music ID (if CML)

**Instagram (Graph API — Business accounts only)**:
- Media URL, Caption, Location, Accessibility alt text, Tagged users, Share to feed/story, IG only posting for Reels (not cross-feed)

**LinkedIn**:
- Text (3000 chars), Media (video / image / document), Visibility (public / connections / group)

**X**:
- Text (280 / 25K), Media (up to 4 images, 1 video, 1 GIF), Reply settings, Community/List targeting

## Upload API endpoints (reference)

| Platform | API | Notes |
|---|---|---|
| YouTube Data v3 | `videos.insert` | Resumable upload, 10K unit/day quota |
| TikTok Content Posting | `/v2/post/publish/video/init` | Approved-partner "Direct Post"; all others "Upload" to drafts |
| Instagram Graph v19+ | `/me/media` + `/me/media_publish` | Business account required |
| LinkedIn | `/rest/assets?action=registerUpload` + `/rest/posts` | Org or member posting |
| X v2 | `POST /2/tweets` w/ media upload | Tier-gated write limits |

## How to use this file

- `format-for-platform` reads this for every encode decision
- `publish` (extension) uses the API endpoints table
- Individual platform files in the same directory go deeper on culture, hooks, best times
