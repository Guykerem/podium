# Content Creator Agent — Research & Reference

> Landscape scan for a content-creation agent boilerplate. Current as of 2026-04. Prefers concrete endpoints, CLI commands, and file formats over prose. Maturity tags: **[stable]**, **[moving]**, **[unstable/no-API]**.

---

## 1. Transcription & Media Intelligence

### Whisper (OpenAI) [stable]

**Hosted API** — `POST https://api.openai.com/v1/audio/transcriptions`

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@episode.mp3" \
  -F model="whisper-1" \
  -F response_format="verbose_json" \
  -F timestamp_granularities[]="word" \
  -F timestamp_granularities[]="segment"
```

- Models: `whisper-1` (original), `gpt-4o-transcribe` / `gpt-4o-mini-transcribe` (2024+, higher accuracy, supports streaming)
- Formats accepted: mp3, mp4, mpeg, mpga, m4a, wav, webm (25MB hard cap — chunk longer files)
- Formats returned: `json`, `text`, `srt`, `verbose_json`, `vtt`
- Pricing: `whisper-1` = $0.006/min, `gpt-4o-mini-transcribe` = $0.003/min, `gpt-4o-transcribe` = $0.006/min
- **No speaker diarization natively** — pair with pyannote.audio or AssemblyAI

### whisper.cpp (local) [stable]

```bash
# Install
brew install whisper-cpp
# or build: git clone https://github.com/ggerganov/whisper.cpp && make

# Download model
bash ./models/download-ggml-model.sh large-v3

# Transcribe with word timestamps + SRT
whisper-cli -m ggml-large-v3.bin -f audio.wav \
  --output-srt --output-json --max-len 1 --word-thold 0.01
```

- Models (GGML quantized): `tiny` (75MB), `base` (142MB), `small` (466MB), `medium` (1.5GB), `large-v3` (3GB), `large-v3-turbo` (1.5GB, ~8x faster)
- Apple Silicon: Core ML acceleration via `--use-coreml`
- Real-time factor on M2: large-v3 ≈ 0.3x (3 min to transcribe 10 min)

### AssemblyAI [stable]

`POST https://api.assemblyai.com/v2/transcript`

```json
{
  "audio_url": "https://...mp3",
  "speaker_labels": true,
  "auto_chapters": true,
  "sentiment_analysis": true,
  "iab_categories": true,
  "entity_detection": true,
  "auto_highlights": true
}
```

- Best-in-class diarization (Universal model, 2024+)
- Pricing: $0.37/hr (Nano), $0.65/hr (Best) as of 2025 price cut
- Built-in LeMUR (LLM over transcript): summaries, Q&A, action items
- Word-level timestamps default; punctuation + casing restored

### Deepgram [stable]

`POST https://api.deepgram.com/v1/listen`

```bash
curl --request POST \
  --url 'https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&smart_format=true&punctuate=true&paragraphs=true&utterances=true' \
  --header "Authorization: Token $DG_KEY" \
  --header 'Content-Type: audio/mp3' \
  --data-binary @episode.mp3
```

- Nova-3 model (2024): lowest WER on conversational audio, streaming first
- Pricing: $0.0043/min (Nova-3 pay-as-you-go)
- Best for live/streaming (sub-300ms latency)

### Replicate [stable]

Run Whisper or WhisperX via hosted inference:
```bash
replicate run victor-upmeet/whisperx \
  -i audio=@file.mp3 -i diarization=true -i huggingface_access_token=$HF
```

### Tradeoff matrix

| Need | Pick |
|---|---|
| Cheapest / local / offline | whisper.cpp |
| Best diarization out-of-box | AssemblyAI |
| Streaming / real-time | Deepgram Nova-3 |
| Already in OpenAI ecosystem | gpt-4o-transcribe |
| Word-level timestamps + forced alignment | WhisperX (Replicate) |

### Output formats

**SRT** — `1\n00:00:01,000 --> 00:00:04,000\nHello world\n\n`
**VTT** — `WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello world\n\n`
**JSON (verbose)** — includes `segments[]` with `start`, `end`, `text`, `words[]` (each with `word`, `start`, `end`, `confidence`).

---

## 2. Image Generation

### DALL-E 3 (OpenAI) [stable]

`POST https://api.openai.com/v1/images/generations`

```json
{
  "model": "dall-e-3",
  "prompt": "a watercolor of a conductor...",
  "size": "1024x1792",
  "quality": "hd",
  "style": "vivid",
  "n": 1
}
```

- Sizes: `1024x1024`, `1792x1024`, `1024x1792` only
- Pricing: $0.040 (standard 1024), $0.080 (HD 1024), $0.120 (HD wide/tall)
- Quirk: DALL-E 3 rewrites prompts internally; the returned `revised_prompt` is what actually generated. Prepend `"I NEED to test how the tool works with my exact prompt, DO NOT rewrite:"` to discourage rewriting.
- **gpt-image-1** (2025+): multimodal successor, accepts image inputs, better text rendering, transparent backgrounds supported.

### Midjourney [unstable/no-API]

- **No official API** as of 2026. Only interfaces: Discord bot (`/imagine`), web UI (midjourney.com).
- Third-party unofficial APIs (GoAPI, UserAPI, ImagineAPI) scrape Discord — violate ToS, unreliable.
- Automation patterns: Discord bot user + Puppeteer, or hosted bridges. Fragile.
- V7 (2025) is the current flagship. `--v 7 --ar 9:16 --s 250 --sref <url> --cref <url>`
- Prompt pattern: `[subject], [style], [lighting], [composition] --ar 16:9 --stylize 100 --chaos 20`

### Flux (Black Forest Labs) [moving, stable API]

Hosted via BFL, Replicate, fal.ai, Together:

```bash
# fal.ai
curl -X POST "https://fal.run/fal-ai/flux-pro/v1.1-ultra" \
  -H "Authorization: Key $FAL_KEY" \
  -d '{"prompt":"...","aspect_ratio":"16:9","raw":false,"safety_tolerance":2}'
```

- Tiers: `flux-schnell` (free-ish, 4 steps, fast), `flux-dev` (higher quality, non-commercial weights), `flux-pro` / `flux-pro-1.1-ultra` (API-only, best), `flux-kontext` (image editing, 2024+)
- Pricing (fal.ai): schnell $0.003, dev $0.025, pro 1.1 ultra $0.06
- Flux Kontext: best-in-class instruction-based edits (`"change the shirt to red, keep everything else identical"`)

### Stable Diffusion [stable ecosystem]

**Models:**
- **SDXL 1.0** — 1024x1024 base, ecosystem-rich, huge LoRA library
- **SD3 / SD3.5 Large** (Stability AI, 2024) — improved text rendering, MMDiT architecture
- **SD3.5 Turbo** — 4-step distilled

**Runners:**
- **Automatic1111 WebUI** — the OG; `--api` flag exposes `http://localhost:7860/sdapi/v1/txt2img`
- **ComfyUI** — node-graph workflow editor; graphs exported as JSON, executed via `/prompt` endpoint. Industry standard for complex pipelines.
- **Forge** — Auto1111 fork, faster, better for SDXL+
- **InvokeAI** — production-oriented

**ComfyUI API pattern:**
```python
import websocket, json, requests
ws = websocket.WebSocket()
ws.connect(f"ws://127.0.0.1:8188/ws?clientId={CID}")
requests.post("http://127.0.0.1:8188/prompt", json={"prompt": workflow_json, "client_id": CID})
# Listen on ws for 'executed' events, then fetch from /history/{prompt_id}
```

### Ideogram [stable]

- Best-in-class **text rendering in images** (posters, logos with readable text)
- `POST https://api.ideogram.ai/generate` — requires `api_key` header
- Style presets: `AUTO`, `REALISTIC`, `DESIGN`, `RENDER_3D`, `ANIME`
- Pricing: ~$0.08/image at v2

### Recraft [stable]

- Vector-native output (SVG), brand-consistent style locks
- `POST https://external.api.recraft.ai/v1/images/generations` (OpenAI-SDK compatible)
- Unique: `"style_id": "..."` to apply trained brand style

### Imagen 3 / 4 (Google) [stable]

Via Vertex AI or Gemini API:
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict" \
  -H "x-goog-api-key: $GEMINI_KEY"
```
- Strong photorealism, strict safety filtering (can block benign prompts)

### Aspect ratio → platform map

| Ratio | Platform use |
|---|---|
| 9:16 (1080x1920) | TikTok, Reels, Shorts, Stories |
| 1:1 (1080x1080) | Instagram feed, LinkedIn feed, X |
| 4:5 (1080x1350) | Instagram feed (takes more screen real estate) |
| 16:9 (1920x1080) | YouTube, Twitter video, LinkedIn |
| 1.91:1 (1200x628) | OG image, Twitter card, link previews |
| 3:2 (1200x800) | Blog hero, Medium |
| 2:3 (1000x1500) | Pinterest, book covers |

### Upscaling

- **Magnific AI** — creative upscaler; "hallucinates" detail. API via Freepik (acquired 2024). ~$0.10/image.
- **Topaz Gigapixel / Photo AI** — desktop, CLI via Topaz Photo AI v3+ (`tpai -i input.jpg -o output.jpg --upscale=4x`). Best preservation of facts.
- **Real-ESRGAN** — open-source, free. `realesrgan-ncnn-vulkan -i input.jpg -o output.png -n realesrgan-x4plus -s 4`
- **clarity-upscaler** (Replicate) — Magnific clone, open-source recipe
- **SUPIR** — best quality open-source (slow, GPU heavy)

### Prompt engineering cheatsheet per model

- **DALL-E 3**: write full sentences, it'll rewrite. Lean into descriptive prose.
- **Midjourney**: tag-style + parameters. Heavy styling via `--sref <url>`, `--cref <url>`.
- **Flux**: natural language, very literal, great text rendering. Shorter is often better.
- **SDXL**: tag-style + negative prompts. BREAK/comma syntax. Embeddings/LoRAs for style.
- **Ideogram**: explicit "The text says '...'" for reliable typography.

---

## 3. Video Generation

### Runway [moving]

- **Gen-3 Alpha Turbo** (2024), **Gen-4** (2025) — current flagship
- Text-to-video, image-to-video, video-to-video, act-one (facial performance transfer)
- API: `POST https://api.dev.runwayml.com/v1/image_to_video` (SDK: `@runwayml/sdk`)
- Durations: 5s or 10s (extensible)
- Resolutions: 1280x768, 768x1280
- Pricing: ~$0.05/second (Gen-3 Turbo), credits-based

### Pika [moving]

- Pika 2.1 (2025), focuses on "Pikaffects" and scene ingredients (ingredient-to-video)
- API via pika.art (limited) — mostly consumer product
- 3-10s generations

### Kling (Kuaishou) [moving]

- Kling 1.6 / 2.0 (2025) — top-tier realism, especially human motion
- 5s / 10s, text-to-video and image-to-video
- API via Kling Official API, PiAPI, or fal.ai (`fal-ai/kling-video/v2-master/text-to-video`)
- Camera control language: `zoom_in`, `pan_left`, `tilt_up`, `tracking_shot`

### Luma Dream Machine [moving]

- Ray-2 (2025) model; fast iterations
- API: `POST https://api.lumalabs.ai/dream-machine/v1/generations`
- Keyframe-based: specify first + last frame images
- Good physics, smooth camera moves

### Sora (OpenAI) [moving, limited access]

- Sora Turbo in ChatGPT Pro/Team (Dec 2024+). No fully-public API yet as of early 2026.
- Up to 20s (Turbo), 1080p
- Story-boarding UI, remix, blend

### Hailuo / MiniMax [moving]

- MiniMax Video-01, Video-01-Live2D, s2v-01 (subject reference)
- API: `POST https://api.minimaxi.chat/v1/video_generation`
- Subject-reference (`S2V`) for character consistency across clips — rare/valuable

### Veo (Google) [moving]

- Veo 2 (2024), Veo 3 (2025) — Veo 3 adds native audio generation
- Via Vertex AI: `veo-003` model on `publishers/google/models/veo-3.0-generate-preview`
- 720p-1080p, up to 8s, with audio in Veo 3
- Pricing: ~$0.50/s video+audio

### Avatar / Lip-sync

**HeyGen** — avatar from single photo, cloned voice, lip-sync
- API: `POST https://api.heygen.com/v2/video/generate`
- Interactive Avatar (streaming): `POST https://api.heygen.com/v1/streaming.new`
- Photo Avatar (2024): generate AI avatar from single still
- Pricing: $24+/mo, API credits on top

**Synthesia** — enterprise-grade AVATAR videos
- API: `POST https://api.synthesia.io/v2/videos`
- 230+ stock avatars, custom avatars require paid plan

**D-ID** — talking-photo specialist (historical figures, portraits)
- API: `POST https://api.d-id.com/talks`
- Cheapest lip-sync; quality lower than HeyGen

**Wav2Lip / SadTalker / Hallo / EMO** — open-source lip-sync
- Wav2Lip: `python inference.py --checkpoint_path wav2lip_gan.pth --face video.mp4 --audio speech.wav`
- Hallo2 (2024), EMO (Alibaba, no public release) — SOTA open
- MuseTalk (Tencent) — real-time

### Mode matrix

| Input | Output | Best-in-class |
|---|---|---|
| Text only | Video | Kling 2, Veo 3, Sora |
| Image + text | Video | Runway Gen-4, Luma Ray-2 |
| Video + text | Video (restyle) | Runway Gen-3 Video-to-Video |
| Photo + Audio | Talking head | HeyGen, D-ID, EMO |
| Script | Avatar presenter | HeyGen, Synthesia |

---

## 4. Audio & Voice

### ElevenLabs [stable, dominant]

**Text-to-speech:**
```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
  -H "xi-api-key: $EL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {"stability":0.5,"similarity_boost":0.75,"style":0.0,"use_speaker_boost":true}
  }' --output out.mp3
```

- Models: `eleven_multilingual_v2` (quality), `eleven_turbo_v2_5` (fast, low-latency), `eleven_flash_v2_5` (~75ms), `eleven_v3` (alpha, expressive tags `[laughs]` `[whispers]`)
- **Voice cloning**: 1 min sample (Instant Clone), 30+ min (Professional Clone)
- **Dubbing**: `POST /v1/dubbing` — full video dub with lip-sync in 30+ languages
- **Projects / Studio** — long-form audiobook workflow
- Pricing: $5 Starter → $22 Creator (100K chars) → $99 Pro

### OpenAI TTS [stable]

`POST https://api.openai.com/v1/audio/speech`
```json
{"model":"tts-1-hd","input":"...","voice":"nova","response_format":"mp3","speed":1.0}
```
- Voices: alloy, echo, fable, onyx, nova, shimmer, + newer: ash, ballad, coral, sage, verse
- **gpt-4o-mini-tts** (2025): steerable — `instructions: "speak like a pirate, excited"`
- Pricing: $15/1M chars (tts-1-hd), $0.60/1M (gpt-4o-mini-tts)

### Cartesia [moving, fast]

- Sonic model — sub-90ms latency, excellent for voice agents
- `POST https://api.cartesia.ai/tts/bytes`
- Pricing: $49/mo Creator, $299 Pro

### PlayHT / Play.AI [stable]

- PlayHT 2.0, Play 3.0 Mini (streaming)
- `POST https://api.play.ht/api/v2/tts/stream`
- Strong voice-cloning, conversational focus

### Resemble AI [stable]

- High-fidelity cloning, real-time inference
- `POST https://app.resemble.ai/api/v2/projects/{id}/clips`
- Unique: localize (accent transfer), Resemble Detect (deepfake detection)

### Music Generation

**Suno** [moving, no official API]
- v4, v4.5 (2025); full song with vocals + lyrics
- Third-party Suno API wrappers (sunoapi.org) — unofficial
- Pricing: $10 Pro, $30 Premier

**Udio** [moving, no public API]
- High-fidelity, fewer artifacts than Suno in some cases

**Stable Audio 2.0** (Stability AI) [stable]
- `POST https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio`
- Up to 3 min tracks, audio-to-audio, no vocals

**AudioCraft / MusicGen** (Meta) [open-source]
- Local: `pip install audiocraft`; `MusicGen.get_pretrained('large')`
- No vocals, 30s chunks

**ElevenLabs Music** (2025) — beta, full song generation inside EL

### Audio cleanup

**Adobe Podcast Enhance** [stable]
- Free web tool, API via Creative Cloud
- Speech-focused noise removal, hallmark quality

**Auphonic** [stable]
- API: `POST https://auphonic.com/api/simple/productions.json`
- Loudness targeting, leveling, cross-gate, codec conversion — industry standard for podcasts
- Pricing: €11/mo for 9hr

**Krisp** — real-time in-call noise suppression, SDK available

**Resemble Enhance** — open-source speech restoration

---

## 5. FFmpeg Automation Cookbook

All commands assume FFmpeg 6+ (`brew install ffmpeg` / `apt install ffmpeg`).

### Extract audio from video

```bash
ffmpeg -i in.mp4 -vn -acodec libmp3lame -q:a 2 out.mp3
# WAV for transcription (16kHz mono — optimal for Whisper)
ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le out.wav
```

### Burn SRT captions into video (hardsub)

```bash
ffmpeg -i in.mp4 -vf "subtitles=captions.srt:force_style='Fontname=Inter,Fontsize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=1,Shadow=0,Alignment=2,MarginV=80'" \
  -c:a copy out.mp4
```
Alignment values: 1=BL, 2=BC, 3=BR, 5=TL, 6=TC, 7=TR. Colors are `&HBBGGRR&`.

### Soft-mux SRT (toggleable subs)

```bash
ffmpeg -i in.mp4 -i captions.srt -c copy -c:s mov_text -metadata:s:s:0 language=eng out.mp4
```

### Aspect ratio conversions

**16:9 → 9:16 (smart pad, blurred background)**
```bash
ffmpeg -i in.mp4 -filter_complex \
  "[0:v]split=2[bg][fg]; \
   [bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:5[bg2]; \
   [fg]scale=1080:-2[fg2]; \
   [bg2][fg2]overlay=(W-w)/2:(H-h)/2" \
  -c:a copy -y out_vertical.mp4
```

**16:9 → 9:16 (center crop, zoomed)**
```bash
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out.mp4
```

**16:9 → 1:1 (center crop)**
```bash
ffmpeg -i in.mp4 -vf "crop=ih:ih,scale=1080:1080" -c:a copy out.mp4
```

### Trim / cut

```bash
# Fast cut (keyframe-aligned, no re-encode)
ffmpeg -ss 00:01:30 -to 00:02:45 -i in.mp4 -c copy out.mp4

# Frame-accurate (re-encodes)
ffmpeg -i in.mp4 -ss 00:01:30.500 -to 00:02:45.100 -c:v libx264 -c:a aac out.mp4
```

### Concat multiple clips (same codec)

```bash
# list.txt:
# file 'clip1.mp4'
# file 'clip2.mp4'
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```

### Concat with re-encode (different codecs)

```bash
ffmpeg -i a.mp4 -i b.mp4 -i c.mp4 -filter_complex \
  "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" out.mp4
```

### Loudness normalize (EBU R128)

```bash
# Two-pass — analyze then apply (most accurate)
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2> pass1.log
# Parse measured_I, measured_LRA, measured_TP, measured_thresh, offset from JSON, then:
ffmpeg -i in.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=...:measured_LRA=...:measured_TP=...:measured_thresh=...:offset=...:linear=true" out.wav

# Single-pass (fast, less accurate)
ffmpeg -i in.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 out.wav
```
Targets: `-16 LUFS` (podcast), `-14 LUFS` (YouTube, Spotify), `-19 LUFS` (AM/FM mastering).

### Generate thumbnail at timestamp

```bash
ffmpeg -ss 00:00:10 -i in.mp4 -frames:v 1 -q:v 2 thumb.jpg

# Scene-change detection — pick the "best" frame
ffmpeg -i in.mp4 -vf "thumbnail,scale=1280:720" -frames:v 1 smart_thumb.jpg
```

### Re-encode for platform specs

```bash
# TikTok / Reels / Shorts — 9:16, 1080x1920, H.264 High, AAC 128k, ~30Mbps cap
ffmpeg -i in.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 \
  -pix_fmt yuv420p -r 30 -b:v 10M -maxrate 15M -bufsize 20M \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart out_tiktok.mp4

# YouTube 1080p (recommended SDR)
ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 384k -movflags +faststart out_yt.mp4

# YouTube HDR (HEVC)
ffmpeg -i in.mp4 -c:v libx265 -crf 20 -pix_fmt yuv420p10le -tag:v hvc1 \
  -color_primaries bt2020 -color_trc smpte2084 -colorspace bt2020nc \
  -c:a aac -b:a 384k -movflags +faststart out_hdr.mp4
```

### Background music with ducking (sidechain compression)

```bash
ffmpeg -i voice.wav -i music.mp3 -filter_complex \
  "[1:a]volume=0.3[bg]; \
   [0:a][bg]sidechaincompress=threshold=0.05:ratio=8:attack=200:release=1000[ducked]; \
   [0:a][ducked]amix=inputs=2:duration=first[mix]" \
  -map "[mix]" out.wav
```

### Silence removal

```bash
# Trim edges
ffmpeg -i in.mp4 -af silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.5:stop_periods=-1:stop_threshold=-40dB:stop_silence=0.5 out.mp4
```
(For aggressive silence cutting from podcasts, use `auto-editor` — see section 6.)

### Strip metadata

```bash
ffmpeg -i in.mp4 -map_metadata -1 -c copy out_clean.mp4
```

### Fade in/out

```bash
ffmpeg -i in.mp4 -vf "fade=t=in:st=0:d=1,fade=t=out:st=59:d=1" \
  -af "afade=t=in:st=0:d=1,afade=t=out:st=59:d=1" out.mp4
```

### Speed up / slow down

```bash
# 2x (video + audio)
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" out.mp4
```

### Watermark / logo overlay

```bash
ffmpeg -i in.mp4 -i logo.png -filter_complex \
  "[1:v]scale=150:-1[wm];[0:v][wm]overlay=W-w-20:20" -c:a copy out.mp4
```

### Probe metadata (for agent decisions)

```bash
ffprobe -v quiet -print_format json -show_format -show_streams in.mp4
```

---

## 6. Editing Automation

### CapCut [unstable/no-API]

- **No official public API** as of 2026. CapCut for Business exists but no programmatic video assembly API.
- ByteDance's internal "Jianying" equivalent has no SDK.
- Workarounds:
  - Desktop automation via Playwright/Puppeteer on CapCut web — fragile, ToS-grey
  - Generate **CapCut draft JSON** directly (format reverse-engineered by community: `draft_content.json` in `~/Movies/CapCut/User Data/Projects/com.lveditor.draft/<uuid>/`). Projects like `pyCapCut` and `CapCut-API` (GitHub) exist.
  - Honest answer: if you need CapCut output, export from elsewhere (Remotion, MoviePy) and use CapCut manually for polish.

### Descript [stable, limited API]

- Text-based video editing — delete text, deletes video
- Overdub: clone your voice, type corrections
- **API**: Descript has an Apps SDK (2024) — JavaScript-based plugins that run inside Descript, not a REST API for external control
- Published scripts export: MP4, SRT, Markdown transcript, Podcast WAV

### AI clip extractors

**OpusClip** [stable, SaaS]
- Long-form → short clips, virality score, auto-caption, auto-reframe
- API via OpusClip API (announced 2024, enterprise tier)
- Pricing: $19-$29/mo

**Vizard** — similar, more aggressive clipping heuristics
**Munch** — marketing-focus, A/B hook variants
**Spikes Studio** — budget option
**Submagic** — caption-first, viral-style animations

### Edit Decision Lists — programmatic video assembly

**EDL (CMX3600)** — oldest, line-based:
```
TITLE: My Edit
001  AX       V     C        00:00:00:00 00:00:05:00 01:00:00:00 01:00:05:00
001  AX       A     C        00:00:00:00 00:00:05:00 01:00:00:00 01:00:05:00
* FROM CLIP NAME: clip1.mp4
```

**FCPXML** (Final Cut Pro XML) — modern, rich, supported by DaVinci Resolve, Premiere (via Premiere XML), FCP:
```xml
<fcpxml version="1.11">
  <resources>
    <asset id="r1" src="file:///path/to/clip.mp4" duration="10s" hasVideo="1" format="r2"/>
  </resources>
  <library>
    <event name="Project">
      <project name="Main">
        <sequence format="r2">
          <spine>
            <asset-clip ref="r1" offset="0s" duration="5s" start="0s"/>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
```

**OTIO (OpenTimelineIO, Pixar)** — modern universal format:
```python
import opentimelineio as otio
tl = otio.schema.Timeline(name="My Edit")
track = otio.schema.Track()
tl.tracks.append(track)
clip = otio.schema.Clip(name="clip1", media_reference=otio.schema.ExternalReference(target_url="file:///clip1.mp4"))
clip.source_range = otio.opentime.TimeRange(start_time=otio.opentime.RationalTime(0, 24), duration=otio.opentime.RationalTime(120, 24))
track.append(clip)
otio.adapters.write_to_file(tl, "edit.otio")
# Convert: otio.adapters.write_to_file(tl, "edit.fcpxml")
```
OTIO converts between EDL, FCPXML, AAF, Premiere XML — **use it as your canonical format**.

### Remotion [stable]

React-based programmatic video. Write components, render to MP4.

```tsx
// MyVideo.tsx
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
export const MyVideo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background:'black', color:'white', opacity}}>Hello</AbsoluteFill>;
};
```
```bash
npx remotion render src/index.ts MyVideo out.mp4 \
  --props='{"title":"Hello"}' --codec=h264 --crf=18
```
- Remotion Lambda: distributed rendering on AWS
- Best for: lower thirds, data viz videos, templated social cuts, branded content

### MoviePy (Python) [stable]

```python
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, concatenate_videoclips
clip = VideoFileClip("in.mp4").subclip(10, 25)
txt = TextClip("BIG IDEA", fontsize=80, color='white', font='Inter-Bold', stroke_color='black', stroke_width=3)
txt = txt.set_position(('center', 'bottom')).set_duration(clip.duration)
final = CompositeVideoClip([clip, txt])
final.write_videofile("out.mp4", codec="libx264", audio_codec="aac")
```
- v2 (2024) is a rewrite — check compatibility
- Good for quick Python scripts, slow at scale

### Auto-Editor [stable]

```bash
# Remove silences from podcast
auto-editor in.mp4 --silent-threshold 0.04 --frame-margin 6 --export premiere

# Export as FCPXML / Final Cut / DaVinci-compatible
auto-editor in.mp4 --export final-cut-pro
```
- Fastest way to strip dead air
- Exports: `premiere`, `final-cut-pro`, `resolve`, `shotcut`, or cut MP4

### Shotstack [stable, hosted]

- Cloud video editing API — JSON edit format, renders MP4
- `POST https://api.shotstack.io/v1/render`
- Good for fully-programmatic templated video without managing FFmpeg

### Creatomate / Bannerbear — similar hosted render APIs, template-driven

---

## 7. Stock Media APIs

### Pexels [free]

- `GET https://api.pexels.com/v1/search?query=mountains&per_page=15&orientation=portrait`
- Header: `Authorization: <API_KEY>`
- Rate: 200/hr, 20K/mo free
- License: free commercial use, **no attribution required** (but appreciated)
- Also: Pexels Videos — `https://api.pexels.com/videos/search`

### Pixabay [free]

- `GET https://pixabay.com/api/?key=KEY&q=mountains&image_type=photo&orientation=vertical`
- Rate: 100 req/60s
- License: Pixabay License (similar to CC0)
- Includes free music/SFX: `https://pixabay.com/api/music/` (limited public API — primarily web scrape)

### Unsplash [free]

- `GET https://api.unsplash.com/search/photos?query=mountain&orientation=portrait`
- Header: `Authorization: Client-ID <ACCESS_KEY>`
- Rate: 50/hr demo, 5000/hr production
- License: Unsplash License — commercial OK, **attribution strongly encouraged**, cannot sell as-is
- MUST trigger download endpoint (`photo.links.download_location`) per API guidelines when using a photo

### Artlist [paid, SaaS]

- No public API; plugin-only (Premiere, FCP, After Effects)
- $9.99-$16.60/mo for unlimited licensed music + stock footage
- Licensing: broad commercial, YouTube, client work

### Epidemic Sound [paid]

- Similar to Artlist, API exists for enterprise
- YouTube monetization-safe

### Uppbeat [freemium]

- Free tier for creators with attribution
- YouTube/TikTok cleared

### YouTube Audio Library

- Free, no API; web-only downloads
- Attribution varies per track

### Storyblocks, Envato Elements — subscription, desktop-focused

### Pond5, Adobe Stock, Shutterstock — per-asset or subscription, APIs exist

### License categories (quick guide)

- **CC0 / Public Domain** — use anything
- **Pexels/Unsplash/Pixabay** — near-CC0 with minor restrictions (no identifiable people without consent, don't resell the raw asset)
- **Royalty-free** — pay once, use forever within license scope
- **Rights-managed** — per-use licensing, more expensive
- **Creative Commons attribution** (CC-BY) — free but must credit

### Matching footage style to tone

- **B-roll for tech/business** — Pexels "office", "typing", "meeting" — avoid overused clichés (stopwatch, handshake)
- **Abstract / emotional** — Unsplash curated collections, Storyblocks "mood" searches
- **Time-lapse / cinematic** — Artlist, Pond5 4K
- Heuristic: if 3+ competitors use it, skip it. Look for second-page results.

---

## 8. Platform Specifications (2026)

### TikTok

- **Aspect**: 9:16 (1080x1920)
- **Length**: 3s min, 60min max (most perform <60s)
- **Ideal**: 21-34s for maximum completion rate
- **Format**: MP4, MOV. H.264/H.265. <500MB upload, <10GB for longer
- **Audio**: AAC, 128+ kbps
- **Captions**: burn-in highly recommended (most viewers scroll with sound off briefly)
- **Hashtags**: 3-5 mid-specificity (avoid #fyp #viral spam; use niche tags)
- **Cover**: 1080x1920, readable text

### YouTube Shorts

- **Aspect**: 9:16 (1080x1920), or 1:1 (works as Short)
- **Length**: ≤180s (3 min, since Oct 2024)
- **Ideal**: 15-40s
- **Format**: same as TikTok; `#Shorts` in title/description helps
- **Thumbnail**: custom unavailable for Shorts — first frame matters
- **Discovery**: hook in first 1-2s (YouTube measures swipe-away rate)

### Instagram Reels / Feed / Stories

- **Reels**: 9:16, 1080x1920, ≤90s standard (3 min allowed, ≤15min if linked from feed), MP4
- **Feed video**: 1:1 or 4:5 recommended (4:5 takes most screen), ≤60min
- **Stories**: 9:16, ≤60s per story, 24hr ephemeral
- **Feed image**: 1080x1080 (1:1), 1080x1350 (4:5)
- **Captions**: 2200 char limit; first 125 chars visible before "more"
- **Hashtags**: up to 30, ideal 3-10 niche tags (2024+ algorithm deprioritizes hashtag spam)

### YouTube Long-Form

- **Aspect**: 16:9 (1920x1080 or 3840x2160)
- **Length**: no hard cap (15min for unverified), 12hr/256GB for verified
- **Ideal**: 8-15 min for new channels, 15-25min for established
- **Format**: MP4 (H.264 High, AAC-LC 384kbps, 48kHz)
- **Thumbnail**: 1280x720, <2MB, JPG/PNG, text-readable at 320x180
- **Titles**: ≤60 char (100 hard cap); front-load keywords
- **Chapters**: `00:00` start, min 3 chapters, min 10s each
- **End screen**: last 5-20s; 1-4 elements

### LinkedIn

- **Native video**: 1:1 or 9:16 (vertical now favored, 2024+), 3s-10min, max 5GB, MP4
- **Document post** (carousel): 10 page PDF, 1:1 or 4:5; strong engagement driver
- **Article** (long-form): ≤125K chars, embedded images
- **Feed image**: 1200x1200 or 1080x1350
- **Caption**: 3000 char, first 210 before "see more"
- **Hashtags**: 3-5 max (LinkedIn deprioritizes >5)

### X / Twitter

- **Video**: 16:9 or 9:16, ≤2:20 (free), ≤3hr (Premium)
- **Image**: 1600x900 (16:9) or 1:1
- **Thread**: 280 char/post (free), 25K (Premium)
- **Best-performing video specs**: MP4 H.264, 1280x720+, 40Mbps

### Substack / Newsletter

- **Format**: web + email; images auto-optimize
- **Hero image**: 1456x816 recommended (16:9-ish for social unfurls)
- **Length**: 800-2000 words typical; 5-10 min read optimal
- **Frequency**: consistency > quantity

### Blog / Medium

- **Hero image**: 1500x844 (16:9 for social unfurls, OG card)
- **SEO title**: ≤60 char, front-load keyword
- **Meta description**: 150-160 char
- **Ideal length**: 1200-2500 words for ranking; Medium favors 7-min reads (~1750 words)

### Quick reference table

| Platform | Ratio | Ideal len | Max len | Resolution |
|---|---|---|---|---|
| TikTok | 9:16 | 21-34s | 60min | 1080x1920 |
| YT Shorts | 9:16 | 15-40s | 3min | 1080x1920 |
| IG Reels | 9:16 | 15-60s | 90s | 1080x1920 |
| IG Feed | 4:5 | - | 60min | 1080x1350 |
| LinkedIn | 1:1 or 9:16 | 30-90s | 10min | 1080x1080 |
| X video | 16:9 | 30-60s | 2:20 / 3hr | 1280x720 |
| YouTube | 16:9 | 8-15min | 12hr | 1920x1080 |

---

## 9. Captions & Subtitles

### SRT structure

```
1
00:00:00,000 --> 00:00:02,500
Welcome to the show.

2
00:00:02,500 --> 00:00:05,800
Today we're talking about
content automation.
```

- Comma as decimal separator (NOT dot)
- Blank line between cues
- UTF-8, no BOM

### VTT structure

```
WEBVTT

00:00:00.000 --> 00:00:02.500 line:90% align:center
Welcome to the show.

00:00:02.500 --> 00:00:05.800
Today we're talking about
<c.yellow>content automation</c>.
```

- Dot as decimal separator
- Header `WEBVTT` required
- Supports positioning, styling, speakers (`<v Joe>Hello</v>`)

### Auto-generation

| Tool | Quality | Speed | Cost |
|---|---|---|---|
| Whisper-1 | Good | 2-5x realtime | $0.006/min |
| gpt-4o-transcribe | Better | 3-5x | $0.006/min |
| AssemblyAI Best | Best | 10x | $0.011/min |
| YouTube auto-captions | Decent | Free | Free |
| Rev (human) | Best | 12-24hr | $1.50/min |

### Burn-in vs soft

- **Burn-in**: always visible, styled. Use for: social shorts (TikTok/Reels/Shorts), fallback when platform won't show SRT, styled word-by-word animations.
- **Soft subs**: separate `.srt`, viewer can toggle. Use for: YouTube long-form, Vimeo, accessibility, translations (one video + many SRTs).
- **Both** — you can have burn-in for style and soft for accessibility/translation (YouTube auto-detects English from burn-ins but CC is still best-practice).

### Style best practices

- **Font**: Inter, Montserrat, Avenir, SF Pro — sans-serif, heavy weight, wide letter spacing
- **Size**: 24-32px base for 1080p (larger for 9:16 mobile reading)
- **Position**: lower-third baseline (avoids UI chrome at bottom of IG/TT)
- **Words/line**: 3-7 words per line, 1-2 lines max
- **Reading speed**: 160-180 WPM optimal, ≤200 WPM max
- **Cue duration**: min 1s, max 7s
- **Contrast**: black outline 2-3px OR 80% opacity dark box behind text
- **Casing**: Title Case for hook captions; Sentence case for narration

### Caption-styling tools (viral short format)

- **Submagic** — word-by-word highlighting, emoji auto-insert, trending templates ($16-80/mo)
- **Captions.ai** — iOS-first, AI voice + captions in one pipeline
- **Zeemo** — template library, browser-based
- **Veed.io** — full editor, good caption UI
- **Kapwing** — collaborative, templates
- **CapCut** — free, includes Auto Captions

All export as MP4 (burn-in) or SRT (download).

---

## 10. Thumbnail Design

### Principles (MrBeast-validated)

1. **One face, one emotion** — shock, confusion, triumph. Eyes visible. 30-50% of canvas.
2. **High contrast** — Color-Focus-Contrast rule. Subject pops off background.
3. **≤3 elements** — face + object + 2-3 words. Cluttered = skipped.
4. **Curiosity gap** — don't give the answer; hint at the payoff
5. **Readable at 320x180** — check on phone before publishing
6. **Pattern break** — different from your channel's recent thumbnails AND from competitors in the recommended feed

### Tools

- **Canva** — templates, fast, Pro has Magic Resize. API: Connect API (enterprise).
- **Figma** — precise, component-based brand templates. API: REST API + plugins.
- **Photoshop** — heavy-lift, best for photo compositing. Generative Fill (2023+) for background extension.
- **DALL-E 3 / Midjourney / Flux** — generate base subjects/backgrounds
- **Photoroom, remove.bg** — subject cutouts (`https://api.remove.bg/v1.0/removebg`)
- **thumbnail.ai, Pebblely** — AI thumbnail generators

### A/B testing

- **YouTube's built-in Test & Compare** (2024+) — native A/B/C test up to 3 thumbnails, auto-winner by watch-time
- **TubeBuddy A/B** — pre-native; still useful for smaller channels
- **Thumbsup** — crowd-sourced voting
- **Spotter Studio / Creator Hooks** — channel trend analysis, thumbnail intelligence

### Testing protocol

1. Generate 3 variants with different emotional registers (e.g., happy / confused / shocked)
2. Same title across all
3. Minimum 2000 impressions per variant
4. Metric: click-through rate (CTR) for discovery, watch-time for post-click
5. Log results; build style library of winners

---

## 11. Script & Hook Frameworks

### Hook formulas

- **3-second rule** — viewer decides in 3s whether to stay. First frame + first words must promise a payoff.
- **Curiosity gap** — "I didn't expect this when I tried X..." Don't answer the question in the hook.
- **Pattern interrupt** — visual (rapid cut, unusual angle) or verbal (contradictory claim) that breaks the viewer's scrolling rhythm.
- **Negation hook** — "Don't buy a DSLR until you see this."
- **Listicle promise** — "3 things nobody tells you about..."
- **Contrarian take** — "Everyone's wrong about X."
- **Question hook** — "What would you do if...?"

### Hook templates

- "If you [desirable outcome], you need to know this."
- "I spent [N] hours/dollars testing [thing] so you don't have to."
- "[Expert/authority] told me [surprising claim]."
- "Here's why [common belief] is a lie."
- "The [adjective] way to [outcome] in [short time]."
- "Stop [common action]. Do this instead."

### Narrative structures

**AIDA** (marketing classic)
- **A**ttention — hook
- **I**nterest — expand the problem
- **D**esire — show the solution + benefit
- **A**ction — CTA

**PAS** (fastest-converting for short-form)
- **P**roblem — name the pain
- **A**gitate — make them feel it
- **S**olution — reveal the fix

**Hero's Journey** (long-form YouTube, documentaries)
- Ordinary world → Call → Refusal → Mentor → Trials → Transformation → Return

**StoryBrand (Donald Miller)** — the viewer is the hero, you are the guide
1. A character (viewer)
2. has a problem (hook)
3. meets a guide (you)
4. who gives them a plan
5. and calls them to action
6. that ends in success / avoids failure

**The Jimmy Donaldson (MrBeast) Retention Framework**
- Every ~40-60s must have a new promise, a new element, or a visual reset
- Open loops: tease a payoff, deliver later
- Ramping stakes: each segment > previous

### Platform scripting patterns

**TikTok / Reels / Shorts**
- 0:00-0:02: hook (visual + verbal)
- 0:02-0:05: context
- 0:05-0:20: beats with visual changes every 1-2s
- 0:20+: payoff + loop back to hook
- Cut EVERY time the speaker takes a breath
- Written: plain spoken language, short sentences, one idea per sentence

**YouTube long-form**
- 0:00-0:15: hook + promise + preview (what they'll learn)
- 0:15-0:30: brief credibility / "why me"
- 0:30-0:45: entry point to main content
- Beats every 45-90s — visual change, b-roll, graphic
- Last 20-30s: CTA + end screen setup

**Twitter / LinkedIn (text)**
- Line 1: hook (appears in preview)
- Line 2: blank
- Line 3-N: one idea per line, short lines
- Bullet lists, numbered lists — scannable
- End with CTA or question

### Viral structures per platform

- **TikTok**: trend-sound + unique angle, loop-friendly ending
- **Reels**: sharp hook, dense value, tagging relevant accounts
- **Shorts**: title-as-hook strategy (since Shorts show title), first-second grab
- **LinkedIn**: contrarian take + personal story + lesson + CTA
- **X**: strong first tweet, thread delivers promised content, final tweet = CTA/summary

---

## 12. Repurposing & Multi-format

### The canonical chain: Podcast → everything

Given 1 podcast episode (audio):

1. **Transcribe** → Whisper / AssemblyAI → transcript.srt + transcript.json
2. **Segment** → LLM identifies 8-15 self-contained "moments" with timestamps
3. **Blog post** → LLM condenses transcript into 1500-word article with H2s matching segments
4. **Show notes** → timestamped links + guest bio + mentioned resources
5. **Newsletter** → 300-word TL;DR + one pull quote + CTA
6. **3-5 clips** → for each identified moment: cut with FFmpeg, reframe 9:16, burn captions
7. **Quote graphics** → 3-6 pull-quotes rendered as 1:1 images (Remotion / Canva)
8. **Twitter/LinkedIn thread** → top insights as 7-10 posts
9. **YouTube version** → full video (if video recording exists) + chapters generated from segments

### Dedicated tools

**Castmagic** — automated show-notes, clips, social posts from audio upload
- $23-$119/mo
- Features: transcription, chapters, show notes, blog, clips, tweets, newsletter

**Podcastle** — recording + AI post-production + Magic Dust (silence/filler removal) + clip generation
- $14.99-$29.99/mo

**Riverside Magic Clips** — auto-clip extraction from Riverside recordings, speaker-focus reframe
- Built into Riverside $15+ plans

**Transistor / Buzzsprout / Spotify for Podcasters** — hosting + basic analytics

**Detail.co** — iPhone-based recording with AI editing, multicam

### Chain-of-content patterns

- **Pillar → clusters**: 1 long-form piece → 20+ derivatives (SEO backbone)
- **Atomic essay → thread → long-form**: test short, expand what hits
- **Episode → themed week**: 1 podcast → 5 daily derived posts, one medium per day
- **Evergreen cycling**: re-cut old content with new angles every 6 months

### Template prompt for repurposing (LLM)

```
Given this transcript, output:
1. 5 quote candidates (each <20 words, standalone, emotionally resonant)
2. 3 clip candidates with start/end timestamps, each 30-60s, each with a 1-line hook
3. 1 LinkedIn post (120-180 words, contrarian angle)
4. 1 X thread (6-8 tweets, 260 chars each max)
5. 1 newsletter intro (150 words, benefit-driven)
6. 1 blog outline (H2s + 2-bullet each)
```

---

## 13. Performance Analytics

### Native platform analytics

**YouTube Studio**
- Retention graph (absolute + relative) — where viewers drop
- CTR — thumbnail performance; benchmark 4-10%
- Average view duration / AVD%
- Impressions → CTR → AVD → engagement → subs funnel
- YouTube Analytics API: `youtubeAnalytics.reports.query` (Google Cloud)

**TikTok Analytics** (creator account)
- Retention by second (detail view)
- Traffic source breakdown (FYP, following, search, profile)
- Average watch time, full watch rate
- Audience demographics, active hours
- TikTok API for Business

**Instagram Insights**
- Reach, impressions, plays, replays
- Interactions: likes, comments, shares, saves (save = strongest signal)
- Follows from reel, profile visits
- Graph API v19+

**LinkedIn**
- Impressions, clicks, reactions, comments, reshares
- Follower demographics
- Post performance over 1/7/28 days

**X Analytics**
- Impressions, engagements, engagement rate, profile visits, link clicks
- Premium: detailed video analytics, top-performing tweets

### Cross-platform tools

- **Metricool** — schedule + analytics across 8+ platforms, $22+/mo
- **Sprout Social** — enterprise, heavy
- **Buffer** — lighter, founder-favorite; scheduling-first
- **Later** — Instagram-heavy, visual calendar
- **Hootsuite** — legacy, broad
- **TubeBuddy / vidIQ** — YouTube-specialist, keyword + competitor analysis
- **Exolyt** — TikTok intelligence

### Reading retention graphs

- **Initial cliff** (0-30s): hook strength. >60% remaining at 30s = healthy.
- **Sawtooth pattern**: viewers skipping ahead (can be good — anticipation) or rewinding (ambiguous chapter).
- **Smooth decay**: ideal. ~3-5% drop per minute is excellent.
- **Flat then cliff**: one segment killed the video. Check what's there.
- **Compare** relative retention vs. benchmark (YouTube shows it).

### A/B hook testing protocol

1. Record 3 hook variants (same content, different cold opens)
2. Upload to 3 identical accounts (or use YouTube's A/B test)
3. Equal promotion (same captions, same time, same hashtags)
4. Measure after 48hr: view-through at 3s, 10s, 30s
5. Winner framework: highest 30s retention + highest CTR
6. Log to hook library — tag with emotional register

### Key metrics by goal

| Goal | Watch | Secondary |
|---|---|---|
| Growth | Reach, new followers | CTR |
| Engagement | Comments, shares | Save rate |
| Monetization | RPM, CPM | Sponsor CPM |
| Sales | Link clicks, conversion | Attribution revenue |

---

## 14. Open-Source Content Creator Agents & Pipelines

### Key repos worth studying

- **ShortGPT** (RayVentura/ShortGPT) — "experimental AI framework for automated short/video content creation" — GPT script + ElevenLabs voice + stock footage + caption burn + auto-upload. ~6K stars. Teaches: end-to-end short creation skeleton.
- **AutoShorts.ai / auto-shorts** (several forks) — "faceless videos" pipeline: Reddit/AITA posts → TTS → Minecraft parkour background → captions.
- **MoneyPrinterV2** (FujiwaraChoki) — YouTube Shorts generation, scheduling, topic research. Teaches: skill composition (`generate_script → generate_audio → generate_video → upload`).
- **Video-Subtitle-Master** — batch transcription + translation
- **whisperX** (m-bain) — Whisper + forced phoneme alignment + diarization. Teaches: how to chain transcription + diarization.
- **Remotion examples** — react-video templates for programmatic branded video
- **faceless-video-generator** — template repo; minimal viable pipeline
- **LLaVA-Video / Video-ChatGPT** — video understanding models (scene/shot analysis)
- **deeptube** — YouTube auto-poster with metadata optimization
- **open-interpreter** — general code-exec agent; useful pattern for giving the agent FFmpeg access safely

### Lessons from these projects

1. **Skill composition > monolith**: best pipelines chain small, testable steps (transcribe → segment → cut → caption → render → upload).
2. **File-system as interface**: intermediate `.srt`, `.json`, `.mp4` on disk lets any step be swapped.
3. **Config over code**: template videos as JSON/YAML configs (Remotion, Shotstack pattern).
4. **Rate limits are the real constraint**: ElevenLabs, OpenAI, Runway all have per-minute caps. Queue + retry is mandatory.
5. **Watermarks & ToS**: most free-tier Runway/Kling/Sora outputs have watermarks. Plan around.
6. **Quality floors**: generated voice can be spotted; branded human voice > cloned voice for trust.

### Anti-patterns to avoid

- "One giant prompt does everything" — brittle, impossible to debug
- Skipping transcript verification — hallucinated segments break downstream edits
- Hardcoding aspect ratios — every platform changes specs; keep it configurable
- No human review gate — creator agents that autopost without approval damage reputation fast

---

## 15. Creator-Specific Agent Skills — Proposal

### Base Skills (12)

These should ship with every Creator agent. Each teaches a concept and is directly useful.

1. **capture** — Ingest a source (URL, file upload, paste) and canonicalize to `source.{mp3,mp4,txt}` in working memory. *Rationale: every pipeline starts with a source; without a normalized input, nothing else works.*

2. **transcribe** — Convert audio/video → transcript.srt + transcript.json with word-level timestamps and speaker labels. *Rationale: text is the substrate for every downstream decision; timestamps unlock precise cuts.*

3. **segment** — Cluster transcript into semantically coherent segments (hook, beats, payoff); tag each with topic, emotion, quotability score. *Rationale: segments are the atomic unit the editor operates on.*

4. **script** — Generate or rewrite a script given an intent, style, and platform. Supports frameworks (AIDA, PAS, StoryBrand). *Rationale: words come first; the script is the blueprint for every other asset.*

5. **voice** — Synthesize audio from a script with a chosen voice profile (ElevenLabs / OpenAI TTS / Cartesia). *Rationale: narration is the cheapest, fastest way to go from script to video asset.*

6. **image** — Generate images for thumbnails, b-roll, quote graphics, hero images. Abstracts over DALL-E / Flux / Midjourney-proxy / SDXL. *Rationale: visuals are the second pillar; one skill handles all visual generation needs.*

7. **video** — Generate short video clips (text-to-video or image-to-video) via Runway / Kling / Luma / Veo. *Rationale: AI video is the highest-leverage new capability; abstracting providers future-proofs the agent.*

8. **edit** — Cut, concatenate, reframe, normalize loudness, and render. FFmpeg + MoviePy under the hood. *Rationale: the core craft of video production; every output passes through here.*

9. **caption** — Generate styled SRT/VTT from transcript or fresh audio; optionally burn-in with platform-appropriate styling. *Rationale: captions are non-negotiable for social reach; should never be a manual step.*

10. **thumbnail** — Design a thumbnail: auto-generate face-centered composition, brand colors, readable text. *Rationale: on YouTube especially, the thumbnail does half the work of the video.*

11. **publish** — Push to YouTube / TikTok / IG / LinkedIn / X with platform-specific metadata (title, description, hashtags, chapters, first-comment link). *Rationale: if the agent doesn't close the loop to the platform, the creator still does all the work.*

12. **analyze** — Pull analytics across platforms, annotate per-post performance, surface retention cliffs and CTR issues. *Rationale: without feedback, the agent can't learn what the creator's audience rewards.*

### Optional base skills (alternates)

13. **research** — Topic mining: competitor scan, trend detection (TikTok trending sounds, YouTube keyword volume). *Rationale: great creators ride existing waves; the agent should surface them.*

14. **schedule** — Calendar-aware publishing queue across platforms. *Rationale: timing is part of the craft; separating from publish lets you batch-produce then drip.*

### Extension Packs (8)

Each pack adds 3-5 specialized skills for a creator archetype or pipeline.

#### Pack: Podcaster
*For creators whose source material is long-form audio conversation.*
- **diarize** — Split transcript by speaker with named labels
- **highlight** — LLM-rank quote candidates by virality heuristics
- **show-notes** — Generate timestamped chapter markers + resource list + guest bio
- **clip-extractor** — Auto-identify 5 best 30-90s moments for social
- **cleanup-audio** — Auphonic-grade leveling, noise removal, EBU R128 normalize

#### Pack: YouTuber (long-form)
*For video-first creators producing 8-20 min content.*
- **hook-lab** — Generate + A/B-test 5 hook variants
- **retention-map** — Overlay retention graph on timeline, identify drop cliffs, propose re-edits
- **chapter** — Auto-generate YouTube chapters from segments
- **end-screen** — Compose last-20s with CTAs, related videos, subscribe prompt
- **seo** — Title, description, tags optimized for YouTube search + CTR

#### Pack: Shorts-Factory
*For high-volume vertical creators (TikTok/Reels/Shorts).*
- **reframe** — Smart 9:16 reframe with face-tracking and recomposition
- **viral-caption** — Word-by-word animated captions with trend-matched style
- **sound-match** — Overlay trending audio with legal-check
- **loop** — Design a loop-friendly end that matches the opening frame
- **variant-spray** — Produce 3-5 versions of the same clip with different hooks/covers for A/B

#### Pack: Newsletter / Writer
*For text-first creators on Substack / Medium / blog.*
- **outline** — Generate hierarchical article outline from a thesis
- **draft** — Write in the creator's established voice (few-shot from past pieces)
- **hero-image** — Generate a hero image matching article tone
- **cross-post** — Reformat article for LinkedIn article, Medium, Substack with platform-specific tweaks
- **pull-quotes** — Extract shareable quotes + render as images

#### Pack: Avatar / Talking-Head
*For creators producing narrated explainer content without filming.*
- **avatar** — Configure and render a HeyGen / Synthesia / D-ID avatar
- **lip-sync** — Post-sync lips to existing footage (Wav2Lip / SadTalker / Hallo)
- **multilingual-dub** — ElevenLabs dubbing with lip-sync for internationalization
- **broll** — Auto-cut B-roll against narration beats

#### Pack: Course / Educator
*For creators teaching structured material.*
- **lesson-plan** — Break a topic into a multi-video curriculum with learning objectives
- **quiz** — Generate checkpoint quizzes from content
- **slide-sync** — Generate slides synchronized to narration timestamps (Marp/Reveal.js)
- **workbook** — Produce downloadable PDF exercises

#### Pack: Brand / B2B
*For creators working with sponsors or producing branded content.*
- **brand-style** — Enforce a brand style guide (colors, fonts, tone) across all assets
- **cta-designer** — Design platform-appropriate CTAs (booking link, lead magnet, pricing)
- **disclosure** — Auto-insert `#ad` / sponsorship disclosure per platform law
- **case-study** — Package a win into a case-study format

#### Pack: Repurpose-Engine
*For creators who record once and want every format.*
- **pillar-to-clusters** — From 1 long-form piece, produce 15+ derivatives
- **atomize** — Extract every shareable atom (quote, stat, insight) as a standalone asset
- **thread** — X / LinkedIn thread from any source
- **carousel** — LinkedIn document / Instagram carousel (10-slide PDF)
- **cycle** — Re-package old hits with new framing on a 6-month cadence

### Autonomy ladder (per skill)

- **Level 1 (draft)**: agent proposes, creator approves before any upload or external API call with cost
- **Level 2 (execute)**: agent runs the pipeline end-to-end, stops at publish
- **Level 3 (post)**: agent posts on approved schedule; flags outliers for review

### What the agent's memory should hold

- **Voice profile** — sample audio, ElevenLabs voice ID, TTS style preferences
- **Style guide** — brand colors, fonts, logo, tone of voice examples
- **Hook library** — prior hooks tagged by performance
- **Caption templates** — styled SRT burn-in presets per platform
- **Audience snapshot** — demographics, active hours, top-performing topics
- **Platform connections** — OAuth tokens, channel IDs
- **Success criteria** — per-platform KPI targets, per-format definition of "good"

### Ladder of tool dependency

Build in this order; each layer assumes the previous:
1. FFmpeg + Whisper.cpp + OpenAI API (can produce anything manually)
2. ElevenLabs + a single image provider (Flux via fal.ai)
3. A video provider (Runway OR Kling OR Luma — one is enough)
4. Publish APIs (start: YouTube + LinkedIn, then IG via Graph, then TikTok via Content Posting API, X last — most rate-limited)
5. Analytics APIs (same order)
6. Advanced: avatar (HeyGen), dubbing, music generation

---

## Appendix: Authentication & rate-limit quick-reference

| Service | Auth | Rate limit (free tier) |
|---|---|---|
| OpenAI | Bearer | 500 RPM text, 50 RPM images (Tier 1) |
| ElevenLabs | `xi-api-key` header | 2 concurrent, 10K char/mo (Starter) |
| Runway | Bearer (dev API) | Credits-based |
| Anthropic | `x-api-key` header | 50 RPM (Tier 1) |
| Replicate | Bearer | 600/min |
| fal.ai | `Key <key>` header | Credit-based |
| Pexels | `Authorization: KEY` | 200/hr |
| Unsplash | `Client-ID KEY` | 50/hr demo, 5000/hr prod |
| YouTube Data | OAuth 2 | 10K units/day |
| YouTube Analytics | OAuth 2 | same pool |
| TikTok Content Posting | OAuth 2 | ~6 posts/day/user |
| LinkedIn | OAuth 2 | varies by endpoint |
| Meta Graph (IG) | OAuth 2 | 200 calls/hr/user |
| X API | OAuth 2 / Bearer | Free: 500 reads, 100 writes/mo |

---

## Appendix: Honest limitations (as of 2026-04)

- **Midjourney**: no official API. Any "API" you find is scraping Discord. Build around this — use Flux or SDXL for programmatic image needs.
- **CapCut**: no API. Any automation is desktop scripting.
- **Sora**: no public API for third-party apps. Limited to ChatGPT Plus/Pro.
- **TikTok Content Posting API**: requires app review, limited to "Direct Post" for approved partners; "Upload" endpoint works for unlisted drafts.
- **Suno/Udio**: no official APIs. Unofficial wrappers violate ToS and may be shut off.
- **Instagram**: can only post via Graph API through a Business account linked to a Facebook Page. Personal accounts: no posting API.
- **AI video providers churn fast**: Runway, Kling, Luma, Veo all shipped major updates in 2025; pricing and endpoints will shift. Wrap providers behind a stable interface.
- **Watermarks**: Runway, Kling, Pika, Luma all watermark free-tier outputs. Plan for paid tiers or live with them.
- **Copyright**: generated music + voice have unclear-to-evolving case law. For commercial use, stick to providers that offer indemnification (ElevenLabs enterprise, Adobe Firefly, OpenAI business).

---

*End of research. This document should be treated as a snapshot — AI tooling velocity requires quarterly refresh. Re-run the research pass every 3 months.*
