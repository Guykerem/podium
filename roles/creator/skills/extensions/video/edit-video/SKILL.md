---
name: edit-video
description: Cut, arrange, reframe, normalize, and render video via FFmpeg, MoviePy, Remotion, or OpenTimelineIO edit decision lists
when_to_use: >
  User has a transcribed / segmented video and wants the actual edit produced —
  dead-air removed, hook assembled, cuts, b-roll overlays, final export.
  Composes segments.json + assets + captions into a final MP4.
tier: extension
---

# Edit Video

The cut list becomes the cut. Turn a `segments.json` (plus assets, captions, music) into a final MP4 — either via FFmpeg commands, a MoviePy script, a Remotion project, or an OpenTimelineIO export for a desktop NLE.

## Purpose

Editing is the craft of video. This skill does two things:

1. **Auto-cut** — remove dead air, assemble segments, overlay b-roll per script markers, render
2. **Emit an EDL** — OTIO / FCPXML / Premiere XML for the creator to fine-tune in Resolve / Final Cut / Premiere

Choose per autonomy: direct render for fast turnaround, EDL handoff for precision craft.

## How It Works

1. **Input manifest** — `edit.yaml` generated from `script.md` + `segments.json`:
   ```yaml
   timeline:
     - id: seg_001
       source: master.mp4
       in: 0.0
       out: 3.2
       role: hook
     - id: broll_1
       source: assets/broll/shot_01.mp4
       start_at: 1.2
       duration: 2.0
       role: overlay
     - id: seg_002
       source: master.mp4
       in: 3.2
       out: 12.5
       role: content
   audio_beds:
     - source: assets/music/bed.mp3
       start: 0.0
       duration: all
       volume: 0.2
       ducking: true
   captions: captions/burn.ass
   output:
     resolution: 1080x1920
     fps: 30
     codec: h264
     target_duration: 45
   ```
2. **Silence removal (optional)** — Use Auto-Editor for fast cuts:
   ```bash
   auto-editor master.mp4 --silent-threshold 0.04 --frame-margin 6 --export premiere
   ```
3. **Cut + concat** (FFmpeg path) — For each timeline entry, extract the slice; concat. Faster: write one complex filtergraph.
   ```bash
   # Simpler: extract each slice, concat
   ffmpeg -ss 0 -to 3.2 -i master.mp4 -c copy seg_001.mp4
   ffmpeg -ss 3.2 -to 12.5 -i master.mp4 -c copy seg_002.mp4
   # list.txt:
   # file 'seg_001.mp4'
   # file 'seg_002.mp4'
   ffmpeg -f concat -safe 0 -i list.txt -c copy cut.mp4
   ```
4. **Reframe** if target is vertical from horizontal source — defer to `shorts-factory/reframe-vertical` for face-tracking, or use center-crop for speed.
5. **B-roll overlays** — Picture-in-picture or full replacement:
   ```bash
   ffmpeg -i cut.mp4 -i assets/broll/shot_01.mp4 -filter_complex \
     "[1:v]setpts=PTS+1.2/TB,scale=540:960[ovl]; \
      [0:v][ovl]overlay=0:0:enable='between(t,1.2,3.2)'" \
     -c:a copy overlay.mp4
   ```
6. **Audio bed with ducking** (see FFmpeg cookbook — `sidechaincompress`).
7. **Loudnorm** — two-pass EBU R128 to -14 LUFS (TikTok/YouTube standard).
8. **Burn captions** via `caption-video` output.
9. **Final encode** — platform target (see `format-for-platform`).

## EDL path — OpenTimelineIO

When the creator wants to polish in Resolve / FCP / Premiere, emit an OTIO file:

```python
import opentimelineio as otio
tl = otio.schema.Timeline(name="edit-slug")
v_track = otio.schema.Track(kind=otio.schema.TrackKind.Video)
a_track = otio.schema.Track(kind=otio.schema.TrackKind.Audio)
tl.tracks.extend([v_track, a_track])

for seg in segments:
    clip = otio.schema.Clip(
        name=seg["id"],
        media_reference=otio.schema.ExternalReference(target_url=f"file://{seg['source']}"),
        source_range=otio.opentime.TimeRange(
            start_time=otio.opentime.RationalTime(seg["in"] * 30, 30),
            duration=otio.opentime.RationalTime((seg["out"] - seg["in"]) * 30, 30),
        ),
    )
    v_track.append(clip)

otio.adapters.write_to_file(tl, "edit.fcpxml")
otio.adapters.write_to_file(tl, "edit.otio")
```

Converts to FCPXML (FCP / Resolve), Premiere XML, EDL.

## Remotion path — programmatic templated video

For branded templates (lower thirds, animated cards, data viz), render with Remotion:

```bash
npx remotion render src/index.ts BrandedShort out.mp4 \
  --props='{"script":"...","segments":"..."}' --codec=h264 --crf=18
```

Good for: quote graphics, social cards, animated headlines, consistent brand templates.

## MoviePy path — Python, quick scripts

Good for one-off assemblies, less good for scale. See research doc for patterns.

## Output

```
edits/<slug>/
  cut.mp4                       # silence-removed master cut
  edit.mp4                      # final w/ overlays + audio bed
  edit.final.mp4                # w/ captions burned, platform-encoded
  edit.otio                     # for desktop NLE handoff
  edit.fcpxml                   # Final Cut / Resolve
  edit.manifest.yaml            # the cut list used
```

## Autonomy behavior

- **L1** — Propose cut manifest (`edit.yaml`), render preview at 720p, show creator. Re-edit on feedback, then render final.
- **L2** — Auto-cut + auto-render final. Creator reviews finished MP4.
- **L3** — Full pipeline through `format-for-platform` + `caption-video`. Creator reviews master output(s).

Never auto-publishes. Publishing requires explicit user action.

## Integration

- Input: `segments.json`, `script.md`, `assets/`, `captions/`
- Composes **act** (FFmpeg / MoviePy / Remotion) + **remember** (writes edits/)
- Downstream: `format-for-platform`, `generate-thumbnail`
- Upstream: `transcribe-media`, `segment-transcript`, `write-script`, `source-media`, `caption-video`

## Failure modes

- **Audio/video drift after concat** — re-encode with explicit `-r 30` and `-ar 48000` to normalize
- **Black frames between cuts** — use concat with re-encode path, not stream-copy, when sources differ
- **Loudness inconsistency** — always loudnorm twice (pass 1 analyze → pass 2 apply)
- **B-roll covering speaker's reaction** — b-roll overlays should follow the script's `[B-ROLL: ...]` markers, not arbitrary timing
