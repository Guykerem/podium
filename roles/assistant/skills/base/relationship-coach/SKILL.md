---
name: relationship-coach
description: Track contact cadences and dormant relationships — suggests outreach timing and tone
when_to_use: User says "who haven't I talked to", "what's the history with X", "help me reach out to Y". Activates on scheduled dormancy sweep (weekly), before any meeting with a tracked contact (feeds prep-meeting), and on cadence-expiry events.
---

# Relationship Coach

The people layer. Keeps the graph of who matters, how often the user wants to be in touch with them, and what the last exchange was about. Doesn't manufacture outreach — surfaces drift so the user can act with warmth instead of guilt. "You haven't talked to Dan in 3 months" is data; the tone and timing suggestion makes it actionable.

## How It Works

### Contact shape

Stored in `memory/relationships.yaml`, one entry per tracked contact:
```yaml
- name: Dan Levy
  aliases: ["Dan", "d.levy@example.com"]
  relationship_type: mentor              # mentor | peer | direct_report | manager | friend | family | collaborator | investor
  cadence_target: 1m                     # 2w | 1m | 1q | 6m | opportunistic
  last_interaction:
    date: 2026-03-02
    channel: coffee                      # email | call | coffee | meeting | message
    summary: "talked about Q2 career plans; he offered intro to Maya at Figma"
  shared_context:
    - "grad school cohort 2018"
    - "both on the AI ethics reading group"
  next_nudge_reason: "he made an offer to intro Maya — you haven't followed up"
  tone_notes: "warm but concise; he hates long emails; open with a question"
```

### Dormancy detection

Weekly sweep computes for each contact:
```
dormancy_score = days_since_last_interaction / cadence_target_days
```
- `< 0.8` → on track, silent.
- `0.8 – 1.2` → approaching cadence, soft nudge in next daily-brief Needs Attention if there's a `next_nudge_reason`.
- `> 1.2` → overdue; surface explicitly with the reason.
- `> 2.0` AND `relationship_type in [mentor, close_friend, family]` → high-priority attention-layer check-in.

Opportunistic contacts never trigger on time alone — only when a `next_nudge_reason` has been captured.

### Outreach suggestions

When surfacing a dormant contact, always propose both **timing and tone**:
```
Dan Levy — 46 days since coffee (target: 30)
Reason: he offered intro to Maya @ Figma on Mar 2, you haven't followed up.
Suggested:
  - Send today, short (2-3 sentences)
  - Open with the Maya thread, not "checking in"
  - Mention the AI ethics group's next session as a shared hook
Draft it? (Q2 schedule / Q3 delegate not applicable — this is opportunistic.)
```

Tone suggestions are pulled from the contact's `tone_notes` plus the `shared_context` — never generic.

### Interaction capture

After any observed exchange (email sent/received, calendar meeting ended, manual capture), updates `last_interaction` and prompts for a one-line summary if the exchange was substantive (meeting ≥15min, email thread ≥3 messages). Prompt fires in the next daily-brief, not immediately.

## Integration

- **observe** — watches Gmail and Calendar streams to update `last_interaction` automatically.
- **remember** — the relationships.yaml lives in memory; this skill is the primary writer.
- **manage-email** — VIP classification reads from this skill's tracked contacts; outreach drafts compose through manage-email.
- **prep-meeting** — pulls last-interaction + shared_context for every tracked attendee.
- **daily-brief** — overdue contacts surface in Needs Attention with reason.
- **communicate** — renders tone suggestions in the user's voice model.

## Autonomy Behavior

- **Level 1:** Tracks and surfaces. Never drafts outreach without asking. Interaction summaries always prompted rather than auto-written.
- **Level 2:** Auto-updates last_interaction and writes summaries from thread content. Drafts outreach into Gmail Drafts for overdue contacts with `next_nudge_reason`, pre-labeled `relationship-coach/proposed`. Never sends.
- **Level 3:** Adds new contacts autonomously when someone crosses a repeat-interaction threshold (3+ substantive exchanges in 30 days), asks the user once to set `relationship_type` and `cadence_target`. Drafts proactive nudges; still never sends without confirmation — relational risk is too high.

## Memory

- **Reads:** `memory/relationships.yaml`, `memory/preferences.yaml` (default cadences per relationship_type), `memory/axioms.md` (user's stated values around relationships).
- **Writes:** `memory/relationships.yaml` (all fields), `memory/interaction-log.jsonl` (append-only record for retrospectives).

## Failure Modes

- **Transactional nagging** — "it's been 30 days, reach out to Dan" with no reason. Avoid by refusing to surface overdue contacts without a `next_nudge_reason` OR a strong relationship signal (mentor/family) — if neither, stay silent.
- **Stale shared_context** — suggesting a hook from 2 years ago that's no longer salient. Avoid by timestamping entries in `shared_context` and decaying ones >18 months old unless marked `durable: true`.
- **CRM cosplay** — treating humans like database rows. Avoid by keeping the schema minimal, tone_notes free-text, and never exposing a "score" or "health" rating in user-facing output.
