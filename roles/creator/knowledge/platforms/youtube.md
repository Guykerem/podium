# YouTube (long-form)

## Specs

- **Aspect**: 16:9 (1920x1080 or 3840x2160 4K)
- **Ideal length**: 8-15 min (new channels) / 15-25 min (established)
- **Max length**: 12 hr / 256 GB (verified accounts)
- **Format**: MP4, H.264 High profile, AAC-LC 384k 48kHz, or HEVC for HDR
- **Thumbnail**: 1280x720, <2MB, JPG/PNG, readable at 320x180
- **Title**: 60 chars visible, 100 hard cap
- **Description**: 5000 chars
- **Tags**: 500 chars total
- **Chapters**: start at 00:00, min 3, min 10s each

## Culture

- **Watch time > views** — algorithm optimizes for session time, not just clicks
- **Retention + CTR = reach** — both matter, neither alone is enough
- **Audience retention graph** is the feedback loop — study it, re-edit future content
- **Subscribers are a slow signal** — earned over many videos, lost quickly with off-brand content

## Hook rules

- **0-15s = full hook**: promise + preview of what they'll learn + why they should care
- **0-30s = critical retention zone** — drop above 40% by 30s is a problem
- **"Browse" vs "Suggested" traffic** — browse = good thumbnail; suggested = good content (algorithm picked you as next-up)

## Retention framework (MrBeast-inspired)

- New element every 40-60s
- Open loops — tease at minute 2, deliver at minute 8
- Ramping stakes
- Clear chapters for re-watch / skim

## What works

- Long tutorials with strong hook
- Story-format personal content
- Analysis / essay format (video essays are thriving)
- Interview content with chapter markers
- Documentaries

## What flops

- Low-CTR thumbnails (test + iterate)
- Slow starts (no hook in first 15s)
- Inconsistent upload cadence (algorithm likes predictability)
- Title / thumbnail mismatch with content (kills retention → kills future reach)

## Title formulas that work

- "[Specific outcome] in [specific timeframe]"
- "Why [common belief] is wrong"
- "I [did unusual thing]. Here's what happened."
- "The [adjective] truth about [topic]"
- "[N] things I wish I knew about [topic]"
- "How to [outcome] without [common pitfall]"

## Thumbnail principles

See `../craft/thumbnail-principles.md`. Face + emotion + ≤3 words. Test variants via YouTube's built-in Test & Compare.

## Chapters

- `00:00 Intro` is required first line
- Min 3 chapters, min 10s each
- Each chapter should have a specific, scannable name (not "Part 1")

## API

- **YouTube Data v3** — `videos.insert`, `thumbnails.set`, `captions.insert`
- **YouTube Analytics v2** — `youtubeAnalytics.reports.query` for retention + CTR + audience
- **Quota**: 10K units/day default, `videos.insert` = 1600 units (≈ 6 uploads/day)

## End screen + cards

- Last 5-20s for end screens
- 1-4 elements: subscribe button, related video, playlist, external link
- Cards throughout for related videos

## SEO

- Primary keyword in: title (first 60 chars), description first line, tags, filename
- Second keyword variant in: description body, chapter titles
- Transcript (captions) is indexed — upload accurate SRT

## Anti-patterns

- Clickbait thumbnail → low retention → reach penalty
- Generic titles ("my new video")
- Sporadic uploads (algorithm rewards cadence)
- Skipping chapters (loses skim-viewers)
- Ignoring the retention graph
