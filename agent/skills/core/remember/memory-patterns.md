# Memory Patterns

File-based memory structure, formats, and lifecycle.

## context.md Format

The primary user profile, stored at `memory/context.md`:

```markdown
# User Context

## Profile
- Name: [name]
- Background: [relevant background]
- Goals: [what they're trying to achieve]

## Preferences
- Communication style: [concise/detailed/casual/formal]
- Topics of interest: [list]
- Known sensitivities: [list]

## History
- First interaction: [date]
- Last interaction: [date]
- Total interactions: [count]
- Key milestones: [list]
```

## Preference Files

Stored in `memory/preferences/` as YAML:

```yaml
# memory/preferences/communication.yaml
style: concise
tone: warm
detail_level: moderate
examples_preferred: true
analogies_preferred: true
updated: 2025-01-15
```

## Role-Specific Memory

Each role can maintain its own memory subdirectory:

```
memory/
  context.md              # Universal user profile
  preferences/            # User preferences (YAML)
  roles/
    tutor/
      topics-covered.md   # What's been taught
      struggles.md        # Where the user needed help
      progress.md         # Learning trajectory
    assistant/
      tasks-log.md        # Completed and pending tasks
      routines.md         # Recurring patterns
```

## Memory Lifecycle

### 1. Capture
Raw information enters from an interaction.
- Source: conversation, observation, feedback
- Format: unstructured text with timestamp

### 2. Store
Information is classified and written to the appropriate location.
- User profile data → `context.md`
- Preferences → `preferences/*.yaml`
- Role-specific → `memory/roles/{role}/`
- Feedback → `learning/adaptations.md`

### 3. Consolidate
Periodic review merges and summarizes related memories.
- Multiple mentions of the same preference → single authoritative entry
- Contradictory memories → keep most recent, note the change
- Fragmented notes → coherent summary

### 4. Retrieve
Memories are searched and surfaced when relevant.
- Exact match: user asks about something previously discussed
- Contextual match: current topic relates to stored knowledge
- Proactive: agent surfaces relevant memory without being asked

### 5. Expire
Outdated or irrelevant memories are marked or removed.
- Superseded preferences → archive with timestamp
- One-time context → delete after session
- Stale information → mark as potentially outdated
- Expiry is soft by default (mark, don't delete) unless storage is constrained

## Naming Conventions

- Files: `kebab-case.md` or `kebab-case.yaml`
- Timestamps: ISO 8601 (`2025-01-15T14:30:00Z`)
- Tags: lowercase, hyphenated (`#learning-progress`, `#preference-update`)
