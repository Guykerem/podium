# Tool Landscape Overview

The generative AI + editing toolchain the creator agent operates. Use this file to pick the right tool for the right job.

**Maturity tags**: **[stable]** = reliable, well-documented, predictable. **[moving]** = changing fast, re-check quarterly. **[unstable/no-API]** = no official API or fragile integration.

Full details in `../../RESEARCH.md`. This file is the cheat sheet.

## Transcription

| Tool | Use when | Maturity |
|---|---|---|
| **Whisper API** (`whisper-1`, `gpt-4o-transcribe`) | Default; cheap; verbose JSON w/ word timestamps | stable |
| **whisper.cpp** (local) | Offline, privacy-sensitive, free | stable |
| **AssemblyAI** | Best-in-class diarization (multi-speaker) | stable |
| **Deepgram Nova-3** | Streaming / realtime | stable |
| **WhisperX** (Replicate) | Forced alignment + diarization | stable |

## Image Generation

| Tool | Use when | Maturity |
|---|---|---|
| **DALL-E 3 / gpt-image-1** | Conceptual, natural-language prompts | stable |
| **Flux Schnell** (fal.ai) | Fast iteration, low cost | stable |
| **Flux Pro 1.1 Ultra** (fal.ai) | Flagship quality, API-only | stable |
| **Flux Kontext** (fal.ai) | Instruction-based edits | stable |
| **Midjourney V7** | Best aesthetic | unstable/no-API |
| **SDXL / SD3.5** (ComfyUI/Auto1111) | Local, free, LoRA ecosystem | stable |
| **Ideogram V2** | Text rendering in images (posters, logos) | stable |
| **Recraft** | Vector output (SVG), brand-style lock | stable |
| **Imagen 3/4** (Vertex AI) | Photorealism | stable |

## Image Editing / Upscaling

| Tool | Use when | Maturity |
|---|---|---|
| **Flux Kontext** | Instruction-based edits (best) | stable |
| **remove.bg / Photoroom / rembg** | Background removal | stable |
| **Real-ESRGAN** | Free upscale, local, fidelity-preserving | stable |
| **Magnific** (Freepik API) | Creative upscale (hallucinates detail) | stable |
| **Topaz Photo AI** (desktop CLI) | High-quality preservation upscale | stable |
| **SUPIR** | SOTA open upscale (GPU-heavy) | moving |

## Video Generation

| Tool | Use when | Maturity |
|---|---|---|
| **Runway Gen-4** | Image-to-video, video-to-video | moving |
| **Kling 2.0** | Realistic motion (esp. human) | moving |
| **Luma Dream Machine (Ray-2)** | Keyframe-based, smooth camera | moving |
| **Veo 3** | Text-to-video with native audio | moving |
| **Sora (Turbo)** | In ChatGPT Pro; no public API | moving (limited) |
| **HeyGen** | Avatar video (photo → presenter) | stable |
| **Synthesia** | Enterprise avatar video | stable |
| **D-ID** | Cheap talking-photo | stable |

## Voice / Audio

| Tool | Use when | Maturity |
|---|---|---|
| **ElevenLabs Multilingual v2** | Default TTS + voice clone + dubbing | stable |
| **ElevenLabs Turbo 2.5** | Low-latency TTS | stable |
| **ElevenLabs v3 (alpha)** | Expressive tags (`[laughs]`) | moving |
| **OpenAI gpt-4o-mini-tts** | Cheap + steerable via `instructions` | stable |
| **Cartesia Sonic** | Lowest latency (conversational agents) | moving |
| **PlayHT Play 3.0** | Alternative voice clone | stable |
| **Resemble AI** | Voice clone + localize + deepfake detect | stable |
| **Suno / Udio** | Music generation (no official API) | moving/unstable |
| **Stable Audio 2.0** | Music generation via API | stable |
| **Adobe Podcast Enhance** | Speech cleanup | stable |
| **Auphonic** | Podcast leveling, EBU R128 | stable |

## Editing / Assembly

| Tool | Use when | Maturity |
|---|---|---|
| **FFmpeg 6+** | Foundation — everything | stable |
| **Auto-Editor** | Silence / filler removal, FCPXML export | stable |
| **Descript** | Text-based video editing, Overdub | stable |
| **Remotion** | React-based programmatic video | stable |
| **MoviePy** | Python scripting | stable |
| **OpenTimelineIO** | Canonical edit-handoff format | stable |
| **Shotstack** | Cloud JSON → MP4 rendering API | stable |
| **CapCut** | No official API | unstable/no-API |
| **OpusClip / Vizard / Munch** | AI clip extraction from long-form | stable |

## Stock Media

See `../licensing/overview.md` — Pexels, Pixabay, Unsplash (free); Artlist, Epidemic Sound, Storyblocks (paid).

## Decision patterns

### "I need a hero image"
- Natural-language prompt + fast iteration → **Flux Schnell**
- Text inside image (poster, quote) → **Ideogram**
- Match brand style exactly → **Recraft** or **SDXL + LoRA**
- Want specific aesthetic from reference → **Midjourney** (via user) or **Flux sref**
- Hero-quality, one-shot → **Flux Pro 1.1 Ultra** or **DALL-E HD**

### "I need to make a short video"
- From raw long footage → **FFmpeg** + `reframe-vertical`
- From a script, no filmed source → **HeyGen** avatar + `edit-video`
- From text only, moody b-roll → **Runway Gen-4** or **Kling**
- Templated branded piece → **Remotion**

### "I need to transcribe this"
- English, reliable, cheap → **Whisper API**
- Offline / privacy → **whisper.cpp** locally
- Multi-speaker → **AssemblyAI**
- Streaming / live → **Deepgram Nova-3**

### "I need voice"
- Default → **ElevenLabs Multilingual v2** (creator's clone)
- Cheap / quick → **OpenAI gpt-4o-mini-tts**
- Lowest latency → **Cartesia Sonic**
- Multi-language dub → **ElevenLabs Dubbing API**

### "I need captions"
- Static burn-in → **FFmpeg `subtitles=` filter** + SRT
- Word-by-word animated → **Remotion** or **Submagic** (hosted)
- Soft for accessibility → emit **SRT + VTT**, let platform render

## Cost tiers (rough, per-asset)

| Range | What it buys |
|---|---|
| Free | whisper.cpp, FFmpeg, Pexels/Pixabay/Unsplash, Real-ESRGAN, SDXL local |
| $0.001-$0.01 | Flux Schnell, OpenAI TTS mini, DALL-E standard |
| $0.01-$0.10 | DALL-E HD, Flux Pro Ultra, Ideogram, Whisper API |
| $0.10-$1 | ElevenLabs full episode, AI video (Runway/Kling/Luma) per clip, upscales |
| $1-$10 | Full video generation, long podcast transcription (AssemblyAI) |

## Honest limitations (2026-04)

- **Midjourney**: no official API. Route to Flux or Ideogram for programmatic needs.
- **CapCut**: no API. Desktop automation only.
- **Sora**: no public third-party API.
- **Suno / Udio**: no official APIs; unofficial wrappers violate ToS.
- **IG personal accounts**: cannot post via API.
- **Kling / Runway / Veo / Luma**: pricing + endpoints shift monthly. Wrap providers.
- **Watermarks**: most free-tier AI video has them. Plan for paid tiers or accept them.

## How to use this file

- Before calling any skill that needs a tool, check this file for the right provider
- Per-creator preferences override these defaults (stored in `memory/tool-preferences/`)
- Re-read `../../RESEARCH.md` quarterly; update this file as landscape shifts
