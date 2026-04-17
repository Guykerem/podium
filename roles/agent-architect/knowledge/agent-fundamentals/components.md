# Agent Components

Every agent is built from the same fundamental components. Here's what they are and why they matter.

## 1. Model / Reasoning

The core thinking ability. This is the large language model (LLM) — GPT, Claude, Llama, etc. — that processes language, reasons about problems, and generates outputs.

**Cognitive analogy:** General intelligence, fluid reasoning. The raw capacity to think.

**What it determines:** How well the agent understands context, how nuanced its reasoning is, how creative its solutions are.

## 2. Memory & Context

What the agent knows — both built-in knowledge and what it remembers from past interactions.

**Types of memory:**
- **System instructions** — permanent context the agent always has (its constitution, its knowledge base)
- **Conversation context** — what's happened in the current session
- **Long-term memory** — what the agent remembers across sessions (user preferences, past decisions, accumulated knowledge)

**Cognitive analogy:** Working memory + long-term memory. The ability to hold relevant information in mind and retrieve past experience.

**What it determines:** Whether the agent gives generic answers or personalized, context-aware ones.

## 3. Tools & Actions

How the agent acts on the world. Without tools, an agent can only produce text. With tools, it can:
- Search the web
- Read and write files
- Execute code
- Send messages
- Call APIs
- Access databases

**Cognitive analogy:** Motor skills, effectors. The hands and voice of the cognitive system.

**What it determines:** What the agent can actually *do*, not just *say*.

## 4. Identity & Personality

The agent's character — its values, communication style, priorities, and constraints. Defined through a constitution (a document of principles) and style configuration.

**Cognitive analogy:** Personality, internalized values, moral framework. The answer to "what kind of person is this?"

**What it determines:** How the agent behaves, what it prioritizes, how it communicates. Two agents with the same model and tools but different identities will produce very different results.

## 5. Learning & Feedback

How the agent improves over time. This includes:
- Success criteria — how it knows if it did well
- Feedback mechanisms — how the user signals quality
- Adaptation rules — what changes based on feedback

**Cognitive analogy:** Reward system, reinforcement learning, metacognition. The ability to evaluate your own performance and adjust.

**What it determines:** Whether the agent gets better with use or stays the same.

## 6. Autonomy

How much the agent decides on its own. This is a spectrum:
- **Level 1:** Ask before every action (training wheels)
- **Level 2:** Act on routine tasks, ask on judgment calls (assisted)
- **Level 3:** Act autonomously, surface only blocking decisions (conductor mode)

**Cognitive analogy:** Executive function, self-regulation. The balance between impulse and deliberation.

**What it determines:** How much the agent does for you vs. with you.
