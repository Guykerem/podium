# CLAUDE.md — Podium

## What This Is

Podium is an agent boilerplate — a minimal runtime plus a shared agent skeleton plus pluggable role overlays. It serves three purposes:

1. **A lecture** — a 90-minute guest session on AI agents for psychology students at Reichman University
2. **A boilerplate** — clone it, pick a role, personalize, run
3. **A gift** — students build their own role on top of it across the course

## Central Metaphor

The conductor, not the CEO. Inspired by Jacob Collier's orchestra improvisation. Agents are an orchestra you conduct through intent and self-knowledge, not employees you micromanage.

## Repo Structure

```
runtime/                       # NanoClaw-inspired engine
  engine.py                    #   Loads role context, dispatches via --message
  context.py                   #   Assembles role system prompt from identity + skills
  llm_client.py                #   LLMClient protocol + ClaudeCodeClient (v0.1)
  providers.yaml               #   openai / anthropic / ollama / openrouter config
  channels.yaml                #   cli / telegram / webhook transports
  scheduler.yaml               #   Proactive cron hooks (v0.2)
setup/                         # NanoClaw-style setup CLI
  cli.py                       #   python -m setup --step install|verify
  status.py                    #   structured status-block emitter
  steps/                       #   install.py, verify.py
setup.sh                       # bash bootstrap (python + venv + deps)
tests/                         # red/green TDD suite
  contracts/                   #   RoleContract — 9 assertions x 4 roles
  l1_boot/                     #   mocked, fast
  l2_setup/                    #   subprocess + stdout blocks
  l3_behavior/                 #   live Claude Code, @live gated
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
lecture/                       # The 90-minute session
  outline/                     #   Beat-by-beat lecture structure
  references/                  #   Source material and research links
spec/                          # Architecture and design decisions
```

## Design Principles

- The structure IS the lesson — each directory maps to an agent component from the lecture
- Built for psychology students with no prior coding experience
- Every technical concept maps to a cognitive analogy
- Skills are both functional AND educational — using the skill teaches the concept
- Autonomy is earned, not assumed — starts at level 1
- Minimal, lean, and honest — no unnecessary complexity
- File-based everything — no framework lock-in, read the files to understand the agent

## Key References

- Spec: `spec/podium-spec.md`
- Agent program: `agent/program.md`
- Runtime engine: `runtime/engine.py`
- Lecture outline: `lecture/outline/conductors-arc.md`
- Workshop template: `workshop/design-template.md`
- Example role: `roles/agent-architect/` (the default, itself a worked example)

## Testing

```
./setup.sh                  # installs deps (creates .venv if needed)
pytest                      # all layers; L3 skipped unless `claude` on PATH
pytest -m "not live"        # skip live behavior tests
pytest tests/contracts      # just the RoleContract (parity check across roles)
```

Test layers:
- `tests/l1_boot/` — mocked, fast. YAML loaders, skill discovery, role resolution.
- `tests/l2_setup/` — subprocess-driven. Runs `python -m setup` and parses status blocks.
- `tests/l3_behavior/` — live. Shells to `claude -p`, gated by `@pytest.mark.live`.
- `tests/contracts/test_role_contract.py` — 9 assertions × 4 roles = 36 parity cases.
