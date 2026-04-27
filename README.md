# Podium

An agent boilerplate for conducting your own AI orchestra.

Clone it, pick a role, personalize, run. Four roles ship in the box; building a fifth is a workshop exercise.

## What This Is

Podium is a **file-based agent boilerplate**. A minimal runtime loads a shared agent skeleton (identity, memory, core skills) and overlays a *role* that gives the agent its personality and specialty. Roles are plain directories — no framework lock-in, no magic. **You read the files, you understand the agent.**

Built for a guest lecture on AI agents at Reichman University, designed to be useful for anyone starting with agents — including people who've never written code before.

## The Conductor Metaphor

You're not a CEO managing AI employees. You're a **conductor leading an orchestra**.

The musicians know how to play. Your job is to know what you want to hear — and shape the whole through intention, presence, and trust. Podium is shaped around that idea: every directory in this repo maps to one part of conducting an agent well.

## The Five Parts of an Agent

An agent has five parts. Each one lives in its own folder, so you can read it like a book.

| Part | What it is | Where it lives |
|---|---|---|
| **Identity** | Who the agent is — values, voice, what it never does | `agent/identity/` + `roles/<role>/identity/` |
| **Skills** | What it can do — one folder per skill, with a SKILL.md | `agent/skills/core/` + `roles/<role>/skills/` |
| **Knowledge** | What it knows — the frameworks the role operates from | `roles/<role>/knowledge/` |
| **Memory** | What it remembers about you — grows over time | `roles/<role>/memory/` |
| **Schedule** | When it acts on its own — proactive cron jobs | `roles/<role>/schedule.yaml` |

That's the whole system. If you understand those five folders, you understand Podium.

## Quick Start

```
git clone <repo-url> && cd podium
npm install
claude
/podium-setup
```

`/podium-setup` walks you through nine short steps — picks a role, asks you a few onboarding questions, and hands off to the live agent. **Plan on about 15 minutes.** Re-run `/podium-verify` any time to confirm health.

**Just want to try it fast?** Pick the `tutor` role and accept all defaults. You'll be talking to an agent in about 5 minutes.

**Requires:** Node 20+, [Claude Code](https://claude.ai/download).

After setup:

```
npm run chat                                    # interactive REPL
npx tsx runtime/engine.ts --message "..."       # one-shot dispatch
```

…or just keep talking from inside the `claude` session.

## The Four Roles

| Role | What It Is | Base Skills | Extension Packs |
|---|---|---|---|
| `agent-architect` | Guides you through designing and customizing your own agent | 5 | 2 |
| `assistant` | Personal assistant — tasks, calendar, email, relationships | 8 | 5 |
| `tutor` | Private tutor — research, learning plans, quizzes, podcast pipeline | 8 | 4 |
| `creator` | Content creator — transcription, scripting, media editing, platform formatting | 9 | 7 |

Base skills load for every instance of a role. Extensions are opt-in packs you enable per user. Each role directory has its own README explaining the shape.

## Build Your Own Role

The `agent-architect` role is itself a worked example — read `roles/agent-architect/` to see the full shape of a role. Then open `workshop/design-template.md` and answer the six questions.

The architect role is also the one that *helps you build a fifth role*. Pick it during `/podium-setup`, and it walks you through translating your design template into an actual `roles/<your-role>/` directory.

## Learning the System

Three directories serve three different audiences:

- **`lecture/`** — the 90-minute guest session. Outline, references, speaker notes. Read this if you're attending or running the lecture.
- **`workshop/`** — design-your-own-role exercises. Read this if you're a student who wants to build a fifth role.
- **`onboarding/`** — what happens on first run. Read this if you're curious how `/podium-setup` personalizes the agent to you.

## How It Actually Thinks

**Curious how the agent really works?** Read [`agent/program.md`](./agent/program.md) — the full operating loop, skill resolution order, and autonomy levels on one page. It's the single best "what is this thing actually doing" doc in the repo.

## Skills, in Three Tiers

- **Core** (`agent/skills/core/`) — communicate, remember, observe, schedule, act. Every role gets these.
- **Base** (`roles/<role>/skills/base/`) — the role's everyday repertoire.
- **Extensions** (`roles/<role>/skills/extensions/<pack>/`) — opt-in specialty packs.

The runtime reads `PODIUM_ROLE` (or `agent/memory/active-role.yaml`), loads the shared skeleton, overlays the role, and discovers all SKILL.md files. Everything else is text.

## For Instructors and Contributors

A few directories exist for builders rather than first-time users — feel free to ignore them on day one:

- `spec/` — architecture and design decisions ([read order](./spec/README.md))
- `docs/superpowers/` — internal planning artifacts (specs and execution plans)
- `legacy/` — preserved v0.1 Python implementation; rollback recipe in `LEGACY.md`
- `schemas/`, `scripts/` — supporting tooling
- `container/` — optional Docker runtime
- `hackathon/` — the publishable lecture site (gallery + role editor for students); see `hackathon/README.md`

The lecture site lets students design their own role through a form, export a single zip, and have the instructor import it with `npm run intake`.

---

The musicians know how to play. Now go build your orchestra.
