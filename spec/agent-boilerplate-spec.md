# Agent Boilerplate — Design Spec

## Overview

A generic, production-ready agent boilerplate that students clone and personalize. Built as a fork of NanoClaw with LiteLLM for provider abstraction. One shared skeleton, four role overlays (agent architect, personal assistant, private tutor, content creator). Each role works out of the box with sensible defaults and includes a guided onboarding flow for personalization.

The **agent architect** is the default role — clone the repo, boot it up, and you're talking to an agent that helps you understand and build agents. It can guide you to pick a packaged role, personalize it, or design your own from scratch.

This boilerplate serves three purposes:
1. **Educational** — the folder structure IS the lesson on agent architecture
2. **Practical** — students get a working agent on day one
3. **Extensible** — the same boilerplate is what we fork for our own production agents

### Design Principles

- The folder IS the agent — every component is a readable, editable file
- Skills are the universal unit — core capabilities and role-specific skills use the same SKILL.md format
- Three-tier skills — core (shared agent capabilities), base (role essentials), extension (available specializations)
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

### Folder Structure

```
podium/
  spec/                          # Design specs (this file lives here)
  workshop/                      # Design templates and guided flows
  guides/                        # Student-facing getting-started material

  runtime/                       # Forked NanoClaw core + LiteLLM
    engine.py                    # Agent runtime (~500 lines)
    providers.yaml               # Model provider config
    channels.yaml                # I/O channel config
    scheduler.yaml               # Global scheduling config
    Dockerfile                   # Container isolation

  agent/                         # The agent skeleton (shared by all roles)
    identity/
      constitution.md            # The agent's soul — values, behavior, boundaries
      style.yaml                 # Personality sliders (warmth, formality, verbosity, etc.)
      name.yaml                  # Display name, pronouns, greeting

    skills/
      core/                      # The five fundamental agent capabilities (all roles)
        communicate/
          SKILL.md
          channels.md
        remember/
          SKILL.md
          memory-patterns.md
        observe/
          SKILL.md
          sources.md
        schedule/
          SKILL.md
          cron-patterns.md
        act/
          SKILL.md
          safety.md

    knowledge/                   # Shared agent fundamentals
    memory/                      # Per-user context (starts empty, grows over time)

    learning/
      feedback-loop.md           # How the agent captures and routes feedback
      success-criteria.md        # What "good" looks like (base-level)
      adaptations.md             # Append-only log of learned adjustments

    autonomy.yaml                # Autonomy levels (1-3) with per-skill overrides
    program.md                   # The operating loop — one file to understand the whole agent

  roles/                         # Role overlays — each adds identity, skills, knowledge
    agent-architect/             # DEFAULT ROLE — the meta-agent (reworked from existing agent/)
    assistant/                   # Personal assistant
    tutor/                       # Private tutor
    creator/                     # Content creator

  onboarding/                    # Guided personalization flow
    flow.md
    questions.yaml
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

### Three-Tier Skill Architecture

Every role organizes its skills into three tiers:

**Core skills** — the five fundamental agent capabilities. Shared across all roles. These are what make something an agent. Installed and active always.

**Base skills** — the essential skills that define the role's competence. Installed by default when the role is selected. The agent cannot fulfill its role without these. Each role's base skills compose the core capabilities into higher-level jobs.

**Extension skills** — available in the repo but not active by default. The agent can suggest activating them when it detects the user needs that specialization. For example:
- A creator who mostly does video gets offered the video extension pack
- A tutor teaching coding gets offered the programming-pedagogy extension
- An assistant managing a team gets offered the delegation extension

Extensions allow roles to specialize without bloating the default experience.

```
roles/<role>/
  skills/
    base/                    # Active by default — role essentials
      skill-a/SKILL.md
      skill-b/SKILL.md
    extensions/              # Available, not active — activated on demand
      video/
        skill-c/SKILL.md
        skill-d/SKILL.md
      audio/
        skill-e/SKILL.md
```

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
    base/                    # Essential skills for this role
      <skill-name>/SKILL.md
    extensions/              # Optional specialization packs
      <pack-name>/
        <skill-name>/SKILL.md
  knowledge/                 # Domain-specific reference material
  memory/                    # Expected memory subdirectory structure (empty but shaped)
  schedule.yaml              # Default cron patterns for this role
  learning/
    success-criteria.md      # Role-specific definition of "good"
  onboarding/
    questions.yaml           # Role-specific personalization questions
```

---

### Role 0: Agent Architect (default)

The meta-role. This is what students interact with when they first clone and boot the repo. Reworked from the existing `agent/` directory — the Podium tutor agent reborn as a role that teaches you to build agents.

**Identity:**
- Constitution: "You are an agent architect — a guide who helps people understand, design, and build their own AI agents. You teach by doing: when someone wants to learn about agent memory, you show them yours. When they want to design a skill, you walk them through the process using real examples from the packaged roles. You help users pick a role and personalize it, or design something entirely new from scratch. You believe the best way to understand agents is to build one."
- Style: warmth 0.8, formality 0.3, verbosity 0.6 (teaching mode but not verbose), curiosity 0.9, proactivity 0.5

**Base skills:**

| Skill | Description |
|-------|-------------|
| `guide-agent-design` | Walk the user through designing an agent from scratch — use case definition, identity, skills, knowledge, memory, autonomy. The six questions from the workshop template, brought to life as an interactive flow. |
| `explain-architecture` | Explain any agent component by pointing to the actual files in the repo. "What is memory?" → show `agent/memory/`, explain the pattern, show how roles extend it. Teaching through the codebase. |
| `recommend-role` | Based on conversation about what the user wants, recommend a packaged role or suggest building custom. Help them understand the trade-offs. |
| `customize-role` | Guide the user through personalizing a chosen role — modifying identity, adding/removing skills, adjusting autonomy levels. Hands-on configuration. |
| `teach-concepts` | Explain agentic engineering concepts: context engineering, knowledge graphs, ontologies, the agentic loop, tool use, memory architecture. Use cognitive analogies (mapping to psychology concepts for this audience). |

**Extension skills:**

| Pack | Skills | Description |
|------|--------|-------------|
| `advanced-engineering` | `teach-context-engineering`, `teach-knowledge-graphs`, `teach-ontologies` | Deep dives into advanced agentic engineering topics for users who want to go beyond the basics. |
| `runtime-setup` | `setup-provider`, `setup-channel`, `setup-schedule` | DevOps-adjacent guidance: help users configure their runtime, connect channels, set up cron jobs. |

**Knowledge domains:** Agent fundamentals (what agents are, components, the agentic loop), field overview (landscape, key players, research), tool guides (Claude Code, NanoClaw, LiteLLM), safety and responsible use, the Podium repo structure itself.

**Memory structure:**
- `memory/student-profile/` — background, experience level, interests, learning style
- `memory/design-sessions/` — agents the user has designed or is designing
- `memory/progress/` — what concepts have been covered, what's been built

**Default schedule:**
- No proactive schedule by default (this is a teaching agent — it responds)
- Optional: periodic "how's your agent going?" check-in if the user has started building

**Learning loop:**
- Tracks which explanations land vs. need rephrasing → adapts teaching approach
- Learns the user's technical level and adjusts depth accordingly
- Remembers design decisions across sessions so the user can pick up where they left off
- Success criteria: user can articulate what their agent does and why, user successfully configures or builds an agent, user's questions become more sophisticated over time

---

### Role 1: Personal Assistant

**Identity:**
- Constitution: "You are a proactive personal assistant and communications strategist. You manage time, tasks, and relationships. You don't just remind — you advise on timing, tone, and priority. You integrate deeply with calendars, email, and task systems. You treat every interaction as data that helps you serve better tomorrow."
- Style: warmth 0.8, formality 0.3, verbosity 0.4 (brief and actionable), proactivity 0.9

**Base skills:**

| Skill | Description |
|-------|-------------|
| `check-in` | Proactive outreach when silence exceeds threshold. Asks what's happening, what's blocking, what needs attention. Genuine curiosity, never nagging. |
| `manage-tasks` | Capture, prioritize, and track tasks. Integrate with task management tools (Todoist, Linear, Notion). Surface overdue items and suggest reprioritization. |
| `manage-calendar` | Read, create, and adjust calendar events. Flag conflicts. Suggest optimal scheduling based on learned energy patterns and meeting density preferences. |
| `manage-email` | Scan inbox for priority items. Draft replies. Flag messages needing attention. Summarize threads. |
| `daily-brief` | Morning summary: today's schedule, pending tasks, overdue items, emails needing response, contacts to follow up with. |
| `relationship-coach` | Track contact history. Remind when someone hasn't been reached. Suggest how and when to reach out based on relationship context and communication style preferences. |
| `time-advisor` | Analyze time spent vs. stated priorities. Suggest schedule adjustments. Protect deep work blocks. Flag when commitments exceed available capacity. |

**Extension skills:**

| Pack | Skills | Description |
|------|--------|-------------|
| `team-management` | `delegate-tasks`, `meeting-prep`, `status-rollup` | For users managing a team — delegation tracking, meeting agenda generation, team status aggregation. |
| `travel` | `plan-trip`, `manage-itinerary`, `timezone-aware` | Travel planning, itinerary management, timezone-aware scheduling. |
| `finance` | `track-expenses`, `budget-alerts`, `invoice-reminders` | Personal finance tracking, budget monitoring, payment reminders. |

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

**Base skills:**

| Skill | Description |
|-------|-------------|
| `research-loop` | Continuously scan configured sources (RSS, APIs, web search) for material relevant to the student's domains. Curate, tag by topic and difficulty, store in knowledge base. |
| `synthesize` | Transform accumulated research into digestible formats — summaries, concept maps, comparison tables — calibrated to the student's current level. |
| `learning-plan` | Design and maintain progressive learning paths per domain. Break topics into milestones. Track coverage, identify what's next, flag what needs reinforcement. |
| `quiz` | Generate targeted quizzes based on recent material. Vary question types (recall, application, synthesis). Use results to update mastery model. |
| `assess-progress` | Analyze quiz results, interaction patterns, and questions asked to build a model of current understanding. Identify gaps. Adjust learning plan accordingly. |
| `podcast-pipeline` | Push curated material to NotebookLM for podcast generation. Prioritize material that fills identified knowledge gaps. Deliver link to student. |
| `adapt-style` | Monitor which formats and approaches lead to engagement and retention. Adjust delivery: more visual? more examples? shorter chunks? Socratic vs. direct? |

**Extension skills:**

| Pack | Skills | Description |
|------|--------|-------------|
| `coding-tutor` | `code-review`, `project-mentor`, `debug-guide` | Programming-specific pedagogy — code reviews as teaching moments, project-based learning, guided debugging. |
| `psychology-tutor` | `case-study-analysis`, `research-methods-coach`, `clinical-scenarios` | Psychology-specific — case study walkthroughs, research methodology training, clinical reasoning exercises. |
| `language-tutor` | `conversation-practice`, `grammar-drill`, `immersion-prompts` | Language learning — practice conversations, targeted grammar, immersive scenario prompts. |
| `exam-prep` | `practice-tests`, `study-schedule`, `weakness-targeting` | Test preparation — timed practice tests, optimized study schedules, targeted weak-area drilling. |

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

**Base skills:**

| Skill | Description |
|-------|-------------|
| `transcribe-media` | Receive audio/video, produce clean timestamped transcript. Identify key moments, quotable segments, and emotional beats. |
| `write-script` | Transform transcript into a tight engaging script. Suggest hooks, structure, pacing. Adapt to platform (short-form vs. long-form, TikTok vs. YouTube vs. LinkedIn). |
| `source-media` | Find complementary stock footage, images, and music from free sources (Pexels, Pixabay, Unsplash). Match visual style to content tone. |
| `format-for-platform` | Adapt a single piece of content for multiple platforms — aspect ratios, caption styles, length constraints, hashtag strategies. One capture → multiple outputs. |
| `creative-brief` | Given a topic or idea, produce a creative brief: suggested format, hook options, visual treatment, reference examples, shooting notes. |

**Extension skills:**

| Pack | Skills | Description |
|------|--------|-------------|
| `video` | `edit-video`, `add-captions`, `generate-thumbnail` | Video editing pipeline — EDL generation, caption/subtitle insertion, cut suggestions, FFmpeg/CapCut integration, thumbnail design. |
| `image` | `edit-image`, `generate-visuals`, `design-graphics` | Image creation and editing — generative AI prompt crafting (DALL-E, Midjourney, Flux), thumbnail design, platform formatting, graphic design for social. |
| `audio` | `edit-audio`, `generate-voiceover`, `mix-podcast` | Audio production — cleanup, normalization, filler removal, music bed sourcing, voiceover generation, podcast mixing. |
| `long-form` | `write-article`, `create-thread`, `repurpose-content` | Long-form content — blog posts, Twitter/X threads, newsletter editions, repurposing one piece across formats. |
| `analytics` | `track-performance`, `ab-test-hooks`, `audience-insights` | Content performance — track what works, A/B test hooks and thumbnails, audience behavior analysis. |

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

The onboarding is a guided conversation run by the agent architect (default role). It runs on first boot and can be re-triggered anytime.

**Flow:**
1. Welcome + explain what this is → the agent architect introduces itself
2. "What do you want to build?" → open conversation about the user's goals
3. Recommend a path:
   - Pick a packaged role (assistant, tutor, creator) → apply overlay + role-specific personalization
   - Build from scratch → guided agent design flow (six questions from workshop template)
   - Explore first → stay with agent architect, learn about agents, decide later
4. If a role is selected:
   - "What should I call you?" → sets `name.yaml`
   - "How do you prefer to communicate?" → sets channel config
   - "Which model provider do you want to use?" → sets `providers.yaml`
   - Role-specific personalization questions (from `roles/<role>/onboarding/questions.yaml`)
5. Boot the configured agent

**Role-specific personalization:**

Agent Architect:
- "What's your experience with AI and agents?" → calibrates teaching depth
- "What are you most curious about?" → seeds initial topic focus
Assistant:
- "What task management tool do you use?" → configures integrations
- "What does your typical day look like?" → seeds scheduling preferences
- "Who are the key people in your life/work?" → seeds contacts memory

Tutor:
- "What domains do you want to learn about?" → configures research domains
- "How do you prefer to learn?" → seeds style preferences
- "What's your current level in each domain?" → seeds mastery model

Creator:
- "What platforms do you create content for?" → configures platform targets
- "What's your visual style?" → seeds creative preferences
- "What tools do you already use?" → configures tool integrations

---

## Implementation Decomposition

This spec is designed to be built as five modules: one shared base (Module 0) built inline, followed by four independent role modules built in parallel isolated sessions.

### Implementation Session Protocol

Each role module session (Modules 1-4) follows this protocol:

1. **Research phase** — the coding agent performs in-depth research before writing any code:
   - Search for similar specialist agents others have built (GitHub repos, blog posts, tutorials)
   - Find relevant skill packages and prompt libraries tailored to the role's domain
   - Study best practices for the role's specific capabilities (e.g., for the tutor: spaced repetition implementations, quiz generation approaches; for the creator: FFmpeg automation patterns, generative AI integration)
   - Use findings to suggest richer, more expansive skills and more detailed soul instructions than what this spec describes
   - The spec provides the skeleton — the research phase fills in the muscle

2. **Build phase** — implement the role overlay based on research findings:
   - Write all SKILL.md files with production-quality prompts
   - Populate knowledge directories with curated domain reference material
   - Configure memory structures, schedules, and learning criteria
   - Write role-specific onboarding questions

3. **Review phase** — self-review against the spec and acceptance criteria

### Module 0: Base Agent Skeleton + Agent Architect Role

**Scope:** Everything shared by all roles, PLUS the agent architect role (which is the default). This module is built inline in the current session and produces the checkpoint commit from which role modules branch.

**Includes reworking the existing `agent/` directory** — the current Podium tutor agent's content (constitution, skills, knowledge) is migrated into `roles/agent-architect/`, adapted to the new structure. The existing `agent/` folder becomes the generic skeleton shared by all roles.

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
- `onboarding/` — generic flow and questions (run by agent architect)
- `roles/agent-architect/` — complete default role with:
  - Identity (constitution + style)
  - Base skills (guide-agent-design, explain-architecture, recommend-role, customize-role, teach-concepts)
  - Extension packs (advanced-engineering, runtime-setup)
  - Knowledge (agent fundamentals, field overview, tool guides, safety)
  - Memory structure, schedule, learning criteria, onboarding questions

**Acceptance criteria:**
- The base agent runs out of the box with `runtime/` configured
- Agent architect role loads as default
- Core skills load and are invocable
- Onboarding flow completes and persists configuration
- Agent responds to messages via at least one channel (CLI)
- Memory read/write works
- Scheduling works (heartbeat fires)
- Existing `agent/` content is preserved in `roles/agent-architect/`, not lost

**This module must be complete and committed before Modules 1-4 begin.**

### Module 1: Assistant Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/assistant/` only — no modifications to base

**Research focus:** Personal assistant agents, productivity tool integrations (calendar APIs, task management APIs, email APIs), proactive AI assistants, relationship CRM patterns, time management frameworks.

**Deliverables:**
- `roles/assistant/identity/` — constitution.md, style.yaml
- `roles/assistant/skills/base/` — base skills (check-in, manage-tasks, manage-calendar, manage-email, daily-brief, relationship-coach, time-advisor — plus any additional skills discovered during research)
- `roles/assistant/skills/extensions/` — extension packs (team-management, travel, finance — plus any additional packs discovered during research)
- `roles/assistant/knowledge/` — productivity frameworks, communication best practices
- `roles/assistant/memory/` — shaped subdirectories (preferences/, contacts/, tasks/)
- `roles/assistant/schedule.yaml` — default cron patterns
- `roles/assistant/learning/success-criteria.md` — assistant-specific success measures
- `roles/assistant/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All base skills have complete, production-quality SKILL.md files
- Extension packs are well-scoped and documented
- Default schedule activates on role selection
- Onboarding questions configure the assistant's behavior
- Memory structure supports all skill requirements

### Module 2: Tutor Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/tutor/` only — no modifications to base

**Research focus:** AI tutor agents, adaptive learning systems, spaced repetition implementations, quiz generation, NotebookLM integration, learning analytics, educational technology best practices.

**Deliverables:**
- `roles/tutor/identity/` — constitution.md, style.yaml
- `roles/tutor/skills/base/` — base skills (research-loop, synthesize, learning-plan, quiz, assess-progress, podcast-pipeline, adapt-style — plus any additional skills discovered during research)
- `roles/tutor/skills/extensions/` — extension packs (coding-tutor, psychology-tutor, language-tutor, exam-prep — plus any additional packs discovered during research)
- `roles/tutor/knowledge/` — research methods, learning science, spaced repetition, Bloom's taxonomy
- `roles/tutor/memory/` — shaped subdirectories (mastery/, style-preferences/, learning-log/, sources/)
- `roles/tutor/schedule.yaml` — default cron patterns
- `roles/tutor/learning/success-criteria.md` — tutor-specific success measures
- `roles/tutor/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All base skills have complete, production-quality SKILL.md files
- Extension packs are well-scoped and documented
- Research loop can discover and curate material for configured domains
- Quiz generation produces varied question types
- Learning plan adapts based on assessment results
- Memory structure supports mastery tracking

### Module 3: Creator Role (isolated worktree)

**Branches from:** Module 0 checkpoint commit
**Writes to:** `roles/creator/` only — no modifications to base

**Research focus:** AI content creation agents, generative AI tool integrations (image, video, audio), FFmpeg automation, caption generation, stock media APIs, platform-specific content optimization, content creator workflows.

**Deliverables:**
- `roles/creator/identity/` — constitution.md, style.yaml
- `roles/creator/skills/base/` — base skills (transcribe-media, write-script, source-media, format-for-platform, creative-brief — plus any additional skills discovered during research)
- `roles/creator/skills/extensions/` — extension packs (video, image, audio, long-form, analytics — plus any additional packs discovered during research)
- `roles/creator/knowledge/` — generative AI tools landscape, editing fundamentals, platform formats, stock media licensing
- `roles/creator/memory/` — shaped subdirectories (creative-style/, platform-preferences/, content-log/, tool-preferences/)
- `roles/creator/schedule.yaml` — default cron patterns
- `roles/creator/learning/success-criteria.md` — creator-specific success measures
- `roles/creator/onboarding/questions.yaml` — personalization questions

**Acceptance criteria:**
- Role overlay applies cleanly on top of base
- All base skills have complete, production-quality SKILL.md files
- Extension packs are well-scoped and documented
- Transcription pipeline handles audio and video input
- Script generation adapts to target platform
- Image and video editing skills reference real tools with real integration patterns
- Memory structure supports creative preference learning

---

## Merge Strategy

```
main ── Module 0 commit (checkpoint) ────────────────────────── merge all ── main
              │
              ├── worktree/assistant ──── Module 1 ──┐
              ├── worktree/tutor ──────── Module 2 ──┼── PR per role
              ├── worktree/creator ────── Module 3 ──┤
              └── (agent-architect is part of Module 0)
```

- Module 0 (base + agent architect) commits directly to a feature branch that becomes the checkpoint
- Modules 1-3 each get their own branch from the checkpoint
- No cross-role dependencies — each writes to its own `roles/<name>/` directory
- Merge order does not matter — no conflicts possible
- Each role gets its own PR for review
- The research phase in each session may expand the skill list beyond what this spec describes — that is expected and encouraged
