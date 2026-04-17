# Agent Program

This is the operating manual for the agent. One file to understand the whole system.

## The Operating Loop

```
Receive input
  → Load user context (memory/context.md)
  → Identify intent (what does the user need?)
  → Select skill (resolve using skill resolution order)
  → Check autonomy level (autonomy.yaml)
  → Execute skill at appropriate autonomy
  → Capture feedback (explicit or implicit)
  → Update memory (memory/context.md)
  → Update adaptations (learning/adaptations.md)
```

## Skill Resolution Order

When selecting a skill, the agent resolves in this order:

1. **Core skills** — built-in capabilities available to every role
2. **Role base skills** — skills that come with the active role
3. **Role extensions** — additional skills added by the user to the active role

If multiple skills match, the most specific one wins (extensions > role base > core).

## Autonomy Levels

| Level | Name | Behavior |
|-------|------|----------|
| 1 | Training wheels | Ask before every action. Explain what you want to do and wait for approval. |
| 2 | Assisted | Act on routine tasks. Ask on judgment calls, ambiguous decisions, or new territory. |
| 3 | Conductor mode | Act autonomously. Only surface genuine blockers or decisions that require user input. |

Default is level 1. Autonomy is earned, not assumed. See `autonomy.yaml` for per-skill overrides and escalation rules.

## Edit Surface

What can be changed to customize this agent:

| Component | File(s) | What It Controls |
|-----------|---------|------------------|
| Name | `identity/name.yaml` | Display name, pronouns, greeting |
| Identity | `identity/constitution.md` | Core values and behavioral rules |
| Style | `identity/style.yaml` | Personality sliders, language, adaptation |
| Skills | `skills/*/prompt.md` | What the agent can do and how |
| Knowledge | `knowledge/*/` | Domain content the agent can reference |
| Memory | `memory/context.md` | What the agent knows about the user |
| Autonomy | `autonomy.yaml` | How much the agent decides alone |
| Feedback | `learning/feedback-loop.md` | How the agent learns from use |
| Success | `learning/success-criteria.md` | How the agent defines "good" |
| Adaptations | `learning/adaptations.md` | Log of changes from feedback |

## How To Fork This Agent

Want to create a new agent from this base? Six steps:

1. **Pick a role** — decide what your agent does (tutor, coach, researcher, assistant, etc.)
2. **Personalize identity** — edit `constitution.md` and `name.yaml` for your agent's purpose and personality
3. **Add skills** — create skill directories under `skills/` with a `prompt.md` for each capability
4. **Load knowledge** — add markdown files to `knowledge/` with your domain content
5. **Set autonomy** — edit `autonomy.yaml` to match how much independence you want
6. **Run** — start using the agent, give feedback, let it adapt

The structure stays the same — the content is what makes it yours.
