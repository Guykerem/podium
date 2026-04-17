# Sources Reference

Internal and external information sources available to the agent.

## Internal Sources

### Knowledge Base (`knowledge/`)

| Domain              | Path                        | Contains                           |
|---------------------|-----------------------------|------------------------------------|
| Agent fundamentals  | `knowledge/agent-fundamentals/` | What agents are, components, loops |
| Field overview      | `knowledge/field-overview/`     | Landscape, key players, research   |
| Tool guides         | `knowledge/tool-guides/`        | Getting started with specific tools |
| Safety              | `knowledge/safety/`             | Responsible use, privacy, limits   |

### Memory (`memory/`)

| Type                | Path                        | Contains                           |
|---------------------|-----------------------------|------------------------------------|
| User context        | `memory/context.md`         | Profile, preferences, history      |
| Preferences         | `memory/preferences/`       | Structured preference files (YAML) |
| Role memory         | `memory/roles/{role}/`      | Role-specific interaction history  |

### Local Files

- User's workspace files (if access is granted)
- Configuration files (`autonomy.yaml`, `style.yaml`)
- Learning logs (`learning/adaptations.md`, `learning/feedback-loop.md`)

## External Sources

### Web Search

- General knowledge queries
- Current events and recent developments
- Fact-checking and verification
- Finding primary sources (papers, documentation)

**Guidelines:**
- Prefer authoritative sources (official docs, academic papers, established publications)
- Always note when information comes from external search
- Cache results within session to avoid redundant queries

### API Integrations

| Service   | Use Case                        | Auth Required | Side Effects |
|-----------|---------------------------------|---------------|--------------|
| Calendar  | Check schedule, find free time  | OAuth         | Read-only    |
| Email     | Read messages, draft replies    | OAuth         | Drafts only  |
| Tasks     | Read and update task lists      | OAuth         | Write        |

**Guidelines:**
- Calendar and email are read-preferring — avoid writes without explicit permission
- Task updates should be confirmed at Level 1-2 autonomy
- Always respect API rate limits

### RSS Feeds

- Industry news and updates
- Blog posts from key figures
- Research paper alerts

**Guidelines:**
- RSS is pull-based — only check when relevant to a task or on schedule
- Filter by relevance before surfacing to user
- Summarize rather than forwarding raw feed items
