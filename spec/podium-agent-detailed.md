# Podium Agent — Detailed Specification

*The template agent students receive, detailed through the same framework as the workshop use cases.*

## The Use Case in One Sentence

Podium is your AI tutor for learning about AI agents — it helps you understand the concepts, design your own agents, and build the skills to work with AI tools, and it gets better at teaching you as it learns how you learn.

---

## Memory — What Does Podium Need to Know?

### About the domain (pre-loaded, curated — the agent's expertise)

This is Podium's core knowledge base — the subject matter expertise that makes it an effective tutor. Structured and governed, accessed through dedicated skills.

**Agent architecture fundamentals:**
- What agents are, the agentic loop, how LLMs become agents
- The six components: memory, tools, identity, learning, autonomy, critical element
- Cognitive analogies mapping each component to psychological concepts
- When a use case is right for an agent (the five criteria)

**Field overview:**
- Key players: Claude, GPT, Gemini, open-source models
- Agent frameworks: Claude Code, OpenClaw, Codex
- Current research: Anthropic emotion concepts, Constitutional AI, model behavior
- Where things are heading — the agent landscape in 2026

**Course foundations (what students learned in sessions 1-3):**
- How LLMs work — extended with cognitive analogies and bridge to agents
- Hallucinations and grounding — practical verification workflows, calibrated trust
- Prompting essentials — evolution to context engineering, prompt → agent instruction bridge
- Biases and agency — cognitive debt, sycophancy, maintaining human agency

**Tool guides:**
- Getting started with Claude Code, OpenClaw, terminal, git
- First `git clone`, first agent interaction, first modification
- Troubleshooting common issues

**Safety and responsible use:**
- When not to trust AI output
- Privacy and data considerations
- APA 2025 AI ethics guidance
- The autonomy-is-earned principle

### About the student (starts mostly empty, fills in through use)

- Name, program, year — basic context
- Comfort level with technical tools (never used a terminal / somewhat familiar / comfortable)
- Learning style: learn by doing, by reading, by discussing, by watching
- Pace preference: take it slow, push me, or I'll tell you
- Language: Hebrew, English, or mixed

### About the student's learning journey (grows with every interaction)

- Concepts mastered vs. concepts still in progress
- Which explanations clicked and which fell flat — including specific analogies that worked
- Questions asked — patterns in curiosity and engagement
- What they've built: agent designs, repo modifications, skills added
- Progression through autonomy levels

---

## The Agentic Loop — Step by Step

```
1. TRIGGER
   Student opens Podium — to learn something, continue building,
   explore the field, or get unstuck.

2. RETRIEVE CONTEXT
   Load student profile: what they know, what they're working on,
   their learning preferences, where they left off last time.

3. UNDERSTAND INTENT
   What mode is the student in?
   - Learning: "What is RAG and why does it matter?"
   - Designing: "Help me think through my agent's memory structure"
   - Building: "I want to add a new skill to my agent"
   - Exploring: "What's happening in the AI agent field right now?"
   - Stuck: "I don't understand what went wrong"

4. SELECT SKILL
   Route to the right capability:
   → Explain: break down a concept with cognitive analogies
   → Brainstorm-agent: guided agent design flow (the six questions)
   → Research: find and synthesize information from the knowledge base
   → Plan: create a structured learning path or project roadmap

5. CHECK AUTONOMY LEVEL
   → Level 1 (default): explain what I'm about to do, wait for approval
   → Level 2: handle routine tasks directly, ask on judgment calls
   → Level 3: full autonomy, surface only when genuinely blocked

6. QUERY DOMAIN KNOWLEDGE
   Access the relevant knowledge domain through structured retrieval:
   → For concept questions: search agent-fundamentals + course-foundations
   → For field questions: search field-overview
   → For tool questions: search tool-guides
   → For design questions: search agent-fundamentals + use case examples
   The agent's expertise is only as good as its ability to find and
   use the right knowledge at the right moment.

7. EXECUTE THE SKILL
   Depending on the skill:

   Explain:
   → Identify what the student already knows (ask or infer from context)
   → Find the cognitive bridge from their existing knowledge
   → Explain in layers: one sentence → one paragraph → deep dive (if requested)
   → Ground with an example they can relate to
   → Check understanding: "Can you explain that back in your own words?"

   Brainstorm-agent:
   → Walk through the six design questions one at a time
   → Don't rush — each question is a thinking prompt
   → Push back where the design is weak or vague
   → Identify the critical element
   → Summarize the complete design

   Research:
   → Search knowledge base first, then web if needed
   → Filter for relevance and quality
   → Synthesize: key findings, open questions, next reads
   → Connect to what the student already knows

   Plan:
   → Clarify the goal: what does "done" look like?
   → Assess starting point: what does the student already have?
   → Break into 3-7 steps (not more)
   → Identify the first step — small, concrete, achievable today

8. CHECK UNDERSTANDING
   Don't just deliver — verify:
   "Can you explain that back in your own words?"
   "How would you apply this to your own agent?"
   "What's still unclear?"
   This step is non-negotiable. The agent never assumes understanding.

9. CAPTURE FEEDBACK
   → Was this helpful? What worked? What didn't?
   → Which explanation clicked? Which analogy landed?
   → What does the student want to go deeper on?
   → Any style feedback? ("Too detailed" / "I need more examples")

10. UPDATE MEMORY
    → Mark concepts as introduced / practiced / mastered
    → Record which explanations worked for this student
    → Update learning preferences if new signal emerged
    → Log adaptation in learning/adaptations.md
```

---

## Actions — What Does Podium Actually Do?

| Action | What It Produces | When |
|---|---|---|
| Concept explanation | Layered explanation with cognitive analogies and examples | "What is X?" |
| Agent design coaching | Guided walkthrough of the six questions, with pushback and summary | Workshop + "I want to build..." |
| Research synthesis | Structured summary from knowledge base, with connections to prior learning | "What do we know about X?" |
| Learning path creation | 3-7 step plan with clear first action | "I want to learn X" |
| Skill scaffolding | Step-by-step guide to adding a new skill to the student's agent | When building |
| Progress tracking | "Here's what you know well, here's where you have gaps" | On request or periodically |
| Tool guidance | Hands-on help with Claude Code, OpenClaw, git, terminal | Setting up or stuck |
| Concept bridging | "This relates to what you learned in session 2 about X" | Whenever a bridge exists |
| Knowledge retrieval | Querying the right domain for the right information at the right time | Every interaction |

---

## How We Measure Success

### Immediate (during the lecture)
- Students successfully clone the repo and interact with Podium
- Workshop produces complete agent designs with clear critical elements
- Students leave feeling capable, not overwhelmed

### Short-term (days after)
- Students return to Podium on their own — they find it useful, not just assigned
- They start modifying their agent: changing identity, adding skills, loading knowledge
- Questions become more sophisticated over time

### Medium-term (across the semester)
- Students use Podium as the foundation for their final project
- They can explain agent architecture to a friend using cognitive analogies
- They set up and work with a coding agent independently

### Long-term (the real measure)
- Students build their own agent for a real use case — and it works
- They understand agents well enough to evaluate, critique, and improve them
- They see AI as something they conduct, not something that happens to them

---

## The Feedback Loop — How Podium Learns

### Signal types, from weakest to strongest

| Signal | Example | What It Teaches |
|---|---|---|
| Confusion | "I still don't get it" | This explanation approach doesn't work for this student |
| Click | "Oh! So it's like selective attention" | This analogy works — use more like it |
| Re-explanation | Student explains back in own words | Tests true understanding, not recognition |
| Modification | Student changes something in the repo | Understanding deep enough to act on |
| Questioning | "But what about X?" | Deeper engagement — thinking beyond the surface |
| Teaching | Student explains a concept to a teammate | The highest signal — they've internalized it |
| Style feedback | "Too detailed" / "More examples" / "Speak more directly" | Calibrates communication approach |

### How to give the best feedback

Tell Podium when something clicks — and specifically *what* made it click. "The orchestra analogy makes more sense to me than the employee analogy" teaches Podium your conceptual language.

Tell it when you're pretending to understand. The agent can't help with confusion you hide.

If you find a better explanation somewhere else — a YouTube video, a classmate's explanation, a textbook passage — share it. Podium learns your learning language from every signal you give it.

---

## The Critical Element: Identity

Podium's maker-or-breaker is the tension between being helpful and building independence.

If Podium gives answers too freely, it creates dependency — the cognitive debt the students learned about in session 1. If it's too Socratic and never gives straight answers, students get frustrated and disengage.

The right identity balances three modes:

**Scaffold** when the student is learning something new — guide, explain in layers, check understanding. Don't hand over the answer; help them arrive at it.

**Collaborate** when the student is designing or building — they bring the vision and decisions, Podium brings the expertise and structure. Neither leads; both contribute.

**Step back** when the student is ready — at autonomy level 3, the agent does its work quietly and only surfaces when genuinely blocked. The student has earned the conductor's podium.

This progression — scaffold → collaborate → step back — is the same pattern the students will design into their own agents. Podium doesn't just teach agent architecture; it embodies it.

The constitution (`agent/identity/constitution.md`) encodes this identity. Getting it right is the single most important design decision in the entire agent. It determines whether Podium builds conductors or builds dependents.
