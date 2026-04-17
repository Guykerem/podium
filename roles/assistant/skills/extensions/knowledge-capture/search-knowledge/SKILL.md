---
name: search-knowledge
description: Semantic search across captured notes, calendar, and email — returns grounded excerpts with sources.
when_to_use: >
  User asks "what did I say about X", "have I written about Y",
  "who did I talk to about Z", or needs to recall something from past work.
tools:
  - mcp: notion
  - mcp: obsidian
  - mcp: gmail
  - mcp: google-calendar
---

# Search Knowledge

Personal memory at scale without hallucination. Every answer comes with source citations — if the agent can't ground it, the agent says so.

## How It Works

1. **Parse the query** into:
   - `semantic_intent` — what concept is the user recalling?
   - `temporal_filter` — explicit ("last month") or inferred
   - `source_filter` — notes / email / calendar / all
   - `people_filter` — names mentioned
2. **Embed** the query and retrieve top-K candidates from each enabled source in parallel.
3. **Rerank** candidates by: semantic similarity, recency (gentle decay), source weighting (user can prefer notes over email).
4. **Assemble the answer** as a short synthesis + cited excerpts:
   ```
   You wrote about this twice:
   
   1. "Three-page memos beat decks because they force non-linear arguments into linear prose."
      — capture 2026-02-14, tag: writing, source: notion://page-xyz
   
   2. In your 1:1 with Maya on 2026-03-07, you said the Q2 priority memo should follow the same shape.
      — one-on-ones/maya.md
   ```
5. **Never fabricate.** If fewer than 2 strong matches, say "I found weak matches — want me to show them anyway?"
6. **Log the query** so repeated searches can surface a "did you already find this?" hint.

## Integration

- `remember` — reads from all memory files
- `communicate` — renders the cited synthesis
- Composes with `capture-note` (new captures feed the index) and `sync-notion`

## Autonomy Behavior

- **Level 1:** Returns excerpts only; user synthesizes.
- **Level 2:** Returns excerpts + short synthesis. Always cites.
- **Level 3:** Same as L2, plus proactively surfaces relevant past notes when the user starts a new thread ("related: you wrote about this in Feb"). Never surfaces without citation.

## Memory

**Reads:** everything in `memory/knowledge/`, `memory/one-on-ones/`, and connected external sources.

**Writes:** `memory/knowledge/search-log.md` (query + top hit + timestamp) for learning user's recall patterns:
```
- q: "three page memo"
  top_hit: notion://page-xyz
  at: 2026-04-17T15:12:00Z
  satisfied: true
```

## Failure Modes

- **Hallucinated citations.** Inventing a source that sounds plausible. Rule: only cite exact matches from the retrieval set. If the synthesis needs a step not in the excerpts, mark it as agent-inferred.
- **Over-synthesis.** Blending contradictory notes into a smooth narrative that hides the contradiction. If two sources disagree, show both verbatim and flag the tension.
- **Privacy bleed.** Returning a 1:1 note containing sensitive feedback when the query was innocent ("what did I say about Maya"). Private-scope memory files require an explicit `--include-private` flag on the query.
