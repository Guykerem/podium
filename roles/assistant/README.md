# Personal Assistant Role

A proactive personal-operations layer — manages email triage, calendar, daily briefs, task systems, and relationship cadence. Reduces cognitive load so attention goes to the work and people that matter.

Built for people who want a real assistant, not a chatbot — one that learns your axioms (what's urgent, who's important, what gets a same-day reply) and applies them consistently.

## Structure

```
identity/
  constitution.md                Values — curate don't dump, interruption is earned, axioms before advice
  style.yaml                     Personality + cadence sliders

skills/
  base/                          Always-active core capabilities
    check-in                       30-min heartbeat — nothing to surface unless something matters
    daily-brief                    Morning curated summary — five sections, each skips if empty
    manage-email                   Eisenhower-matrix triage tuned to your own urgency examples
    manage-calendar                Time-block protection, conflict surfacing, energy-aware scheduling
    manage-tasks                   GTD-style capture + MoSCoW prioritization
    prep-meeting                   One-hour-before brief — attendees, history, open actions, relevant docs
    relationship-coach             Dunbar-layer cadence tracker — who's overdue, who's drifting
    time-advisor                   Loehr-Schwartz energy-management coaching against your real calendar
  extensions/                    Opt-in specialization packs
    team-management                Direct reports, 1:1 prep, performance signal tracking
    travel                         Trip planning, packing, itinerary curation
    finance                        Expense capture, monthly review, budget signal
    knowledge-capture              Voice-memo to structured note pipeline
    health-and-habits              Habit cadence, recovery signal, sleep/exercise patterns

knowledge/                       Frameworks the assistant operates from
  task-management/                 GTD, Eisenhower, MoSCoW
  communication/                   Email triage axioms, deep work (Newport)
  calendar/                        Energy management (Loehr-Schwartz), time blocking
  crm/                             Personal CRM (Dunbar layers), relationship cadence

memory/                          Grows per user
  preferences/                     Declared preferences (cadence, channels, do-not-disturb windows)
  axioms/                          Captured judgment calls — who's VIP, what's actually urgent
  relationships/                   Per-person cadence, last-touch, context

schedule.yaml                    Seven recurring jobs — 30-min heartbeat → evening shutdown

onboarding/
  questions.yaml                 Eleven axiom-gathering questions
```

## Activation

Pick this role if you want:

- A proactive partner — surfaces things at the right time, doesn't wait to be asked.
- Email and calendar handled with judgment, not just rules.
- Relationship upkeep that actually keeps up — Dunbar-layer cadence with real follow-through.
- Daily briefs that earn the interruption — five curated sections, never a dump.

## What It Doesn't Do

- **Auto-send anything that matters.** Drafts replies; you press send. Autonomy starts at level 1.
- **Pretend to read minds.** Onboarding asks for your axioms because the assistant won't guess them.
- **Ignore signal-to-noise.** Sections of the daily brief skip when empty — silence is a feature.

## See Also

- `agent/skills/core/*` — the five core skills every role inherits
- `agent/program.md` — how roles are composed onto the base agent
- [`roles/assistant/RESEARCH.md`](./RESEARCH.md) — the research that informed this role
