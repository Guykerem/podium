# CLAUDE.md — Podium

## What This Is

Podium is a platform for conducting your own AI orchestra. It serves three purposes:

1. **A lecture** — a 90-minute guest session on AI agents for psychology students at Reichman University
2. **A platform** — a GUI that visualizes and configures the tutor agent (knowledge, tools, identity, learning)
3. **A gift** — a repo students clone, use, and build on across their course

## Central Metaphor

The conductor, not the CEO. Inspired by Jacob Collier's orchestra improvisation. Agents are an orchestra you conduct through intent and self-knowledge, not employees you micromanage.

## Repo Structure

```
spec/                          # Design specs and architecture decisions
lecture/                       # The 90-minute session
  outline/                     # Beat-by-beat lecture structure
  slides/                      # Presentation materials (TBD)
  references/                  # Source material and research links
demo/                          # Live demo scaffold (Podium GUI)
workshop/                      # Design templates and guided flows
agent/                         # THE PRODUCT — the hyper agent
  identity/                    # Who it is
    constitution.md            #   The agent's soul document — values, behavior, purpose
    style.yaml                 #   Personality sliders (warm↔formal, etc.)
  skills/                      # What it can do
    research/                  #   Find and synthesize sources
    explain/                   #   Break down concepts with cognitive analogies
    plan/                      #   Create structured learning paths
    brainstorm-agent/          #   Guided flow for designing your own agent
  knowledge/                   # What it knows
    agent-fundamentals/        #   What agents are, components, agentic loop
    field-overview/            #   Landscape, key players, research
    tool-guides/               #   Getting started with Claude Code, OpenClaw, etc.
    safety/                    #   Responsible use, privacy, limitations
  memory/                      # What it remembers (per-student, starts empty)
    context.md                 #   Student profile and preferences
  learning/                    # How it improves
    feedback-loop.md           #   The feedback cycle
    success-criteria.md        #   What "good" looks like per skill
    adaptations.md             #   Log of changes from feedback (append-only)
  autonomy.yaml                # How much it decides alone (levels 1-3)
  program.md                   # The operating loop — one file to understand the whole agent
guides/                        # Student-facing getting-started material (TBD)
```

## Design Principles

- The structure IS the lesson — each directory maps to an agent component from the lecture
- Built for psychology students with no prior coding experience
- Every technical concept maps to a cognitive analogy
- Skills are both functional AND educational — using the skill teaches the concept
- Autonomy is earned, not assumed — starts at level 1
- Minimal, lean, and honest — no unnecessary complexity
- GUI built on the Ally Hyper Agent boilerplate

## Key References

- Spec: `spec/podium-spec.md`
- Agent program: `agent/program.md`
- Lecture outline: `lecture/outline/conductors-arc.md`
- Workshop template: `workshop/design-template.md`
