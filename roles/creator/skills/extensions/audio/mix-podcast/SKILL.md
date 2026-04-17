---
name: mix-podcast
description: Mix a podcast episode — intro stinger, host + guest tracks, music beds, ducking, outro — ready for distribution
when_to_use: >
  Multi-track podcast recording (host + 1-N guests) needs to become a single
  publishable episode. Combines edited tracks with intro/outro music, optional
  ad beds, loudness-normalized to broadcast standard.
tier: extension
---

# Mix Podcast

Assemble a full podcast episode from tracks, stingers, and music — broadcast-ready.

## Purpose

Multi-track podcasts need careful mixing:
- Each speaker track gated + compressed independently
- Music bed ducks when anyone speaks
- Intro/outro stingers sit at show-brand levels
- Final mix hits target loudness (-16 LUFS US, -23 EU, -14 for Spotify)

Assumes `edit-audio` has already processed individual tracks.

## How It Works

1. **Input manifest** — `mix.yaml`:
   ```yaml
   episode: 047
   title: "The Conductor's Arc"
   tracks:
     host:
       file: host_cleaned.wav
       gain_db: 0
     guest_1:
       file: guest1_cleaned.wav
       gain_db: -2
     intro:
       file: assets/music/intro_stinger.wav
       start: 0.0
       duration: 12.0
       volume: 1.0
     outro:
       file: assets/music/outro.wav
       start: "episode_end - 20"
       duration: 20
       volume: 0.8
     ad_bed:
       file: assets/music/ad_bed.wav
       start: 1200.0
       duration: 60.0
       volume: 0.3
       duck: true
   target_loudness: -16
   output: episode_047.mp3
   chapters:
     - {time: 0, title: "Intro"}
     - {time: 30, title: "Guest introduction"}
     - {time: 320, title: "Main topic"}
   ```

2. **Assemble FFmpeg complex filtergraph** — Multi-track mix with sidechain ducking:
   ```bash
   ffmpeg \
     -i host_cleaned.wav \
     -i guest1_cleaned.wav \
     -i intro_stinger.wav \
     -i outro.wav \
     -i ad_bed.wav \
     -filter_complex "\
   [0:a]adelay=0|0,volume=0dB[host]; \
   [1:a]adelay=0|0,volume=-2dB[guest]; \
   [host][guest]amix=inputs=2:duration=longest:dropout_transition=0[voices]; \
   [2:a]adelay=0|0,volume=1.0[intro_]; \
   [3:a]adelay=${OUTRO_START}s|${OUTRO_START}s,volume=0.8[outro_]; \
   [4:a]adelay=1200000|1200000,volume=0.3[adbed_]; \
   [voices][adbed_]sidechaincompress=threshold=0.05:ratio=8:attack=200:release=1000[voices_ducked]; \
   [voices_ducked][intro_][outro_]amix=inputs=3:duration=longest[mixed]; \
   [mixed]loudnorm=I=-16:TP=-1.5:LRA=11[final]" \
     -map "[final]" -c:a libmp3lame -b:a 128k episode_047.mp3
   ```

3. **Embed chapters** (ID3 v2.3 chapters, iTunes-compatible):
   ```bash
   # Generate chapters metadata file, then embed:
   ffmpeg -i episode_047.mp3 -i chapters.txt -map_metadata 1 -c copy \
     -metadata title="$TITLE" -metadata artist="$HOST" \
     -metadata album="$SHOW" -metadata track="$EPISODE" \
     episode_047_tagged.mp3
   ```

4. **Video podcast path** — if recording has video (Riverside, Zoom, etc.), produce both:
   - Audio-only for podcast feeds (MP3, 128 kbps VBR, mono or stereo)
   - Video version for YouTube (1080p, H.264, loudness -14)
   
   Speaker-switch cuts for video can be driven from diarized transcript — cut to whoever's speaking.

5. **Artwork**:
   - Square episode art (3000x3000, PNG or JPG, <500KB)
   - Embedded in ID3:
     ```bash
     ffmpeg -i episode_047.mp3 -i episode_art.jpg -map 0 -map 1 \
       -c copy -id3v2_version 3 -metadata:s:v title="Album cover" \
       -metadata:s:v comment="Cover (front)" episode_047_art.mp3
     ```

6. **Emit outputs + publishing package**:
   ```
   outputs/podcast/047/
     episode_047.mp3              # master (hosted)
     episode_047_video.mp4        # video version if applicable
     episode_art.jpg              # 3000x3000
     show_notes.md                # timestamps + links + guest bio
     transcript.md                # readable
     transcript.srt               # for YouTube captions
     publish.yaml                 # RSS/hosting metadata
   ```

## Supported hosts

- **Transistor**, **Buzzsprout**, **Captivate**, **Spotify for Podcasters** — upload APIs or RSS-based
- Generic RSS: agent can emit an RSS entry and upload MP3 to S3/R2
- YouTube: via `publish` skill with video version

## Chapters format (iTunes / Apple)

```
CHAPTER01=00:00:00.000
CHAPTER01NAME=Intro
CHAPTER02=00:00:30.500
CHAPTER02NAME=Guest introduction
...
```

Or the newer Podcast Index chapters JSON (supported by modern apps).

## Autonomy behavior

- **L1** — Render preview at first 2min with full mix applied. Creator signs off on levels before full render.
- **L2** — Full render on default preset. Creator reviews before hosting upload.
- **L3** — Render + emit publish package + stage in hosting platform (draft, not published). Creator hits publish.

Never auto-publishes a podcast episode. Always drafts to host.

## Integration

- Input: individual cleaned tracks (from `edit-audio`), intro/outro stingers, optional ad bed, transcript for chapters
- Composes **act** (FFmpeg) + **remember** (show config, ep log)
- Downstream: `publish` skill (podcast host), `generate-thumbnail` (episode art), `create-thread` (launch promo)
- Upstream: `edit-audio`, `transcribe-media`, `segment-transcript` (for chapters)

## Failure modes

- **Voices too quiet under music** — increase ducking ratio (8:1 → 12:1); adjust `threshold` lower (-30 dB)
- **Audible pumping when music ducks** — longer release (1500ms+); tighter threshold
- **Levels inconsistent between speakers** — this is an `edit-audio` issue upstream; don't paper over in mix
- **Embedded chapters not showing in app** — check app compatibility (Apple vs Overcast vs Spotify); ID3v2.3 preferred, not v2.4
