---
name: multilingual-dub
description: Translate + dub a video into another language with voice cloning and lip-sync — one video, many markets
when_to_use: >
  User wants to localize content for non-English audiences. Covers the full
  pipeline: translate transcript, generate target-language audio in cloned
  voice, re-sync lips, emit ready-to-publish localized variants.
tier: extension
---

# Multilingual Dub

One video, many language versions — voice-cloned, lip-synced, caption-translated.

## Purpose

True localization (not just captions):
- **Translate** transcript accurately with cultural context
- **Generate** target-language audio in the creator's cloned voice (ElevenLabs Dubbing or similar)
- **Lip-sync** the new audio to the original video
- **Captions** in both source and target languages
- **Metadata** localized — title, description, hashtags, thumbnail text

## How It Works

### Fast path: ElevenLabs Dubbing API (turnkey)

```bash
# Submit a video for dubbing
curl -X POST https://api.elevenlabs.io/v1/dubbing \
  -H "xi-api-key: $EL_KEY" \
  -F "file=@source.mp4" \
  -F "target_lang=es" \
  -F "source_lang=en" \
  -F "num_speakers=1" \
  -F "watermark=false"

# Poll for completion
curl "https://api.elevenlabs.io/v1/dubbing/$DUBBING_ID" -H "xi-api-key: $EL_KEY"

# Get transcript + audio + video
curl "https://api.elevenlabs.io/v1/dubbing/$DUBBING_ID/audio/$LANG" \
  -H "xi-api-key: $EL_KEY" --output dub.mp3
curl "https://api.elevenlabs.io/v1/dubbing/$DUBBING_ID/transcript/$LANG" \
  -H "xi-api-key: $EL_KEY" --output dub.srt
```

ElevenLabs Dubbing Studio offers an editor UI for fine-tuning translation + voice settings; the API exposes the core pipeline. Output includes lip-synced video, dubbed audio, and target-language SRT.

### Composable path (more control)

When you need tighter control (e.g., custom translation review, specific voice clone, non-EL providers):

1. **Translate transcript** — LLM (Claude, GPT-4) with cultural-adaptation prompt:
   ```
   Translate from {source_lang} to {target_lang}. Preserve:
   - Creator's voice register (casual, direct, curious)
   - Timing-friendly line lengths (roughly match original segment durations)
   - Cultural references — adapt, don't literally translate
   - Proper nouns, brand names (keep)
   - Humor (adapt to target-language equivalents)
   Output: SRT with preserved timestamps.
   ```
2. **Generate target-language audio** — ElevenLabs Multilingual v2 with cloned voice (`voice_id` stays the same across languages):
   ```bash
   curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
     -H "xi-api-key: $EL_KEY" \
     -d '{"text":"...","model_id":"eleven_multilingual_v2","voice_settings":{...}}'
   ```
3. **Lip-sync** — See `lip-sync`:
   - Wav2Lip for fast
   - Hallo2 or HeyGen for quality
4. **Align caption timing** — Target-language captions using the generated audio's timings (run `transcribe-media` on the dub audio to get precise word timings).
5. **Localize metadata** — Title, description, hashtags translated + culturally adapted (hashtags: regional hashtags matter — e.g., `#브이로그` for Korean vlog).
6. **Localize thumbnail text** — Re-run `generate-thumbnail` with target-language text.

### Provider comparison

| Tool | Quality | Languages | Voice clone | Lip-sync | Cost |
|---|---|---|---|---|---|
| ElevenLabs Dubbing | great | 30+ | yes, in-clone | yes | creator-tier up |
| HeyGen Translation | great | 75+ | yes | yes | API credits |
| Rask AI | good | 130+ | yes | yes | subscription |
| Sonantic (Spotify) | studio-grade | limited | yes | no | enterprise |
| Custom pipeline (EL + Whisper + Hallo) | customizable | depends | yes | yes | variable |

## Supported languages (ElevenLabs Multilingual v2)

29 languages as of 2026: English, Japanese, Chinese, German, Hindi, French, Korean, Portuguese, Italian, Spanish, Indonesian, Dutch, Turkish, Filipino, Polish, Swedish, Bulgarian, Romanian, Arabic, Czech, Greek, Finnish, Croatian, Malay, Slovak, Danish, Tamil, Ukrainian, Russian, Hungarian, Norwegian, Vietnamese.

Check current list — language support expands frequently.

## Output structure

```
dubs/<slug>/
  source.mp4                   # original
  en/                          # source language
    captions.srt
    metadata.yaml
  es/
    audio.mp3                  # dubbed audio
    captions.srt               # Spanish captions
    video.mp4                  # lip-synced video
    title.txt                  # translated title
    description.md             # translated description
    metadata.yaml
  pt/
    ...
  manifest.yaml                # all languages, pipeline used, cost, AI disclosure
```

## Quality gates

1. **Back-translation check** — translate target → source; if meaning drifted, re-prompt
2. **Audio loudness parity** — match dubbed audio LUFS to original
3. **Caption timing** — no caption exceeds 2s past end of spoken line
4. **Lip-sync sanity** — spot-check 3 random points in the video
5. **Title length** — target-language titles can expand (Spanish ~25%, German ~20%); re-check platform char limits

## Autonomy behavior

- **L1** — Submit dubbing for one language, present for review. If creator approves, run remaining languages.
- **L2** — Submit all approved languages. Present batch for review before emitting final package.
- **L3** — Full pipeline. Creator reviews final package.

Never auto-publishes localized versions. Each language gets its own publish step.

## Integration

- Input: source video + transcript + target languages list
- Composes **act** (EL / HeyGen API, LLM translate, lip-sync model) + **remember** (voice-clone IDs, disclosure metadata)
- Downstream: `format-for-platform` per-language; `publish`
- Upstream: `transcribe-media` (for source SRT), `generate-voiceover` (for composable path)

## Failure modes

- **Translation-quality cliff** — machine translation between English and low-resource languages drops hard; always flag <0.8 back-translation similarity for manual review
- **Voice-clone language fidelity** — ElevenLabs Multilingual v2 works well but accents bleed; test a sample first
- **Cost scaling** — 10 languages = 10x ElevenLabs spend + 10x lip-sync GPU time; always estimate before running
- **Cultural misstep** — LLM translation can miss cultural context ("eat the rich" doesn't translate culturally); flag politically / culturally sensitive content for human review
