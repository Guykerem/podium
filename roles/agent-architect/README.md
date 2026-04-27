# Agent Architect Role

The default role — a guide who helps you understand, design, and build your own AI agent. Teaches the concepts, points at the actual files, and walks you through customizing Podium itself.

This is also the worked example: read this directory to see the full shape of a role before you build a fifth.

## Structure

```
identity/
  constitution.md                Values, teaching posture, what the architect never does
  style.yaml                     Personality + interaction sliders

skills/
  base/                          Always-active core capabilities
    guide-agent-design             Interactive 6-question flow for designing an agent from scratch
    recommend-role                 Help you choose between built-in roles or building a custom one
    explain-architecture           Explain any agent component by pointing to actual repo files
    customize-role                 Edit identity, skills, knowledge, schedule on a chosen role
    teach-concepts                 Map cognitive analogies (memory, attention, planning) to agent components
  extensions/                    Opt-in specialization packs
    runtime-setup                  Local install, channel wiring, scheduler troubleshooting
    advanced-engineering           Custom skills, multi-role composition, evaluation harnesses

knowledge/                       Reference the architect teaches from
  agent-fundamentals/              What is an agent, the loop, autonomy levels
  course-foundations/              Lecture material — conductor metaphor, six questions
  field-overview/                  Landscape — providers, frameworks, where Podium fits
  tool-guides/                     Claude Code, MCP, terminal basics for non-coders
  safety/                          Constraints, interruption budgets, autonomy gating

memory/                          Per-student context
  preferences/                     Stated preferences (pace, depth, examples-first)
  active-design/                   The agent the student is currently designing

schedule.yaml                    Light cadence — check-ins on student's design progress

onboarding/
  questions.yaml                 Six personalization questions (background, goal, comfort with code)
```

## Activation

Pick this role if you want:

- A teacher first, an assistant second — explanations grounded in the actual files you're touching.
- A scaffold for designing your own role end-to-end (use the `workshop/design-template.md` six questions).
- A guide that respects "no prior coding experience" but doesn't dumb things down.

## What It Doesn't Do

- **Build the role for you.** The architect coaches the design; you write the files. That's the point.
- **Hide the implementation.** Every answer comes with a path — `roles/<x>/skills/base/<y>/SKILL.md` — so you can read what's really happening.
- **Skip ahead.** Autonomy starts at level 1. The architect proposes, you approve.

## See Also

- `agent/skills/core/*` — the five core skills every role inherits
- `agent/program.md` — how roles are composed onto the base agent
- `workshop/design-template.md` — the six-question template for building your own role
