---
name: status-rollup
description: Aggregate team activity into a weekly rollup — highlights, blockers, metrics, upcoming.
when_to_use: >
  End of the week (Friday afternoon by default), or when the user asks for "team status",
  "weekly update", or needs a digest before a leadership meeting.
tools:
  - mcp: linear
  - mcp: github
  - mcp: slack
---

# Status Rollup

A weekly rollup that your team can actually use — grounded in what shipped, not what people say they did.

## How It Works

1. **Define the window.** Default: last 7 days ending Friday 17:00 local. User can override.
2. **Pull from sources in parallel:**
   - **Linear** — tickets completed, moved to in-progress, newly opened with priority >= high, blocked tickets older than 3 days
   - **GitHub** — merged PRs (title + author + linked issue), open PRs waiting on review > 48h
   - **Slack** — messages in `#announcements`, `#eng`, and any `#team-*` channel tagged `:ship:` or starting with "SHIPPED:"
3. **Classify each item** into the 4-section structure:
   - `highlights` — shipped things worth celebrating; user wins; customer impact
   - `blockers` — stuck tickets, unreviewed PRs, stated blockers in standups
   - `metrics` — cycle time, PRs merged, tickets closed, deploy count (only include what the team has agreed to track)
   - `upcoming` — next week's in-progress work + upcoming deadlines pulled from Linear
4. **Deduplicate.** Same ticket mentioned in Linear + Slack = one entry, not two.
5. **Summarize per section.** 3-6 bullets max. Curate, don't dump. If a section has nothing substantial, say "quiet week on X" rather than padding.
6. **Render** into the user's preferred format (markdown, Notion page, Slack post draft).

## Integration

- `observe` — watches the three sources on a cron
- `remember` — stores `memory/rollups/YYYY-WW.md` for longitudinal tracking
- `communicate` — renders and drafts the post
- `schedule` — triggers weekly at configured time
- Composes with `run-one-on-one` (rollup informs 1:1 prep) and `delegate-tasks` (blockers → nudges)

## Autonomy Behavior

- **Level 1:** Generates the rollup draft; user reviews and posts.
- **Level 2:** Generates and posts to a private channel / draft doc the user controls; surfaces a preview notification.
- **Level 3:** Posts to the configured team channel directly on schedule. Still escalates if "blockers" section includes a tagged person's name for the first time (reputational care).

## Memory

**Reads:** `memory/people.md`, `memory/rollups/` (prior weeks for trend), `memory/team-config.md` (channels, metrics-to-track).

**Writes:** `memory/rollups/2026-W16.md`:
```
week: 2026-W16
window: [2026-04-13, 2026-04-17]
highlights:
  - Auth migration shipped (maya) — 2 days early
  - New onboarding flow up 18% activation
blockers:
  - Billing bug #4421 — 6 days unassigned
metrics:
  prs_merged: 24
  cycle_time_median_hours: 18
upcoming:
  - Q2 kickoff 2026-04-21
  - Performance reviews start 2026-04-28
```

## Failure Modes

- **Padding.** Generating fake "highlights" when the week was quiet. A quiet rollup is a valid rollup.
- **Public blame.** A blocker that names a person without consent creates resentment. Default: name the work, not the person, unless user explicitly approves.
- **Metric drift.** Agent starts tracking metrics the team hasn't agreed to care about. Only report metrics listed in `memory/team-config.md:metrics-to-track`.
