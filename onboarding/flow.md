# Onboarding Flow

The onboarding flow is the first thing a new user encounters. It is hosted by the **agent architect** — the default role — and guides the user from "who are you?" to a fully configured, running agent.

The flow is structured in six phases. Each phase maps to a section in `questions.yaml`.

---

## Phase 1: Welcome

**Type:** Message (no input needed)

The agent architect introduces itself and sets expectations:

> "Hi! I'm an agent architect — I help you understand and build AI agents.
>
> This repo is both the lesson and the tool. Every folder maps to a part of how agents work. By the time we're done here, you'll have a working agent configured to your needs — and you'll understand why each piece exists."

**What happens:** Display welcome message. No files are written.

---

## Phase 2: Discover Intent

**Type:** Multiple choice

Ask: "What brings you here?"

| Option | Label | What happens next |
|--------|-------|-------------------|
| A | "I want to build an agent" | Ask what kind of agent, then recommend a role or guide from scratch |
| B | "I want to learn about agents" | Stay with agent-architect role, begin teaching concepts |
| C | "I already know what I want" | Jump directly to Phase 3: Role Selection |

### Path A: Build

Follow-up (open-ended): "Tell me a bit about what you'd want your agent to do — just describe the situation in plain language."

Listen for keywords, then either:
- Recommend a matching role (go to Phase 3 with a pre-selection)
- If nothing fits, offer to guide a custom design using `guide-agent-design`

### Path B: Learn

Skip Phase 3 entirely. Set role to `agent-architect`. Proceed to Phase 4 (basic config), then begin with `teach-concepts` skill after boot.

### Path C: Jump

Go directly to Phase 3.

---

## Phase 3: Role Selection

**Type:** Multiple choice

Present the three packaged roles with one-line pitches:

| Role | Pitch |
|------|-------|
| **assistant** | Manages your time, tasks, and relationships |
| **tutor** | Continuous learning with research, quizzes, and podcasts |
| **creator** | Turns raw captures into polished content |

Plus a fourth option:

> "None of these fit? I can help you design an agent from scratch."

If "from scratch" is selected, invoke `guide-agent-design` to walk through the 6-question design flow. The result becomes a custom role.

**What happens:** Selected role is recorded. Role-specific files will be loaded at boot.

---

## Phase 4: Basic Configuration

**Type:** Sequence of three questions

These apply regardless of role.

### 4.1 Name

"What should I call you?"

- Writes to: `agent/identity/name.yaml`
- Format: `name: <value>`

### 4.2 Channel

"How do you want to communicate with your agent?"

Options:
- **CLI** — right here in the terminal (default)
- **Telegram** — chat with your agent on Telegram
- **Webhook** — connect to any app via HTTP

- Writes to: `runtime/channels.yaml` (sets `default_channel` and enables the selected channel)

### 4.3 Provider

"Which AI model provider do you want to use?"

Options:
- **Anthropic** — Claude (recommended, default)
- **OpenAI** — GPT-4o
- **Ollama** — local models, no API key needed
- **OpenRouter** — access multiple models through one API

- Writes to: `runtime/providers.yaml` (sets `default_provider`)

---

## Phase 5: Role-Specific Personalization

**Type:** Dynamic (loaded from role)

Load questions from `roles/<selected_role>/onboarding/questions.yaml` and ask them in order.

For the agent-architect role, this includes:
- Experience level with AI tools
- What they're curious about
- What would make this time well spent

Each role defines its own questions. If the role has no `onboarding/questions.yaml`, skip this phase.

**What happens:** Responses are stored in the role's memory directory (`roles/<role>/memory/`).

---

## Phase 6: Boot

**Type:** Message (no input needed)

Confirm the configuration and show what's ready:

> "All set! Your agent is configured as **[role name]**.
>
> Here's what it can do:"

Then list the role's base skills with one-line descriptions.

If extensions are available, mention them:

> "There are also optional extensions you can enable later: [list]. Just ask when you're ready."

**What happens:** Agent loads the selected role's configuration and is ready for use.

---

## Implementation Notes

- The flow is defined declaratively in `onboarding/questions.yaml` and executed by the runtime engine.
- Each phase writes to specific files. The flow should be idempotent — running it again overwrites previous config.
- Phase 5 is the only dynamic phase. All others are static and defined in this repo.
- The agent-architect role's `onboarding/questions.yaml` at `roles/agent-architect/onboarding/questions.yaml` serves as the reference implementation for role-specific questions.
