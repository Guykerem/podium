---
name: recommend-role
description: Help user choose between pre-built roles or building custom
when_to_use: >
  User wants help picking a role, isn't sure which one to use, says "what
  roles are available?", "which one should I pick?", or "I don't know where
  to start." Also use after guide-agent-design if the design matches an
  existing role.
---

# Recommend Role

Help the user choose the right role for their needs — or decide to build a custom one.

## Available Roles

| Role | One-Line Pitch | Key Skills |
|------|---------------|------------|
| **agent-architect** | Learn to understand, design, and build AI agents | Agent design, architecture explanation, concept teaching |
| **assistant** | A general-purpose personal assistant | Task management, research, scheduling, communication |
| **tutor** | A personalized learning companion | Explain concepts, create exercises, track progress, adapt difficulty |
| **creator** | A creative collaborator for writing and projects | Brainstorm, draft, edit, structure, maintain voice |

> **Note:** Not all roles may be fully built yet. Check `roles/` for what's currently available. The agent-architect role is always available as the default.

## Decision Flow

### Step 1: Ask What They Want Help With

"What are you hoping your agent will help you with? Don't worry about technical terms — just describe the situation."

### Step 2: Listen for Keywords

Map their description to roles:

| If they mention... | Consider... |
|---|---|
| Learning, studying, understanding concepts, course material | **tutor** |
| Organizing, scheduling, tasks, email, reminders | **assistant** |
| Writing, brainstorming, creating content, projects | **creator** |
| Building agents, understanding AI, designing systems | **agent-architect** |
| Something that doesn't fit any of these | **custom build** |

### Step 3: Recommend With Explanation

Don't just name the role — explain *why* it fits:

"Based on what you described, the **tutor** role sounds like the best fit. Here's why: you mentioned wanting help understanding course material and getting personalized explanations. The tutor role is designed exactly for that — it has skills for breaking down concepts, creating practice exercises, and adapting to your learning style."

### Step 4: Show What's Inside

Give them a quick tour of the recommended role:
- What skills it comes with (base skills)
- What extensions are available
- What knowledge it has
- How they can customize it

### Step 5: Offer the Path Forward

**If they pick a pre-built role:**
- Invoke the `customize-role` skill to personalize it
- Or invoke the onboarding flow if they want to start immediately

**If they want something custom:**
- Invoke `guide-agent-design` to walk through the 6-question design flow
- Explain that they can start from the closest role and modify it

**If they're not sure:**
- Ask one more clarifying question
- Or suggest they start with agent-architect (this role) to learn more before deciding

## Teaching Moments

When recommending roles, use these as natural teaching opportunities:

- **"Why are there separate roles?"** — Specialization. A psychologist and a surgeon both went to medical school, but you wouldn't want a surgeon doing therapy. Same model, different configuration.
- **"Can I switch roles later?"** — Yes. Roles are overlays on the base agent. Switching roles changes skills and knowledge, but the base identity and your memory persist.
- **"Can I combine roles?"** — Not directly (one active role at a time), but you can copy skills or knowledge from one role to another. That's the power of the modular structure.

## Tone

Be warm but direct. Don't oversell any role. If their use case doesn't fit well, say so — and help them build something custom. The goal is the right fit, not any fit.
