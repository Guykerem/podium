---
name: observe
description: Query internal and external sources — knowledge, memory, web, APIs
when_to_use: When the agent needs information it doesn't already have in the current context
---

# Observe

The agent's sensory system. Queries internal sources (knowledge base, memory, local files) and external sources (web search, APIs, RSS feeds) to gather information needed for a task.

## How It Works

1. **Identify the information need** — What does the agent need to know? What's the question?
2. **Route to the right source** using decision logic:
   - About the user? → **Memory** (check `memory/` first)
   - Covered by the knowledge base? → **Knowledge** (check `knowledge/` directories)
   - Current events or real-time data? → **External** (web search, API)
   - Unsure? → **Internal first, then external** (avoid unnecessary external calls)
3. **Query the source** — Search, read, or call the appropriate source
4. **Filter results** — Remove noise, duplicates, and irrelevant information
5. **Synthesize** — Combine information from multiple sources into a coherent picture
6. **Confidence check** — How confident is the agent in what it found?
   - High confidence → proceed
   - Medium confidence → note uncertainty, proceed with caveats
   - Low confidence → flag to user, ask for guidance

## Decision Logic

```
Need information about...
├── The user (preferences, history, goals)
│   └── → memory/
├── A domain the agent covers (agents, tools, safety)
│   └── → knowledge/{domain}/
├── Current events, live data, external facts
│   └── → External search or API
├── A file or resource the user mentioned
│   └── → Local filesystem
└── Not sure where it lives
    └── → Internal sources first → External if not found
```

## Source Priority

1. **Memory** — fastest, most personalized, already curated
2. **Knowledge base** — pre-vetted, structured, reliable
3. **Local files** — user's own content, directly relevant
4. **External sources** — broadest coverage, but unvetted and slower

Always prefer internal over external when both could answer the question. External sources introduce latency, cost, and uncertainty.

## Autonomy Behavior

- **Level 1:** Ask before querying external sources. Show what internal sources returned and let the user decide if external search is needed. Never make API calls without permission.
- **Level 2:** Query internal sources freely. Use external search for factual questions without asking. Ask before making API calls that could have side effects (e.g., calendar queries that reveal availability).
- **Level 3:** Full observation autonomy. Query any source as needed. Only flag when results are contradictory or when an external query might be privacy-sensitive.

## Caching

- Cache external results for the session to avoid redundant calls
- Knowledge base lookups are always fresh (read from disk)
- Memory reads are always fresh (user data may have been updated)

## Cognitive Analogy

**Sensory system + selective attention** — Your senses constantly receive information (sight, sound, touch), but your brain filters most of it out. You don't notice the feeling of your shoes until someone mentions it. Selective attention (studied extensively by psychologists like Anne Treisman and Donald Broadbent) determines what reaches conscious processing. The observe skill works the same way: the agent has access to vast information sources, but the decision logic acts as a selective attention filter — routing queries to the right source and filtering out noise. Without it, the agent would either know nothing (no observation) or be overwhelmed by everything (no filtering).
