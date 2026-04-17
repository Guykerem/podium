---
name: variant-spray
description: Produce 3-5 variants of the same clip with different hooks, covers, and opens — ready to A/B or spread across platforms
when_to_use: >
  User has a winning clip and wants to test multiple openings, or has one piece
  worth publishing to multiple platforms with per-platform-native hooks.
  The shotgun approach — let the algorithm pick the winner.
tier: extension
---

# Variant Spray

One clip, many openings. Produce 3-5 variants with different hooks / covers / opens — test them, spread them, let the algorithm decide.

## Purpose

The first 3 seconds of short-form make 90% of the retention difference. Testing multiple hooks on the same body content yields fast learning. This skill productizes the variant-spray loop.

## How It Works

1. **Input**: a tight final clip (post `edit-video` + `reframe-vertical`) + the brief / script.
2. **Generate 3-5 hook variants** — different emotional registers:
   - Curiosity: "I didn't expect this..."
   - Contrarian: "Everyone's wrong about..."
   - Stakes: "If you're doing X, stop."
   - Specific: "3 words that changed..."
   - Personal: "I've been thinking about this for months..."
3. **Record / synthesize each variant**:
   - **Talking-head variants** — user re-records the first 3s for each variant (agent provides scripts)
   - **Voiceover variants** — `generate-voiceover` synthesizes each hook in the creator's cloned voice; agent overlays onto a common cover frame
   - **Text-only hooks** — render a cover frame (2-3s) with on-screen text using `design-graphics`, stitched onto the clip
4. **Stitch + encode** — For each variant:
   ```bash
   # Variant with text-cover frame:
   ffmpeg -loop 1 -t 2 -i cover_variant_1.jpg -f lavfi -t 2 -i anullsrc=channel_layout=stereo:sample_rate=48000 \
     -vf "scale=1080:1920,setsar=1" cover_1.mp4

   # Concat cover + clip
   printf "file 'cover_1.mp4'\nfile 'clip.mp4'\n" > list.txt
   ffmpeg -f concat -safe 0 -i list.txt -c copy variant_1.mp4
   ```
5. **Generate per-variant cover image** (TikTok/Reels cover) via `design-graphics`.
6. **Platform spray map** — Assign variants to platforms:
   ```yaml
   variants:
     curiosity:
       platforms: [tiktok]
       post_time: 2026-04-17T18:00:00Z
     contrarian:
       platforms: [shorts]
       post_time: 2026-04-17T18:00:00Z
     stakes:
       platforms: [reels]
       post_time: 2026-04-17T18:00:00Z
     specific:
       platforms: [linkedin_native_video]
       post_time: 2026-04-17T08:00:00Z
     personal:
       platforms: [x]
       post_time: 2026-04-17T14:00:00Z
   ```
   (Deliberately spread across platforms so same audience isn't hit twice — OR concentrate on one platform for a cleaner A/B.)
7. **Emit**:
   ```
   variants/<slug>/
     v1_curiosity/
       video.mp4
       cover.jpg
       caption.txt
       hook_script.md
     v2_contrarian/...
     v3_stakes/...
     v4_specific/...
     v5_personal/...
     spray_map.yaml               # platform + schedule
     ab_test.yaml                 # links to ab-test-hooks protocol
   ```
8. **Schedule via `publish`** (if enabled) or hand to creator for manual posting.
9. **Follow up with `track-performance`** — tie variant IDs to post IDs; feed results into `ab-test-hooks` for winner declaration.

## Variant design heuristics

- **Don't spread content across variants** — body is the SAME. Only opens differ.
- **One variable per variant** — hook text only, OR cover only, not both (unless explicitly running a multi-variable spray)
- **Force register spread** — never ship 3 variants in the same emotional register; the point is to *test* differences

## Quality floor

Reject a variant if:
- Its opening feels forced or inauthentic
- The hook makes a claim the body doesn't support
- The variant breaks continuity (cover → clip transition jarring)

Better to ship 3 strong variants than 5 variants including 2 weak ones.

## Autonomy behavior

- **L1** — Generate hook scripts, present for creator to pick which to record/synthesize. Then render. Creator reviews each variant.
- **L2** — Generate + synthesize all variants (if voice-clone permits). Present batch for approval.
- **L3** — Full pipeline + stage in `publish` queue with spray_map; creator confirms before anything goes live.

Never auto-publishes sprayed variants.

## Integration

- Input: final clip + brief + creator's cloned voice (optional)
- Composes **act** (FFmpeg + generate-voiceover + design-graphics) + **remember** (variant performance log)
- Downstream: `publish` for staging, `track-performance` + `ab-test-hooks` to measure
- Upstream: `edit-video`, `reframe-vertical`, `caption-video`, `write-script` (for hook variants)

## Failure modes

- **Same hook in different words** — variants must feel meaningfully different; if they all read like one person saying X five ways, the test is weak
- **Body doesn't support hook variety** — some clips only support one honest angle; ship one, not five
- **Audience fatigue** — sprayed across same audience within hours = diminishing returns. Stagger or cross-platform.
- **Voice-clone artifacts** — if synthesized hooks sound off, re-record manually; inauthentic hook kills retention regardless of performance math
