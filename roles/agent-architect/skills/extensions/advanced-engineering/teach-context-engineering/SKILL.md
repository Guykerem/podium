---
name: teach-context-engineering
description: Deep dive into giving agents the right information at the right time
when_to_use: >
  User wants to go deeper on context engineering, asks about RAG, context
  windows, prompt architecture, or how to design the information environment
  for an agent.
tier: extension
---

# Teach Context Engineering

An extension skill that teaches the discipline of context engineering — designing dynamic systems that provide the right information, tools, and state to an LLM at the right time.

## Key Topics

- The shift from prompting to context engineering (Karpathy's "you are the operating system" frame)
- The six components of context: system instructions, conversation history, retrieved documents, tool definitions, memory, dynamic state
- Context window as working memory — capacity limits, recency bias, lost-in-the-middle effects
- RAG (Retrieval-Augmented Generation) — grounding responses in external documents
- Modular context assembly — building context dynamically per-request
- Trade-offs: more context vs. attention dilution

## Files to Reference

- `roles/agent-architect/knowledge/course-foundations/prompting-essentials.md`
- `agent/program.md` (the operating loop shows context assembly in action)
- `agent/identity/constitution.md` (system instructions as persistent context)

## Activation

This is an extension skill. Activate when the user has grasped basic concepts (identity, skills, the loop) and wants to understand the engineering layer underneath.
