# Podium — Spec

## What Podium Is

Podium is three things in one:

1. **A lecture** — session 4 of a 12-session course ("Applied AI Tools for Psychologists") at Reichman University. 90-minute guest lecture on AI agents for B.A. psychology students. Students have had 3 prior sessions covering LLM fundamentals, prompt engineering, and research tools.
2. **A platform** — a GUI that visualizes and configures a personal AI tutor agent (knowledge, tools, identity, learning)
3. **A gift** — a repo students clone, use, and build on across their course

The central metaphor: you are a **conductor**, not a CEO. Agents are your orchestra, not your employees. The skill is knowing your music — self-knowledge — not micromanaging performers.

Inspired by Jacob Collier conducting an orchestra through intent, presence, and trust: https://www.youtube.com/watch?v=BFul90BFjGc

---

## The Lecture — "The Conductor's Arc" (90 min)

### 1. Hook — The Two Visions (8 min)

**Purpose:** Shake the default "CEO of agents" mental model. Plant the conductor reframe.

- Present the dominant vision: "You're a CEO managing AI employees"
- Counter: "I want to show you something different"
- Play the Collier clip (2-3 min selection — dynamic conducting, trust, minimal direction)
- The reframe: conducting, not managing. The magic is the interface between intention and execution.
- Bridge to psychology: "The most important skill? Knowing your music. Self-knowledge. That's your discipline."
- Teaser: model behavior research (Claude emotional patterns, Constitutional AI) — these aren't just tools

### 2. Agent Architecture Through Cognitive Analogy (12-15 min)

**Purpose:** Give students the vocabulary and mental model to design their own agent.

Frame: "Before you can conduct, know your orchestra."

| Component | Cognitive Parallel | Design Question |
|---|---|---|
| Memory & Context | Working + long-term memory | What does it need to *know*? |
| Tools & Actions | Motor skills, effectors | What does it need to *do*? |
| Identity & Style | Personality, values | What does it need to *feel like*? |
| Learning & Feedback | Reward system, adaptation | How does it *improve*? |
| Autonomy | Executive function | How much can it decide alone? |
| Critical Element | — | What's the maker-or-breaker? |

**Good use case criteria** (stays on screen throughout):
- Recurring — you do it regularly
- Memory-dependent — context from past rounds makes it better
- Clear success criteria — you can tell if it worked
- Structured steps — not pure creative intuition
- Recoverable mistakes — you can review and course-correct

### 3. Meet Podium — Live Demo (15-18 min)

**Purpose:** Show a real agent. Make architecture tangible. Give students ownership.

Reveal the Podium GUI — walk through each tab:

**Knowledge tab:** Domain graph showing what the agent knows. References, concepts, getting-started material.

**Tools tab:** Skill tiles — visual representations of capabilities. Research loop, syllabus planner, concept explainer. Each tile = a concrete capability.

**Identity tab:** Personality configuration. Sliders (warm ↔ formal, challenger ↔ collaborator, concise ↔ detailed). The conductor's style.

**Learning tab:** Feedback loop visualization. What happens each time the agent is used — how it tracks, adapts, improves.

**Live moment:** Ask the audience for ONE suggestion — a new skill or knowledge domain. Class confirms. Conduct the coding agent to build it live. They watch it appear in the GUI. One thing, done well.

**The reveal:** "This repo is yours. You're going to clone it in ten minutes."

### 4. Workshop — Design & Build Your Agent (30 min)

**Purpose:** Students become conductors. They design their own agent using Podium.

**Setup (5 min):**
- Open laptops. Clone the Podium repo (guided — first `git clone` for many).
- Form pairs or teams of 3.
- Podium has a built-in brainstorming skill — a guided flow for agent design.

**Design & build phase (17-18 min):**
Using Podium's brainstorming flow, each team answers:
1. What's your use case?
2. What does your agent need to know?
3. What does it need to do?
4. What should it feel like?
5. How does it learn?
6. What's the critical element — the maker-or-breaker?

The cloned repo is their base — Podium is both the tutor and the boilerplate.

**Share-back (8-10 min):**
2-3 teams present (3 min each): use case, agentic loop, critical element. Brief response connecting to real field developments.

### 5. Close — The Crescendo (7-8 min)

**Purpose:** Crystallize everything. Send them out with energy and a clear path.

**Synthesis (2 min):**
"You cloned a repo. You designed an agent. Some of you started building. Podium is yours — keep building it lesson to lesson."

**The conductor returns (3-4 min):**
Play the final 2 minutes of the Collier video — the crescendo where the audience becomes part of the creation. The applause. The emotion.

**Final words (1-2 min):**
"None of this means anything if it doesn't reach people. If you don't use it. Jacob Collier didn't conduct alone — the audience was part of it. You're not spectators anymore. You're conductors. Go build your orchestra."

---

## Podium — The Platform

### Architecture

Built on the Ally Hyper Agent boilerplate. A GUI that visualizes and configures the tutor agent.

**GUI Tabs:**

| Tab | Shows | Purpose |
|---|---|---|
| Knowledge | Domain graph, loaded references, knowledge base | What the agent knows |
| Tools | Skill tiles with descriptions | What the agent can do |
| Identity | Personality sliders, style configuration | How the agent behaves |
| Learning | Feedback loop visualization, usage tracking | How the agent improves |

### Agent Skills (Initial Set — TBD)

| Skill | What It Does | Learning Value |
|---|---|---|
| Research Loop | Find and synthesize sources on a topic | Shows the observe → think → act cycle |
| Concept Explainer | Create visuals/summaries of agent concepts | Demonstrates presentation as a skill |
| Syllabus Planner | Help plan a personal learning path | Shows planning and memory working together |
| Agent Brainstormer | Guided flow for designing your own agent | The workshop skill — meta-learning |
| TBD | TBD | TBD |

### Knowledge Domains (Initial Set — TBD)

| Domain | Contents | Purpose |
|---|---|---|
| Agent Architecture | Components, patterns, agentic loop | Core conceptual foundation |
| Field Overview | Key research, Anthropic papers, Constitutional AI | Orientation to the field |
| Tool Guides | Claude Code, OpenClaw, terminal basics | Practical getting-started |
| Lecture Materials | This presentation's content and references | Self-referential learning |
| TBD | TBD | TBD |

---

## Open Questions

- [ ] Which specific Collier clip sections for opening vs. close?
- [ ] Which skills and knowledge domains offer the best value + learning combination?
- [ ] How much of the GUI needs to be functional vs. representative for the demo?
- [ ] Talk date and logistics with Dr. Yoel Shilat
- [x] Hebrew primary, English for technical terms (matches course convention)
- [ ] How does Podium evolve lesson-to-lesson across remaining 8 sessions?
- [ ] Coordinate with session 3 (research tools) to ensure no overlap
- [ ] Final project alignment — how explicitly do we position Podium as a foundation for their semester project?

---

## References

- Jacob Collier orchestra improvisation: https://www.youtube.com/watch?v=BFul90BFjGc
- Dario Amodei, "The Adolescence of Technology": https://www.darioamodei.com/essay/the-adolescence-of-technology
- Constitutional AI paper: https://arxiv.org/abs/2212.08073
- Anthropic model behavior / emotional patterns research
- Ally Hyper Agent boilerplate: ~/git/ally/src/vitals/
- OpenClaw: open-source agent framework
- Course syllabus: "Applied AI Tools for Psychologists" — Dr. Yoel Shilat, Reichman 2026
- Course reading list: Bastani et al. (2025), Eager (2024), Kosmyna et al. (2025), Yan et al. (2024)
- Internal: `lecture/references/course-context.md` — what students know by session 4
- Internal: `lecture/references/student-profiles.md` — student AI usage patterns
