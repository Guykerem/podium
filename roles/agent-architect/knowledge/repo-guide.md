# Repo Guide

A reference for understanding the Podium repository structure.

## Top-Level Directories

| Directory | Purpose |
|-----------|---------|
| `agent/` | The agent skeleton — identity, skills, knowledge, memory, learning, autonomy |
| `roles/` | Role overlays — specialized configurations layered on the base agent |
| `runtime/` | Engine, providers, channels, scheduler — the infrastructure that runs the agent |
| `lecture/` | The 90-minute guest session — outline, slides, references |
| `workshop/` | Design templates and guided flows for the hands-on session |
| `guides/` | Student-facing getting-started material |
| `demo/` | Live demo scaffold (Podium GUI) |
| `spec/` | Design specs and architecture decisions |
| `docs/` | Additional documentation |

## Agent Skeleton Components

These live in `agent/` and define the base agent that all roles extend.

| Component | Path | What It Controls |
|-----------|------|------------------|
| Identity | `agent/identity/constitution.md` | Core values and behavioral rules |
| Style | `agent/identity/style.yaml` | Personality sliders (warmth, formality, etc.) |
| Name | `agent/identity/name.yaml` | Display name, pronouns, greeting |
| Program | `agent/program.md` | The operating loop — one file to understand the whole system |
| Core skills | `agent/skills/core/` | Built-in capabilities available to every role |
| Knowledge | `agent/knowledge/` | Shared knowledge (agent fundamentals, safety) |
| Memory | `agent/memory/` | User context and active role tracking |
| Autonomy | `agent/autonomy.yaml` | How much the agent decides alone (levels 1-3) |
| Learning | `agent/learning/` | Feedback loop, success criteria, adaptation log |

## Role Overlay Components

These live in `roles/<role-name>/` and specialize the base agent for a purpose.

| Component | Path | What It Controls |
|-----------|------|------------------|
| Identity | `identity/constitution.md` | Role-specific values and behaviors |
| Style | `identity/style.yaml` | Role-specific personality overrides |
| Base skills | `skills/base/` | Skills that come with the role |
| Extension skills | `skills/extensions/` | Optional skills the user can activate |
| Knowledge | `knowledge/` | Role-specific domain content |
| Memory | `memory/` | Role-specific memory directories |
| Schedule | `schedule.yaml` | Role-specific scheduled jobs |
| Learning | `learning/` | Role-specific success criteria |
| Onboarding | `onboarding/` | First-time setup questions |

## Available Roles

| Role | Description |
|------|-------------|
| `agent-architect` | The default role — learn to understand, design, and build AI agents |
| `assistant` | A general-purpose personal assistant (planned) |
| `tutor` | A personalized learning companion (planned) |
| `creator` | A creative collaborator for writing and projects (planned) |
