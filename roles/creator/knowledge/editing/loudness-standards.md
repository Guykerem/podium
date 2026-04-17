# Loudness Standards

Target LUFS (Loudness Units Full Scale) per platform. Referenced by `edit-audio`, `mix-podcast`, `format-for-platform`.

## Target table

| Platform | Integrated LUFS | True Peak | Notes |
|---|---|---|---|
| YouTube | -14 | -1 dB TP | Auto-normalizes loud content down; quiet stays quiet |
| Spotify music | -14 | -1 dB TP | Similar normalization behavior |
| Spotify podcasts | -16 to -19 | -1 dB TP | Podcast-aware normalization |
| Apple Podcasts | -16 | -1 dB TP | ATSC A/85 style |
| Apple Music | -16 | -1 dB TP | Sound Check |
| TikTok | -14 | -1 dB TP | Loudness matched at playback |
| Instagram Reels | -14 | -1 dB TP | Same |
| YouTube Shorts | -14 | -1 dB TP | Same |
| LinkedIn video | -14 to -16 | -1 dB TP | Less strict than YT |
| X video | -14 | -1 dB TP | — |
| Broadcast TV (US, ATSC A/85) | -24 | -2 dB TP | Legacy standard |
| Broadcast TV (EU, EBU R128) | -23 | -1 dB TP | European standard |
| Podcast EBU R128 (EU) | -23 | -1 dB TP | Podcast-specific EU target |
| AM/FM radio mastering | -19 | -2 dB TP | Loud, compressed |

## What these numbers mean

- **Integrated LUFS**: average perceived loudness of the whole piece
- **True Peak (dB TP)**: maximum instantaneous level, measured with inter-sample peaks accounted for
- **LRA (Loudness Range)**: difference between loud and soft moments; typical target 7-11 for podcasts, broader for music

## Why this matters

Each platform **normalizes** content at playback. If you ship:
- Too loud (e.g., -9 LUFS) — platform pulls you down. You lose dynamic range. Sounds squashed.
- Too quiet (e.g., -23 LUFS to a -14 target) — platform doesn't always boost you. Listener turns up manually, then the next video blasts.
- On-target — platform plays you at original fidelity, consistent with neighboring content.

## FFmpeg two-pass loudnorm (accurate)

```bash
# Pass 1 — analyze
ffmpeg -i in.wav -af "loudnorm=I=-14:TP=-1:LRA=11:print_format=json" -f null - 2> pass1.log

# Parse JSON output for:
# input_i, input_lra, input_tp, input_thresh, target_offset

# Pass 2 — apply with measured values
ffmpeg -i in.wav -af "loudnorm=I=-14:TP=-1:LRA=11:\
measured_I=$INPUT_I:\
measured_LRA=$INPUT_LRA:\
measured_TP=$INPUT_TP:\
measured_thresh=$INPUT_THRESH:\
offset=$TARGET_OFFSET:\
linear=true:print_format=summary" out.wav
```

## FFmpeg single-pass (quick)

```bash
ffmpeg -i in.wav -af loudnorm=I=-14:TP=-1:LRA=11 out.wav
```

Fine for rough cuts; two-pass is mandatory for published masters.

## Verification

Always verify post-render:

```bash
ffmpeg -i out.wav -af "ebur128=peak=true" -f null - 2>&1 | grep -E "I:|LRA:|TP:"
```

Expected output:
```
[Parsed_ebur128_0 @ ...]   I:         -14.0 LUFS
[Parsed_ebur128_0 @ ...] LRA:          9.2 LU
[Parsed_ebur128_0 @ ...]  TP:         -1.2 dB
```

If off-target by ≥ 0.5 LUFS, re-run.

## Tools

- **FFmpeg loudnorm** — free, scriptable, baseline
- **Auphonic** — intelligent leveling, API-driven, handles multi-track
- **iZotope RX / Ozone** — pro desktop tools
- **Waves WLM Plus** — broadcast-standard metering
- **Youlean Loudness Meter** — free metering plugin

## Per-skill targets

- `edit-audio` (podcast) → `-16 LUFS` default; `-14` if primarily YouTube video podcast
- `mix-podcast` → `-16 LUFS` (Apple Podcasts standard) or configurable
- `format-for-platform` (TikTok / Reels / Shorts / YouTube) → `-14 LUFS` always
- `generate-voiceover` → `-16 LUFS` intermediate; final target applied in mix/format step

## Anti-patterns

- **Loudness war** — pushing to -9 LUFS "because it's loud" ignores that platforms normalize; you lose dynamics and gain nothing
- **Ignoring true peak** — even if integrated LUFS is right, clipping at -0.1 dB TP will cause distortion after codec encoding
- **Inconsistent targets across episode types** — listeners notice when one episode plays louder than the next; keep your target consistent per format

## How to use this file

- `edit-audio` applies these targets
- `mix-podcast` references the podcast-specific targets
- `format-for-platform` applies final loudnorm per platform
- `review-performance` uses listener complaints about audio as a signal to check
