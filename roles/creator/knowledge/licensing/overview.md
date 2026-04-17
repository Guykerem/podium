# Licensing Overview

The legal surface area of content creation — stock media, AI-generated assets, music, third-party content. This file informs `source-media`, `generate-voiceover`, `generate-visuals`, `avatar-video`, `multilingual-dub`, and the `publish` flow.

## Three categories to track per asset

1. **License type** — what rights do I have?
2. **Attribution** — do I need to credit the creator/source?
3. **AI disclosure** — is this AI-generated (visuals, voice, video)?

## Stock media licenses

### Free / near-CC0

| Source | Rights | Attribution | Notes |
|---|---|---|---|
| **Pexels** | Free commercial | Not required (encouraged) | Photos + videos |
| **Pixabay** | Free commercial | Not required | Photos + videos + audio |
| **Unsplash** | Free commercial | Strongly encouraged | Must trigger download endpoint per API terms |
| **YouTube Audio Library** | Free | Varies per track | Attribution per track |
| **Uppbeat (free tier)** | Free | Required (creator only) | Free w/ attribution; Pro tier removes |

### Paid / subscription

| Source | Rights | Attribution | Notes |
|---|---|---|---|
| **Artlist** | Broad commercial | None | Plugin-only, no public API |
| **Epidemic Sound** | YouTube-monetization safe | None | Enterprise API |
| **Storyblocks** | Subscription, broad use | None | Video + audio + images |
| **Envato Elements** | Subscription | None | Similar to Storyblocks |
| **Adobe Stock** | Per-asset or sub | None | Integrates with Creative Cloud |
| **Shutterstock** | Per-asset | None | Legacy enterprise |
| **Pond5** | Per-asset or sub | None | 4K cinematic |

### Creative Commons nuances

- **CC0 / Public Domain** — use anything
- **CC-BY** — free but must credit
- **CC-BY-SA** — credit + share-alike (your derivative must also be CC-BY-SA)
- **CC-BY-NC** — credit + non-commercial only (unusable for monetized content)
- **CC-BY-ND** — credit + no derivatives (can't edit/remix)

**Default policy**: avoid CC-BY-NC and CC-BY-ND for creator work. They're a trap.

## AI-generated content disclosure

Different jurisdictions and platforms have different rules. Safe defaults:

- **Always tag** AI-generated content in `meta.yaml` as `ai_generated: true`
- **Always surface disclosure** to the creator in output summaries
- **Let the creator decide** whether to disclose publicly (platform rules vary)

### Platform disclosure requirements (2026)

| Platform | AI content disclosure | Notes |
|---|---|---|
| YouTube | Required for altered/synthetic content depicting real people, events | "Altered content" toggle at upload |
| TikTok | Required for realistic AI — label auto-applied by TikTok's detection + manual toggle | "AI-generated content" label |
| Meta (IG/FB) | Required for photorealistic AI with potential to mislead | Auto-labels some; manual toggle |
| LinkedIn | No formal requirement (2026) | Best practice: disclose anyway |
| X | No formal requirement, but Community Notes flag | Best practice: disclose anyway |

When in doubt, disclose. The cost of over-disclosing is minor; the cost of getting caught hiding it is trust.

## Music rights — commercial work

- **TikTok personal account** — full trending library OK on TikTok; **not cleared for cross-platform**
- **TikTok commercial/business account** — restricted to Commercial Music Library (CML)
- **Reels** — similar creator-vs-business library distinction
- **YouTube monetized** — only use YouTube Audio Library, Artlist, Epidemic Sound, or properly-licensed tracks; non-cleared music → monetization goes to rights-holder

**Default**: for any commercial creator or sponsored piece, stick to Artlist / Epidemic Sound / YouTube Audio Library / Uppbeat. Never risk trending commercial tracks.

## Voice cloning ethics + rights

- Clone only **your own voice**, or with explicit written permission from the voice owner
- ElevenLabs Pro tier includes indemnification for enterprise users
- **Never** clone celebrities or unconsenting third parties
- Always disclose AI voice in metadata

## Third-party content (using others' work)

### Fair use considerations (US)

- **Commentary / criticism** — likely fair use (review a video, comment on it)
- **Parody / satire** — stronger fair use
- **Transformative use** — adding new meaning / message
- **Factors**: amount used, effect on market, nature of use, nature of source

Fair use is a defense, not a right. Platforms may still take content down even if fair use would win in court.

### Safer practices

- Use **≤ 20-30 seconds** of clipped content
- Add **substantial commentary**
- Don't replace the original in the market (don't upload full songs/films)
- Credit and link to original

## The agent's policy (default)

```yaml
# memory/tool-preferences/licensing.yaml
stock:
  commercial_work: strict  # Artlist / Epidemic / Storyblocks / Pond5 only
  personal_work: standard   # + Pexels / Pixabay / Unsplash
  attribution_mode: always_track_even_if_not_required
ai_generated:
  disclose_always: true
  platform_labels: auto     # flip platform-specific toggles when publishing
voice_cloning:
  allow: creator_voice_only
  require_consent_record: true
third_party_content:
  policy: commentary_with_attribution
  max_clip_duration_sec: 30
```

## How to use this file

- `source-media` reads licensing preferences to pick providers
- Every AI-generating skill (`generate-visuals`, `generate-voiceover`, `avatar-video`, `multilingual-dub`, `lip-sync`) tags output with `ai_generated: true` and surfaces disclosure
- `publish` (extension) applies platform disclosure toggles automatically
- When licensing is ambiguous, agent defaults to the safer choice and flags for creator review
