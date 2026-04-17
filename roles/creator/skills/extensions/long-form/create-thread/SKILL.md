---
name: create-thread
description: Compose X / LinkedIn threads — hook post + value posts + CTA close, within platform char limits
when_to_use: >
  User wants to turn a capture, article, or insight into a threaded post for
  X or LinkedIn. Also generates thread graphics if helpful. The highest-reach
  text format on both platforms in 2026.
tier: extension
---

# Create Thread

Turn a single idea into 6-12 posts that together pull the reader through.

## Purpose

Threads work because they:
- Hook with a single-post payoff promise
- Reward each subsequent scroll with one new idea
- Close with a clean synthesis or CTA

Poorly structured threads (one idea split over 10 posts, or 10 ideas competing) flop. This skill forces the structure.

## How It Works

1. **Inputs**:
   - Source: article, transcript, outline, or raw thesis
   - Target platform: X (280 free / 25K Premium) or LinkedIn (3000 char per post, but posts-in-thread render as comments)
   - Tone: personal story, tactical tutorial, contrarian take, research summary
2. **Identify the payoff** — What's the one insight this thread delivers? Write it in a single sentence. Everything serves this.
3. **Draft the hook post** (Post 1):
   - X: ≤ 260 chars (leave room for link/attachment)
   - LinkedIn: ≤ 200 chars visible before "see more"
   - Promise the payoff; don't deliver yet
   - Negation, contradiction, or specific-number hooks outperform
   - Example:
     ```
     I spent 3 years teaching agents. The one thing I learned:
     most agent tutorials teach the wrong skill. 🧵
     ```
4. **Draft 6-10 value posts**:
   - One idea per post
   - Short sentences. Line breaks for rhythm.
   - For tactical threads: numbered posts (2/, 3/, etc.)
   - For narrative threads: no numbers, rely on hook continuity
   - Drop a "payoff preview" mid-thread if long (post 5 or 6 of 10)
5. **Close post**:
   - Synthesis (restate the thesis)
   - CTA: follow, sign up, reply, share
   - Or: question to prompt replies
   - Final post often has an asset: screenshot, graphic, link
6. **Per-post character budget** (X):
   - Free tier: 280 chars — budget ~260 for copy, 20 for line breaks
   - Premium: 25K per post — don't abuse it; threading is a form, not a cap
7. **Platform-specific touches**:
   - **X**: emoji sparingly; use structure tokens (numbered list) over emoji decoration; final post pins the thread
   - **LinkedIn**: no emoji decoration; line breaks every 1-2 sentences; end with a question
8. **Emit**:
   ```
   threads/<slug>/
     thread.md                   # human-readable, numbered
     thread.x.json               # [{text: "...", attachment: null}, ...] ready for API
     thread.linkedin.json        # same shape, platform-adjusted
     graphics_brief.md           # if any post wants a graphic (pass to design-graphics)
   ```

## thread.md template

```markdown
# Thread — {slug}
- **Platform**: {x | linkedin}
- **Posts**: {N}
- **Thesis**: {one line}
- **CTA**: {what the reader should do}

---

## 1/ Hook
{post 1 copy}
[char count: 248/280]

## 2/
{post 2 copy}
[248/280]

## 3/
{post 3 copy}
[265/280]

...

## {N}/ Close
{close post copy + CTA}
[250/280]
[attachment: graphics/thumb.png]
```

## Thread structures that work

**The enumerated (tactical)**
```
1/ Hook with promise
2/ First lesson
3/ Second lesson
...
N/ Synthesis + CTA
```

**The narrative (personal)**
```
1/ Hook with character + problem
2/ Setup the stakes
3/ First attempt
4/ The twist
5/ The insight
6/ The lesson
7/ CTA / question
```

**The contrarian (opinion)**
```
1/ "Most people think X. Here's why that's wrong:"
2/ Common belief stated charitably
3/ The hidden flaw
4/ Evidence
5/ Alternative framework
6/ What to do instead
7/ CTA
```

## Autonomy behavior

- **L1** — Draft hook + outline of subsequent posts. Review before body posts drafted. Then body → review → emit.
- **L2** — Full draft on a chosen structure. Creator reviews complete thread.
- **L3** — Full auto; creator reviews + manually posts (no auto-publish).

## Integration

- Input: `article.md`, `brief.md`, transcript, or user prompt
- Composes **act** (LLM drafting with thread-structure prompts) + **remember** (thread-performance log)
- Downstream: `design-graphics` (thread graphics), `publish` skill (queue posts), or manual
- Upstream: `write-article`, `segment-transcript` (quote-source)

## Failure modes

- **Too long** — every post must earn its existence. If you can cut 2 posts and the thesis is intact, cut them.
- **Too short** — 2-3 posts is a thread failure; either fold into one post or expand to 6+
- **Recycled hook** — creator's last 5 hooks used the same register; check `memory/creative-style/hook-library.yaml` and push a different angle
- **CTA doesn't match content** — if the thread was narrative and the CTA is "buy my course," the mismatch is felt; align CTA to content genre
