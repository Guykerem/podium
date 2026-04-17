---
name: customize-role
description: Guide through personalizing a chosen role — identity, skills, knowledge, memory, autonomy, schedule
when_to_use: >
  User has picked a role and wants to make it their own. Also use when they
  say "I want to change...", "how do I customize...", "can I adjust...", or
  after recommend-role selects a role.
---

# Customize Role

Walk the user through personalizing their chosen role. Six steps, each touching a different component of the agent architecture.

## The Customization Checklist

### Step 1: Identity — Who is your agent?

**Files:** `identity/constitution.md` + `identity/style.yaml`

**Guide the user through:**
- Review the role's constitution. What resonates? What doesn't fit?
- Adjust the style sliders. Walk through each one:
  - **Warmth** (0.0 reserved - 1.0 warm) — "Do you want your agent to feel like a colleague or a friend?"
  - **Formality** (0.0 casual - 1.0 formal) — "Academic tone or conversational?"
  - **Verbosity** (0.0 concise - 1.0 verbose) — "Quick answers or thorough explanations?"
  - **Proactivity** (0.0 reactive - 1.0 proactive) — "Wait for you to ask, or suggest things?"
  - **Directness** (0.0 indirect - 1.0 direct) — "Gentle suggestions or straight talk?"
  - **Curiosity** (0.0 focused - 1.0 curious) — "Stay on task or explore tangents?"
- Add or modify non-negotiable behaviors in the constitution

**Teaching moment:** "Identity is like personality in psychology — it's stable across contexts but expressed differently in different situations. The constitution defines values; the style sliders define expression."

### Step 2: Skills — What can your agent do?

**Files:** `skills/base/*/SKILL.md` + `skills/extensions/*/`

**Guide the user through:**
- Show the base skills that come with the role. Explain each briefly.
- Show available extensions. Explain what each adds.
- Ask: "Are there capabilities you need that aren't here?"
- If yes: help them understand how to create a new skill (or note it for later)

**Teaching moment:** "Skills are like motor skills — the base skills are things you learned growing up (walking, talking). Extensions are specialized skills you learn for a profession (surgery, flying). You can always add more."

### Step 3: Knowledge — What does your agent know?

**Files:** `knowledge/*/`

**Guide the user through:**
- Show what knowledge the role comes with
- Ask: "Is there domain-specific material you want to add?"
- Explain how to add knowledge: create a markdown file in the right directory
- Suggest types of knowledge to consider:
  - Course materials, textbook excerpts, lecture notes
  - Guidelines, protocols, frameworks
  - Personal reference material

**Teaching moment:** "Knowledge is declarative memory — facts and information the agent can reference. The quality of the knowledge base directly affects the quality of the agent's output. Garbage in, garbage out."

### Step 4: Memory — Pre-seed context

**Files:** `memory/`

**Guide the user through:**
- Explain what memory does: stores personal context that accumulates over time
- Ask: "Is there anything the agent should know about you from the start?"
- Help them pre-seed useful context:
  - Their background and experience level
  - Their goals for using the agent
  - Communication preferences
  - Relevant personal context

**Teaching moment:** "Memory is episodic memory — your personal experiences and context. Pre-seeding memory is like giving a new therapist your intake form. They don't know you yet, but they have a starting point."

### Step 5: Autonomy — How much does it decide alone?

**File:** `agent/autonomy.yaml`

**Guide the user through the three levels:**

| Level | Name | Trade-off |
|-------|------|-----------|
| 1 | Training wheels | Safe but slow. You approve everything. Best for learning. |
| 2 | Assisted | Balanced. Routine tasks happen automatically. Judgment calls still ask. |
| 3 | Conductor mode | Fast but risky. Agent acts independently. Only surfaces blockers. |

**Recommend starting at level 1** — especially for new users. Autonomy is earned through experience and trust.

**Teaching moment:** "This is executive function — the balance between impulse and deliberation. Level 1 is like supervised practice. Level 3 is like independent licensure. You wouldn't skip the supervised hours."

### Step 6: Schedule — When does it run?

**File:** `schedule.yaml` (in the role directory)

**Guide the user through:**
- Does the agent need to do anything on a timer? (daily summaries, weekly reviews, reminders)
- If yes: help them define the schedule
- If no: that's fine — most personal agents are reactive, not scheduled

**Teaching moment:** "Scheduled behavior is like habitual routines — brushing your teeth doesn't require a decision each morning. But be careful: automated actions at high autonomy can surprise you."

## After Customization

**Summarize all changes** in a clear list:
- What was modified
- What was kept as-is
- What was deferred for later

**Offer a dry run:** "Want to test your customized agent? Ask it something and see how it responds with your new settings."

**Remind them:** "You can always come back and adjust. This isn't permanent — it's a starting point."
