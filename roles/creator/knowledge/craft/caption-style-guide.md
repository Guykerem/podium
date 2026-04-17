# Caption Style Guide

Captions are not optional in 2026 — most social video is watched muted. This guide informs `caption-video` and `add-captions`.

## Baseline rules

- **Font**: sans-serif, heavy weight — Inter, Montserrat, Bebas Neue, Avenir, SF Pro
- **Size (1080x1920 vertical)**: 60-72px for animated short-form; 48-56px for static-line long-form
- **Position**: upper third or center for shorts (avoid IG/TT UI chrome at bottom); lower third for long-form
- **Lines**: 1-2 max
- **Words per line**: 3-7 for static; 1 for animated word-by-word
- **Reading speed**: 160-180 WPM optimal, ≤ 200 WPM absolute max
- **Cue duration**: minimum 1s, maximum 7s
- **Contrast**: black 3-4px outline OR 80% opacity dark box behind text
- **Casing**: Title Case for hook captions; Sentence case for narration

## Platform-specific positioning

| Platform | Safe zone | Avoid |
|---|---|---|
| TikTok | Center or center-upper-third | Bottom 200px (progress bar, username, caption) |
| Reels | Center or center-upper-third | Bottom 300px (like/comment/share buttons) |
| Shorts | Center or upper-third | Bottom 400px (engagement + creator info) + top 180px (title bar when focused) |
| LinkedIn native | Lower-third | — |
| YouTube long | Not applicable (use soft SRT) | — |

## Burn-in vs soft-mux decision

| Situation | Approach |
|---|---|
| TikTok / Reels / Shorts | Burn-in, always (animated preferred) |
| LinkedIn native video | Burn-in (muted auto-play) |
| X video | Burn-in |
| YouTube long-form | Soft SRT primary; optional burn-in for mobile |
| Multilingual release | Always soft per language (burn-in source lang only) |
| Podcast video on YouTube | Burn-in for clips; soft for full episode |
| Accessibility-priority | Soft SRT (allows screen-reader pass-through) |

## Style presets

```yaml
# submagic-gold — popular 2024+ short-form style
font: Inter-Black
base_color: "#FFFFFF"
active_color: "#FFD700"  # the word currently being spoken
outline_color: "#000000"
outline_width: 4
bounce: true             # active word pops slightly
position: center-upper-third
font_size_1080: 68
max_words_per_line: 3

# hormozi-green — minimal, high-contrast
font: Bebas-Neue
base_color: "#FFFFFF"
active_color: "#00FF88"
outline_color: "#000000"
outline_width: 6
bounce: false
position: center
font_size_1080: 96

# mrbeast-yellow — chunky, playful
font: Komika-Axis
base_color: "#FFD700"
active_color: "#FFFFFF"
outline_color: "#000000"
outline_width: 8
bounce: true
position: bottom-third
font_size_1080: 80

# professional-white — for LinkedIn / corporate
font: Inter
weight: 600
base_color: "#FFFFFF"
outline_color: "#000000"
outline_width: 2
bounce: false
position: lower-third
font_size_1080: 52
max_words_per_line: 7
```

Stored in `memory/creative-style/caption-presets.yaml`. Creator can override per project.

## Emoji insertion (optional, for animated short-form)

- Density: 10-20% of words maximum (more = spammy)
- Target: content words (nouns, verbs, emotional adjectives)
- Skip: articles, prepositions, proper nouns, numbers
- Match: "money" → 💰, "crash" → 💥, "slow" → 🐢, "fire" → 🔥
- Disable entirely if the creator's `memory/creative-style/emoji-policy.yaml` says no

## Accessibility considerations

- For hearing-impaired viewers, soft SRT is superior to burn-in (screen-reader pass-through, user can change size)
- For multilingual accessibility, always emit soft SRT per language
- Burn-in for style is fine, but ALWAYS include a soft SRT alongside on YouTube

## Format reference

### SRT
```
1
00:00:00,000 --> 00:00:02,500
Welcome to the show.

2
00:00:02,500 --> 00:00:05,800
Today we're talking about
content automation.
```

### VTT
```
WEBVTT

00:00:00.000 --> 00:00:02.500
Welcome to the show.

00:00:02.500 --> 00:00:05.800
Today we're talking about
content automation.
```

### ASS (styled / karaoke — for animated word-by-word)
```
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Style: Default,Inter,64,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,3,0,5,80,80,400,1

[Events]
Dialogue: 0,0:00:00.00,0:00:00.30,Default,,0,0,0,,{\k30}Welcome
Dialogue: 0,0:00:00.30,0:00:00.60,Default,,0,0,0,,{\k30}to
```

## Anti-patterns

- **Over-decorated fonts** — script fonts read as amateur at mobile scale
- **Caption over face** — blocks the emotion
- **Low contrast** (white text on light background) — always use heavy outline or box
- **Walls of text** — if the viewer can't read the line in the time it's on screen, cut the line shorter
- **Animations that distract from speaker** — bouncing chaos over a serious talk breaks tone

## How to use this file

- `caption-video` reads this for styling defaults
- `add-captions` (animated) reads this for word-highlight behavior
- `format-for-platform` reads this to adapt caption style per target
