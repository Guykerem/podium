---
name: avatar-video
description: Generate avatar / talking-head videos via HeyGen, Synthesia, or D-ID — script + avatar + voice → rendered MP4
when_to_use: >
  User wants a presenter video without filming — explainer content, localization,
  high-volume educational content, or prototyping a video before self-recording.
  Always flags AI-generated video for disclosure policy.
tier: extension
---

# Avatar Video

Script + avatar identity + voice → rendered video with synthetic presenter.

## Purpose

Avatar video unlocks:
- **High-volume explainer content** without recording bottleneck
- **Localization** — one script, many language versions with the same "presenter"
- **Prototyping** — see how a video paces before committing to a real shoot
- **Brand avatar** — consistent presenter identity when the creator doesn't want to be on camera

Always disclose AI-generated presenters. Don't deceive viewers.

## How It Works

### Path A: HeyGen (recommended in 2026)

1. **Select or create avatar**:
   - Stock avatar (230+ options) OR
   - Photo Avatar (upload one still → AI-generated avatar) OR
   - Custom avatar (requires filming, days of processing, paid plan)
2. **Pick voice** — HeyGen bundles ElevenLabs-compatible voices + supports custom cloned voices
3. **Submit render**:
   ```bash
   curl -X POST "https://api.heygen.com/v2/video/generate" \
     -H "X-Api-Key: $HEYGEN_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "video_inputs": [{
         "character": {"type":"avatar","avatar_id":"$AVATAR_ID","avatar_style":"normal"},
         "voice": {"type":"text","input_text":"...","voice_id":"$VOICE_ID"},
         "background": {"type":"color","value":"#0B1220"}
       }],
       "dimension": {"width": 1080, "height": 1920},
       "aspect_ratio": "9:16"
     }'
   ```
4. **Poll for completion**:
   ```bash
   curl "https://api.heygen.com/v1/video_status.get?video_id=$VIDEO_ID" \
     -H "X-Api-Key: $HEYGEN_KEY"
   ```
5. **Download MP4** → post-process in `edit-video` (add b-roll, captions, music).

### Path B: Synthesia (enterprise / corporate)

```bash
curl -X POST https://api.synthesia.io/v2/videos \
  -H "Authorization: $SYNTHESIA_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "test": false,
    "title": "Explainer",
    "visibility": "private",
    "aspectRatio": "9:16",
    "input": [{
      "avatar": "anna_costume1_cameraA",
      "background": "green_screen",
      "scriptText": "...",
      "voice": "en-US-JennyNeural"
    }]
  }'
```

### Path C: D-ID (cheapest, talking-photo specialty)

Best for historical figures, animated portraits:
```bash
curl -X POST https://api.d-id.com/talks \
  -H "Authorization: Basic $D_ID_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_url": "https://.../portrait.jpg",
    "script": {"type":"audio","audio_url":"https://.../vo.mp3"}
  }'
```

Lower video quality than HeyGen but cheap; best if you already have the voice track.

### Path D: Interactive streaming avatar (real-time)

HeyGen Interactive Avatar — for live-streaming or conversational apps. Use the streaming endpoint:
```bash
curl -X POST https://api.heygen.com/v1/streaming.new \
  -H "X-Api-Key: $HEYGEN_KEY" \
  -d '{"quality":"medium","avatar_name":"$AVATAR_ID","voice":{"voice_id":"$V"}}'
```

Not typical for asynchronous content production; usually used for agent-driven live interactions.

## Provider comparison

| Provider | Quality | Speed | Custom avatar | Cost tier |
|---|---|---|---|---|
| HeyGen | best overall 2026 | 5-10 min | Photo Avatar (1 still) or custom film | $24+/mo |
| Synthesia | stable enterprise | 5-15 min | Custom film, enterprise | $30+/mo |
| D-ID | lowest quality, cheapest | fast | talking photo only | $5+/mo |
| Hallo2 / EMO (OS) | SOTA research but limited tooling | slow | yes, GPU-heavy | free (GPU cost) |

## Output + post-processing pipeline

```
avatar/<slug>/
  avatar.mp4                   # raw rendered
  avatar.meta.yaml             # provider, avatar_id, voice_id, ai_disclosure:true
  script.md                    # input
```

Then typically:
- `edit-video` adds cuts, b-roll overlays, dynamic backgrounds
- `caption-video` for animated burns
- `format-for-platform` for final encode
- Flag AI disclosure in post description

## Disclosure policy

Always include in output metadata:
```yaml
ai_generated: true
ai_disclosure_required: true
recommended_disclosure: "Narrated by an AI avatar based on a script I wrote."
```

Creator decides how/where to disclose, but the agent surfaces the requirement.

## Autonomy behavior

- **L1** — Render a short test (first 10s) before committing credits to full render. Creator approves voice + avatar before full.
- **L2** — Render full on selected avatar/voice. Present for QA.
- **L3** — Full pipeline through post-processing. Creator reviews final.

Never auto-publishes avatar content.

## Integration

- Input: `script.md`, selected avatar + voice
- Composes **act** (HeyGen/Synthesia/D-ID API) + **remember** (avatar preferences, disclosure metadata)
- Downstream: `edit-video`, `caption-video`, `format-for-platform`, `multilingual-dub`
- Upstream: `write-script`, `generate-voiceover` (if voice needs to be generated first and passed to D-ID)

## Failure modes

- **Avatar lip-sync artifacts** — HeyGen handles most phonemes well; if the script has technical jargon, pre-rewrite in spoken form
- **Disclosure omission** — never remove the `ai_disclosure_required: true` flag from output metadata
- **Cost runaway** — render previews first; long scripts × paid tier = fast spend
- **Uncanny expression** — background + lighting mismatch makes avatars look off; add subtle motion background or match lighting to avatar's rendered lighting
