# X (Twitter)

## Specs

- **Post text**: 280 chars (free) / 25,000 chars (Premium)
- **Video**: 16:9 or 9:16, ≤ 2:20 (free) / ≤ 3hr (Premium)
- **Image**: 1600x900 (16:9) or 1200x1200 (1:1), <5MB
- **Thread**: sequence of replies, each a post
- **Hashtags**: 2-3 max (overuse hurts)

## Culture

- **Fast-paced, reactive** — trending topics shift hourly
- **Text-first** — video is secondary; good threads outperform okay videos
- **First tweet = hook AND payoff tease** — people screenshot just the first tweet
- **Reply engagement** — replying to others' posts drives your visibility more than posting alone
- **Community Notes** — content gets fact-checked visibly; honesty matters
- **Quote-tweet is a rhetorical device** — adds your angle to someone else's idea

## Hook rules

- **First tweet stands alone** — if it can't earn an engagement without a thread, the hook is weak
- **Specific > vague** — numbers, names, stakes
- **Cold opens work** — no "I'm going to share..."

## What works

- Tactical threads with actionable steps
- Contrarian takes with receipts
- Personal stories that land in ≤10 tweets
- Screenshots of specific things (code, UI, emails — with permission)
- Timely takes on trending topics (within 2hr of trend peak)

## What flops

- "This tweet will get ignored but..." preambles
- Generic "big take" tweets without specifics
- Long threads that could have been a short post
- Recycled LinkedIn posts (format mismatch)

## Thread structure

```
1/ Hook (280 chars) — promise + tease
    — standalone quality post

2/ Context / credibility

3/ First insight / step

4/ Second insight / step

...

N-1/ The big payoff

N/ Synthesis + CTA (follow / reply / link)
```

- **6-10 tweets optimal** — longer threads lose readers past tweet 10
- Number them (`1/`, `2/`) for tactical; skip numbers for narrative
- **Pin the hook tweet** after posting

## Character budgets

- **Free tier**: 280 chars — budget ~250 for copy, ~30 for line breaks
- **Premium**: 25K chars per post — treat as a canvas, but most threading culture still assumes short posts

## Hashtags

- 2-3 max; any more reads as spam
- One niche + one trending (if relevant)
- Often skip entirely — X has weaker hashtag discovery than IG

## Media

- Images: 4 max per post
- Video: 1 per post (2:20 free / 3hr Premium)
- Alt text for images — both accessible and a quiet engagement boost

## API

- **X API v2** — `POST /2/tweets` (write)
- **Free tier**: 500 reads/mo, 100 writes/mo — very limited
- **Basic tier ($200/mo)**: 10K reads/mo, 3K writes/mo
- **Pro tier ($5K/mo)**: higher caps, analytics
- **Enterprise**: full-firehose

Free tier is too restrictive for most creator agent use. Basic is the practical minimum.

## Posting

- **Best windows** (general): weekdays 8-10am and 7-9pm ET
- **Peak tech/dev audience**: weekdays 10am-2pm ET
- Use `audience-insights` to override with creator-specific data

## Anti-patterns

- Tweet threads that should have been single tweets
- Engagement bait ("Retweet if you agree")
- Preambles ("Real quick...")
- Following trend-jacking advice literally (trend must actually fit your niche)
- Shitposting under your brand account
