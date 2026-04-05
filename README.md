# Podium

A platform for conducting your own AI orchestra.

## What Is This?

Podium is your personal AI tutor agent. It helps you learn about AI agents, design your own, and start building — all from this repo.

It was built as part of a guest lecture on AI agents for psychology students at Reichman University. But it's designed to be useful for anyone starting their journey with AI agents.

## Quick Start

1. **Clone this repo:**
   ```
   git clone <repo-url>
   cd podium
   ```

2. **Read the agent's soul:**
   Open `agent/identity/constitution.md` — this is who Podium is.

3. **Explore what it knows:**
   Browse `agent/knowledge/` — start with `agent-fundamentals/what-is-an-agent.md`.

4. **Design your own agent:**
   Open `workshop/design-template.md` and work through the six questions.

5. **Set up a coding agent:**
   Follow `agent/knowledge/tool-guides/getting-started.md` to install Claude Code or OpenClaw.

6. **Start building:**
   Use this repo as your base. Add skills, add knowledge, change the identity. Make it yours.

## What's Inside

### The Agent (`agent/`)
The product. A minimal, complete AI tutor with all the components of a real agent:

| Component | Directory | What It Does |
|---|---|---|
| Identity | `agent/identity/` | Who the agent is — constitution and personality config |
| Skills | `agent/skills/` | What it can do — research, explain, plan, brainstorm |
| Knowledge | `agent/knowledge/` | What it knows — fundamentals, field overview, tool guides, safety |
| Memory | `agent/memory/` | What it remembers about you — starts empty, grows with use |
| Learning | `agent/learning/` | How it improves — feedback loop, success criteria, adaptations |
| Autonomy | `agent/autonomy.yaml` | How much it decides alone — configurable levels 1-3 |
| Program | `agent/program.md` | The full operating loop — read this one file to understand the whole agent |

### The Lecture (`lecture/`)
The 90-minute session outline — "The Conductor's Arc."

### The Workshop (`workshop/`)
The design template for creating your own agent — six questions that cover every component.

### The Spec (`spec/`)
The design document behind everything — architecture decisions, open questions, references.

## The Metaphor

You're not a CEO managing AI employees. You're a conductor leading an orchestra.

The musicians know how to play. Your job is to know what you want to hear — and shape the whole through intention, presence, and trust.

That's what working with AI agents looks like when it works.

Go build your orchestra.
