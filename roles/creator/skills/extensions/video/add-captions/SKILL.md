---
name: add-captions
description: Word-by-word animated burn-in captions (Submagic / Captions.ai style) — the viral short format
when_to_use: >
  Short-form video (TikTok / Reels / Shorts) needs high-retention animated
  captions with word-highlight, emoji auto-insert, and viral-style animation.
  Goes beyond base caption-video, which emits static SRT burn-in.
tier: extension
---

# Add Captions (Animated)

Word-by-word animated captions with highlight-on-speak, bounce, emoji auto-insert. The visual signature of high-retention short-form.

## Purpose

Base `caption-video` produces SRT burn-in — legible, but static. This extension produces the Submagic / Captions.ai style: each word appears as it's spoken, often highlighted, sometimes bouncing, with auto-inserted emoji for emphasis words. This style measurably boosts retention on short-form.

## How It Works

Three implementation paths, pick one per `memory/tool-preferences/captions.yaml`:

### Path A: Remotion (best quality, most control)

1. Load `transcript.json` with word-level timestamps.
2. Scaffold a Remotion project with a `<Caption>` component that renders the current word per frame:
   ```tsx
   const Caption = ({words}) => {
     const frame = useCurrentFrame();
     const t = frame / fps;
     const active = words.find(w => w.start <= t && t < w.end);
     const window = words.filter(w => w.start >= active.start - 0.4 && w.end <= active.end + 0.4);
     return (
       <div style={{...base, position:'absolute', bottom:'35%', textAlign:'center'}}>
         {window.map(w => (
           <span style={{
             color: w === active ? '#FFD700' : '#FFFFFF',
             transform: w === active ? 'scale(1.1)' : 'scale(1.0)',
             transition: 'all 120ms',
           }}>{w.text}{' '}</span>
         ))}
       </div>
     );
   };
   ```
3. Emoji inserter: LLM pass — for each word, decide whether to prepend / append an emoji. Rules: emphasize nouns + strong verbs + emotional adjectives. Never on articles / prepositions.
4. Render over source video:
   ```bash
   npx remotion render src/index.ts VideoWithCaptions out.mp4 \
     --props='{"source":"input.mp4","words":"words.json","style":"submagic-gold"}'
   ```

### Path B: ASS subtitle + FFmpeg (faster, less animated)

Generate ASS karaoke file (one event per word with `\k` timing). Style via the `[V4+ Styles]` section. Burn with FFmpeg:

```bash
ffmpeg -i source.mp4 -vf "ass=captions.ass" -c:a copy out.mp4
```

Lower visual quality than Remotion but way faster and no Node dependency.

### Path C: Hosted API (fastest, highest recurring cost)

Call Submagic / Captions.ai / Zeemo API. Upload video, select style, download result.

- **Submagic**: `POST https://api.submagic.co/...` (enterprise plan required for API; check current status — SaaS tooling shifts)
- **Captions.ai**: iOS-first, limited API
- **Zeemo**: browser-based, no public API as of 2026

Prefer Path A or B unless user explicitly wants a specific SaaS style.

## Style presets in memory

```yaml
# memory/creative-style/caption-presets.yaml
submagic-gold:
  font: Inter-Black
  base_color: "#FFFFFF"
  active_color: "#FFD700"
  outline_color: "#000000"
  outline_width: 4
  bounce: true
  bounce_amount: 1.1
  emoji_insertion: true
  emoji_density: 0.15      # emoji per word
  position: center-upper-third
  font_size: 68

hormozi-white:
  font: BebasNeue-Regular
  base_color: "#FFFFFF"
  active_color: "#00FF88"
  outline_color: "#000000"
  outline_width: 6
  bounce: false
  emoji_insertion: false
  position: center
  font_size: 96

mrbeast-yellow:
  font: Komika-Axis
  base_color: "#FFD700"
  active_color: "#FFFFFF"
  outline_color: "#000000"
  outline_width: 8
  bounce: true
  position: bottom
  font_size: 80
```

## Emoji auto-insert heuristics

- Insert only on content words (nouns, verbs, adjectives with emotional weight)
- Density: 10-20% of words max (more = spammy)
- Context-match: "money" → 💰, "crash" → 💥, "slow" → 🐢
- Never insert on: proper nouns, numbers, technical jargon
- Respect `memory/creative-style/emoji-policy.yaml` — some creators hate emoji

## Autonomy behavior

- **L1** — Render preview (first 5s), get approval on style. Then full render.
- **L2** — Render full per default preset. Present for one QA pass.
- **L3** — Render + integrate into final pipeline. Creator sees finished output only.

## Integration

- Input: `transcript.json` (word timings), source MP4
- Composes **act** (Remotion render or FFmpeg) + **remember** (caption presets)
- Downstream: feeds the final export in `edit-video` or `format-for-platform`
- Upstream: `transcribe-media`, `segment-transcript`

## Failure modes

- **Timing drift** — if words appear 200ms late, the transcript's word timings are misaligned. Re-transcribe with WhisperX (forced alignment).
- **Emoji noise** — if it looks AI-generated, reduce density or disable
- **Unreadable at mobile scale** — test on an actual phone, not desktop preview
- **Style fights the content** — aggressive bouncing captions over a somber talk break tone; match style preset to content register
