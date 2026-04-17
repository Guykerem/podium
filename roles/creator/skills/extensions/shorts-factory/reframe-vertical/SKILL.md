---
name: reframe-vertical
description: Convert horizontal video to vertical with face-tracking — speaker stays centered, not center-cropped
when_to_use: >
  16:9 source needs to become 9:16 for TikTok / Reels / Shorts without losing
  the speaker. Beats the dumb center-crop when the subject moves around frame.
  Essential for podcast-to-shorts and webinar-to-shorts pipelines.
tier: extension
---

# Reframe Vertical

Smart 9:16 reframing with face tracking. Keeps the speaker centered even when they move.

## Purpose

Center-crop is lazy: it chops off the edges of the frame regardless of where the subject is. Face-tracking reframing follows the speaker, producing vertical video that feels intentional.

For podcasts with 2 speakers, it cuts between speakers based on whoever's talking.

## How It Works

### Path A: Descript Smart Reframe (hosted, fast)

Upload → Smart Reframe (auto-face-track) → download 9:16. Good for quick turnarounds; requires Descript subscription.

### Path B: OpusClip / Vizard / Munch (hosted, AI clip + reframe in one step)

These tools do auto-reframe as part of their clip-extraction pipeline. Good when you also want auto-clipping. API status varies — OpusClip has enterprise API; others are mostly UI.

### Path C: Self-hosted (face detection + FFmpeg crop) — recommended for control

```python
import cv2, numpy as np, subprocess

cap = cv2.VideoCapture("in.mp4")
detector = cv2.FaceDetectorYN.create("face_detection_yunet_2023mar.onnx", "", (0, 0))

src_w, src_h = int(cap.get(3)), int(cap.get(4))
fps = cap.get(5)
target_ratio = 9/16
target_w = int(src_h * target_ratio)   # crop width for vertical from horizontal

# Collect face centers per frame
centers = []
frame_idx = 0
while True:
    ret, frame = cap.read()
    if not ret: break
    detector.setInputSize((src_w, src_h))
    _, faces = detector.detect(frame)
    if faces is not None and len(faces) > 0:
        f = faces[0]
        cx = int(f[0] + f[2]/2)
        centers.append((frame_idx, cx))
    frame_idx += 1
cap.release()

# Smooth centers (exponential moving average) to avoid jitter
smoothed = []
ema_alpha = 0.15
last = centers[0][1] if centers else src_w/2
for idx, cx in centers:
    last = ema_alpha * cx + (1 - ema_alpha) * last
    smoothed.append((idx, int(last)))

# Emit FFmpeg overlay/crop expression
# Simpler: split into segments where center shifts > threshold and render per-segment
```

Then use FFmpeg's `crop` filter with time-varying center:
```bash
# Simple case — static face center (most podcasts with fixed framing)
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih:$CENTER-ih*9/32:0,scale=1080:1920" -c:a copy out.mp4

# Time-varying: use sendcmd filter to change crop params over time
ffmpeg -i in.mp4 -vf "sendcmd=f=crop.cmds,crop=ih*9/16:ih:0:0,scale=1080:1920" out.mp4
# crop.cmds:
# 0 crop x 450;
# 12.5 crop x 520;
# 18.2 crop x 480;
```

### Path D: Auto-framing via Apple-provided tools (macOS) or Python libraries

- `MediaPipe Face Detection` (Google, free, works well)
- `RetinaFace` (higher accuracy, slower)
- `YOLOv8-face` (modern, fast)

### Multi-speaker podcast mode

For 2 speakers on a horizontal recording:
1. Diarize audio (AssemblyAI speaker labels)
2. Per word-block, active speaker ID → face position
3. Cut to the active speaker's crop region (with a 500ms hysteresis to avoid flicker)
4. Optional: fit both speakers in a split-screen if they overlap

```
# Pseudocode: driven from diarization + face positions
segments = []
for word_block in diarized_transcript:
    speaker = word_block.speaker
    face = speaker_face_positions[speaker]
    segments.append({
        "start": word_block.start,
        "end": word_block.end,
        "crop_center_x": face.center_x,
    })
# Merge consecutive same-speaker segments; apply hysteresis
```

## Output

```
reframed/<slug>/
  in.mp4
  out.mp4                   # 9:16, face-tracked
  crop_track.json           # per-frame crop center (for debugging)
  meta.yaml                 # method, model, hysteresis settings
```

## Quality controls

- **Jitter** — smooth crop position; no frame-to-frame jumps of >40px
- **Snap-back** — when face leaves frame, slow decay back to center (don't chase off-frame)
- **Headroom** — keep 15-20% of vertical frame above the subject's head
- **Rule-of-thirds** — optional: position face at upper-third rather than dead-center

## Autonomy behavior

- **L1** — Process sample clip (first 10s), show reframed preview alongside original. Creator approves method + settings before full run.
- **L2** — Full reframe on default settings. Preview 3 timestamps for QA.
- **L3** — Full auto. Creator reviews final MP4.

## Integration

- Input: horizontal source video
- Composes **act** (face detection + FFmpeg) + **remember** (reframe preferences per show)
- Downstream: `caption-video`, `format-for-platform`, `variant-spray`
- Upstream: `edit-video` (cut first, reframe second — cutting on horizontal preserves context)

## Failure modes

- **Face out of frame** — subject turned away or moved off-screen; freeze crop center at last known position or fall back to center-crop for that window
- **Multiple faces, wrong one tracked** — add speaker-face mapping in `memory/creative-style/show-setups.yaml` (host is left, guest is right, etc.)
- **Excessive jitter** — raise EMA alpha; increase hysteresis
- **Cropping important visuals** — if a slide or graphic is on-screen, don't face-track; fall back to center with subject off-center — mark these regions manually or detect OCR presence
