# CLAUDE.md — Podium

## What This Is

Podium is a platform for conducting your own AI orchestra. It's the companion repo for a guest lecture on AI agents given to psychology students at Reichman University.

The repo contains the lecture materials, live demo, workshop templates, and a personal AI tutor agent that students clone and build on.

## Central Metaphor

The conductor, not the CEO. Inspired by Jacob Collier's orchestra improvisation. Agents are an orchestra you conduct through intent and self-knowledge, not employees you micromanage.

## Repo Structure

```
spec/              # Design specs and architecture decisions
lecture/           # Outline, slides, references
  outline/         # Beat-by-beat lecture structure
  slides/          # Presentation materials (TBD)
  references/      # Source material and research links
demo/              # Live demo scaffold (Podium GUI)
workshop/          # Design templates and guided flows
agent/             # The tutor agent
  skills/          # Agent capabilities (research, planning, etc.)
  knowledge/       # Domain content and references
  identity/        # Personality config and style
guides/            # Getting started guides for students
```

## Design Principles

- Built for psychology students with no prior coding experience
- Every technical concept maps to a cognitive analogy
- The repo itself is an onramp — designed for first-time `git clone`
- Skills are both functional AND educational — using the skill teaches the concept
- GUI built on the Ally Hyper Agent boilerplate

## Key References

- Spec: `spec/podium-spec.md`
- Lecture outline: `lecture/outline/conductors-arc.md`
- Workshop template: `workshop/design-template.md`
