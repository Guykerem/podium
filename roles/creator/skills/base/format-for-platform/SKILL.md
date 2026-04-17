---
name: format-for-platform
description: Adapt a piece of content for multiple platforms — aspect ratios, captions, lengths, metadata. One capture becomes many outputs.
when_to_use: >
  Content is produced once and needs to ship to multiple platforms. Also used
  to retarget existing content to a new platform. The multi-output engine that
  makes a single capture worth many posts.
tier: base
---

# Format For Platform

Take a master asset and produce platform-native variants — not cropped, adapted. Correct specs, correct metadata, correct hook style.

## Purpose

A TikTok is not a cropped YouTube video. A LinkedIn post is not a blog intro. The difference between "repurposed" and "cross-posted" is whether each platform's audience feels like the content was made for them.

This skill owns the mechanical transformations AND the editorial adjustments — different hook, different pacing, different CTA per platform.

## How It Works

1. **Load master** — Video, audio, text, or image + a `brief.md` indicating target platforms.
2. **For each target platform**, consult `knowledge/platforms/<platform>.md` to get:
   - Aspect ratio + resolution
   - Length range (ideal, max)
   - Caption requirements (burn-in vs soft, style)
   - Metadata fields (title length, description length, hashtags, chapters)
   - File format / codec / bitrate
   - Upload mechanics (API endpoint, upload method)
3. **Transform video** (see FFmpeg cookbook in `knowledge/editing/ffmpeg-cookbook.md`):
   - **16:9 → 9:16** smart-reframe with face tracking OR blurred-bg pad
   - **16:9 → 1:1** center crop or aware-crop
   - Length trim (for shorts, pull top-rated `segments.json` entries; re-stitch)
   - Re-encode to platform specs (H.264 High, yuv420p, faststart)
4. **Adapt hook per platform**:
   - TikTok / Reels / Shorts — visual + verbal hook in first 2s
   - YouTube long-form — promise + preview in first 15s
   - LinkedIn native video — text overlay hook in first 3s (people scroll with sound off)
5. **Generate platform-specific metadata**:
   - Title / caption / description per platform limits and best practices
   - Hashtags — niche, 3-10 (not #fyp spam)
   - Chapters for YouTube if ≥ 10min
   - First-comment link (IG doesn't allow links in caption reliably)
   - OG image for blog/web
6. **Handle captions per platform**:
   - TikTok / Reels / Shorts → burn-in styled
   - YouTube → soft SRT (viewers toggle), plus burn-in for mobile
   - LinkedIn → burn-in (auto-play muted by default)
   - X → burn-in
7. **Emit** to `outputs/<platform>/`:
   ```
   outputs/
     tiktok/
       video.mp4
       caption.txt
       hashtags.txt
       cover.jpg
       metadata.yaml
     youtube-shorts/
       video.mp4
       title.txt
       description.md
       tags.txt
     linkedin/
       video.mp4
       post.md
     x/
       video.mp4
       thread.md         # if the piece wants a thread companion
   ```

## Transformation recipes

### 16:9 master → 9:16 short (smart reframe)

```bash
# Option A: face-aware reframe (requires Auto-Framing tool like Descript or Submagic)
# Option B: center-crop (lossy, safe)
ffmpeg -i master.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy short.mp4

# Option C: blurred-pad (preserves full frame, letterboxed)
ffmpeg -i master.mp4 -filter_complex \
  "[0:v]split=2[bg][fg]; \
   [bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:5[bg2]; \
   [fg]scale=1080:-2[fg2]; \
   [bg2][fg2]overlay=(W-w)/2:(H-h)/2" \
  -c:a copy short.mp4
```

### Trim master to 60s clip from segment

```bash
# Pull start/end from segments.json
ffmpeg -ss $SEG_START -to $SEG_END -i master.mp4 -c copy clip.mp4
# Frame-accurate (re-encode)
ffmpeg -i master.mp4 -ss $SEG_START -to $SEG_END -c:v libx264 -c:a aac clip.mp4
```

### Final platform encode

```bash
# TikTok / Reels / Shorts
ffmpeg -i clip.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 \
  -pix_fmt yuv420p -r 30 -b:v 10M -maxrate 15M -bufsize 20M \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart out_tiktok.mp4

# YouTube 1080p
ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 384k -movflags +faststart out_youtube.mp4
```

## Platform-aware hook adaptation (LLM pass)

For each platform, rewrite the opening with these constraints:

```
Platform: {tiktok | shorts | reels | youtube | linkedin | x}
Master hook: "{original hook}"
Audience: {platform culture}
Constraints: {2s vs 15s, sound-off vs sound-on, text-first vs visual-first}

Rewrite the opening 3 seconds / 3 lines while preserving the core promise.
Change rhythm, not content.
```

## Autonomy behavior

- **Level 1** — Produce each platform variant, present all for review before export. Creator approves per-platform.
- **Level 2** — Auto-transform mechanical specs (aspect, length, encode). Present hook rewrites for approval.
- **Level 3** — Full auto-transform including hook rewrites; creator reviews batch before any upload.

Never auto-publishes. Publishing is its own skill (`publish`, extension) and always requires explicit confirmation.

## Integration

- Input: master video/audio/text + `brief.md` + `segments.json`
- Composes **act** (FFmpeg, LLM for hooks) + **remember** (writes outputs/)
- Downstream: `publish` skill (if enabled) or manual upload by creator
- Upstream: `edit-video` (if a video edit exists), `write-script` (for text-based adaptation)

## Failure modes

- **Wrong aspect ratio for platform** — specs change; always read from `knowledge/platforms/<platform>.md` (kept current) rather than hardcoding
- **Caption burn at wrong size for 9:16** — caption position and size must be recomputed per-aspect; never just re-encode
- **Audio peaking after re-encode** — run loudnorm pass after every encode to hit platform LUFS target (YouTube -14, TikTok -14)
- **Hook identical across platforms** — if the per-platform hook rewrite returns the same text 3x, flag: the LLM isn't adapting, retry with sharper constraints
