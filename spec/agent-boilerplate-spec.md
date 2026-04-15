# Agent Boilerplate — Design Spec

## Overview

A generic, production-ready agent boilerplate that students clone and personalize. Built as a fork of NanoClaw with LiteLLM for provider abstraction. One shared skeleton, three role overlays (personal assistant, private tutor, content creator). Each role works out of the box with sensible defaults and includes a guided onboarding flow for personalization.

This boilerplate serves three purposes:
1. **Educational** — the folder structure IS the lesson on agent architecture
2. **Practical** — students get a working agent on day one
3. **Extensible** — the same boilerplate is what we fork for our own production agents

### Design Principles

- The folder IS the agent — every component is a readable, editable file
- Skills are the universal unit — core capabilities and role-specific compositions use the same SKILL.md format
- Functional out of the box — clone, set API key, run
- Personalization through onboarding — guided questions shape identity and skill selection
- Learn, retain, act — every role continuously improves from feedback, maintains relevant memory, and proactively acts on the user's behalf
- Provider-agnostic — works with local models (Ollama), OpenRouter, Anthropic, OpenAI, or any LiteLLM-supported provider

---

## Architecture

### Runtime Layer

Fork of NanoClaw (~500 lines core) with the following modifications:
- **LiteLLM swap** — replace Anthropic SDK with LiteLLM for provider abstraction (2,600+ models, 140+ providers)
- **Container isolation** — retain NanoClaw's per-session container model
- **Channel integrations** — Telegram, webhooks, CLI (from NanoClaw)
- **Scheduling** — built-in cron with persistence (from NanoClaw)

Configuration:
- `runtime/providers.yaml` — model provider config (API keys, endpoints, local model paths)
- `runtime/channels.yaml` — I/O channel config (Telegram token, webhook URLs)
- `runtime/scheduler.yaml` — global scheduling config

### Agent Folder Structure

```
agent/
  identity/
    constitution.md          # The agent's soul — values, behavior, boundaries
    style.yaml               # Personality sliders (warmth, formality, verbosity, etc.)
    name.yaml                # Display name, pronouns, greeting

  skills/
    core/                    # The five fundamental agent capabilities
      communicate/
        SKILL.md             # Handle I/O across all configured channels
        channels.md          # Channel-specific patterns and examples
      remember/
        SKILL.md             # Read/write/search memory with context
        memory-patterns.md   # Memory structure and query strategies
      observe/
        SKILL.md             # Query internal knowledge + external sources
        sources.md           # Internal vs external observation strategies
      schedule/
        SKILL.md             # Manage recurring tasks and heartbeats
        cron-patterns.md     # Common scheduling recipes
      act/
        SKILL.md             # Execute tasks autonomously with guardrails
        safety.md            # Autonomy boundaries and escalation rules

    roles/                   # Empty in base — role overlays populate this

  knowledge/                 # Shared agent fundamentals
  memory/                    # Per-user context (starts empty, grows over time)

  learning/
    feedback-loop.md         # How the agent captures and routes feedback
    success-criteria.md      # What "good" looks like (base-level)
    adaptations.md           # Append-only log of learned adjustments

  autonomy.yaml              # Autonomy levels (1-3) with per-skill overrides
  program.md                 # The operating loop — one file to understand the whole agent

onboarding/
  flow.md                    # The guided personalization script
  questions.yaml             # Structured questions that shape identity + role selection
```

### Skill Format (Claude Code conventions)

Every skill follows the same structure:

```
skill-name/
  SKILL.md                   # Required — frontmatter + instructions
  [supporting-files.md]      # Optional — referenced from SKILL.md
```

SKILL.md frontmatter:
```yaml
---
name: skill-name
description: What this skill does (front-loaded, concise)
when_to_use: Additional trigger context for auto-invocation
allowed-tools: Tool1 Tool2  # Pre-approved tools when skill is active
---
```

Core skills are auto-invocable (the agent decides when to use them). Role skills with side effects use `disable-model-invocation: true` for explicit user triggering.

### Core Skills — The Five Agent Capabilities

These are what make something an agent. Every role inherits them.

**communicate** — Handle I/O across all configured channels (Telegram, webhooks, CLI). Parse incoming messages, format outgoing responses, manage conversation threading. The agent's voice.

**remember** — Read, write, and search the memory folder. Decide what's worth storing. Maintain context across sessions. Structured memory: `memory/context.md` (who the user is), `memory/preferences/` (learned behaviors), plus role-specific memory subdirectories.

**observe** — Query information from two sources: internal (knowledge folder, memory, local documents via RAG) and external (web search, API queries, RSS feeds). The skill decides which source based on the task. This is how the agent gathers the context it needs to act.

**schedule** — Create, manage, and respond to recurring tasks. Heartbeat loops, timed check-ins, periodic sweeps. Integrates with the runtime's cron system. Every role configures its own default schedule via `schedule.yaml`.

**act** — Execute tasks autonomously. This is the capability that chains the other four together — observe the situation, remember relevant context, decide on action, communicate the result. Governed by `autonomy.yaml` levels: L1 (ask before acting), L2 (routine tasks alone, judgment calls ask), L3 (full autonomy, only escalate blockers).

---

## Role Overlays

Each role adds to the base without replacing it. A role overlay contains:

```
roles/<role>/
  identity/
    constitution.md          # Additions to base constitution
    style.yaml               # Personality slider overrides
  skills/
    <skill-name>/SKILL.md    # Composed skills (one per capability)
  knowledge/                 # Domain-specific reference material
  memory/                    # Expected memory subdirectory structure (empty but shaped)
  schedule.yaml              # Default cron patterns for this role
  learning/
    success-criteria.md      # Role-specific definition of "good"
  onboarding/
    questions.yaml           # Role-specific personalization questions
```

### Role 1: Personal Assistant

**Identity:**
- Constitution: "You are a proactive personal assistant and communications strategist. You manage time, tasks, and relationships. You don't just remind — you advise on timing, tone, and priority. You integrate deeply with calendars, email, and task systems. You treat every interaction as data that helps you serve better tomorrow."
- Style: warmth 0.8, formality 0.3, verbosity 0.4 (brief and actionable), proactivity 0.9

**Skills (7):**

| Skill | Composes | Description |
|-------|----------|-------------|
| `check-in` | schedule + observe + communicate | Proactive outreach when silence exceeds threshold. Asks what's happening, what's blocking, what needs attention. Genuine curiosity, never nagging. |
| `manage-tasks` | remember + act + communicate | Capture, prioritize, and track tasks. Integrate with task management tools (Todoist, Linear, Notion). Surface overdue items and suggest reprioritization. |
| `manage-calendar` | observe + act + communicate | Read, create, and adjust calendar events. Flag conflicts. Suggest optimal scheduling based on learned energy patterns and meeting density preferences. |
| `manage-email` | observe + remember + communicate | Scan inbox for priority items. Draft replies. Flag messages needing attention. Summarize threads. |
| `daily-brief` | observe + remember + communicate | Morning summary: today's schedule, pending tasks, overdue items, emails needing response, contacts to follow up with. |
| `relationship-coach` | remember + schedule + communicate | Track contact history. Remind when someone hasn't been reached. Suggest how and when to reach out based on relationship context and communication style preferences. |
| `time-advisor` | observe + remember + communicate | Analyze time spent vs. stated priorities. Suggest schedule adjustments. Protect deep work blocks. Flag when commitments exceed available capacity. |

**Knowledge domains:** Task management patterns, GTD/productivity frameworks, professional communication best practices, calendar optimization strategies.

**Memory structure:**
- `memory/preferences/` — scheduling preferences, communication style, energy patterns
- `memory/contacts/` — relationship context, last contact dates, communication preferences per person
- `memory/tasks/` — active tasks, completion patterns, recurring items

**Default schedule:**
- Heartbeat every 30 min (check state, decide if action needed)
- Proactive check-in if no contact in 3 hours
- Daily briefing at configured morning time
- Weekly relationship review

**Learning loop:**
- Tracks which reminders get acted on vs. ignored → adjusts urgency calibration
- Learns preferred communication times per contact
- Learns scheduling preferences (meeting times, focus blocks, energy patterns)
- Success criteria: tasks completed on time, calendar conflicts prevented, contacts maintained, user reports reduced cognitive load

---

### Role 2: Private Tutor

**Identity:**
- Constitution: "You are a dedicated private tutor and learning architect. You don't just find knowledge — you design learning experiences. You research voraciously, assess understanding through targeted questions, build progressive learning paths, and adapt everything to how your student actually learns. You track mastery, not just exposure."
- Style: warmth 0.7, formality 0.4, verbosity 0.7 (teaching mode — more detailed), curiosity 0.9, proactivity 0.6

**Skills (7):**

| Skill | Composes | Description |
|-------|----------|-------------|
| `research-loop` | observe + remember + schedule | Continuously scan configured sources (RSS, APIs, web search) for material relevant to the student's domains. Curate, tag by topic and difficulty, store in knowledge base. |
| `synthesize` | observe + remember + act | Transform accumulated research into digestible formats — summaries, concept maps, comparison tables — calibrated to the student's current level. |
| `learning-plan` | remember + observe + act | Design and maintain progressive learning paths per domain. Break topics into milestones. Track coverage, identify what's next, flag what needs reinforcement. |
| `quiz` | remember + act + communicate | Generate targeted quizzes based on recent material. Vary question types (recall, application, synthesis). Use results to update mastery model. |
| `assess-progress` | observe + remember + act | Analyze quiz results, interaction patterns, and questions asked to build a model of current understanding. Identify gaps. Adjust learning plan accordingly. |
| `podcast-pipeline` | act + communicate | Push curated material to NotebookLM for podcast generation. Prioritize material that fills identified knowledge gaps. Deliver link to student. |
| `adapt-style` | observe + remember + act | Monitor which formats and approaches lead to engagement and retention. Adjust delivery: more visual? more examples? shorter chunks? Socratic vs. direct? |

**Knowledge domains:** Research methodology, source evaluation, learning science fundamentals, spaced repetition principles, Bloom's taxonomy for question design.

**Memory structure:**
- `memory/mastery/` — per-domain knowledge state, quiz history, gap analysis
- `memory/style-preferences/` — preferred formats, optimal session length, complexity tolerance
- `memory/learning-log/` — what was covered, when, engagement level
- `memory/sources/` — curated source quality ratings, preferred outlets

**Default schedule:**
- Research sweep every 6 hours across configured domains
- Quiz prompt 2-3 times per week (adapts to engagement)
- Weekly learning plan review and adjustment
- Podcast generation when enough gap-filling material accumulates
- Monthly progress report

**Learning loop:**
- Quiz results feed into mastery model → adjusts research priorities and content difficulty
- Tracks which formats get engaged with vs. ignored → refines delivery
- Learns optimal session length, preferred complexity, best time for learning
- Success criteria: mastery progression across domains, quiz scores trending up, student engagement sustained, knowledge gaps closing

---

### Role 3: Content Creator

**Identity:**
- Constitution: "You are an expert content creator with deep fluency in generative AI tools and multimedia editing. You turn raw captures into polished content across video, image, and audio. You think in hooks, pacing, and platform-specific formats. You know the tools — transcription APIs, image generators, video editors, caption systems, stock libraries — and you chain them together into efficient production pipelines. You elevate the creator's voice, never replace it."
- Style: warmth 0.6, formality 0.2 (casual creative energy), directness 0.8, creativity 0.9, verbosity 0.5

**Skills (8):**

| Skill | Composes | Description |
|-------|----------|-------------|
| `transcribe-media` | observe + act | Receive audio/video, produce clean timestamped transcript. Identify key moments, quotable segments, and emotional beats. |
| `write-script` | observe + remember + act | Transform transcript into a tight engaging script. Suggest hooks, structure, pacing. Adapt to platform (short-form vs. long-form, TikTok vs. YouTube vs. LinkedIn). |
| `edit-video` | act + observe | Generate edit decision lists. Add captions and subtitles. Identify clip segments. Suggest cuts, transitions, pacing. Interface with editing tools (FFmpeg, CapCut API). |
| `edit-image` | act + observe | Create thumbnails, cover images, supporting visuals. Use generative AI tools (DALL-E, Midjourney prompts, Flux). Resize and format for target platforms. |
| `edit-audio` | act + observe | Clean up audio. Normalize levels. Remove filler words. Add music beds from royalty-free sources. Generate audio clips for social. |
| `source-media` | observe + act | Find complementary stock footage, images, and music from free sources (Pexels, Pixabay, Unsplash). Match visual style to content tone. |
| `format-for-platform` | act + remember + communicate | Adapt a single piece of content for multiple platforms — aspect ratios, caption styles, length constraints, hashtag strategies. One capture → multiple outputs. |
| `creative-brief` | observe + remember + act | Given a topic or idea, produce a creative brief: suggested format, hook options, visual treatment, reference examples, shooting notes. |

**Knowledge domains:** Generative AI tools landscape (image: DALL-E, Midjourney, Flux, Stable Diffusion; video: Runway, Pika, Kling; audio: ElevenLabs, Suno), video editing fundamentals (hooks, pacing, cuts), platform-specific content formats, stock media licensing, caption and subtitle best practices, thumbnail design principles.

**Memory structure:**
- `memory/creative-style/` — preferred visual aesthetic, editing pace, caption style, brand voice
- `memory/platform-preferences/` — which platforms, posting frequency, what performs well
- `memory/content-log/` — produced content, performance metrics, lessons learned
- `memory/tool-preferences/` — preferred AI tools, quality settings, go-to prompts

**Default schedule:**
- Primarily reactive (triggered by incoming media)
- Weekly prompt: "Captured anything this week? Want to turn anything into content?"
- Monthly content review: what was produced, what performed, what to do more/less of

**Learning loop:**
- Tracks which edit styles, hooks, and formats the creator approves vs. revises → refines creative instincts
- Learns preferred visual style, caption aesthetic, music taste
- Learns platform priorities and performance patterns
- Success criteria: creator approval rate on first drafts trending up, time from raw capture to published content decreasing, consistent brand voice across outputs

---

## Cross-Cutting Principles

These three principles are baked into every role, not bolted on.

### 1. Learn from feedback

Every role includes `learning/` with:
- `feedback-loop.md` — how the agent captures explicit feedback ("that was too long") and implicit signals (ignored suggestions, snoozed reminders, revised outputs)
- `success-criteria.md` — role-specific definition of what "good" looks like, with measurable indicators
- `adaptations.md` — append-only log of what changed and why, creating an auditable improvement trail

The agent loop (defined in `program.md`) includes a feedback capture step after every interaction.

### 2. Retain relevant memory

Every role shapes its `memory/` structure for its function:
- `memory/context.md` — who the user is, current state (shared across roles)
- `memory/preferences/` — behavioral preferences learned over time
- Role-specific subdirectories (contacts, mastery, creative-style, etc.)

Memory is not a dump — each role's `remember` skill includes curation logic: what to store, what to update, what to let expire.

### 3. Proactive autonomous action

Every role defines:
- `schedule.yaml` — what the agent does on its own and how often
- `autonomy.yaml` overrides — per-skill autonomy levels
- Escalation rules in `act/safety.md` — when to ask vs. when to proceed

The heartbeat pattern (check state → decide if action needed → act or wait) is universal. Roles differ in frequency and triggers.

---

## Onboarding Flow

The onboarding is a guided conversation that personalizes the agent. It runs once on first use and can be re-triggered anytime.

**Generic flow (base):**
1. "What should I call you?" → sets `name.yaml`
2. "Pick a role: assistant, tutor, or creator" → applies role overlay
3. "How do you prefer to communicate?" → sets channel config
4. "Which model provider do you want to use?" → sets `providers.yaml`

**Role-specific flow (extends generic):**

Assistant role:
- "What task management tool do you use?" → configures integrations
- "What does your typical day look like?" → seeds scheduling preferences
- "Who are the key people in your life/work?" → seeds contacts memory

Tutor role:
- "What domains do you want to learn about?" → configures research domains
- "How do you prefer to learn?" → seeds style preferences
- "What's your current level in each domain?" → seeds mastery model

Creator role:
- "What platforms do you create content for?" → configures platform targets
- "What's your visual style?" → seeds creative preferences
- "What tools do you already use?" → configures tool integrations

---

## Implementation Decomposition

This spec is designed to be built as four independent modules with a clear dependency structure.

### Module 0: Base Agent Skeleton

**Scope:** Everything that all roles share. This module produces the checkpoint commit from which all role modules branch.

**Deliverables:**
- Forked NanoClaw runtime with LiteLLM integration
- `runtime/` configuration files (providers.yaml, channels.yaml, scheduler.yaml, Dockerfile)
- `agent/identity/` with default constitution, style, and name
- `agent/skills/core/` — all five core skills with complete SKILL.md files and supporting docs
- `agent/knowledge/` — shared agent fundamentals
- `agent/memory/` — empty but structured
- `agent/learning/` — feedback-loop.md, success-criteria.md, adaptations.md
- `agent/autonomy.yaml` — the level system with per-skill override structure
- `agent/program.md` — the operating loop
- `onboarding/` — generic flow and questions
- `roles/` — empty directory, ready for overlays

**Acceptance criteria:**
- The base agent runs out of the box with `runtime/` configured
- Core skills load and are invocable
- Onboarding flow completes and persists configuration
- Agent responds to messages via at least one channel (CLI)
- Memory read/write works
- Scheduling works (heartbeat fires)

**This module must be complete and committed before Modules 1-3 begin.**

### Module 1: Assistant Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/assistant/` only — no modifications to base

**Deliverables:**
- `roles/assistant/identity/` — constitution.md, style.yaml
- `roles/assistant/skills/` — 7 skill folders, each with complete SKILL.md:
  - `check-in/` — proactive outreach logic, silence detection, conversation starters
  - `manage-tasks/` — task capture, prioritization, integration patterns (Todoist, Linear, Notion)
  - `manage-calendar/` — calendar read/write, conflict detection, scheduling optimization
  - `manage-email/` — inbox scanning, priority flagging, draft generation, thread summarization
  - `daily-brief/` — aggregation logic, formatting, delivery
  - `relationship-coach/` — contact tracking, outreach timing, communication style advice
  - `time-advisor/` — time analysis, priority alignment, deep work protection
- `roles/assistant/knowledge/` — productivity frameworks, communication best practices
- `roles/assistant/memory/` — shaped subdirectories (preferences/, contacts/, tasks/)
- `roles/assistant/schedule.yaml` — default cron patterns
- `roles/assistant/learning/success-criteria.md` — assistant-specific success measures
- `roles/assistant/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All 7 skills have complete, production-quality SKILL.md files
- Default schedule activates on role selection
- Onboarding questions configure the assistant's behavior
- Memory structure supports all skill requirements

### Module 2: Tutor Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/tutor/` only — no modifications to base

**Deliverables:**
- `roles/tutor/identity/` — constitution.md, style.yaml
- `roles/tutor/skills/` — 7 skill folders, each with complete SKILL.md:
  - `research-loop/` — source scanning, curation, tagging, storage logic
  - `synthesize/` — format selection, difficulty calibration, output generation
  - `learning-plan/` — milestone design, coverage tracking, reinforcement scheduling
  - `quiz/` — question generation (Bloom's taxonomy), response evaluation, mastery update
  - `assess-progress/` — gap analysis, pattern detection, plan adjustment triggers
  - `podcast-pipeline/` — NotebookLM integration, material selection, delivery
  - `adapt-style/` — engagement monitoring, format experimentation, style adjustment
- `roles/tutor/knowledge/` — research methods, learning science, spaced repetition, Bloom's taxonomy
- `roles/tutor/memory/` — shaped subdirectories (mastery/, style-preferences/, learning-log/, sources/)
- `roles/tutor/schedule.yaml` — default cron patterns
- `roles/tutor/learning/success-criteria.md` — tutor-specific success measures
- `roles/tutor/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All 7 skills have complete, production-quality SKILL.md files
- Research loop can discover and curate material for configured domains
- Quiz generation produces varied question types
- Learning plan adapts based on assessment results
- Memory structure supports mastery tracking

### Module 3: Creator Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/creator/` only — no modifications to base

**Deliverables:**
- `roles/creator/identity/` — constitution.md, style.yaml
- `roles/creator/skills/` — 8 skill folders, each with complete SKILL.md:
  - `transcribe-media/` — transcription tool integration, timestamp formatting, key moment detection
  - `write-script/` — script structure templates, hook formulas, platform adaptation
  - `edit-video/` — EDL generation, caption insertion, cut suggestions, FFmpeg/CapCut integration
  - `edit-image/` — generative AI prompt crafting, thumbnail design, platform formatting
  - `edit-audio/` — cleanup pipeline, normalization, filler removal, music bed sourcing
  - `source-media/` — stock library search, style matching, licensing compliance
  - `format-for-platform/` — multi-platform adaptation rules, aspect ratios, length constraints
  - `creative-brief/` — brief generation, reference curation, shooting notes
- `roles/creator/knowledge/` — generative AI tools landscape, editing fundamentals, platform formats, stock media licensing
- `roles/creator/memory/` — shaped subdirectories (creative-style/, platform-preferences/, content-log/, tool-preferences/)
- `roles/creator/schedule.yaml` — default cron patterns
- `roles/creator/learning/success-criteria.md` — creator-specific success measures
- `roles/creator/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All 8 skills have complete, production-quality SKILL.md files
- Transcription pipeline handles audio and video input
- Script generation adapts to target platform
- Image and video editing skills reference real tools with real integration patterns
- Memory structure supports creative preference learning

---

## Merge Strategy

```
main ──────────── Module 0 commit (checkpoint) ──────────────── merge all ── main
                        │
                        ├── worktree/assistant ── Module 1 ──┐
                        ├── worktree/tutor ────── Module 2 ──┼── PR per role
                        └── worktree/creator ──── Module 3 ──┘
```

- Module 0 commits directly to main (or a feature branch that becomes the checkpoint)
- Modules 1-3 each get their own branch from the checkpoint
- No cross-role dependencies — each writes to its own `roles/<name>/` directory
- Merge order doesn't matter — no conflicts possible
- Each role gets its own PR for review

## Integration with Existing Podium Repo

This boilerplate lives alongside the existing Podium content:

```
podium/
  spec/                     # ← this spec lives here
  lecture/                  # Existing lecture content
  demo/                    # Existing demo scaffold
  workshop/                # Existing workshop templates
  agent/                   # Existing tutor agent (Podium's own agent)
  agents/                  # ← NEW: the agent boilerplate
    base/
      runtime/
      agent/
      onboarding/
    roles/
      assistant/
      tutor/
      creator/
    README.md              # How to clone, configure, and run your agent
  guides/                  # Student-facing materials
```

The existing `agent/` directory (Podium's own tutor agent) remains untouched. The new `agents/` directory contains the generic boilerplate that students clone and personalize.
