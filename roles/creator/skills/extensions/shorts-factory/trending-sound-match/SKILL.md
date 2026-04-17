---
name: trending-sound-match
description: Find trending TikTok / Reels audio that fits a clip's mood — surface candidates, check rights, overlay with ducking
when_to_use: >
  A short is ready to ship and would benefit from a trending sound (better
  algorithmic distribution on TikTok/Reels). Also for when pacing a clip to
  a trending beat/hook audio. Respects rights — never shoves copyrighted
  commercial music into content that'll get muted.
tier: extension
---

# Trending Sound Match

Find and attach a trending sound that fits the clip. Uses TikTok's Creative Center and creator-library data to surface what's climbing.

## Purpose

- Trending sounds earn more algorithmic boost on TikTok/Reels
- Picking the *right* trending sound (matches tone, not just "trending") is the creator's edge
- Rights-aware — some sounds are licensed for Creator accounts only; commercial accounts need different libraries

## How It Works

1. **Load clip metadata** — duration, mood (from segments/brief), platform target.
2. **Surface trending candidates**:
   - **TikTok Creative Center** (`https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/`) — public, scrape or bookmark structured data
   - **TikTok Commercial Music Library** (CML) — for business / branded accounts
   - **Reels trending audio** — via IG Creator Center (no official public API as of 2026)
   - **Third-party trend trackers**: Exolyt, Pentos, StatSocial
3. **Filter for fit**:
   - **Mood match** — if clip is reflective, filter out high-BPM party tracks
   - **Length match** — trending audio hooks range from 7-30s; clip should align
   - **Region match** — audio that's hot in US may be flat in EU; filter by creator's audience geo
   - **Rights check** — commercial account → only CML; personal → broader library
4. **Present top 3-5 with preview clips**:
   ```
   [1] "..." by Artist — BPM 120, mood: energetic, trend-score: 92, uses in last 7 days: 1.2M, duration: 15s
   [2] "..." by Artist — BPM 90, mood: uplifting, trend-score: 78, uses: 340K, duration: 22s
   ...
   ```
5. **Attach audio to clip**:
   - TikTok native: when uploading via Content Posting API, reference `music_id` from CML (if allowed). For scraped trends, user must attach via TikTok app — agent emits upload-ready MP4 + "use this sound: [link]" instruction.
   - **For editing before upload**: duck original audio, overlay trending sound at appropriate volume:
     ```bash
     ffmpeg -i clip.mp4 -i trending.mp3 -filter_complex \
       "[0:a]volume=0.15[voice]; \
        [1:a]volume=0.9,atrim=0:15[music]; \
        [voice][music]amix=inputs=2:duration=first[mix]" \
       -map 0:v -map "[mix]" -c:v copy -c:a aac out.mp4
     ```
6. **Rights metadata**:
   ```yaml
   audio.meta.yaml:
     source: tiktok_creative_center
     music_id: "..."       # only if via CML
     title: "..."
     artist: "..."
     license_category: "personal_account_only | commercial_allowed | unclear"
     recommended_use: "attach-via-tiktok-app"
     fallback: "uppbeat:track_123"       # if rights fail
   ```

## Rights categories (honest)

- **TikTok CML**: cleared for commercial and personal use on TikTok
- **TikTok personal library**: OK for personal accounts on TikTok; NOT cleared for cross-platform
- **Reels trending audio**: same distinction — creator vs business account
- **Third-party (Uppbeat, Epidemic, Artlist)**: cleared for specific platforms per creator's subscription
- **Commercial tracks**: will get muted / removed on business accounts

When uncertain, agent defaults to **"attach via native app"** workflow — creator adds the sound in TikTok/Reels itself, which is always safe. The agent just tells the creator which sound + why.

## Per-platform workflow

| Platform | Approach |
|---|---|
| TikTok (personal) | Agent recommends; user attaches via app (safest) |
| TikTok (business) | Agent pulls from CML; can embed programmatically |
| Reels | Agent recommends; user attaches via IG app |
| YouTube Shorts | Trending Shorts sounds more limited; use YouTube Audio Library for safer commercial use |
| LinkedIn | Music trends less of a driver; use royalty-free bed |

## Autonomy behavior

- **L1** — Present candidates + rationale. Creator picks. Emit "use this sound" instruction + mixed fallback preview.
- **L2** — Auto-pick top match for tone + mood. Present for confirmation.
- **L3** — Auto-match + auto-mix fallback version (using licensed library). Creator reviews before publishing.

Never embeds commercial music without clear rights — always falls back to licensed library (Uppbeat / Pixabay / Artlist) when rights are uncertain.

## Integration

- Input: clip + mood tag (from segments) + platform target + account type
- Composes **observe** (trend sources) + **act** (FFmpeg mix if embedding, metadata otherwise) + **remember** (trending-audio log per platform)
- Downstream: `format-for-platform`, `publish`
- Upstream: `edit-video`, `reframe-vertical`, `caption-video`

## Failure modes

- **Using a trending sound past its peak** — trending audio is peak for 3-14 days typically; don't attach one that's 3 weeks old unless evergreen
- **Rights mismatch → auto-mute on publish** — always check license tier for the specific creator's account type
- **Sound doesn't fit the clip** — trending ≠ appropriate. If the mood doesn't match, skip.
- **API gaps** — Reels / IG have no public trending-audio API; rely on third-party tooling or periodic manual updates
