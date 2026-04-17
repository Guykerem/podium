---
name: write-article
description: Write blog posts, newsletter issues, Substack articles, LinkedIn long-form — SEO-aware, voice-matched, repurposing-friendly
when_to_use: >
  User has a thesis, transcript, or outline they want turned into a 500-2500
  word article. Also used to expand a short-form success into a deeper piece.
  Produces SEO metadata, hero image brief, and repurposing hooks.
tier: extension
---

# Write Article

Long-form text. Blog, newsletter, Substack, LinkedIn article — all live here.

## Purpose

A good article:
- Earns the click with headline + deck (subtitle)
- Rewards the scroll with structure and pacing
- Matches the creator's voice, not ChatGPT's
- Emits SEO metadata (title, meta, OG) + repurposing artifacts (pull quotes, thread outline)

## How It Works

1. **Inputs**:
   - Thesis / topic (from `brief.md` or user)
   - Source material: transcript, research notes, raw draft, bullet outline
   - Platform: blog (SEO-optimized), newsletter (email-optimized), Substack (email + web), LinkedIn article (platform-specific formatting, no H1)
   - Voice samples from `memory/creative-style/writing-samples/`
2. **Outline first, always**:
   - H1 / headline (≤ 60 chars, front-load keyword)
   - Deck / subtitle (if platform supports — blog, Substack)
   - 3-7 H2s covering the arc
   - Under each H2: 2-bullet preview of what it covers
   - Closing: CTA / question / resource list
3. **Voice calibration** — Load 2-3 past articles the creator approved as few-shot examples. Note phrasing tics, sentence length distribution, whether they use questions, asides, footnotes, etc.
4. **Draft with structural markers**:
   ```markdown
   # {headline}
   > {deck — one sharp sentence, the promise}
   
   {lede — 2-3 sentences, hook + promise of payoff}
   
   ## {H2 — framed as a mini-thesis, not a label}
   {body}
   
   > {pull quote — 1 per H2 where one earns being pulled}
   
   ## ...
   
   ## Takeaway / CTA
   {clear action or synthesis}
   ```
5. **SEO / discoverability pass** (if target is blog/Substack):
   - Primary keyword in H1, URL slug, first 100 words, at least one H2
   - Meta description (150-160 chars) — stand-alone sales pitch
   - OG image brief (pass to `generate-visuals` or `design-graphics`)
   - Internal + external links (at least 2 of each, no spam)
   - Alt text for every image
6. **Platform adaptations**:
   - **Blog / Medium / Substack**: full markdown with H1, use footnotes, embeddable tweets/videos
   - **LinkedIn article**: no H1 (LinkedIn renders title separately), no markdown links (paste raw URLs), 1500-2000 words optimal, section breaks via bold paragraph-first-line
   - **Newsletter (email)**: shorter paragraphs, higher cadence of subheads, first 50 words must earn the scroll
7. **Emit artifacts**:
   ```
   articles/<slug>/
     article.md                   # the piece
     meta.yaml                    # title, meta_description, slug, tags, OG brief
     hero_brief.md                # prompt for generate-visuals
     pull_quotes.md               # 3-6 shareable quotes for repurposing
     thread_outline.md            # X / LinkedIn thread repurpose scaffold
     newsletter_intro.md          # 150-word TL;DR for newsletter
   ```

## Word count targets

| Platform | Optimal |
|---|---|
| Blog (SEO ranking) | 1200-2500 |
| Medium (7-min read) | ~1750 |
| Substack (email-friendly) | 800-1500 |
| LinkedIn article | 1500-2000 |
| Newsletter issue | 300-1000 (email-scrollable) |

## Voice-matching

- Load `writing-samples/` and include 2-3 paragraphs as few-shot
- Note rules the creator has stated in `creative-style/voice-rules.md` (e.g., "no em-dashes", "never start with 'So'", "first-person only")
- After draft, run a voice-drift check: if >X% of sentences match generic LLM cadence, regenerate tighter

## Repurposing hooks (generated alongside)

Every article emits:
- 3-6 **pull quotes** (≤ 20 words, standalone) — for graphics + social
- 1 **thread outline** — 7-12 tweets worth of beats
- 1 **newsletter TL;DR** — 150 words
- 1 **LinkedIn short post** — 120-180 words, contrarian angle
- 1 **video hook bank** — 5 hook variants if this becomes a short

Feeds directly into `repurpose-content`.

## Autonomy behavior

- **L1** — Present outline first. Draft after approval. Present article for revision before any export.
- **L2** — Auto-outline + draft. Present for one revision pass, then emit artifacts.
- **L3** — Full auto with default voice profile. Creator reviews final.

Never publishes to platform. Emits drafts for manual publish (or `publish` skill).

## Integration

- Input: `brief.md`, transcript, outline, raw source
- Composes **act** (LLM) + **remember** (writing samples, voice rules, SEO keyword log)
- Downstream: `create-thread`, `repurpose-content`, `design-graphics` (pull-quote cards), `generate-visuals` (hero image)
- Upstream: `creative-brief`, `transcribe-media`, `segment-transcript`

## Failure modes

- **AI cadence** — "In today's fast-paced world..." / "As creators, we all..." Kill with tighter voice samples + direct feedback loop
- **Keyword stuffing** — if primary keyword appears >1.5% of body, cut; SEO stopped rewarding density circa 2018
- **No through-line** — article is a list of paragraphs, not an argument; always surface an explicit thesis in the deck
- **Clickbait headline with no payoff** — delivers on the promise, or change the promise
