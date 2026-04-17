---
name: guide-agent-design
description: Interactive 6-question flow for designing an agent from scratch
when_to_use: >
  User wants to design a new agent, build something from scratch, brainstorm
  an agent idea, or figure out what kind of agent they need. Also use when
  they say "I have an idea" or "I want to build."
always_interactive: true
---

# Guide Agent Design

Walk the user through a structured design conversation — 6 questions that produce a complete agent blueprint. This skill is always interactive regardless of autonomy level.

The flow is based on the design template at `workshop/design-template.md`. Reference it so users can revisit the framework on their own.

## The 6 Questions

### Question 1: Use Case + Agent Test

**Ask:** "What problem does your agent solve? Describe something you do regularly that you think an agent could help with."

**Then apply the agent test checklist:**
- [ ] Recurring — they do this regularly, not once
- [ ] Memory-dependent — it gets better with context from past rounds
- [ ] Clear success criteria — they can tell if it worked
- [ ] Structured steps — there's a process, not just creative intuition
- [ ] Recoverable mistakes — they can review and course-correct

**If fewer than 3 boxes are checked:** Gently suggest this might work better as a simpler tool (a script, a chatbot, a template). Explain why. Don't gatekeep — help them see the trade-off.

**If 3+ boxes are checked:** Affirm the use case and move forward.

### Question 2: What It Needs to KNOW

**Ask:** "What information does your agent need access to?"

**Guide them through three categories:**
- **Static knowledge** — domain content that rarely changes (textbooks, guidelines, reference material). Maps to `knowledge/` in the repo.
- **Dynamic context** — information about the user that accumulates over time (preferences, history, goals). Maps to `memory/` in the repo.
- **External data** — information the agent needs to fetch from outside (web search, APIs, databases). Maps to tools.

**Show the file:** Point to `agent/knowledge/` and `agent/memory/` to make it concrete.

### Question 3: What It Needs to DO

**Ask:** "Walk me through a typical session. What does your agent observe, think about, decide, and do?"

**Map their answer to the agentic loop:**
- **Observe** — what inputs trigger the agent? (user message, scheduled check, new data)
- **Think** — what reasoning does it perform? (analyze, compare, synthesize, plan)
- **Decide** — what choices does it make? (which action, which priority, whether to ask)
- **Act** — what outputs does it produce? (text, file changes, messages, API calls)
- **Learn** — what should it remember for next time? (what worked, what didn't, user preferences)

**Show the file:** Point to `agent/knowledge/agent-fundamentals/what-is-an-agent.md` for the loop.

### Question 4: What It Should FEEL LIKE

**Ask:** "If this agent were a person, what kind of person would it be?"

**Guide them through:**
- Communication style — warm or formal? Concise or detailed? Challenging or supportive?
- Personality traits — what 2-3 adjectives describe it?
- Non-negotiable behaviors — what must it always do? What must it never do?

**Show the file:** Point to `agent/identity/style.yaml` and explain the sliders.

### Question 5: How It LEARNS

**Ask:** "How will you know if your agent is doing a good job? How will you tell it?"

**Guide them through:**
- **Success criteria** — what does "good" look like? Be specific and observable.
- **Feedback mechanism** — how does the user signal quality? (thumbs up/down, corrections, explicit rating, observed behavior)
- **Adaptation** — what should change based on feedback? (style, priorities, approach, knowledge)

**Show the file:** Point to `agent/learning/success-criteria.md`.

### Question 6: What's the CRITICAL ELEMENT

**Ask:** "Of everything we've discussed, what's the one thing that makes or breaks this agent? The thing that, if you get it right, the agent flies — and if you get it wrong, it's a non-starter."

**Help them identify it.** Common critical elements:
- The quality of the knowledge base (garbage in, garbage out)
- Access to the right tools or data sources
- Getting the tone right for sensitive interactions
- The feedback loop that drives improvement

**Then ask:** "Do you have access to what you need for this critical element?"
- Yes — great, they can start building
- Partially — help them identify what's missing
- No — this is the blocker; help them figure out if it's solvable

## After the Flow

**Produce a design summary** with all 6 answers organized clearly.

**Offer next steps:**
1. **Start building** — use the customize-role skill to configure a role based on this design
2. **Pick a pre-built role** — use recommend-role to find the closest match
3. **Explore more** — use teach-concepts to go deeper on any concept that came up

## Teaching Notes

- Let the user talk. Don't rush through questions.
- Use their specific answers to make the concepts concrete.
- If they get stuck on a question, give an example from a different domain.
- Celebrate good thinking — when they identify a strong use case or a sharp critical element, acknowledge it.
- Reference `workshop/design-template.md` so they can revisit the framework later.
