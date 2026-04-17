---
name: audience-insights
description: Build and maintain an audience profile — demographics, active hours, top topics, shared vocabulary — from analytics and comments
when_to_use: >
  User wants to understand who's actually watching — for positioning, for
  sponsor pitches, or to spot a shift (audience changed, old content stopped
  landing). Produces a single audience snapshot + trend diffs over time.
tier: extension
---

# Audience Insights

Who's actually in the audience? What do they care about? When do they show up?

## Purpose

Creators often think they're talking to "people like them." Analytics reveals:
- **Demographics** — age, geo, gender distribution
- **Active hours** — when they're online
- **Top-performing topics** with this specific audience (not "in general")
- **Shared vocabulary** — words the audience uses in comments
- **Overlap** with other creators / topics

Without this, every content decision is a guess against a phantom audience.

## How It Works

1. **Pull demographic data** where available:
   - **YouTube Analytics** — age group / gender / country breakdown
   - **TikTok Creator Center** — follower insights (requires creator account)
   - **Meta Business Suite** — IG/FB demographics
   - **LinkedIn Campaign Manager** — follower analytics (even without ad spend)
   - **X** — basic demographics via Premium tier
2. **Active-hours map**:
   - Per platform, per day-of-week
   - Overlay creator's current posting schedule — are they posting into the audience's window?
   - Output:
     ```
     Best X posting windows (audience online):
       Mon 08:00, 12:00, 19:00
       Tue 08:00, 19:00
       Wed 12:00, 21:00
       ...
     ```
3. **Top-topics analysis**:
   - Cluster last 90 days of posts by topic tags
   - Score each cluster by combined reach + engagement rate
   - Surface: "Your audience rewards [topic X] 3x more than [topic Y]"
4. **Comment vocabulary pass**:
   - Collect comments from top 20 posts
   - LLM or simple TF-IDF: extract distinctive words/phrases the audience uses
   - Output a shared vocabulary — use these in future hooks and captions
5. **Audience-shift detection**:
   - Compare current audience snapshot with snapshot from N months ago (stored in `memory/creative-style/audience-history/`)
   - Flag significant shifts: demographics change, topic performance inversion, platform decline
   - Example flag: "Your TikTok audience shifted from 18-24 US to 25-34 global over 6 months; your hooks haven't adapted."
6. **Cross-platform audience map**:
   - Is YouTube audience the same as LinkedIn audience? (usually not)
   - Per-platform persona cards — tailor content per platform accordingly
7. **Emit**:
   ```
   memory/creative-style/audience/
     snapshot_<date>.md          # current state
     history/                    # time-series snapshots
     vocabulary.md               # shared words/phrases (updated)
     persona_cards/              # per-platform audience personas
     shifts.md                   # flagged changes over time
   ```

## Persona card template

```markdown
# Audience — {platform}

## Who
- Age: {distribution}
- Geo: {top 3 countries + %}
- Language: {primary, secondary}
- Likely roles / interests (inferred): {list}

## When they show up
- Peak hours: {list}
- Peak days: {list}

## What they reward
1. {topic} — reach X, engagement Y
2. {topic} — reach X, engagement Y
3. {topic} — reach X, engagement Y

## How they talk (their vocabulary)
- {term} — shows up N times in comments
- {phrase} — shows up N times
- {meme/reference they share}

## What they don't engage with
- {topic or format}

## Implications for content
- Hook style: {what works with this audience}
- Length: {what they stay for}
- CTA: {what they respond to}
```

## Use downstream

- `write-script` loads persona card as context; adapts vocabulary + hook style per platform
- `creative-brief` references persona for "audience" field
- `design-thumbnail` informed by which emotions this audience responded to

## Autonomy behavior

- **L1** — Pull data, present snapshot + shifts. Creator approves memory update.
- **L2** — Pull + auto-update snapshot. Surface shifts for confirmation before persona-card changes propagate to drafts.
- **L3** — Full auto; persona cards regenerate quarterly or on significant shift detection.

## Integration

- Input: platform analytics + comments (with user consent to analyze)
- Composes **observe** (API) + **act** (LLM clustering) + **remember** (audience history)
- Downstream: `write-script`, `creative-brief`, `design-thumbnail`, `format-for-platform`, `create-thread`
- Upstream: `track-performance`, `review-performance`

## Failure modes

- **Thin platform analytics** — X's free tier gives almost nothing; be honest about what you don't know
- **Comment sampling bias** — commenters are a small, self-selected slice; don't over-index on vocabulary from 10 people
- **Demographic conflation** — YouTube reports "% of viewers" not "% of subscribers"; same platform, different audiences inside
- **Inferred personas** — LLM-inferred roles/interests are hypotheses, not facts; label them as such in the card
