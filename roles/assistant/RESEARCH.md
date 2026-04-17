# Personal Assistant Role — Research Synthesis

Research synthesis for the "Personal Assistant" agent role in Podium. Focused on open-source personal AI assistant designs, productivity tool integration patterns, proactive behavior, and prompt patterns for the core skill set.

## Key Findings

- **Khoj and Leon converge on a small set of primitives**: persistent memory, semantic doc search, scheduled automations ("reminders"), and pluggable skills/personas. Khoj explicitly builds around "second brain" + scheduled deep research; Leon uses three execution modes — smart (auto), workflow (fixed path), agent (plan step-by-step). The mode-switch concept is worth borrowing: the assistant should behave differently for "just do it" tasks vs. open-ended planning.

- **OpenClaw/NanoClaw define the personal-assistant skill shape Podium should match**: multi-channel messaging, cron/scheduled jobs, persistent memory, MCP tool integration, sub-agent spawning. NanoClaw's explicit scope ("readable in 8 minutes") matches Podium's pedagogical intent — lean skills over feature bloat.

- **A good daily brief is curated, not a data dump.** Consistent pattern across Cowork, hypeflo, n8n templates, and OpenClaw's `ai-daily-briefing`: (1) Needs Attention (overdue/blocking), (2) Today's 3 Priorities with *why*, (3) Calendar with prep notes inline, (4) Top 5–10 emails filtered of newsletters, (5) Tasks due today/overdue. Skip empty sections rather than show "nothing." Combine related items (meeting + its PR, email + its task).

- **Energy-based scheduling beats pure time-blocking.** Reclaim, Motion, and multiple "plan-my-day" skills show the pattern: ask user for peak hours, match hard/creative work to peak, leave 20% buffer, enforce 15-min breaks after 90-min focus blocks, add a shutdown ritual. This is load-bearing for `time-advisor`.

- **Personal CRM dormancy = cadence + last-contact + signal.** Dex sets explicit cadences (weekly/monthly/quarterly) per contact group; Clay uses AI-suggested reconnect based on interaction decay; Monica adds life-event tracking (birthdays, family details). All three surface a "you haven't talked to X in N weeks — here's why it might matter" prompt. The relationship-coach skill should track: `last_interaction`, `cadence_target`, `relationship_type`, `shared_context` (for warm re-entry).

- **Proactive AI needs a consent/interruption architecture, not just a cron.** USENIX SOUPS'22 + AI UX Design guide converge on four status layers: **ambient** (persistent badge), **progress** (on-demand panel), **attention** (interrupt), **summary** (report). Rule: accumulate observations into periodic briefings; only interrupt for time-sensitive + high-importance + high-confidence items. Honor quiet hours absolutely. This directly shapes `check-in`.

- **Email triage = Eisenhower matrix + user-tuned examples.** The n8n/Superhuman pattern: classify each mail into Urgent×Important quadrants via a classifier prompt tuned with *user-provided examples* of what counts as urgent. Q1 = now, Q2 = scheduled block, Q3 = draft delegate/decline, Q4 = auto-archive. The tuning step matters more than the matrix itself — generic classifiers fail on personal context.

- **MCP is the integration substrate in 2026.** Notion, Todoist, Gmail, Google Calendar, Linear all ship official or quasi-official MCP servers; Composio/Rube/Klavis offer aggregator MCPs (500–11,000 tools). Pattern: skills should declare which MCP server they need, not hard-code API clients. This keeps the "built on boilerplate" promise honest for students.

- **Meeting prep is a distinct, high-value skill.** Tavily meeting-prep-agent + Remind.ing + multiple "1 hour before meeting" agents: watch calendar → 60min before → research attendees (LinkedIn/recent news) + pull past thread context + list open action items + surface relevant docs → one-screen brief. This is different enough from daily-brief to warrant its own skill OR a clear extension of `manage-calendar`.

- **Prompts that prioritize ask for user axioms up front.** Effective time-management prompts collect: peak energy hours, non-negotiables, top-3 goals this quarter, biggest time-wasters, shutdown ritual preferences — *once, stored in memory* — then reference those in every replan. Avoids the LLM defaulting to generic advice.

## Recommended Additional Base Skills

Only one addition strongly justified beyond the given seven:

- **`prep-meeting`** — the "1 hour before" pattern is distinct enough from `daily-brief` (which looks at the whole day) and from `manage-calendar` (which is CRUD) to stand alone, and it's the single highest-impact proactive behavior across every tool surveyed. Triggers off calendar watch; outputs attendee research + past-context pull + open-items + agenda seed.

The other six requested skills cover the core surface well. Resist adding more at the base tier.

## Recommended Additional Extension Packs

- **`knowledge-capture`** — a pack for notebook/second-brain integration (Notion, Obsidian, Readwise). Strongly justified by the Khoj evidence that memory + doc-grounding is the feature users actually retain assistants for; separating it from base `remember` keeps core lean while giving power users the "second brain" surface.
- **`health-and-habits`** — optional pack for mood/energy check-ins, sleep/exercise nudges, journaling prompts. Justified because every long-running proactive assistant (Replika-style, Rewind, DayStart) converges on this surface and it's especially resonant for psychology students as a *topic of study*, not just a feature.

Skip adding more. `team-management`, `travel`, `finance` already cover the obvious professional extensions.

## Integration Patterns

Concrete patterns to reference in skill files:

**MCP-first tool declaration** — each skill declares required MCP servers in frontmatter rather than embedding API calls:
```yaml
tools:
  - mcp: google-calendar  # list_events, create_event, suggest_time
  - mcp: gmail            # search_threads, get_thread, create_draft
  - mcp: todoist          # get_tasks, create_task, close_task
```

**The "watch + threshold + brief" loop** (for `check-in`, `prep-meeting`, relationship dormancy):
1. Cron/schedule wakes the skill.
2. Skill pulls recent state (events, unread, tasks, last-contact).
3. Apply importance + time-sensitivity threshold.
4. If nothing passes threshold → silent log, do not interrupt.
5. If something passes → accumulate into a digest; only push an "attention" notification for Q1 items.

**Email triage prompt scaffold** (Eisenhower, tuned):
```
Classify each email into Q1-Q4. User's urgency examples: {from memory}.
Q1 (urgent+important): needs reply <24h AND affects {user's top-3 goals}.
Q2 (important, not urgent): schedule a block.
Q3 (urgent, not important): draft a decline/delegate.
Q4: archive candidate.
For each: {one-line reason}, {suggested action}, {draft if Q1 or Q3}.
```

**Daily brief structure** (Markdown, sections skipped if empty):
```
## Needs Attention   # overdue, blocked, time-critical
## Today's Priorities (3)  # each with 1-line "why it matters"
## Calendar  # inline prep note or link to prior thread per event
## Inbox Highlights  # max 7, newsletters filtered out
## Today's Tasks  # due-today + overdue
```

**Relationship record shape** (for `relationship-coach`):
```yaml
name: ...
relationship_type: close-friend | family | colleague | mentor | network
cadence_target: 2w | 1m | 1q | none
last_interaction: 2026-03-14  # auto-updated from email/calendar
shared_context: []            # recent topics, kids' names, interests
next_nudge_reason: ""         # birthday, cadence, life-event, news
```

**Energy-aware planning prompt** (for `time-advisor`) — always reference stored axioms:
```
User axioms: peak hours {from memory}, non-negotiables {...}, top-3 goals {...}.
Rules: 20% buffer, 90-min focus blocks ← 15-min break, hard work in peak,
admin/email off-peak, shutdown ritual at {time}.
```

## Constitution Enrichment

Three values that emerged across the research that the assistant's `constitution.md` should encode:

1. **"Curate, don't dump."** The assistant's job is to reduce the user's cognitive load, not mirror their inbox back at them. Every surface (brief, triage, nudge) must be filtered through "does this move a priority forward?" — if not, it waits or disappears.

2. **"Interruption is earned."** Borrow the USENIX framing: the assistant has four modes (ambient / progress / attention / summary) and defaults to the quietest one that fits. Honor quiet hours absolutely. An unsolicited interrupt must clear an importance × time-sensitivity × confidence bar the user can tune.

3. **"Axioms before advice."** The assistant never gives generic productivity advice. It asks for and remembers the user's peak hours, top-3 goals, non-negotiables, and urgency examples — then every recommendation references those. Borrowed from the conductor metaphor: the orchestra plays the user's score, not a stock one.

## Sources

- [Khoj — AI second brain, self-hostable](https://github.com/khoj-ai/khoj)
- [Leon — open-source personal assistant](https://github.com/leon-ai/leon)
- [OpenClaw — Personal AI Assistant](https://openclaw.ai/)
- [NanoClaw Skills](https://nanoclaw.dev/skills/)
- [awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw ai-daily-briefing skill](https://github.com/openclaw/skills/blob/main/skills/jeffjhunter/ai-daily-briefing/SKILL.md)
- [Claude Cowork daily briefing walkthrough](https://petrvojacek.cz/en/blog/claude-cowork-daily-briefing/)
- [Build Your AI Executive Daily Briefing](https://www.leadwithai.co/article/build-your-ai-executive-daily-briefing)
- [AI-powered Daily Brief that saves 2 hours](https://mark-mishaev.medium.com/how-i-built-an-ai-powered-daily-brief-that-saves-me-2-hours-every-day-2504a015f79f)
- [Dex — personal CRM guide](https://getdex.com/guides/finding-the-right-personal-crm/)
- [Dex vs. Clay personal CRMs 2026](https://getdex.com/blog/dex-vs-clay/)
- [Monica — open-source personal CRM (referenced via guides)](https://wavecnct.com/blogs/the-6-best-personal-crm-tools-in-2025)
- [Notion MCP — official docs](https://developers.notion.com/docs/mcp)
- [Todoist MCP Server](https://mcpservers.org/servers/stanislavlysenko0912/todoist-mcp-server)
- [awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers)
- [Composio MCP — 850+ toolkits](https://mcp.composio.dev/)
- [mcp-calendar-integration (Google Calendar → Notion action items)](https://github.com/DeepuKr0315/mcp-calendar-integration)
- [Tavily meeting-prep-agent](https://github.com/tavily-ai/meeting-prep-agent)
- [Remind — full-screen meeting briefings](https://remind.ing/)
- [AI UX Design — agent status monitoring patterns](https://www.aiuxdesign.guide/patterns/agent-status-monitoring)
- [USENIX SOUPS'22 — Runtime Permissions for Proactive Assistants](https://www.usenix.org/conference/soups2022/presentation/malkin)
- [Designing Proactive Notification Systems (JISEM)](https://jisem-journal.com/index.php/journal/article/download/12841/5982/21634)
- [n8n — Gmail Eisenhower triage workflow](https://n8n.io/workflows/7753-automate-gmail-email-triage-with-eisenhower-matrix-and-gpt-41-mini/)
- [Superhuman — time management matrix for email](https://blog.superhuman.com/time-management-matrix/)
- [Reclaim — AI calendar](https://reclaim.ai/)
- [plan-my-day agent skill](https://agentskills.so/zh/skills/brianrwagner-ai-marketing-skills-plan-my-day)
- [6 AI Prompts for Time Management — tested](https://www.nailedit.ai/prompts/time-management)
- [AI agent tutorial — Gmail + Calendar + Notion productivity](https://aimaker.substack.com/p/ai-agent-tutorial-productivity-assistant-makecom-gmail-google-calendar-notion)
