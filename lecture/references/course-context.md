# Course Context — Internal Reference

> This document is for us, not students. It captures where the class stands when we walk in for session 4.

## The Course

**Title:** Applied AI Tools for Psychologists: From Language Models to Agents
**Instructor:** Dr. Yoel Shilat (yoel.shilat@post.runi.ac.il)
**TA:** Morrin Keltsh (morrin.fahy@post.runi.ac.il)
**Institution:** Reichman University, Baruch Ivcher School of Psychology (B.A.)
**Semester:** 2, 2026 — 12 sessions, 2 hours/week, Hebrew
**Students:** B.A. Psychology undergraduates
**Our session:** #4 (moved up from originally planned #7)

## Course Structure

Two phases:
1. **Sessions 1-3:** Core concepts (intro + LLMs, prompt engineering, research tools)
2. **Sessions 4-12:** Guest lectures + applied topics

We are the first guest lecture. Students have had 3 sessions of foundations.

### Full Session Map

| # | Topic | Lecturer | Category |
|---|-------|----------|----------|
| 1 | Intro to AI & LLMs | Course team | Core |
| 2 | Prompt Engineering | Liba (TA) | Core |
| 3 | Research Tools | Mar Ria Karam | Core |
| **4** | **AI Agents & Data** | **Guy Kerem** | **Guest** |
| 5 | UX Research | Inbal Berkowitz | Guest |
| 6 | Visualization | Yarden Adelman | Guest |
| 7 | AI in Organizations | Uri Simantov | Guest |
| 8 | Vibe Coding | Course team | Applied |
| 9 | AI in Digital Therapy | Dr. Adva Segal Tetro | Guest |
| 10 | AI Systems Development | Dr. Elon Goldstein | Guest |
| 11 | Quantitative Analysis | Course team | Core |
| 12 | Summary & Presentations | Course team | Summary |

## What Students Know by Session 4

### From Session 1 — Intro to AI & LLMs
- AI history: ML → deep learning → LLMs timeline
- GPT model: generative, pre-trained, transformer
- How LLMs work: tokens, embeddings, attention mechanism, probability distributions, temperature
- Key insight: LLMs are probability machines — sophisticated autocomplete, not knowledge retrieval
- Hallucinations: types (fabricated citations, invented facts, flawed reasoning, out-of-scope confidence), root causes, RAG as mitigation
- Biases in AI: gender, cultural/linguistic, recency, confirmation
- Cognitive debt: skills atrophy when cognitive tasks are fully delegated
- Agency: verify outputs, avoid overconfidence, prevent routinization, collaborate with AI

### From Session 2 — Prompt Engineering
- What prompt engineering is (etymology, definition, evolution: prompting → chaining → context engineering)
- 5 preliminary questions: task, inputs, outputs, constraints, evaluation
- 6-stage prompt framework: task, context, format, rules/style, examples, specify output
- Role prompting: useful for tone/style but doesn't improve factual accuracy (Mollick et al., 2024)
- Grice's cooperative principle applied to prompting
- Advanced techniques: Chain of Thought (CoT), zero-shot CoT, few-shot CoT, task decomposition, self-criticism, meta-prompting, self-consistency, confidence calibration
- Context windows: what they are, practical limits, management strategies
- Hands-on: students wrote and refined prompts for their own research tasks

### From Session 3 — Research Tools
- Details TBD (we don't have the slides), but the syllabus describes: finding reliable sources, scientific research, market research, checking information, distinguishing evidence-based from opinion-based information

### Vocabulary They Have
- Token, embedding, attention, context window, temperature
- Hallucination, RAG, grounding
- Prompt engineering, CoT, few-shot, zero-shot
- Cognitive debt, agency, bias

### Vocabulary They DON'T Have Yet
- Agent, agentic loop, tool use, autonomy (in the AI sense)
- Identity/constitution (for an agent)
- Memory (as an agent component, beyond context window)
- Feedback loop (as a system design concept)
- Skills (as discrete agent capabilities)
- CLI, terminal, git, repo, clone, fork

## Assessment

- **Final project (100%):** Develop an AI tool or agent integrating course principles, with reflective/critical component, present at end of semester
- **Shield grade (bonus):** Present applied case study in class (pairs), up to +10% per presentation, max 40% accumulated
- **AI policy:** Free use, must disclose which AI tools used and how

**Critical implication for us:** The final project IS building an AI tool or agent. Podium could literally become the foundation for many students' final projects. If we design it right, the workshop outputs feed directly into their semester deliverable.

## What This Means for Our Session

1. **We're early in the course.** They have foundations (LLMs, prompting) but haven't seen applied domains yet. We're their first guest, first exposure to agents, first taste of building something.

2. **They've never coded.** Session 8 (Vibe Coding) is weeks away. Our demo and workshop need to work for people who've never opened a terminal.

3. **They understand prompting but not agents.** The bridge from "good prompt" to "agent with memory, tools, and autonomy" is the key conceptual leap we need to facilitate.

4. **Their final project aligns perfectly.** If Podium becomes their boilerplate for the final project, we've given them a 10-week head start. This is a massive value proposition.

5. **The cognitive debt / agency framing is already planted.** Session 1 covered this. We can build on it — the conductor metaphor IS the answer to cognitive debt. You don't delegate; you conduct.

6. **Hebrew is primary.** All course materials are in Hebrew. Our talk should be in Hebrew. Technical terms in English are fine (they're already used to that from the course).
