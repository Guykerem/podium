---
name: review-performance
description: Pull analytics across platforms, surface what's working, and propose next experiments — the monthly learning loop
when_to_use: >
  Monthly on the `monthly-content-review` schedule. Also on-demand when the
  creator asks "how did last week's content do?" or wants to plan next month.
  Drives learning — updates memory/creative-style/ based on what the audience
  rewards.
tier: base
---

# Review Performance

Close the loop. Analytics without action is just dashboards; this skill turns numbers into next experiments.

## Purpose

- Pull per-post metrics from every connected platform
- Surface patterns — which hooks landed, which thumbnails earned clicks, which topics drove saves
- Propose 2-3 experiments for the next cycle (hook variant, format test, topic direction)
- Update `memory/creative-style/` with what's working — the agent gets better over time

## How It Works

1. **Load connected platforms** — From `memory/platform-preferences/connections.yaml`:
   ```yaml
   youtube: oauth_token_ref
   tiktok: oauth_token_ref
   instagram: oauth_token_ref
   linkedin: oauth_token_ref
   x: oauth_token_ref
   ```
2. **Pull per-platform analytics** (last 30 days default, configurable):
   - **YouTube**: `youtubeAnalytics.reports.query` — views, impressions, CTR, avg view duration, audience retention per video
   - **TikTok**: Business API — views, full watch rate, traffic source (FYP vs following vs search), retention curve
   - **Instagram**: Graph API v19+ — reach, impressions, plays, saves, shares, follows-from-post
   - **LinkedIn**: organization/member APIs — impressions, engagement, click-through
   - **X**: Analytics API — impressions, engagements, link clicks
3. **Normalize into a single data model**:
   ```yaml
   post_id: "yt_dQw4w9WgXcQ"
   platform: youtube
   published_at: 2026-03-15
   format: long-form
   topic_tags: [ai-agents, tutorial]
   hook_register: contrarian
   thumbnail_style: face+word
   duration_sec: 712
   reach: 12430
   impressions: 58200
   ctr_pct: 7.2
   watch_through_pct: 48.1
   saves: 340
   shares: 180
   comments: 92
   followers_gained: 26
   ```
4. **Diagnostic pass** — For each post, grade:
   - **Hook**: CTR (discovery) + retention at 3s / 10s / 30s
   - **Body**: retention curve shape (smooth decay? cliff? sawtooth?)
   - **Payoff**: saves + shares + comments depth
   - **CTA**: follow rate, link clicks
5. **Pattern surface** — Cluster top-performing and bottom-performing posts. Ask:
   - Which hook registers (curiosity / contrarian / stakes / personal / tactical) correlate with high CTR?
   - Which topics drove saves vs. shares vs. comments (they're different signals)?
   - Which thumbnails earned clicks (face emotion, color, text)?
   - Which posting times hit for this audience?
6. **Read retention graphs** (where available):
   - Initial cliff (0-30s) = hook health
   - Smooth decay = healthy (≈ 3-5%/min drop)
   - Flat then cliff = one bad segment, flag timestamp
   - Sawtooth = skipping (good if anticipation; ambiguous if confusion)
7. **Propose 2-3 experiments** for next cycle:
   - "Your contrarian hooks are 2.1x CTR vs. listicle hooks — test 3 more contrarian opens."
   - "Tutorials drove 4x saves but 0.3x shares. Add a shareable moment mid-tutorial."
   - "Your 9pm posts outperformed your morning posts 3:1 — shift cadence."
8. **Update memory** — Write to `memory/creative-style/`:
   - `hook-library.yaml` — ranked hooks with performance metadata
   - `audience-insights.md` — consolidated audience profile
   - `platform-cadence.yaml` — best times, best days per platform
   - `thumbnail-winners.md` — reference for `design-thumbnail`
9. **Emit report** — `memory/content-log/reviews/<date>.md`:
   ```markdown
   # Performance Review — {window}

   ## Headline numbers
   - Total reach: {N}
   - Total engagements: {N}
   - Followers gained: {N}
   - Top post: {id} — {why}

   ## What's working
   - {insight 1}
   - {insight 2}
   - {insight 3}

   ## What isn't
   - {anti-insight 1}
   - {anti-insight 2}

   ## Proposed experiments
   1. {hypothesis + how to test}
   2. {hypothesis + how to test}
   3. {hypothesis + how to test}

   ## Updates applied
   - memory/creative-style/hook-library.yaml: +3 winners, -2 retired
   - memory/platform-preferences/x.yaml: cadence updated
   ```

## Per-platform API notes

| Platform | Endpoint | Auth | Quota |
|---|---|---|---|
| YouTube Analytics | `youtubeAnalytics.reports.query` | OAuth 2 | 10K units/day pool |
| TikTok | `display_api.v2` Business endpoints | OAuth 2 | Per-app |
| Instagram Graph | `/me/insights` + `/media/<id>/insights` | OAuth 2 | 200/hr/user |
| LinkedIn | `/rest/organizationalEntityShareStatistics` | OAuth 2 | Varies |
| X | v2 endpoints (tier-gated) | OAuth 2 | Free tier: 500 reads/mo |

## Autonomy behavior

- **Level 1** — Pull data, present report with proposed experiments. Creator chooses which to apply to memory.
- **Level 2** — Pull data, write report, auto-apply confident updates (cadence, thumbnail winners). Creator reviews before new hooks go into rotation.
- **Level 3** — Full monthly auto-review; memory auto-updates; experiments logged but not auto-executed.

Never auto-posts based on analytics. Insights → experiments → creator decides.

## Integration

- Composes **observe** (pull analytics) + **act** (LLM pattern analysis) + **remember** (update memory/creative-style)
- Input: OAuth tokens from platform connections, post history log
- Downstream: informs every future `write-script`, `design-thumbnail`, `creative-brief`, `triage-captures` decision

## Failure modes

- **Small sample sizes** — if fewer than ~20 posts in the window, don't draw confident conclusions. Report trends, not laws.
- **Correlation-causation confusion** — "contrarian hooks perform better" might actually be "this specific topic performed better." Control for topic before adjusting style.
- **Over-indexing on vanity metrics** — views without saves/shares is a trap. Weight save + share heavily, not impressions.
- **Token expiry** — OAuth tokens lapse; detect `401` and route to re-auth flow without retrying.
