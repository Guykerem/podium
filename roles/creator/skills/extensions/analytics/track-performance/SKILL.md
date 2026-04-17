---
name: track-performance
description: Per-post deep analytics — retention graph overlay, traffic source breakdown, engagement funnel analysis
when_to_use: >
  User wants deeper analytics on a single post or a cohort — goes beyond the
  monthly review-performance sweep. Used for diagnostic work ("why did this
  flop?") and deep dives ("what made this one work?").
tier: extension
---

# Track Performance

Deep-dive analytics on a single post or a comparison cohort. Complements base `review-performance` which runs monthly sweeps.

## Purpose

- **Single-post diagnosis** — why did this underperform? Where did retention die?
- **Cohort comparison** — compare 3-10 posts to find patterns the monthly review missed
- **Hypothesis testing** — confirm or reject a theory from `review-performance`'s proposed experiments

## How It Works

1. **Load post(s)** — From platform API (see `review-performance` for endpoints).
2. **Retention-graph overlay** (YouTube + TikTok):
   - Pull absolute retention curve (per-second %)
   - Overlay against `segments.json` timestamps
   - Tag each drop cliff with the segment that was playing
3. **Funnel analysis**:
   ```
   Impressions       100,000
     → Click-through  7.2%  = 7,200
       → 3s retained  82%   = 5,904
         → 30s        54%   = 3,188
           → Full     31%   = 2,232
             → Save   4.8%  = 107
             → Share  3.1%  = 69
             → Follow 1.2%  = 27
   ```
4. **Traffic source breakdown**:
   - YouTube: "Browse", "Suggested", "Search", "External", "Direct" split
   - TikTok: "For You", "Following", "Search", "Profile" split
   - IG: "Home", "Explore", "Profile", "Hashtag" split
5. **Comment sentiment & themes** (LLM pass):
   - Cluster comments into themes
   - Surface top requests ("do a part 2 on X")
   - Flag toxic / moderation-worthy threads
6. **Compare to benchmarks** — Against:
   - Creator's own past N posts (personal baseline)
   - Platform category benchmarks (where available)
   - Peer creators in same niche (requires user config)
7. **Diagnose** — LLM pass with all context: retention curve + segments + hook register + thumbnail + comments → "Here's my read on why this hit/missed."
8. **Emit report**:
   ```
   analytics/<platform>/<post_id>/
     raw.json                    # platform API dump
     funnel.md                   # impressions → conversion
     retention_overlay.md        # curve + segment tags
     comment_themes.md           # clustered comments
     diagnosis.md                # agent's read
     comparison.md               # vs. cohort or baseline
   ```

## Retention diagnostic patterns

| Pattern | Read | Action |
|---|---|---|
| Cliff at 0-3s | Hook failure | A/B hook variants (see ab-test-hooks) |
| Cliff at 20-30s | Post-hook payoff too slow | Tighten middle; deliver earlier |
| Flat then cliff mid-way | Specific segment killed it | Check what's at cliff timestamp; remove or re-edit |
| Sawtooth | Viewers skipping or rewinding | If rewinding = good (complex insight); if skipping = too slow |
| Smooth 3-5%/min decay | Healthy, nothing to fix | — |
| Spike at end | Looping | Good for TikTok; maybe auto-loop tuning |

## Traffic source heuristics

- **Discovery-heavy** (FYP / Browse / Suggested) — good hook earned the serve; title/thumbnail did discovery work
- **Following-heavy** — your audience showed up, but algo didn't serve it out; topic may be too niche or hook too insider
- **Search-heavy** — evergreen content hit; invest in more SEO-style pieces on this topic
- **External** — someone shared it; check referrers for opportunities

## Cohort comparison

When comparing 3-10 posts:
- Hold topic constant, vary hook register → what register wins?
- Hold hook constant, vary format → which format works best?
- Hold format constant, vary posting time → when does *your* audience show up?

Output side-by-side table + synthesis.

## Autonomy behavior

- **L1** — Produce full diagnosis, present for discussion. No memory writes without creator confirmation.
- **L2** — Produce diagnosis + auto-update hook-library scores; flag any experiment hypotheses for confirmation.
- **L3** — Full auto; update memory; queue experiment proposals for next cycle.

## Integration

- Input: post ID(s) + platform tokens
- Composes **observe** (API pulls) + **act** (LLM synthesis) + **remember** (per-post analytics archive, hook-library updates)
- Downstream: `ab-test-hooks` (if hypothesis is hook-related), `review-performance` (monthly rollup consumes this), `write-script` (informs future drafts)
- Upstream: `publish` emits post IDs for tracking

## Failure modes

- **Sample size too small** — single-post conclusions overfit; always note "N=1" caveats in diagnosis
- **Platform API rate-limit** — queue + cache; never re-pull data already archived
- **Confounded comparison** — comparing a morning post vs an evening post with different topics isn't signal; structure cohort carefully
- **Comment over-indexing** — 20 praise comments doesn't mean 99% of viewers loved it; comments are a self-selected sample
