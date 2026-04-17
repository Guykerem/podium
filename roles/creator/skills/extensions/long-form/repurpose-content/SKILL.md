---
name: repurpose-content
description: Fan out a single piece of content into every derivative format — clips, thread, newsletter, carousel, quotes, cross-platform variants
when_to_use: >
  User wants maximum mileage from one capture. Takes a long-form source
  (podcast, YouTube video, article) and produces 10-20 derivative assets
  automatically. The multiplier skill — one capture, a week of content.
tier: extension
---

# Repurpose Content

The Pillar-to-Clusters machine. One long-form source becomes 15+ derivatives across formats and platforms.

## Purpose

Most creators produce one great piece and let it die. This skill treats every long-form source as a pillar and generates every natural derivative:

- Short clips per top segment (9:16 + 1:1)
- X thread
- LinkedIn carousel
- Newsletter issue
- Quote graphics (3-6)
- Blog post / newsletter (if source was audio/video)
- Podcast clip pack (if source was video)
- Cross-platform variants of every derivative

## How It Works

1. **Input** — One pillar source:
   - A YouTube video + transcript
   - A podcast episode + transcript + segments
   - A long-form article
   - A talk/keynote recording
2. **Run or confirm prerequisites**:
   - `transcribe-media` → transcript
   - `segment-transcript` → segments with hook potential + quotability scores
3. **Generate derivation plan** — `repurpose_plan.yaml`:
   ```yaml
   pillar: episode_047_master.mp4
   derivations:
     short_clips:
       - {segment: seg_003, format: 9:16, platforms: [tiktok, shorts, reels], target_length: 45}
       - {segment: seg_007, format: 9:16, platforms: [tiktok, shorts], target_length: 60}
       - {segment: seg_012, format: 1:1, platforms: [linkedin, ig_feed], target_length: 30}
     thread:
       platform: x
       posts: 9
       source: top_5_insights
     carousel:
       platform: linkedin
       slides: 8
       source: structured_outline
     newsletter:
       platform: substack
       length: 800
       angle: "behind the scenes of this episode"
     article:
       platform: blog
       length: 1800
       seo_keyword: "{computed}"
     quote_cards:
       count: 5
       source: top_quotability
       platforms: [ig_feed, x, linkedin]
     podcast_clips:
       count: 3
       format: audiogram
   ```
4. **Creator approval checkpoint** — Show plan; creator can drop / add / reorder derivatives.
5. **Execute** — For each derivation, route to the appropriate skill:
   - `short_clips` → `edit-video` + `caption-video` + `shorts-factory/reframe-vertical` + `format-for-platform`
   - `thread` → `create-thread`
   - `carousel` → `design-graphics`
   - `newsletter` → `write-article` with newsletter target
   - `article` → `write-article` with blog target
   - `quote_cards` → `design-graphics` with quote template
   - `podcast_clips` → `mix-podcast` (short variant) + audiogram image
6. **Stagger the ship schedule** — Don't dump all derivatives same day. Propose a 5-10 day drip:
   ```
   Day 0: publish pillar
   Day 0: thread (X + LinkedIn)
   Day 1: clip 1 (TikTok/Shorts/Reels)
   Day 2: quote cards (IG/LinkedIn)
   Day 3: newsletter
   Day 4: clip 2
   Day 5: carousel
   Day 7: blog post
   Day 9: clip 3 (as "didn't land first time, another angle")
   ```
7. **Emit** — All derivatives in a single package:
   ```
   repurpose/<slug>/
     plan.yaml
     schedule.yaml
     clips/
     thread.md
     carousel/
     newsletter.md
     article.md
     quote_cards/
     podcast_clips/
     publish_queue.yaml           # ready for `publish` skill or manual
   ```

## Segment selection heuristics

Pull the top candidates per derivative type from `segments.json`:

- **Short clips**: `hook_potential >= 4` AND `self_contained == true` AND `15 <= duration <= 90s`
- **Thread source**: top 5 `insight` beat_type segments
- **Carousel source**: full narrative arc (hook → context → beats → payoff)
- **Newsletter angle**: pick a less-obvious angle — "here's what I didn't say on the show" works
- **Blog post**: full transcript restructured for SEO
- **Quote cards**: top 5 `quotability == 5` segments, each ≤ 20 words

## Platform-specific output specs

Each derivative goes through `format-for-platform` for final specs. The repurpose plan just picks which segments become which formats.

## Autonomy behavior

- **L1** — Show plan, get approval before running any derivation. Each derivative's output reviewed separately.
- **L2** — Run derivations on approved plan. Present consolidated output for batch review.
- **L3** — Full auto on pillar approval. Stagger schedule auto-applied. Creator reviews schedule + final outputs.

Never auto-publishes any derivative.

## Integration

- Input: pillar source + transcript + segments
- Composes **act** (orchestrates sub-skills) + **remember** (derivation log, performance tracking per derivative type)
- Downstream: every production skill; `publish` for queue; `review-performance` closes the loop
- Upstream: `transcribe-media`, `segment-transcript`

## Failure modes

- **Everything derivative feels rehashed** — add angle variation; one clip should be "the tactical moment," another "the emotional beat," another "the surprise"
- **Spamming the same audience on same day** — stagger across platforms that share audiences (e.g., don't post IG Reel + TikTok same hour)
- **Low-quality derivative dilutes brand** — a weak short is worse than no short; set a `min_quality_score` and drop weak derivatives
- **Losing the pillar's message** — derivatives should all point back to the pillar, either thematically or with a link
