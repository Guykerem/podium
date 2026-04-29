# CLAUDE.md — Podium

## What This Is

Podium is an agent boilerplate — a minimal runtime plus a shared agent skeleton plus pluggable role overlays. It serves two purposes:

1. **A boilerplate** — clone it, pick a role, personalize, run
2. **A teaching scaffold** — every directory maps to an agent component, so reading the repo is itself a lesson on how agents are built

## Central Metaphor

The conductor, not the CEO. Agents are an orchestra you conduct through intent and self-knowledge, not employees you micromanage.

## Repo Structure

```
runtime/                       # NanoClaw-inspired engine (TypeScript)
  engine.ts                    #   Loads role context, dispatches via --message
  context.ts                   #   Assembles role system prompt from identity + skills
  llm_client.ts                #   LLMClient interface + ClaudeCodeClient
  scheduler.ts                 #   Proactive cron dispatch
  providers.yaml               #   openai / anthropic / ollama / openrouter config
  channels.yaml                #   cli / telegram / webhook transports
  scheduler.yaml               #   Proactive cron hooks (v0.2)
setup/                         # NanoClaw-style setup CLI (tsx / npm run setup)
  install.ts, verify.ts        #   install + health-check steps
  onboarding.ts, routine.ts    #   personalization + schedule design
  role-select.ts, role-preview.ts, channel.ts, service.ts
  platform.ts, timezone.ts, runtime.ts, status.ts
container/                     # Optional Docker runtime
  Dockerfile                   #   Node 20 slim image for the runtime
  build.sh                     #   Local image build
  entrypoint.sh                #   Container boot — loads role and channels
  README.md                    #   Container usage notes
setup.sh                       # bash bootstrap (node + npm install)
tests/                         # vitest suite (red/green TDD)
  contracts/                   #   RoleContract — 9 assertions x 4 roles
  l1_boot/                     #   mocked, fast
  l2_setup/                    #   subprocess + stdout blocks
  l3_behavior/                 #   live Claude Code, gated
runtime/__tests__/             #   unit tests colocated with runtime
setup/__tests__/               #   unit tests colocated with setup
.claude/skills/
  podium-setup/SKILL.md        #   /podium-setup (AI-native entry)
  podium-verify/SKILL.md       #   /podium-verify (standalone health check)
agent/                         # SHARED SKELETON — every role inherits this
  identity/                    #   Baseline constitution and style
  skills/
    core/                      #   communicate, remember, observe, schedule, act
  knowledge/                   #   Shared fundamentals, field overview, safety
  memory/                      #   active-role.yaml, preferences, per-user state
  learning/                    #   Feedback loop, success criteria, adaptations
  autonomy.yaml                #   Levels 1-3 default
  program.md                   #   The operating loop — read this to understand the agent
roles/                         # ROLE OVERLAYS — each is self-contained
  agent-architect/             #   Default — helps you design your own agent
  assistant/                   #   Personal assistant — tasks, calendar, email
  tutor/                       #   Private tutor — research, quizzes, podcasts
  creator/                     #   Content creator — transcription, scripting, media
  <role>/
    identity/                  #     Role-specific constitution + style
    skills/
      base/                    #       Always loaded for this role
      extensions/<pack>/       #       Opt-in specialty packs
    knowledge/                 #     Role-specific reference material
    memory/                    #     Role-specific memory scaffold
    learning/                  #     Role-specific success criteria
    onboarding/questions.yaml  #     Role-specific personalization
    schedule.yaml              #     Role-specific cron jobs
onboarding/                    # Shared onboarding runner (role picks up its questions)
workshop/                      # Design template for building your own role
spec/                          # Architecture and design decisions
```

## Design Principles

- The structure IS the lesson — each directory maps to an agent component
- Built so that someone with no prior coding experience can clone, personalize, and run
- Every technical concept maps to a cognitive analogy
- Skills are both functional AND educational — using the skill teaches the concept
- Autonomy is earned, not assumed — starts at level 1
- Minimal, lean, and honest — no unnecessary complexity
- File-based everything — no framework lock-in, read the files to understand the agent

## Key References

- Agent program: `agent/program.md`
- Runtime engine: `runtime/engine.ts`
- Setup design: `spec/podium-setup-v0.2.md`
- Workshop template: `workshop/design-template.md`
- Example role: `roles/agent-architect/` (the default, itself a worked example)

## Testing

```
npm install                 # Node 20+; installs tsx + vitest + yaml
npm test                    # all vitest suites (L3 skipped unless `claude` on PATH)
npm run test:contracts      # just the RoleContract (parity check across roles)
npm run test:l1             # mocked boot tests
npm run test:l2             # subprocess setup tests
npm run test:l3             # live Claude Code behavior tests
npm run test:unit           # colocated unit tests under runtime/ and setup/
npm run typecheck           # tsc --noEmit
```

Test layers:
- `tests/l1_boot/` — mocked, fast. YAML loaders, skill discovery, role resolution.
- `tests/l2_setup/` — subprocess-driven. Runs `npm run setup` and parses status blocks.
- `tests/l3_behavior/` — live. Shells to `claude -p`, skipped when unavailable.
- `tests/contracts/role-contract.test.ts` — 9 assertions × 4 roles = 36 parity cases.
