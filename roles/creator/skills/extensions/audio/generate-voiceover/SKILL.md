---
name: generate-voiceover
description: Synthesize narration from a script using ElevenLabs, OpenAI TTS, Cartesia, or a cloned voice
when_to_use: >
  User has a script but doesn't want to record their own voice, or wants to
  generate in their cloned voice for scale, or needs a non-English dub.
  Always flags AI-generated audio for disclosure policy.
tier: extension
---

# Generate Voiceover

Script → audio, using TTS or a voice clone.

## Purpose

- **Scale narration** — faceless / explainer / tutorial content
- **Clone the creator's voice** for multi-language versions
- **Prototype** a script before the creator records properly
- **Multilingual dubbing** — see `multilingual-dub` in the avatar pack for full video dubs

Always flag AI-generated audio. Never deceive the listener.

## How It Works

1. **Load voice profile** — From `memory/creative-style/voices.yaml`:
   ```yaml
   primary:
     provider: elevenlabs
     voice_id: "21m00Tcm4TlvDq8ikWAM"
     model: "eleven_turbo_v2_5"
     settings: {stability: 0.5, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true}
     label: "Creator clone — main narration"
     ai_disclosure_required: true
   backup_openai:
     provider: openai
     model: "gpt-4o-mini-tts"
     voice: "nova"
     instructions: "warm, curious, mid-tempo"
   ```
2. **Clean script for TTS** — Remove stage directions (`[VISUAL:]`, `[CUT]`). Expand abbreviations ("FFmpeg" → "F.F.mpeg" if the model stumbles). Add SSML / pause markers:
   ```
   Hello there. <break time="400ms"/> Today we're talking about...
   ```
3. **Generate**:

   **ElevenLabs** (preferred for expressive):
   ```bash
   curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" \
     -H "xi-api-key: $EL_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "...",
       "model_id": "eleven_turbo_v2_5",
       "voice_settings": {"stability":0.5,"similarity_boost":0.75,"style":0.0,"use_speaker_boost":true}
     }' --output vo.mp3
   ```

   **ElevenLabs v3 expressive tags** (alpha):
   ```
   Hey [laughs] you're not going to believe this. [whispers] It worked.
   ```

   **OpenAI TTS** (cheap, decent):
   ```bash
   curl https://api.openai.com/v1/audio/speech \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4o-mini-tts","input":"...","voice":"nova","response_format":"mp3","speed":1.0,"instructions":"warm, curious"}' \
     --output vo.mp3
   ```

   **Cartesia Sonic** (lowest latency):
   ```bash
   curl -X POST "https://api.cartesia.ai/tts/bytes" \
     -H "X-API-Key: $CARTESIA_KEY" \
     -H "Content-Type: application/json" \
     -H "Cartesia-Version: 2024-06-30" \
     -d '{"model_id":"sonic","transcript":"...","voice":{"mode":"id","id":"..."},"output_format":{"container":"mp3","encoding":"mp3","sample_rate":44100}}'
   ```

4. **Chunk long scripts** — ElevenLabs has a per-call character cap (varies by plan). Split at paragraph boundaries; stitch:
   ```bash
   ffmpeg -f concat -safe 0 -i list.txt -c copy narration.mp3
   ```

5. **Timing alignment** — If you need word-level timestamps for animated captions, run the generated audio back through `transcribe-media` (Whisper handles TTS-generated audio trivially).

6. **Post-process**:
   - Normalize to -16 LUFS for podcast, -14 for YouTube
   - Remove any front/back silence
   - Subtle compression (ratio 2:1, threshold -18 dB) for consistency:
     ```bash
     ffmpeg -i vo.mp3 -af "acompressor=threshold=-18dB:ratio=2:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11" vo.processed.mp3
     ```

7. **Tag metadata** with AI disclosure:
   ```yaml
   # vo.meta.yaml
   file: vo.processed.mp3
   provider: elevenlabs
   voice_id: ...
   ai_generated: true
   disclosure_required: true
   cost_usd: 0.82
   duration_sec: 47.3
   script_hash: sha256:...
   ```

## Voice cloning setup

**ElevenLabs Instant Clone** (1 min sample):
```bash
curl -X POST "https://api.elevenlabs.io/v1/voices/add" \
  -H "xi-api-key: $EL_KEY" \
  -F "name=Creator Clone" \
  -F "files=@sample.mp3"
```
Returns `voice_id`. Store in `memory/creative-style/voices.yaml`.

**Professional Clone** — 30+ min of audio, higher fidelity, requires Pro plan. Setup guide ship separately; agent never uploads cloning samples without explicit confirmation.

## Provider comparison

| Provider | Quality | Latency | Expressive | Cost |
|---|---|---|---|---|
| ElevenLabs Turbo 2.5 | great | low | medium | $ |
| ElevenLabs Multilingual v2 | best | medium | best | $$ |
| ElevenLabs v3 (alpha) | great | medium | best (tags) | $$ |
| OpenAI gpt-4o-mini-tts | good | low | medium (instructions) | cheap |
| OpenAI tts-1-hd | good | medium | low | $ |
| Cartesia Sonic | good | lowest | medium | $ |
| PlayHT Play 3.0 | good | low | medium | $ |

## Autonomy behavior

- **L1** — Generate one preview (first 10s), get approval on voice choice before full render.
- **L2** — Use voice of record. Generate full. Present for QA listen.
- **L3** — Full generate + post-process + pipeline-integrate. Creator reviews final output.

Voice cloning setup is ALWAYS explicit action by the creator, never auto.

## Integration

- Input: `script.md` (cleaned), voice profile
- Composes **act** (TTS API) + **remember** (voice library, disclosure metadata)
- Downstream: `mix-podcast` (combine with music bed), `edit-video` (as audio track), `multilingual-dub` (avatar pack)
- Upstream: `write-script`

## Failure modes

- **AI voice detectable** — stick to ElevenLabs Multilingual v2 at stability 0.4-0.6; use expressive tags (v3) for realism; accept that some listeners will spot it
- **Mispronunciation** — provide phonetic spelling in SSML (`<phoneme alphabet="ipa" ph="...">word</phoneme>`) or rewrite the offending word
- **Flat delivery** — lower stability (more variance), add `[laughs]` / `[sighs]` (v3), break script into emotional beats and generate in pieces
- **Cost spike on long scripts** — estimate before generating (script chars × $ per 1K); cap at configured budget
