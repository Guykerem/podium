# FFmpeg Cookbook

Canonical FFmpeg reference for every editing operation the creator agent performs. All commands assume FFmpeg 6+ (`brew install ffmpeg` on macOS, `apt install ffmpeg` on Debian/Ubuntu).

## Probe (always run first)

```bash
ffprobe -v quiet -print_format json -show_format -show_streams in.mp4
```

Use the output to detect: codec, duration, fps, resolution, audio sample rate, channel count, presence of video/audio streams.

## Extract audio

```bash
# MP3 from video (compressed)
ffmpeg -i in.mp4 -vn -acodec libmp3lame -q:a 2 out.mp3

# WAV for transcription — 16kHz mono (optimal for Whisper)
ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav
```

## Trim / cut

```bash
# Fast (keyframe-aligned, no re-encode) — use for rough cuts
ffmpeg -ss 00:01:30 -to 00:02:45 -i in.mp4 -c copy out.mp4

# Frame-accurate (re-encodes) — use for final cuts
ffmpeg -i in.mp4 -ss 00:01:30.500 -to 00:02:45.100 -c:v libx264 -c:a aac out.mp4
```

`-ss` before `-i` = faster seek; after `-i` = frame-accurate.

## Concatenate clips

```bash
# Same codec — fast stream copy
# list.txt:
# file 'clip1.mp4'
# file 'clip2.mp4'
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4

# Different codecs — re-encode via concat filter
ffmpeg -i a.mp4 -i b.mp4 -i c.mp4 -filter_complex \
  "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" out.mp4
```

## Aspect-ratio conversion

### 16:9 → 9:16 (center crop, loses edges)

```bash
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4
```

### 16:9 → 9:16 (blurred-background pad, preserves full frame)

```bash
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]split=2[bg][fg]; \
   [bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:5[bg2]; \
   [fg]scale=1080:-2[fg2]; \
   [bg2][fg2]overlay=(W-w)/2:(H-h)/2" \
  -c:a copy out.mp4
```

### 16:9 → 1:1 (center crop)

```bash
ffmpeg -i in.mp4 -vf "crop=ih:ih,scale=1080:1080" -c:a copy out.mp4
```

## Burn SRT captions (hardsub)

```bash
ffmpeg -i in.mp4 -vf "subtitles=captions.srt:force_style='Fontname=Inter,Fontsize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=3,Shadow=0,Alignment=8,MarginV=400'" \
  -c:a copy out.mp4
```

- **Alignment**: 1=BL, 2=BC, 3=BR, 5=TL, 6=TC, 7=TR, 8=above-bottom, 9=center
- **Colors**: `&HBBGGRR&` — hex reversed
- **BorderStyle**: 1=outline only, 3=box background

## Soft-mux SRT (toggleable subtitles)

```bash
ffmpeg -i in.mp4 -i captions.srt -c copy -c:s mov_text \
  -metadata:s:s:0 language=eng out.mp4
```

## Loudness normalize (EBU R128)

### Two-pass (accurate)

```bash
# Pass 1 — analyze
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2> pass1.log

# Parse JSON for: measured_I, measured_LRA, measured_TP, measured_thresh, offset

# Pass 2 — apply (substitute measured values)
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$I:measured_LRA=$LRA:measured_TP=$TP:measured_thresh=$THRESH:offset=$OFFSET:linear=true" out.wav
```

### Single-pass (fast, less accurate)

```bash
ffmpeg -i in.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 out.wav
```

### Targets

- `-14 LUFS` — YouTube, Spotify, TikTok, Reels, Shorts (modern social)
- `-16 LUFS` — Apple Podcasts, US podcast standard
- `-23 LUFS` — EBU R128 (European broadcast)
- `-19 LUFS` — AM/FM mastering
- `-1 dB TP` — True peak cap (prevents clipping in codecs)

## Background music with ducking (sidechain compression)

```bash
ffmpeg -i voice.wav -i music.mp3 -filter_complex \
  "[1:a]volume=0.3[bg]; \
   [0:a][bg]sidechaincompress=threshold=0.05:ratio=8:attack=200:release=1000[ducked]; \
   [0:a][ducked]amix=inputs=2:duration=first[mix]" \
  -map "[mix]" out.wav
```

## Platform encodes

### TikTok / Reels / Shorts (9:16)

```bash
ffmpeg -i in.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 \
  -pix_fmt yuv420p -r 30 -b:v 10M -maxrate 15M -bufsize 20M \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart out.mp4
```

### YouTube 1080p SDR

```bash
ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 384k -movflags +faststart out.mp4
```

### YouTube HDR (HEVC)

```bash
ffmpeg -i in.mp4 -c:v libx265 -crf 20 -pix_fmt yuv420p10le -tag:v hvc1 \
  -color_primaries bt2020 -color_trc smpte2084 -colorspace bt2020nc \
  -c:a aac -b:a 384k -movflags +faststart out.mp4
```

## Thumbnail / key-frame extraction

```bash
# At specific timestamp
ffmpeg -ss 00:00:10 -i in.mp4 -frames:v 1 -q:v 2 thumb.jpg

# Scene-change "best" frame
ffmpeg -i in.mp4 -vf "thumbnail,scale=1280:720" -frames:v 1 smart_thumb.jpg

# N thumbnails evenly spaced (poster sheet)
ffmpeg -i in.mp4 -vf "fps=1/60,scale=320:180,tile=5x2" poster.jpg
```

## Silence removal (edges)

```bash
ffmpeg -i in.mp4 -af silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.5:stop_periods=-1:stop_threshold=-40dB:stop_silence=0.5 out.mp4
```

For aggressive filler cutting, use `auto-editor` separately.

## Strip metadata

```bash
ffmpeg -i in.mp4 -map_metadata -1 -c copy out_clean.mp4
```

## Fade in / out

```bash
ffmpeg -i in.mp4 -vf "fade=t=in:st=0:d=1,fade=t=out:st=59:d=1" \
  -af "afade=t=in:st=0:d=1,afade=t=out:st=59:d=1" out.mp4
```

## Watermark / logo overlay

```bash
ffmpeg -i in.mp4 -i logo.png -filter_complex \
  "[1:v]scale=150:-1[wm];[0:v][wm]overlay=W-w-20:20" -c:a copy out.mp4
```

## Speed change (video + audio)

```bash
# 2x speed
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" \
  -map "[v]" -map "[a]" out.mp4

# 0.5x (half speed)
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" \
  -map "[v]" -map "[a]" out.mp4
```

`atempo` range per filter: 0.5-2.0. For more extreme, chain: `atempo=2.0,atempo=2.0` = 4x.

## Picture-in-picture / b-roll overlay

```bash
ffmpeg -i main.mp4 -i broll.mp4 -filter_complex \
  "[1:v]setpts=PTS+1.2/TB,scale=540:960[ovl]; \
   [0:v][ovl]overlay=0:0:enable='between(t,1.2,3.2)'" \
  -c:a copy out.mp4
```

## Convert for transcription

```bash
# Optimal Whisper input
ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le out.wav
```

## Chunk long files

```bash
# Split at 600s (10min) boundaries, keyframe-aligned
ffmpeg -i in.wav -f segment -segment_time 600 -c copy chunk_%03d.wav
```

## Burn-in animated captions (ASS)

```bash
ffmpeg -i in.mp4 -vf "ass=captions.ass" -c:a copy out.mp4
```

## Full podcast mix example

```bash
ffmpeg \
  -i host.wav \
  -i guest.wav \
  -i intro.wav \
  -i outro.wav \
  -filter_complex "\
   [0:a]volume=0dB[host]; \
   [1:a]volume=-2dB[guest]; \
   [host][guest]amix=inputs=2:duration=longest:dropout_transition=0[voices]; \
   [2:a]adelay=0|0[intro_]; \
   [3:a]adelay=3600000|3600000[outro_]; \
   [voices][intro_][outro_]amix=inputs=3:duration=longest[mixed]; \
   [mixed]loudnorm=I=-16:TP=-1.5:LRA=11[final]" \
  -map "[final]" -c:a libmp3lame -b:a 128k episode.mp3
```

## Debugging tips

- **`-v verbose`** — see filter graph resolution
- **`-loglevel error`** — quiet noisy output for scripts
- **`-y`** — overwrite output without asking
- **`-n`** — fail if output exists (opposite of `-y`)
- **`-progress pipe:1`** — machine-readable progress on stdout (for agent consumption)

## How to use this file

- `edit-video`, `format-for-platform`, `caption-video`, `edit-audio`, `mix-podcast` all reference commands from this cookbook
- Keep this file in sync with FFmpeg major versions (check after FFmpeg 7+ adoption)
