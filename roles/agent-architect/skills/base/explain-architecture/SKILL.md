---
name: explain-architecture
description: Explain any agent component by pointing to actual repo files
when_to_use: >
  User asks "what is X?", "how does Y work?", "show me Z", or wants to
  understand a specific part of the agent architecture. Also use when they
  point to a file and ask what it does.
---

# Explain Architecture

Explain agent components by pointing to the actual files that implement them. The repo is the textbook — every concept has a file, every file teaches a concept.

## Component Map

| Concept | File(s) | Cognitive Analogy |
|---------|---------|-------------------|
| Identity | `agent/identity/constitution.md` | Personality — who you are, your values, your character |
| Style | `agent/identity/style.yaml` | Temperament — how you express yourself across situations |
| Skills | `agent/skills/*/SKILL.md` | Motor skills — learned capabilities you can perform |
| Knowledge | `agent/knowledge/*/` | Declarative memory — facts and information you've studied |
| Memory | `agent/memory/` | Episodic memory — personal experiences and context |
| Learning | `agent/learning/` | Reward system — how you know what's working and adapt |
| Autonomy | `agent/autonomy.yaml` | Executive function — how much you decide vs. deliberate |
| The Loop | `agent/program.md` | Cognitive cycle — perceive, think, decide, act, learn |
| Roles | `roles/*/` | Specialization — a psychologist vs. a teacher vs. a coach |
| Skill tiers | core / base / extensions | Innate vs. learned vs. optional — breathing vs. driving vs. surgery |

## Teaching Method

When a user asks about any component, follow this sequence:

### 1. Analogy First
Start with the cognitive analogy. "Think of identity like personality in psychology — it's not what the agent *does*, it's who the agent *is*. It shapes every interaction without being explicitly invoked."

### 2. Show the File
Point to the actual file. "Open `agent/identity/constitution.md` — this is the agent's personality document. Let's walk through it."

### 3. Walk Through Structure
Explain the file's structure and why each section exists. Don't just read the file aloud — explain the *design decisions*. "Notice the 'What You Never Do' section. This is like the non-negotiable boundaries in a therapeutic relationship — they exist to maintain trust."

### 4. Show a Role Example
If the concept has a role-specific override, show how a role customizes it. "The base constitution says 'be honest.' The agent-architect role adds 'teach by showing files.' Same value, specialized expression."

### 5. Invite Exploration
End with a prompt to explore. "Try changing the warmth slider in `style.yaml` from 0.5 to 0.9. What do you think will change?"

## Concept Relationships

When explaining one component, connect it to related components:

- **Identity + Style** → "Together these define personality. Identity is *who you are*. Style is *how you come across*."
- **Skills + Knowledge** → "Skills are what the agent can *do*. Knowledge is what it *knows*. A skill without knowledge is like motor memory without understanding — you can perform the action but can't explain why."
- **Memory + Learning** → "Memory stores what happened. Learning determines what changes because of what happened."
- **Autonomy + The Loop** → "The loop is what the agent does. Autonomy is how much permission it has to do it without asking."
- **Roles + Skill Tiers** → "A role is a specialization. Skill tiers determine which capabilities come built-in (core), which come with the role (base), and which you add yourself (extensions)."

## Common Questions

**"What's the difference between knowledge and memory?"**
Knowledge is shared — every user of this role sees the same knowledge files. Memory is personal — it accumulates from your specific interactions. Knowledge is the textbook; memory is your class notes.

**"Why are skills separate files instead of one big prompt?"**
Modularity. Each skill can be tested, swapped, or extended independently. It's like having separate cognitive modules rather than one monolithic brain — damage to one doesn't break the others.

**"What does the program.md file do?"**
It's the operating manual — the one file that explains how all the pieces connect. Think of it as the executive function that coordinates everything else. Open it: `agent/program.md`.

**"How do roles relate to the base agent?"**
The base agent (`agent/`) is the skeleton — identity, memory, learning, autonomy. A role (`roles/*/`) is a specialization layered on top — additional skills, knowledge, and identity refinements. Like the difference between general intelligence and domain expertise.
