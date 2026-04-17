---
name: edit-audio
description: Clean, level, de-noise, de-filler, and normalize audio — podcast-grade polish via FFmpeg, Auphonic, or Adobe Enhance
when_to_use: >
  Raw audio needs cleanup before publish — podcast recordings, voice memos,
  interview tracks. Pair with generate-voiceover for AI narration polish.
  Also used to prep audio for transcription accuracy.
tier: extension
---

# Edit Audio

Make audio sound intentional. De-noise, level, compress, de-ess, remove fillers.

## Purpose

Raw recordings have noise floor, plosives, volume inconsistency, filler words, and dead air. This skill produces publish-ready audio.

## How It Works

1. **Diagnose**:
   ```bash
   ffprobe -v quiet -print_format json -show_format -show_streams in.wav
   # Check: sample_rate, channels, duration, codec
   ```
   Plus a loudness analysis pass:
   ```bash
   ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2> analysis.log
   ```
2. **Pick pipeline**:
   - **Fast, free, deterministic**: FFmpeg + `auto-editor`
   - **Pro-grade podcast**: Auphonic API
   - **Voice-specialized noise removal**: Adobe Podcast Enhance (free web, API via Creative Cloud) or Resemble Enhance (open-source)
   - **Real-time**: Krisp (SDK, not post-production)

### FFmpeg path (deterministic baseline)

```bash
# 1. High-pass filter to kill rumble (<80Hz)
# 2. De-ess (sibilance 4-8kHz)
# 3. Noise gate
# 4. Compressor
# 5. Loudnorm EBU R128
ffmpeg -i in.wav -af "\
highpass=f=80,\
deesser=i=0.5:m=0.5:f=0.5,\
agate=threshold=-40dB:ratio=10:attack=3:release=80,\
acompressor=threshold=-18dB:ratio=3:attack=5:release=50,\
loudnorm=I=-16:TP=-1.5:LRA=11" \
out.wav
```

Two-pass loudnorm (more accurate):
```bash
# Pass 1 — analyze
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2> pass1.log
# Parse measured_I, measured_LRA, measured_TP, measured_thresh, offset, then:
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:\
measured_I=...:measured_LRA=...:measured_TP=...:measured_thresh=...:offset=...:linear=true" out.wav
```

### Auphonic path (best set-and-forget podcast quality)

```bash
curl -X POST https://auphonic.com/api/simple/productions.json \
  -u "$AUPHONIC_USER:$AUPHONIC_PASS" \
  -F "input_file=@episode.wav" \
  -F "preset=LOUDNESS_PODCAST_16" \
  -F "action=start" \
  -F "output_files=mp3,wav"
```

Auphonic does:
- Intelligent leveling (gate, expand, compress)
- Noise reduction
- Loudness to EBU R128 / AES / ATSC
- Silence / cut detection
- Cross-gate (if multiple speaker mics)
- Encoder to MP3 / Ogg / AAC

**Pricing**: €11/mo for 9hr; $3 per credit pay-as-you-go. Indispensable for serious podcasting.

### Adobe Podcast Enhance path (voice cleanup specialty)

- Web UI: free
- API via Adobe Creative Cloud endpoints (developer program required)
- Drops noise, pops, room reverb — makes anything sound like a studio mic
- Known issue: aggressive on certain voices; always A/B with original

### Filler removal

**auto-editor** for silence + filler cutting:
```bash
auto-editor in.wav --silent-threshold 0.04 --frame-margin 6 \
  --export default --output out.wav
```

**Descript (manual)** — text-based; remove "um" by selecting word in transcript

**Custom Whisper + filler detection**:
1. Transcribe with word timings
2. Detect fillers (`um`, `uh`, `like`, `you know`, `so`, `basically`)
3. Generate FFmpeg cut-list with `-ss`/`-to` for each non-filler segment
4. Concat

Be careful — some fillers are part of the creator's voice. Keep `memory/creative-style/voice-preservation.yaml` with a per-filler keep/cut policy.

## Loudness targets

| Target | LUFS | True Peak |
|---|---|---|
| YouTube | -14 | -1 dB TP |
| Spotify music | -14 | -1 dB TP |
| Apple Podcasts | -16 | -1 dB TP |
| Podcast EBU R128 | -23 (EU) or -16 (US) | -1 dB TP |
| TikTok / Reels / Shorts | -14 | -1 dB TP |
| AM/FM broadcast | -19 | -2 dB TP |

## Output

```
audio-edits/<slug>/
  in.wav               # original preserved
  out.wav              # processed master (24-bit PCM, -16 LUFS)
  out.mp3              # encoded (128kbps VBR)
  out.meta.yaml        # loudness measurements, cuts applied, tools used
  report.md            # before/after LUFS, peaks, cuts count
```

## Autonomy behavior

- **L1** — Process first 30s as preview. Present loudness before/after + cuts made. Get approval to run full.
- **L2** — Process full file on default pipeline. Present report for review before emitting final.
- **L3** — Full auto with configured pipeline. Creator reviews final output.

Never applies filler removal above aggressive threshold without preview — risk of cutting creator's voice.

## Integration

- Input: raw audio file(s), optional transcript
- Composes **act** (FFmpeg / Auphonic / Adobe) + **remember** (loudness log, preservation policy)
- Downstream: `mix-podcast`, `edit-video` (as audio track), `transcribe-media` (re-transcribe after cleanup)
- Upstream: any raw capture with speech

## Failure modes

- **Over-noise-reduced** — voice sounds underwater / phasey. Back off noise reduction, or switch from Adobe to Resemble Enhance
- **Compression pumping** — lower ratio (to 2:1), slower attack; never compress above 4:1 for voice
- **Lost creator personality** — aggressive cuts of fillers/breaths flatten voice; check `voice-preservation.yaml`
- **Loudness drift across a long file** — use Auphonic's intelligent leveling, not static compressor
