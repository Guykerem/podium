# Podium

An agent boilerplate for conducting your own AI orchestra.

Clone it, pick a role, personalize, run. Four roles ship in the box; building a fifth is a workshop exercise.

## What This Is

Podium is a file-based agent boilerplate. A minimal runtime loads a shared agent skeleton (identity, core skills, knowledge, memory, learning, autonomy) and overlays a role that gives the agent its personality and specialty. Roles are plain directories — no framework lock-in, no magic. You read the files, you understand the agent.

Built as part of a guest lecture on AI agents at Reichman University, designed to be useful for anyone starting with agents.

## Quick Start

1. **Clone:**
   ```
   git clone <repo-url> && cd podium
   ```

2. **Install dependencies:**
   ```
   pip install -r runtime/requirements.txt
   ```

3. **Configure a provider** — edit `runtime/providers.yaml` to pick `openai`, `anthropic`, `ollama`, or `openrouter`, then export the matching API key (e.g. `export ANTHROPIC_API_KEY=...`).

4. **Pick a role and run:**
   ```
   PODIUM_ROLE=agent-architect python3 runtime/engine.py
   ```
   Swap in `assistant`, `tutor`, or `creator` to boot a different role.

5. **Personalize** — each role has an `onboarding/questions.yaml` and a `memory/` directory. The agent-architect role hosts the role-selection and personalization flow.

## Available Roles

| Role | What It Is | Base Skills | Extension Packs |
|---|---|---|---|
| `agent-architect` | Guides you through designing and customizing your own agent | 5 | 2 |
| `assistant` | Personal assistant — tasks, calendar, email, relationships | 8 | 5 |
| `tutor` | Private tutor — research, learning plans, quizzes, podcast pipeline | 8 | 4 |
| `creator` | Content creator — transcription, scripting, media editing, platform formatting | 9 | 7 |

Base skills load for every instance of a role. Extensions are opt-in packs you enable per user.

## Architecture

```
runtime/       # Engine — loads providers, discovers skills, dispatches
agent/         # Shared skeleton — identity, core skills, autonomy, program
roles/         # Role overlays — each role is a self-contained directory
onboarding/    # Shared onboarding runner (role picks up its own questions)
workshop/      # Design template for building your own role
lecture/       # The 90-minute session outline
spec/          # Architecture and design decisions
```

Skills come in three tiers:

- **Core** (`agent/skills/core/`) — communicate, remember, observe, schedule, act. Every role gets these.
- **Base** (`roles/<role>/skills/base/`) — the role's everyday repertoire.
- **Extensions** (`roles/<role>/skills/extensions/<pack>/`) — opt-in specialty packs.

The runtime reads `PODIUM_ROLE` (or `agent/memory/active-role.yaml`), loads the shared skeleton, overlays the role, and discovers all SKILL.md files. Everything else is text.

## Building Your Own Role

The `agent-architect` role is itself an example — read `roles/agent-architect/` to see the full shape of a role. Then open `workshop/design-template.md` and answer the six questions.

## The Metaphor

You're not a CEO managing AI employees. You're a conductor leading an orchestra.

The musicians know how to play. Your job is to know what you want to hear — and shape the whole through intention, presence, and trust.

Go build your orchestra.
