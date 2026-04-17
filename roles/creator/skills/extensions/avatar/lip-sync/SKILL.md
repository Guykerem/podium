---
name: lip-sync
description: Re-sync lip movements to new audio — using Wav2Lip, SadTalker, Hallo, or MuseTalk on existing video
when_to_use: >
  User has existing video of themselves (or a photo), and wants lips re-synced
  to different audio — for corrections, translations, or re-recording dialogue
  without re-filming. Complements multilingual-dub.
tier: extension
---

# Lip Sync

Re-sync lip movements to a new audio track. Critical for localization pipelines and "I messed up one line" fixes.

## Purpose

Use cases:
- **Dialogue correction** without re-filming
- **Localization** — dub a video into another language, re-sync lips for naturalness
- **Historical figures / portraits** — bring a still image to life with D-ID / EMO-style output
- **Scaling** — one filmed take, many audio variants

## How It Works

### Path A: Wav2Lip (open-source, classic baseline)

```bash
git clone https://github.com/Rudrabha/Wav2Lip
cd Wav2Lip
# Download weights (wav2lip_gan.pth)
python inference.py \
  --checkpoint_path wav2lip_gan.pth \
  --face source_video.mp4 \
  --audio new_narration.wav \
  --outfile out.mp4 \
  --pads 0 20 0 0 \
  --nosmooth
```

- **Pros**: free, fast, deterministic
- **Cons**: mouth-region only, can look "glued on"; works best on stable face framing

### Path B: SadTalker / AniPortrait (still-photo to talking video)

For animating a single photo:
```bash
# SadTalker
python inference.py --driven_audio audio.wav --source_image portrait.jpg \
  --result_dir out --enhancer gfpgan --still
```

- **Pros**: works from a single still
- **Cons**: artifacts around head motion; best for head-and-shoulders

### Path C: Hallo2 (2024+, SOTA open-source)

```bash
# Hallo2 — requires reference image + audio
python scripts/inference.py \
  --audio_path audio.wav \
  --source_image portrait.jpg \
  --driving_audio audio.wav \
  --output_path out.mp4
```

- **Pros**: best quality open-source; handles expression + head motion
- **Cons**: GPU-heavy (A100 recommended), 5-10x realtime render

### Path D: MuseTalk (Tencent, real-time)

```bash
python scripts/inference.py --inference_config configs/inference/test.yaml
```

- **Pros**: real-time on consumer GPU
- **Cons**: lower fidelity than Hallo2

### Path E: Hosted (D-ID, HeyGen Photo Avatar)

- **D-ID**: cheapest; upload photo + audio → MP4
- **HeyGen Photo Avatar**: generate an avatar from a still; then drive with text

See `avatar-video` for API details.

## Path selection

| Need | Use |
|---|---|
| Existing video + new dialogue (small region edit) | Wav2Lip |
| Still photo + any audio | D-ID (cheap) or Hallo2 (quality) |
| Historical figure portrait | D-ID |
| Full head motion + expression quality | Hallo2 (open) or HeyGen (hosted) |
| Real-time / interactive | MuseTalk or HeyGen Interactive |

## Pipeline

```
lipsync/<slug>/
  source_face.mp4 or portrait.jpg
  new_audio.wav
  out.mp4                # final
  out.meta.yaml          # provider, ai_generated:true, disclosure
```

Always run `out.mp4` through:
- `edit-audio` on the new audio BEFORE sync (to match loudness / tone)
- `format-for-platform` for final encode
- Caption pass if appropriate

## Audio preprocessing (critical)

Wav2Lip and most lip-sync models expect:
- 16kHz mono WAV preferred
- No long silence at head/tail (trim)
- Consistent loudness (apply `edit-audio` first)

```bash
ffmpeg -i new_audio.mp3 -ac 1 -ar 16000 -c:a pcm_s16le new_audio.wav
```

## Autonomy behavior

- **L1** — Render a short test (first 5s). Creator approves before full.
- **L2** — Full render with chosen model. Present for QA.
- **L3** — Full render + downstream pipeline.

Never auto-applies to video of a third party. Only the creator's own image / a clearly-licensed source.

## Integration

- Input: face video or portrait + target audio
- Composes **act** (lip-sync model) + **remember** (preferences, disclosure metadata)
- Downstream: `edit-video`, `caption-video`, `format-for-platform`, `multilingual-dub`
- Upstream: `generate-voiceover`, `edit-audio`

## Failure modes

- **Mouth "sticker" effect** — Wav2Lip limitation; upgrade to Hallo2 or hosted service if quality matters
- **Head-motion artifacts** — if face moves a lot, Wav2Lip breaks down; stabilize input or use a model that handles motion
- **Audio-mouth mismatch** — always check that input audio was denoised and properly timed; dirty audio → dirty sync
- **Ethical use** — never generate lip-sync of a non-consenting person. Enforce via `memory/tool-preferences/consent.yaml` — require creator to confirm subject authorization before render
