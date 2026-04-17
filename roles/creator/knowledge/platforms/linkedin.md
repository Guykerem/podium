# LinkedIn

## Specs

- **Native video**: 1:1 or 9:16 (vertical favored 2024+), 3s-10min, max 5GB, MP4
- **Document post (carousel PDF)**: 1-300 pages, 1:1 or 4:5 per page, max 100MB — highest-engagement format
- **Article** (long-form): ≤ 125K chars
- **Post image**: 1:1 (1200x1200) or 4:5 (1080x1350)
- **Feed caption**: 3000 chars, first 210 visible before "see more"
- **Hashtags**: 3-5 max (algo deprioritizes >5)

## Culture

- **Professional-adjacent** — slightly more polish than other social, less formal than corporate
- **Text posts drive huge reach** — LinkedIn's algorithm rewards text with genuine engagement
- **Comments > likes** — comments in the first hour compound reach
- **Dwell time counts** — long posts that hold attention get pushed
- **Personal stories + lessons** dominate the feed in 2026
- **Corporate-speak is a death sentence** — write like a person, not a press release

## Hook rules

- **Line 1 is visible in the preview** — treat as headline
- **Line 2 blank**
- **Lines 3-N: one idea per line, short lines**
- **Scroll-earning structure** — give them reasons to tap "see more"

## What works

- Contrarian take + personal story + lesson + question
- "I learned this at [company] and I'll never forget it" structure
- Document carousel posts (swipeable PDF) — highest save rate
- Native video with burn-in captions (autoplay muted)
- Polls (high engagement trigger)

## What flops

- Sales pitches
- External links (LinkedIn deprioritizes; put link in first comment instead)
- Generic "inspirational" content
- Cross-posted tweets (formatting breaks)
- Corporate tone without personality

## Post structure template

```
{line 1 — hook, visible in preview}

{line 2 — blank}

{line 3 — expand hook}

{line 4-5 — story / context, short lines}

{beat 1}
- bullet
- bullet

{beat 2}
- bullet
- bullet

{line — synthesis or lesson}

{CTA — question or "follow for more" — sparingly}
```

## Hashtags

- 3-5 max
- 1 broad category + 2-3 niche + 0-1 trending
- Examples: `#ProductManagement #AIAgents #BuildInPublic`
- Avoid hashtag chains (>5 reads as spammy)

## Link strategy

- Put links **in the first comment**, not the body
- If you must have a link in body, add it at the end (not first paragraph)
- Add "[link in comments]" to drive people down

## API

- **LinkedIn REST API** — `/rest/posts` for content, OAuth 2
- **Upload sequence**: register → upload binary → create post referencing asset
- Personal vs organization posting via `author` field
- Document posts: upload as "document" media type

## Video specifics

- Vertical (9:16) now favored over horizontal for native video (2024+)
- First 3 seconds must have burn-in text (muted autoplay default)
- Square (1:1) works but loses screen real estate
- Captions essential — LinkedIn auto-caption exists but is unreliable; upload SRT

## Anti-patterns

- Regurgitated LinkedIn Lunatic generic-inspo ("Coffee ☕ is the foundation...")
- Faux humility ("I was rejected 10,000 times but...")
- Hashtag walls
- Treating it like Twitter (ignores culture)
- Selling in every post
