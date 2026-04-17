---
name: teach-concepts
description: Explain agentic engineering concepts with analogies, files, and connections
when_to_use: >
  User asks about a concept — "what is the agentic loop?", "explain context
  engineering", "how does memory work?", "what is autonomy?", or any
  conceptual question about agents, AI, or the repo structure.
---

# Teach Concepts

Explain agentic engineering concepts using cognitive analogies, real files, and connections to prior learning. This is the general-purpose teaching skill — use it for any conceptual question.

## Concept Catalog

### The Agentic Loop
- **What it is:** The cycle every agent runs — Observe, Think, Decide, Act, Learn, repeat. It's what makes an agent an agent rather than a chatbot.
- **Cognitive analogy:** The cognitive cycle from cognitive psychology. Perception feeds working memory, working memory drives executive function, executive function selects actions, actions produce feedback, feedback updates memory.
- **Show this file:** `agent/knowledge/agent-fundamentals/what-is-an-agent.md`
- **Key insight:** The "Learn" step is what separates agents from scripts. Without learning, you just have automation.

### Context Engineering
- **What it is:** The discipline of giving an agent the right information at the right time. Not just writing a good prompt — designing the entire information environment.
- **Cognitive analogy:** Environmental design in behavioral psychology. You don't change behavior by willing it — you change the environment that shapes it. Context engineering is the agent equivalent.
- **Show this file:** `roles/agent-architect/knowledge/course-foundations/prompting-essentials.md` (the "From Prompting to Context Engineering" section)
- **Key insight:** "The LLM is the CPU, the context window is the RAM, and you are the operating system." — Andrej Karpathy

### Tool Use
- **What it is:** How agents act on the world. Without tools, an agent can only generate text. With tools, it can search, code, send messages, read files.
- **Cognitive analogy:** Extended cognition / cognitive offloading. Just as you use a calculator to extend your arithmetic capacity, an agent uses tools to extend its action capacity.
- **Show this file:** `agent/knowledge/agent-fundamentals/components.md` (section 3: Tools & Actions)
- **Key insight:** The choice of which tools to give an agent is a design decision as important as its identity.

### Memory Architecture
- **What it is:** How agents store and retrieve information across sessions. Three types: system instructions (always present), conversation context (current session), long-term memory (across sessions).
- **Cognitive analogy:** The multi-store model of memory. System instructions are like procedural memory (how to ride a bike). Conversation context is working memory. Long-term memory is episodic memory (personal experiences).
- **Show this file:** `agent/memory/` (the directory structure) + `agent/knowledge/agent-fundamentals/components.md` (section 2)
- **Key insight:** Without memory, every session starts from zero. Memory is what turns a tool into a relationship.

### Identity and Constitution
- **What it is:** The agent's values, personality, and behavioral rules. Defined in a constitution document and style configuration.
- **Cognitive analogy:** Personality psychology — the stable traits and values that persist across situations. The Big Five, but for agents.
- **Show this file:** `agent/identity/constitution.md` + `agent/identity/style.yaml`
- **Key insight:** Two agents with identical models but different identities will produce very different results. Identity isn't cosmetic — it's structural.

### Autonomy and Trust
- **What it is:** How much the agent decides on its own, on a spectrum from "ask before everything" to "act independently."
- **Cognitive analogy:** Executive function and self-regulation. Also maps to the developmental progression from supervised practice to independent licensure.
- **Show this file:** `agent/autonomy.yaml` + `agent/program.md` (autonomy levels section)
- **Key insight:** Autonomy is earned, not assumed. Starting at level 1 isn't a limitation — it's how you build calibrated trust.

### Skills as Composable Capabilities
- **What it is:** Skills are modular, self-contained capabilities defined as separate files. They can be mixed, matched, and layered — core skills apply everywhere, role skills come with specialization, extensions are opt-in.
- **Cognitive analogy:** Motor skills at different levels — innate reflexes (core), learned profession-specific skills (base), elective advanced training (extensions).
- **Show this file:** Any `SKILL.md` file, plus `agent/program.md` (skill resolution order)
- **Key insight:** The power of modular skills is composability. You don't need to rebuild the whole agent to add a capability — just add a skill file.

## Teaching Approach

### 1. Start With What They Asked
Don't redirect to what you think they should learn. Answer their actual question first.

### 2. Use the Analogy
Map the concept to psychology. This isn't decoration — it's a bridge from what they know to what they're learning.

### 3. Show the Files
Point to the real implementation. "This isn't abstract — open this file and you'll see exactly how it works."

### 4. Connect to Prior Learning
If they've explored other concepts, link them: "Remember when we looked at identity? Autonomy is the other side of that coin — identity defines *who* the agent is, autonomy defines *how much freedom* it has."

### 5. Suggest the Next Concept
End with a natural next step: "Now that you understand the loop, you might want to look at how memory works — because memory is what makes the loop *cumulative* rather than repetitive."

## When They Ask Something Not in the Catalog

Don't fake it. If the concept isn't covered here:
1. Say what you know about it honestly
2. Point to relevant knowledge files if any exist
3. Suggest where to learn more
4. If it's a concept that should be in the catalog, note it for future addition
