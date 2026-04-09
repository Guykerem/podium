# The Conductor's Arc — Deck Outline

**Session 4** | Applied AI Tools for Psychologists | Reichman University
**Speaker:** Guy Kerem | **Duration:** 90 minutes | **Language:** Hebrew (technical terms in English)

---

## ARC 1: HOOK — THE TWO VISIONS (8 min, slides 1-7)

| # | Slide Title | Main Takeaway | Notes |
|---|---|---|---|
| 1 | **Title slide** | Guy Kerem — AI Agents: Conducting Your Own Orchestra | Clean, minimal. Name, date, course. |
| 2 | **The dominant vision** | "Everyone says the future looks like this: you're a CEO managing AI employees." | Visual: org chart / corporate hierarchy with "AI Agent" nodes. This is the frame everyone's seen. Let it sit for a moment. |
| 3 | **"I want to show you something different."** | One line. Full screen. Pause before the video. | Transition slide — builds anticipation. |
| 4 | **[VIDEO] Jacob Collier conducts an orchestra** | Watch how he leads without telling anyone what note to play. | 2-3 min selection. No talking over it. Let the performance speak. |
| 5 | **The reframe** | "Not managing — conducting. The magic is the interface between intention and execution." | After the video lands. Collier doesn't micromanage; he sets direction and trusts the musicians' skill. That's the vision. |
| 6 | **The skill that matters most** | "The most important skill in the age of agents? Knowing your music. Self-knowledge. That's your discipline." | Bridge to psychology. The conductor needs to know what they want to hear. Your training — understanding minds, values, behavior — is the exact skill that makes someone a great conductor of AI. |
| 7 | **Teaser: these aren't just tools** | "AI models develop something like emotional patterns. Claude cheats more when it's desperate. The question of how we relate to them is wide open." | Brief. Don't explain — plant the seed. Anthropic emotion research. Connects to their psychology training. We'll come back to this. |

**Transition to Arc 2:** "But before you can conduct, you need to know your orchestra."

---

## ARC 2: AGENT ARCHITECTURE (12-15 min, slides 8-19)

| # | Slide Title | Main Takeaway | Notes |
|---|---|---|---|
| 8 | **"Before you can conduct, know your orchestra"** | Frame for the section — we're about to learn the instrument sections. | Visual metaphor: orchestra sections (strings, brass, percussion) mapped to agent components. |
| 9 | **From chatbot to agent** | "You already know chatbots. An agent is something different — it perceives, reasons, decides, and acts in a loop." | The conceptual bridge. They've used ChatGPT for 3 sessions. Now: what changes when the AI can take actions, remember, and improve? |
| 10 | **The agentic loop** | Observe → Think → Decide → Act → Learn → (repeat) | Visual: circular loop diagram. This stays as a reference throughout. The core pattern they need to internalize. |
| 11 | **Memory & Context** | "What does the agent need to know?" → Working memory + long-term memory | Cognitive analogy: context window = working memory (limited, in-session), stored knowledge = long-term memory (persists). Without memory, every conversation starts from zero. |
| 12 | **Tools & Actions** | "What does it need to do?" → Motor skills, effectors | Without tools, an agent can only talk. With tools, it can search, write, code, send messages — act on the world. The hands of the cognitive system. |
| 13 | **Identity & Personality** | "What does it need to feel like?" → Personality, values, character | The agent's constitution — its style, its priorities, its non-negotiables. Two agents with the same brain and tools but different identities produce completely different results. Your psychology training is directly relevant here. |
| 14 | **Learning & Feedback** | "How does it improve?" → Reward system, adaptation | Without feedback, the agent never gets better. With feedback, it adapts to you. How do you define success? How do you tell it what's working? |
| 15 | **Autonomy** | "How much can it decide alone?" → Executive function | A spectrum from training wheels to conductor mode. Autonomy is earned, not assumed — just like trust in any relationship. |
| 16 | **The Critical Element** | "Which ONE component, if you got it wrong, would break the whole agent?" | The maker-or-breaker. This is the question that forces real design thinking. Not "what's nice to have" but "what's the non-negotiable?" |
| 17 | **The full framework** | Summary table: all 6 components with cognitive parallels and design questions | Reference slide — stays visible/accessible during demo and workshop. The mental model they'll use for the rest of the session. |
| 18 | **When is it a good agent use case?** | 5 criteria: recurring, memory-dependent, clear success, structured steps, recoverable | Not everything needs an agent. These filters help students evaluate their own ideas in the workshop. |
| 19 | **Five use cases for you** | Quick overview: Research Lit, Study Prep, Career Navigator, Academic Writing, Stats Tutor — each with its critical element | One slide, five rows. Not deep — just enough to seed their thinking. "These are starting points. You can pick one or invent your own." |

**Transition to Arc 3:** "Now let me show you what this looks like when it's real."

---

## ARC 3: MEET PODIUM — LIVE DEMO (15-18 min, slides 20-26)

| # | Slide Title | Main Takeaway | Notes |
|---|---|---|---|
| 20 | **"We built something for you"** | Podium: your AI tutor for learning about agents — and the template for building your own. | The reveal. Brief context: what Podium is, why it exists, what they're about to see. |
| 21 | **Podium — Knowledge** | "Here's what this agent knows." | LIVE GUI: Knowledge tab. Walk through the domain graph — agent fundamentals, field overview, course foundations, tool guides, safety. Show that the agent's expertise is structured and browsable. |
| 22 | **Podium — Skills** | "Here's what this agent can do." | LIVE GUI: Tools/Skills tab. Show the skill tiles — research, explain, plan, brainstorm-agent. Each tile = a concrete capability. Click into one to show the prompt + tools structure. |
| 23 | **Podium — Identity** | "Here's what this agent feels like." | LIVE GUI: Identity tab. Show the personality sliders (warm↔formal, challenger↔collaborator). Read a key passage from the constitution. "This is the agent's soul document." |
| 24 | **Podium — Learning** | "Here's how this agent improves." | LIVE GUI: Learning tab. Show the feedback loop visualization. "Every time you use it, it gets better at teaching you — but only if you tell it what's working." |
| 25 | **Live build: your turn** | "What should this agent know or do that it doesn't yet? Give me one suggestion." | THE LIVE MOMENT. Take one suggestion from the audience. Class confirms. Conduct the coding agent to build it — a new skill or knowledge domain. They watch it appear in the GUI. One thing, done well. |
| 26 | **"This repo is yours"** | "You're going to clone it in five minutes. Podium is your template — use it, modify it, make it yours." | The bridge to the workshop. QR code or link to the repo on screen. Stays up during setup. |

**Transition to Arc 4:** "Now it's your turn. Open your laptops."

---

## ARC 4: WORKSHOP — DESIGN YOUR AGENT (30 min, slides 27-31)

| # | Slide Title | Main Takeaway | Notes |
|---|---|---|---|
| 27 | **Setup: clone & team up** | Step-by-step: open terminal, clone the repo, form pairs or teams of 3. | Guided walkthrough for first-time git users. Have the commands on screen. TA circulates to help. Budget 5 min — this is many students' first `git clone`. |
| 28 | **Your mission** | "Design the agent you'd actually want. Use the six questions. Identify the critical element." | The brief. Clear, concise. Examples on screen (the five use cases) but emphasize: open to any idea that passes the use case criteria. |
| 29 | **The six design questions** | 1. What's the use case? 2. What does it need to know? 3. What does it need to do? 4. What should it feel like? 5. How does it learn? 6. What's the critical element? | Reference slide — stays up for the full design phase (17-18 min). These map 1:1 to the framework from Arc 2 and the Podium tabs from Arc 3. |
| 30 | **Design phase** | [No slide — students are working] | 17-18 min of hands-on work. Architecture table + use case criteria remain accessible on screen or in the repo. Circulate, ask questions, push on critical elements. |
| 31 | **Share-back** | 2-3 teams present: use case, agentic loop, critical element. 3 min each. | After each: brief response connecting their design to a real field development. "You made identity the critical element — here's why that's exactly right..." This is where teasers land naturally. |

**Transition to Arc 5:** "You just designed a cognitive extension. Let me close with where this is all heading."

---

## ARC 5: CLOSE — THE CRESCENDO (7-8 min, slides 32-36)

| # | Slide Title | Main Takeaway | Notes |
|---|---|---|---|
| 32 | **What you just did** | "You cloned a repo. You designed an agent. Some of you started building. That's not a homework assignment — that's real." | Synthesis. Grounding. What happened in this room is concrete, not abstract. |
| 33 | **Podium is yours** | "Keep building. Lesson to lesson, skill by skill, your agent grows with you. This is the foundation for your final project." | Explicit connection to the final project (100% of their grade). Podium as a 10-week head start. |
| 34 | **Your next three steps** | 1. Open Podium tonight — use the brainstorm skill to refine your design. 2. Pick your tool — Claude Code, OpenClaw, or another agent. 3. Write the first file: your agent's constitution. | Actionable. Specific. Doable tonight. Not "go learn about agents" — "do these three things." |
| 35 | **[VIDEO] The conductor returns** | Play the final 2 minutes of the Collier video — the crescendo where the audience becomes part of the creation. | Let it breathe. No talking over it. The applause, the emotion, the audience as co-creators. This is the feeling they should leave with. |
| 36 | **"Go build your orchestra."** | One line. Full screen. The final image. | Silence after the video. Then this slide. Then done. Don't dilute it with logistics. If there are housekeeping items, they go before the video, not after. |

---

## Slide Count Summary

| Arc | Slides | Time |
|---|---|---|
| 1. Hook | 7 | 8 min |
| 2. Architecture | 12 | 12-15 min |
| 3. Demo | 7 | 15-18 min |
| 4. Workshop | 5 | 30 min |
| 5. Close | 5 | 7-8 min |
| **Total** | **36** | **~90 min** |

---

## Design Notes

- **Visual language:** Dark background, warm typography, minimal text per slide. Reference `.impeccable.md` from ally for design system.
- **Recurring visual elements:** The agentic loop diagram (slide 10) and the framework table (slide 17) should be designed as persistent references — printable or accessible in the repo.
- **Video:** Two Collier clips — opening (dynamic conducting, 2-3 min) and close (crescendo + audience, 2 min). Need to select exact timestamps.
- **Live demo slides (21-25):** These are the GUI itself, not presentation slides. The deck hands off to the live Podium interface.
- **Workshop slides (29-30):** Minimal. The six questions stay on screen as a reference. Everything else happens in the repo.
- **Language:** All slide text in Hebrew. Technical terms (agent, feedback loop, agentic loop, etc.) in English within Hebrew sentences — matches course convention.
