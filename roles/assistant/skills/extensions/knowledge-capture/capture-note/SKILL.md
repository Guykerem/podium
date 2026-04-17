---
name: capture-note
description: Frictionless note capture from any channel into Notion or Obsidian — tagged and routed by type.
when_to_use: >
  User dumps a thought, forwards an article, shares a quote, or says
  "note that", "save this", "write this down". Also on fleeting voice captures.
tools:
  - mcp: notion
  - mcp: obsidian
---

# Capture Note

The single biggest enemy of a second brain is friction. This skill removes every decision the user shouldn't have to make at capture time — type, tags, destination — and makes them later, or never.

## How It Works

1. **Accept input in any form:** pasted text, URL, email forward, voice transcript, photo of a page.
2. **Detect type** based on content signals. Three types from Zettelkasten:
   - `fleeting` — short thought, no source, "idea just struck me"
   - `literature` — quote / insight / link from an external source
   - `permanent` — refined, self-contained, reusable (usually created later from fleeting+literature)
   Default new captures to `fleeting` unless a source URL is present (then `literature`).
3. **Extract metadata:**
   - `title` — first non-empty line or generated from content
   - `body` — full content, preserving quotes
   - `source` — URL, author, or "self"
   - `tags` — 1-4 auto-suggested from content + user's existing tag vocabulary
   - `captured_at` — ISO timestamp
4. **Write to destination** based on config:
   - Notion: append a row to the "Inbox" database with type-specific properties
   - Obsidian: write a markdown file to `Inbox/` with frontmatter
5. **Confirm with a one-line receipt.** "Saved to Inbox as literature: 'On the futility of 5-year plans'." No extra questions at capture time.
6. **Weekly processing is a separate flow** (not this skill) — this skill only captures.

## Integration

- `remember` — stores destination config and tag vocabulary
- `communicate` — one-line receipt only
- `act` — writes to Notion/Obsidian MCP
- Composes with `search-knowledge` (captured notes become searchable) and `sync-notion`

## Autonomy Behavior

- **Level 1:** Asks which type + tags before saving.
- **Level 2:** Auto-detects type and tags; saves; shows receipt. User can correct with "change tag to X" and agent relearns.
- **Level 3:** Same as L2 — capture is low-risk so no escalation. The autonomy dial for this skill basically caps at L2 in effect.

## Memory

**Reads:** `memory/knowledge/config.yaml` (destination, vault path, databases), `memory/knowledge/tag-vocabulary.md`.

**Writes:** appends new tags to `memory/knowledge/tag-vocabulary.md`; logs capture event to `memory/knowledge/capture-log.md` for later throughput analysis:
```
- id: cap-2026-04-17-034
  type: literature
  source: https://collaborativefund.com/blog/...
  tags: [behavioral-econ, housing]
  destination: notion://inbox/page-abc
  captured_at: 2026-04-17T14:22:00Z
```

## Failure Modes

- **Tag proliferation.** Every capture invents a new tag. Cap at 4 tags and prefer reusing existing ones; only propose a new tag if no existing tag fits above 0.6 similarity.
- **Source loss.** Pasted quote with no URL and no context. Always preserve the raw input verbatim in the body so the source can be reconstructed later.
- **Destination drift.** User switches from Notion to Obsidian mid-stream. Previously captured notes don't move; agent notes the cutover date and keeps searching both.
