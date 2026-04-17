# Source Evaluation — CRAAP and SIFT

The tutor refuses to teach from low-quality sources. This file defines the two evaluation frameworks used by `research-loop` and `synthesize`.

## CRAAP Test — Structured Scoring

Good for academic/long-form sources. Score each axis 0-5; mean is the source's quality.

### Currency
How recent is the information?

- 0 — published before a known paradigm shift; almost certainly outdated
- 1 — old; relevant only for historical context
- 2 — old but still partly applicable
- 3 — reasonably current for a stable domain
- 4 — recent; relevant
- 5 — very recent; reflects current state of the field

**Domain-adjusted:** ML papers decay in months; math proofs last decades. The scorer applies a `currency_weight` per domain.

### Relevance
Does it address the target concept directly?

- 0 — unrelated despite matching keywords
- 2 — tangential; discusses something adjacent
- 3 — discusses the concept but not at the level we need
- 4 — directly relevant; addresses the target question
- 5 — exactly on target; could serve as the primary source

### Authority
Who wrote it and what's their standing?

- 0 — anonymous, no traceable author
- 1 — author can't be verified, no institution
- 2 — personal blog or unvetted outlet
- 3 — industry professional, trade publication
- 4 — credentialed expert or reputable organization
- 5 — peer-reviewed primary source by acknowledged experts

### Accuracy
Can claims be verified?

- 0 — contains fabricated citations or obvious factual errors
- 1 — weak citations, multiple minor errors
- 2 — partial citation; spot-checks mostly hold
- 3 — solid citations; spot-checks hold
- 4 — rigorous citation; no errors found
- 5 — formally peer-reviewed primary data

**Key spot-check:** pick one cited source and verify it exists, says what the article claims it says, and supports the claim.

### Purpose
Why was this written?

- 0 — deceptive; hidden agenda
- 1 — pure promotion of a product/ideology
- 2 — opinion piece with acknowledged slant
- 3 — mixed purpose (educate + promote)
- 4 — educational or informational intent
- 5 — peer-reviewed science / neutral informational

### Applying It

```
overall = mean(currency, relevance, authority, accuracy, purpose)
if overall < min_quality_score (default 3):
    archive — do not teach from this source
else:
    store with overall and per-axis scores
```

## SIFT Method — Fast Web Filter

Good for online content, social media, AI-generated material. Four moves:

### Stop
Before reading further, ask: do I know this source? Do I trust it? If not, don't start with the article itself.

### Investigate the Source
Open a second tab. Look up the publisher, author, organization. What's their funding? Track record? Use Wikipedia, [mediabiasfactcheck.com](https://mediabiasfactcheck.com), [Know Your Meme](https://knowyourmeme.com) for internet-culture claims.

### Find Better Coverage
For any contested or consequential claim, look for multiple independent sources. If only one outlet is reporting it, that's a signal — not a verdict, but a signal.

### Trace Claims to Their Origin
Articles summarize. Follow the chain: article → source article → primary study / document. Evaluate the primary, not the summary.

Mike Caulfield, SIFT's originator: "Most web sources lose information as they're re-shared. Trace back until you find the original form."

## Hybrid Flow for `research-loop`

1. **SIFT pass** (cheap, deflects obvious garbage):
   - Stop: is the source known to the curated list? If yes, skip the deep SIFT and go to CRAAP.
   - Investigate: unknown publisher? Check first; archive if obviously unreliable.
   - Find better: is there a primary source? If yes, use it instead.
   - Trace: when an article summarizes a study, follow to the study.

2. **CRAAP scoring** on the survivors.

3. **Dedup**: exact fingerprint → skip; near-duplicate (cosine > 0.85) → merge.

4. **Tag**: attach `{source_type, authority_tier, currency_year, domain_fit}`. Tag to `concept_id`s from the learning plan.

## Deduplication

Two tiers:

**Exact:** `sha256(normalize(content))`. Normalize = lowercase, strip HTML, collapse whitespace. First 4KB is usually enough.

**Near:** embed source content, cosine similarity against existing sources. Threshold 0.85. If over threshold, merge (don't overwrite) — keep both URLs in `mirrors[]`, pick the higher-authority one as canonical.

## Re-Verification

Weekly, the role re-verifies the top-10 most-cited sources in the student's active concepts:
- Still reachable? (link-rot check)
- Content drift? (hash changed without a visible update notice)
- Retracted? (for papers — check retraction databases)

Re-verification outcome updates the source's `last_verified` field and can downgrade an accuracy or authority score if something changed.

## AI-Generated Content

2025+ reality: much web content is AI-generated. Signals to watch:
- Generic, hedged phrasing; lack of specifics
- Fabricated citations (DOIs that don't resolve, authors who don't exist)
- Surface-level coverage without primary engagement

Apply SIFT *first* for any source that can't be traced to a human author or institutional publication. Prefer primary literature and established outlets.

## References

- [CRAAP Test (CSU Fullerton)](https://libraryguides.fullerton.edu/sourceevaluation)
- [SIFT method (Mike Caulfield)](https://merritt.libguides.com/c.php?g=1235656&p=9066623)
- [Caulfield's Four Moves blog](https://hapgood.us/2019/06/19/sift-the-four-moves/)
- [Mnemonic evaluative frameworks in the AI era](https://www.sciencedirect.com/science/article/pii/S0099133325001090)
