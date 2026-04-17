# Content Creator — Success Criteria

How to evaluate whether each skill is performing well. The agent reads this when updating `memory/` after feedback.

## Headline metrics

Across all skills, the creator agent is succeeding when:

1. **First-draft approval rate trends up.** The creator revises less over time because the agent has learned their voice.
2. **Capture-to-publish time trends down.** Mechanical steps (transcription, formatting, exports) become invisible.
3. **Brand voice stays consistent** across formats and platforms — the creator's POV survives every adaptation.
4. **Output volume grows** without the creator grinding harder.
5. **The creator trusts the pipeline** enough to leave Level 2 autonomy on for mechanical steps.

## Per-skill rubric

### transcribe-media

| Rating | Criteria |
|--------|----------|
| **Good** | Transcript is >97% accurate, timestamps align within ±0.5s, quotable moments flagged match what the creator would pick. |
| **Okay** | Transcript is usable but needs cleanup. Speaker labels are inconsistent. Flagged moments are 50% aligned with taste. |
| **Poor** | Transcript has systematic errors (wrong names, dropped sections) or the creator has to re-run transcription. |

### write-script

| Rating | Criteria |
|--------|----------|
| **Good** | Hook lands on first read. Structure fits the platform. Voice sounds like the creator, not like ChatGPT. Approved with light edits. |
| **Okay** | Script is serviceable but generic. Hook works after a rewrite. Creator rewrites most of the body. |
| **Poor** | Script reads as AI-generated. Hook is cliché ("Did you know..."). Creator scraps it and writes from scratch. |

### source-media

| Rating | Criteria |
|--------|----------|
| **Good** | Every sourced asset matches content tone, licensing is clean, attribution metadata is attached. Creator uses ≥70% of suggestions. |
| **Okay** | Assets are on-topic but generic. Licensing is correct but attribution requires manual lookup. Creator uses 30-70%. |
| **Poor** | Assets don't match tone, or licensing is ambiguous. Creator finds their own. |

### format-for-platform

| Rating | Criteria |
|--------|----------|
| **Good** | Aspect ratios, captions, lengths, and hashtags correct for every target platform. Exports render without retry. Platform-specific hooks adapted, not just cropped. |
| **Okay** | Mechanical specs correct but hooks feel ported, not adapted. Captions need styling tweaks. |
| **Poor** | Wrong aspect ratio, broken captions, or specs that would cause platform rejection. Creator has to redo exports. |

### creative-brief

| Rating | Criteria |
|--------|----------|
| **Good** | Brief is specific enough to shoot/produce without follow-up questions. References are on-tone. Hook options include at least one the creator loves. |
| **Okay** | Brief captures the idea but needs clarification. Hook options are safe, not sharp. |
| **Poor** | Brief is generic or contradictory. Creator can't act on it without rewriting. |

### triage-captures

| Rating | Criteria |
|--------|----------|
| **Good** | Every capture sorted into a format direction with a hook hypothesis. Discarded items are honestly labeled, not forced into content. |
| **Okay** | Captures are sorted but hook hypotheses are weak. Some forced matches. |
| **Poor** | Captures sit in limbo, or everything is forced into "this could be a video" regardless of fit. |

## Extension skills

Each extension skill inherits the overall rubric:

- **Technical correctness** — exports render, files validate, APIs called correctly
- **Aesthetic match** — output matches the creator's tracked taste in `memory/creative-style/`
- **Transparency** — reasoning is shown, AI-generated parts are flagged
- **Respect for voice** — no flattening, no "AI voice" drift

## Feedback signals

The agent updates `memory/` based on:

- **Direct revisions** — what the creator changed in an approved draft (strongest signal)
- **Rejections** — what they threw out entirely and why (if they say)
- **Thumbs-up / thumbs-down** on variants (hooks, thumbnails, cut options)
- **Platform performance** when analytics are connected (retention, CTR, save rate)
- **Explicit preferences** — "I always want captions at the top" type rules
