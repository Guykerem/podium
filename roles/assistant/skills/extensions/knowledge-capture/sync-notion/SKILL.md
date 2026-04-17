---
name: sync-notion
description: Bidirectional sync between agent memory and Notion pages — last-write-wins with history.
when_to_use: >
  Structured memory (preferences, contacts, tasks, habits) needs to be editable by the user
  in a GUI. Runs continuously once configured.
tools:
  - mcp: notion
---

# Sync Notion

The agent's memory is plain text — great for agents, awkward for humans. Notion is where humans are already editing. This skill keeps both in agreement.

## How It Works

1. **Configure sync map** in `memory/knowledge/sync-map.yaml`:
   ```
   syncs:
     - local: memory/people.md
       remote: notion://db/people-xyz
       format: table
       key: id
     - local: memory/preferences.md
       remote: notion://page/preferences-abc
       format: page
     - local: memory/finance/budgets.yaml
       remote: notion://db/budgets-def
       format: table
       key: category
   ```
2. **Detect changes** on both sides each sync tick (default: every 15 min):
   - Local: file `mtime` > last sync
   - Remote: Notion `last_edited_time` > last sync, per page
3. **Compute diff** record-by-record using the configured `key`.
4. **Resolve conflicts** with last-write-wins by `last_edited_time`. Log every conflict to `memory/knowledge/sync-conflicts.md` with both versions so nothing is silently lost.
5. **Apply changes** in the direction they came from:
   - Remote → local: rewrite the local file
   - Local → remote: patch the Notion page via MCP
6. **Write audit trail** — every sync records what moved, in which direction, and when. History is append-only.

## Integration

- `remember` — the thing being synced
- `observe` — filesystem watcher on local files, polling or webhook on Notion side
- `schedule` — triggers the sync tick
- `act` — performs the Notion writes
- Composes with `capture-note` (Notion Inbox is a sync destination) and `search-knowledge`

## Autonomy Behavior

- **Level 1:** Proposes each diff for user approval before applying either direction. Slow but safe during setup.
- **Level 2:** Auto-applies non-conflicting diffs; surfaces conflicts for user decision.
- **Level 3:** Auto-applies including conflicts (last-write-wins), surfaces a daily conflict digest. Still refuses to delete — deletions always require explicit user confirmation, regardless of level.

## Memory

**Reads:** `memory/knowledge/sync-map.yaml`, all files listed as `local`.

**Writes:** `memory/knowledge/sync-log.md` (every tick), `memory/knowledge/sync-conflicts.md` (every conflict):
```
- at: 2026-04-17T15:00:00Z
  record: people.maya
  local_edited: 2026-04-17T14:55:00Z
  remote_edited: 2026-04-17T14:58:00Z
  winner: remote
  local_backup: memory/.backup/people.md.2026-04-17T15-00
```

## Failure Modes

- **Silent deletion.** A field cleared in Notion wipes local data. Always preserve deleted content in `.backup/` for 30 days and require explicit confirmation for deletions.
- **Schema drift.** User adds a new column in Notion the sync-map doesn't know about. New remote fields are surfaced as "want to sync this?" rather than ignored silently.
- **Rate limits.** Notion API caps at 3 req/sec. Batch writes and back off on 429s; never lose a write on a rate-limit error — queue and retry.
