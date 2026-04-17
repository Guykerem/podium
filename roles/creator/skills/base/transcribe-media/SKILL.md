---
name: transcribe-media
description: Transcribe audio or video into timestamped text with speaker labels and flagged quotable moments
when_to_use: >
  Any capture that contains speech — voice memos, podcast recordings, video
  interviews, Zoom calls, screen recordings with narration. Also invoked as a
  subroutine by write-script, segment-transcript, caption-video, clip-extractor.
tier: base
---

# Transcribe Media

Text is the substrate of every downstream decision. This skill turns any speech into a precise, timestamped, searchable transcript.

## Purpose

A good transcript unlocks:
- **Cutting** — frame-accurate clip extraction
- **Captions** — SRT/VTT generation without re-processing
- **Scripting** — editing the script by editing the text (Descript pattern)
- **Segmenting** — finding moments, quotes, chapters
- **Search** — full-text recall across the creator's archive

A bad transcript poisons everything downstream. Invest here.

## How It Works

1. **Detect input** — Accept `.mp3 .mp4 .wav .m4a .webm .mov`. If video, extract audio-only stream.
2. **Normalize for STT** — Convert to 16kHz mono WAV (optimal for Whisper):
   ```bash
   ffmpeg -i source.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav
   ```
3. **Chunk if needed** — OpenAI Whisper API has a 25 MB cap. For longer files, split at silence boundaries:
   ```bash
   ffmpeg -i audio.wav -f segment -segment_time 600 -c copy chunk_%03d.wav
   ```
4. **Choose provider** — Read `memory/tool-preferences/transcription.yaml`:
   - **Whisper API** (`whisper-1` or `gpt-4o-transcribe`) — default, $0.006/min
   - **whisper.cpp** local — if offline / cost-sensitive / sensitive content
   - **AssemblyAI** — if diarization matters (multiple speakers)
   - **Deepgram Nova-3** — if streaming/realtime
5. **Transcribe with word-level timestamps**:
   ```bash
   curl https://api.openai.com/v1/audio/transcriptions \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -F file="@audio.wav" \
     -F model="whisper-1" \
     -F response_format="verbose_json" \
     -F "timestamp_granularities[]=word" \
     -F "timestamp_granularities[]=segment"
   ```
6. **Diarize if multi-speaker** — Use AssemblyAI (native) or pair Whisper with pyannote.audio. Assign speaker labels (`SPEAKER_0`, `SPEAKER_1`) and prompt the user to rename.
7. **Emit four files** in `memory/content-log/<slug>/`:
   - `transcript.srt` — caption-ready
   - `transcript.vtt` — web-ready
   - `transcript.json` — full verbose structure with word timings
   - `transcript.md` — human-readable with speaker names and timestamps every ~30s
8. **Flag quotable moments** — Simple LLM pass: "Find 5-10 quotable lines. Each ≤ 20 words, standalone, emotionally resonant." Write to `quotables.md` with timestamps.
9. **QA pass** — Flag low-confidence words (`< 0.6`), inaudible sections, and any proper-noun misspellings for the creator to correct.

## Output structure

```
memory/content-log/<slug>/
  source.mp4                  # original
  audio.wav                   # normalized
  transcript.srt              # captions
  transcript.vtt              # web captions
  transcript.json             # words + timestamps + confidence
  transcript.md               # readable transcript
  quotables.md                # flagged highlights with timestamps
  transcript.meta.yaml        # provider, model, cost, duration, WER estimate
```

## Autonomy behavior

- **Level 1** — Ask before running a paid API transcription (show estimated cost from duration × rate). Local Whisper.cpp requires no ask.
- **Level 2** — Auto-transcribe on provider of record without asking. Show cost in completion summary.
- **Level 3** — Auto-transcribe + auto-diarize + auto-emit all downstream artifacts. Creator gets a completion notification.

Never auto-transcribes sensitive audio if `memory/tool-preferences/privacy.yaml` flags the source as private — always forces local.

## Cost / time estimates

| Duration | Whisper API | whisper.cpp (M2 large-v3) | AssemblyAI |
|---|---|---|---|
| 10 min | $0.06, ~30s | Free, ~3 min | $0.11, ~1 min |
| 60 min | $0.36, ~3 min | Free, ~18 min | $0.65, ~6 min |
| 3 hr | $1.08, ~9 min | Free, ~54 min | $1.95, ~18 min |

## Integration

- Composes **observe** (file input) + **act** (API call) + **remember** (writes content-log)
- Downstream consumers: `segment-transcript`, `write-script`, `caption-video`, `audio/mix-podcast`, `analytics/track-performance`
- Upstream: `triage-captures` routes here when an audio/video capture advances

## Failure modes

- **25 MB cap breach** — always chunk first; never fail silently
- **Silent audio / wrong stream** — check `ffprobe` for audio stream existence before charging a transcription
- **Heavy accent or poor audio** — route to AssemblyAI Best model; flag low-confidence segments
- **Dropped sections** — compare transcript duration vs. source duration; alert on >5% gap
