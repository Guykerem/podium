# CLAUDE.md — Podium

## What This Is

Podium is an agent boilerplate — a minimal runtime plus a shared agent skeleton plus pluggable role overlays. It serves three purposes:

1. **A lecture** — a 90-minute guest session on AI agents for psychology students at Reichman University
2. **A boilerplate** — clone it, pick a role, personalize, run
3. **A gift** — students build their own role on top of it across the course

## Central Metaphor

The conductor, not the CEO. Inspired by Jacob Collier's orchestra improvisation. Agents are an orchestra you conduct through intent and self-knowledge, not employees you micromanage.

## Repo Structure

```
runtime/                       # Forked NanoClaw engine with LiteLLM
  engine.py                    #   Loads providers, discovers skills, dispatches
  providers.yaml               #   openai / anthropic / ollama / openrouter config
  channels.yaml                #   cli / telegram / webhook transports
  scheduler.yaml               #   Proactive cron hooks
agent/                         # SHARED SKELETON — every role inherits this
  identity/                    #   Baseline constitution and style
  skills/
    core/                      #   communicate, remember, observe, schedule, act
  knowledge/                   #   Shared fundamentals, field overview, safety
  memory/                      #   active-role.yaml, preferences, per-user state
  learning/                    #   Feedback loop, success criteria, adaptations
  autonomy.yaml                #   Levels 1-3 default
  program.md                   #   The operating loop — read this to understand the agent
roles/                         # ROLE OVERLAYS — each is self-contained
  agent-architect/             #   Default — helps you design your own agent
  assistant/                   #   Personal assistant — tasks, calendar, email
  tutor/                       #   Private tutor — research, quizzes, podcasts
  creator/                     #   Content creator — transcription, scripting, media
  <role>/
    identity/                  #     Role-specific constitution + style
    skills/
      base/                    #       Always loaded for this role
      extensions/<pack>/       #       Opt-in specialty packs
    knowledge/                 #     Role-specific reference material
    memory/                    #     Role-specific memory scaffold
    learning/                  #     Role-specific success criteria
    onboarding/questions.yaml  #     Role-specific personalization
    schedule.yaml              #     Role-specific cron jobs
onboarding/                    # Shared onboarding runner (role picks up its questions)
workshop/                      # Design template for building your own role
lecture/                       # The 90-minute session
  outline/                     #   Beat-by-beat lecture structure
  references/                  #   Source material and research links
spec/                          # Architecture and design decisions
```

## Design Principles

- The structure IS the lesson — each directory maps to an agent component from the lecture
- Built for psychology students with no prior coding experience
- Every technical concept maps to a cognitive analogy
- Skills are both functional AND educational — using the skill teaches the concept
- Autonomy is earned, not assumed — starts at level 1
- Minimal, lean, and honest — no unnecessary complexity
- File-based everything — no framework lock-in, read the files to understand the agent

## Key References

- Spec: `spec/podium-spec.md`
- Agent program: `agent/program.md`
- Runtime engine: `runtime/engine.py`
- Lecture outline: `lecture/outline/conductors-arc.md`
- Workshop template: `workshop/design-template.md`
- Example role: `roles/agent-architect/` (the default, itself a worked example)
