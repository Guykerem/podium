---
name: research-loop
description: Continuously scan configured sources for domain-relevant material, score, dedupe, tag, and curate into memory/sources/
when_to_use: >
  On the scheduled research-sweep cron (every 6h by default), or on demand
  when the student asks "what's new in X" or when a gap surfaces that needs
  fresh material. Also triggered by the podcast-pipeline when a concept needs
  more inputs before bundling.
tier: base
---

# Research Loop

The agent's continuous-research engine. Scans RSS feeds, arXiv, YouTube channels, blogs, documentation sites, and web search for material relevant to the student's active domains. Scores every candidate with the CRAAP test, dedupes against everything already in `memory/sources/`, tags to the concepts in the learning plan, and archives anything below the quality threshold. The tutor never teaches from material that didn't pass this gate.

## How It Works

### 1. Determine What To Look For
- Load the active domain list from `memory/style-preferences/profile.md` and the current learning plan.
- Identify **priority concepts** — nodes on the plan with (a) mastery below the advance threshold, (b) next_review approaching, or (c) flagged gaps from the latest `assess-progress` report.
- Build search queries per priority concept: one broad ("transformer architecture survey 2026"), one narrow to the gap ("multi-head attention worked example"), and one recency-bounded ("arxiv last 30 days").

### 2. Query Sources
Route per source type, composing the core `observe` skill:
- **RSS / Atom feeds** — arXiv categories, blog feeds, podcast feeds. Cheap, structured; pull deltas since last sweep.
- **APIs** — arXiv, Semantic Scholar, OpenAlex, YouTube Data API (for channel updates), GitHub releases (for tool-guide domains).
- **Web search** — fall back here when APIs don't cover the query. Prefer queries scoped to educational domains (`site:edu`, `site:*.gov`, `site:arxiv.org`).
- **Student-provided links** — anything they've pasted during a session that wasn't yet ingested.

### 3. Score with CRAAP
For each candidate, assign 0-5 on each axis:
- **Currency** — How recent? Weighted by domain volatility (ML papers decay faster than mathematics proofs).
- **Relevance** — How well does it match the target concept? Embeds-style cosine vs. concept description, then a quick read-through check.
- **Authority** — Credentials of the author / publisher. Peer-reviewed > reputable org > personal blog > anonymous.
- **Accuracy** — Verifiable claims, citations present, no obvious factual errors on spot-check.
- **Purpose** — Educational intent vs. marketing vs. opinion. Declared and actual.

Overall = mean. Archive anything below `min_quality_score` (default 3).

### 4. Deduplicate
- Compute `dedup_fingerprint` = SHA-256 of normalized text (lowercase, stripped markup, collapsed whitespace, first 4kB). Exact match → skip.
- Near-duplicate check: if fingerprint is new but title + author + URL canonical form collide, merge the newer record's metadata into the existing file (don't create two entries for the same arXiv preprint at v1 and v2 — update in place).

### 5. Tag to Concepts
- For each surviving source, tag it to one or more `concept_id`s from the learning plan.
- Tagging is evidence-weighted: if the source covers a concept thoroughly, tag with `primary`; if it touches adjacent, tag with `adjacent`.

### 6. Write to Memory
- One file per source at `memory/sources/<domain>/<fingerprint-prefix>.md` using the schema in `memory/sources/.gitkeep`.
- Never overwrite an existing file without preserving prior content in an `updates:` block.

### 7. Report Briefly
- At the end of a sweep, append a one-line summary to `memory/learning-log/YYYY-MM-DD-research-sweep.md`:
  `<time> — scanned N sources, accepted M (avg CRAAP 4.1), deduped K, tagged to [concept_ids]`.
- Do not surface this to the student unless they asked or something notable happened (new primary source on a gap concept, a previously trusted source was downgraded, etc.).

## Composition

- Uses `observe` (core) for every external query.
- Uses `remember` (core) for every write to `memory/sources/`.
- Feeds `synthesize` (which needs inputs) and `podcast-pipeline` (which needs curated bundles).

## Autonomy Behavior

- **L1 — Supervised.** Agent presents a candidate list per sweep; student approves each addition. No auto-archival.
- **L2 — Assisted.** Agent auto-accepts sources with CRAAP ≥ 4 on all axes, flags borderline cases (3-4) for student approval, auto-archives < 3. Student reviews the weekly digest.
- **L3 — Autonomous.** Full curation without prompts. Only surfaces decisions when a previously trusted source is being downgraded (possible domain shift) or when a source makes claims contradicting existing curated sources (possible contested topic flag).

## Failure Modes

- **Echo chamber.** If all sources come from the same author/publisher, diversify. Log a diversity warning.
- **Staleness.** If no new material has entered a domain in 14 days, either the domain is quiet or the source list is too narrow. Flag for the student to review.
- **API quota exhaustion.** Degrade to RSS + web search rather than failing the sweep.
- **Hallucinated citations in web-sourced material.** Spot-check: if an article cites a paper that can't be found, downgrade Accuracy score aggressively.

## Cognitive Analogy

**Exploratory foraging + selective attention.** Animals optimize a trade-off between exploiting known food patches and exploring for new ones. The research-loop is the agent's foraging strategy — it returns to known-good feeds (exploit) while periodically broadening search to catch material the feeds would miss (explore). CRAAP scoring is selective attention: the world generates more than the student can consume, so the agent filters for signal and discards noise before it reaches conscious teaching.
