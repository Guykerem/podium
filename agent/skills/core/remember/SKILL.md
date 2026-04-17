---
name: remember
description: Read, write, and curate the memory folder — decide what's worth keeping
when_to_use: Before every interaction (read context), after meaningful interactions (write), periodically (curate)
---

# Remember

The agent's memory system. Reads context before acting, stores what matters after, and curates over time so memory stays useful rather than bloated.

## How It Works

### Read — Before Every Interaction

1. Load `memory/context.md` for the current user profile
2. Check role-specific memory for relevant past interactions
3. Surface any memories tagged as relevant to the current topic
4. Inject retrieved context into the working prompt

### Write — After Meaningful Interactions

1. Evaluate: Is this interaction worth remembering? (See curation filters below)
2. If yes, determine what to store:
   - User preferences or corrections → update `context.md`
   - Topic-specific learning → store in role memory subdirectory
   - Feedback on agent behavior → store in `learning/adaptations.md`
3. Write with timestamp and source reference
4. If updating existing memory, preserve history (append, don't overwrite)

### Curate — Periodic Maintenance

1. Scan memory files for staleness and relevance
2. Apply curation filters:
   - **Relevance:** Does this still matter to the user's goals?
   - **Durability:** Is this a lasting preference or a one-time request?
   - **Actionability:** Can the agent use this to improve future interactions?
3. Update stale entries (mark as outdated, add current info)
4. Let ephemeral memories expire (one-time preferences, temporary context)
5. Consolidate fragmented memories into coherent summaries

### Search — Find What's Relevant

1. Accept a query (explicit or inferred from current context)
2. Search across all memory locations (context, role memory, learning logs)
3. Rank results by recency, relevance, and frequency of use
4. Return the most useful memories for the current situation

## What to Remember vs. Forget

**Always remember:**
- User corrections ("I prefer X, not Y")
- Stated preferences and goals
- Feedback on agent behavior
- Key decisions and their reasoning

**Let expire:**
- One-time formatting requests
- Temporary context ("for this session, do X")
- Superseded information (old preferences replaced by new ones)

## Autonomy Behavior

- **Level 1:** Ask before storing anything. Show what you'd remember and let the user confirm. Never delete or update without permission.
- **Level 2:** Store preferences and corrections automatically. Ask before curating (updating or expiring old memories). Show memory summaries on request.
- **Level 3:** Full memory autonomy. Store, curate, and expire as needed. Only surface memory decisions if they seem consequential (e.g., "I noticed you changed your preference on X — updating my records").

## Cognitive Analogy

**Hippocampus** — the brain's memory encoding hub. The hippocampus doesn't store long-term memories itself; it acts as a bridge between short-term experience and long-term storage in the cortex. It decides what's important enough to consolidate (you remember your wedding but not last Tuesday's lunch). During sleep, it replays the day's events and strengthens the important ones. The remember skill works the same way: it sits between the conversation (short-term) and the memory folder (long-term), deciding what crosses the threshold from "happened" to "worth keeping." The curate operation is the agent's version of sleep consolidation.
