---
name: ab-test-hooks
description: Design and execute A/B (or A/B/C) tests on hooks, thumbnails, titles — measure, declare winner, update hook-library
when_to_use: >
  User wants to test a specific creative variable systematically — hook
  register, thumbnail emotion, title structure. Produces test plan, monitors
  metrics, declares winner, logs to memory for future prompts.
tier: extension
---

# A/B Test Hooks

Experimentation as a first-class production step. Every variable-tested is a memory entry that makes future drafts sharper.

## Purpose

Intuition + feedback loop = taste. This skill formalizes the loop:
- Design the test (2-3 variants)
- Execute (publish variants or use platform-native A/B)
- Measure (wait for stat significance)
- Declare a winner
- Log to `memory/creative-style/hook-library.yaml`

## How It Works

1. **Test design** — From user hypothesis or `track-performance`'s proposal:
   ```yaml
   # test.yaml
   id: test_2026_04_17_hook
   hypothesis: "Contrarian hooks outperform listicle hooks on my Shorts"
   variable: hook_register   # what we're testing
   variants:
     A:
       register: contrarian
       text: "Everyone's wrong about agents"
       thumbnail: variant_shocked.jpg
     B:
       register: listicle
       text: "3 things nobody says about agents"
       thumbnail: variant_confused.jpg
   held_constant:
     - body_content
     - duration
     - captions
     - posting_time
     - hashtags
   platform: youtube_shorts
   primary_metric: retention_at_30s
   secondary_metrics: [ctr, saves, shares]
   minimum_sample: 2000_impressions_per_variant
   max_runtime_days: 7
   ```
2. **Execute**:
   - **YouTube**: use native Test & Compare (Studio → Thumbnails → Test) for thumbnail + title A/B; for hook-variant testing, you need separate video uploads
   - **TubeBuddy A/B** — legacy A/B for thumbnails
   - **Manual platform spread**: upload as separate posts at equivalent times; use same hashtags/description
3. **Monitor**:
   - Pull metrics daily via `track-performance`
   - Hold until `minimum_sample` reached per variant
   - Statistical significance check — simple test-of-proportions for binary metrics (CTR, completion %)
4. **Declare winner**:
   - Winner = highest primary metric with sample ≥ minimum and significance at p<0.1 (generous threshold; not a clinical trial)
   - If no significant winner, declare "no difference" — also a valuable result
5. **Log**:
   - Update `memory/creative-style/hook-library.yaml`:
     ```yaml
     - id: contrarian_agents_20260417
       register: contrarian
       text: "Everyone's wrong about agents"
       platform: youtube_shorts
       metric_primary: retention_at_30s
       value: 0.54
       baseline: 0.42
       lift: 0.29
       tested_against: listicle
       test_id: test_2026_04_17_hook
     ```
   - Write test report: `tests/<id>/report.md`
6. **Update future drafts** — `write-script` will pull from hook-library and weight contrarian hooks higher for this creator/platform going forward.

## What to test (priority)

| Variable | Expected lift if won | Test cost |
|---|---|---|
| Hook register | high | 2 full posts |
| Thumbnail | very high (YouTube) | built-in test; low cost |
| Title | medium | built-in test |
| Posting time | low | test over 4-6 weeks |
| Caption style (burn-in) | medium | cohort comparison |
| Video length | medium | needs multiple tests |

## Statistical honesty

- **Small sample → small claims.** Lift of 20% with N=30 per variant is noise.
- **Multiple testing**: if you test 10 things, ~1 false positive by chance. Don't stack tests.
- **Confounders**: if you ran variant A on Tuesday and variant B on Saturday, you tested day-of-week, not your variable.

## Autonomy behavior

- **L1** — Design test, show plan, wait for creator approval before publishing variants.
- **L2** — Design + monitor + declare. Present winner for creator confirmation before memory update.
- **L3** — Full auto; logs winner; notifies creator of result.

Never publishes variants without explicit creator action — A/B involves actual audience exposure.

## Integration

- Input: hypothesis (from `track-performance` or user), content ready in variants
- Composes **act** (publish variants via `publish`) + **observe** (monitor via `track-performance`) + **remember** (hook-library updates)
- Downstream: `write-script` (next drafts pull from updated library), `review-performance` (monthly rollup logs wins)
- Upstream: `track-performance`, `generate-thumbnail` (for thumbnail variants)

## Failure modes

- **Variable not actually isolated** — running variant B a week later conflates time with variable; always publish variants in the same window
- **Calling winners too early** — wait for min sample even if early leader looks decisive
- **Lift without significance** — 50 vs 45 (N=100) is noise; don't update memory on that
- **Over-testing** — testing 3 things at once on a single post = no learning; one variable per test
