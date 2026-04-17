# Hook Formulas

The first 3 seconds decide whether anything else matters. This is the canonical hook reference for `write-script`, `creative-brief`, and `variant-spray`.

## The rules

1. **Promise a payoff** the viewer can't predict
2. **Don't resolve it** in the hook itself — tease, don't tell
3. **Visual + verbal together** — the hook is both what they see and what they hear
4. **Match register to audience** — a contrarian hook on a calming wellness channel breaks trust
5. **Three seconds max.** If your hook needs a minute, you don't have a hook.

## Emotional registers (pick one per hook)

| Register | When to use | Example |
|---|---|---|
| **Curiosity** | Novel insight or counter-intuitive | "I didn't expect this when I tried Claude's agent mode..." |
| **Contrarian** | You have a sharp take against common belief | "Everyone's wrong about agent frameworks." |
| **Stakes / negation** | A mistake your audience is making | "Stop using Zapier for agents. Do this instead." |
| **Specific / numeric** | Tactical content with clear promise | "3 words that made my agent 10x more useful." |
| **Personal** | Story-led, vulnerability | "I spent $400 on tools before realizing this one thing." |
| **Pattern interrupt** | Unusual claim or visual | "Your agent is watching you right now. Here's what it sees." |
| **Question** | Invites engagement, works text-first | "What would you do if your agent lied to you?" |
| **Authority name-drop** | Social proof + payoff | "Daniel Miessler told me the one thing every agent needs." |

## Hook templates (fill-in-the-blank)

### Curiosity
- "If you [desirable outcome], you need to know this."
- "I spent [N hours/dollars] testing [thing] so you don't have to."
- "[Expert/authority] told me [surprising claim]."
- "Here's what I learned when [unusual event]."

### Contrarian
- "[Common belief] is a lie. Here's why."
- "Everyone's [doing X]. That's the mistake."
- "You've been told [X]. The truth is [Y]."
- "Stop [common behavior]. Try this instead."

### Stakes
- "If you're [action], you're losing [specific thing]."
- "Don't [action] until you've seen this."
- "[Action] is costing you [specific cost]."
- "The [adjective] way to [outcome] without [common pitfall]."

### Specific
- "[N] things nobody tells you about [topic]."
- "[N] words that changed how I [action]."
- "The [specific time] framework for [outcome]."
- "[$X] in [Y days] using only [Z]."

### Personal
- "I've been thinking about this for [time period]..."
- "[N] years ago I [event]. Here's what I learned."
- "This is the [adjective] thing I've [done/tried] this [month/year]."
- "I used to [common habit]. Now I [new behavior]."

## Visual hook pairings

The verbal hook is half. The visual is the other half.

| Verbal hook style | Visual pairing |
|---|---|
| Curiosity | Mid-action shot with clear but unresolved intent (hand reaching, object mid-fall, screen with partial reveal) |
| Contrarian | Direct eye contact + firm expression + simple background |
| Stakes | Warning sign visual (red color, caution tape, crossed-out element) |
| Specific | Count-in-frame (number visible), or the thing itself (object close-up) |
| Personal | Creator's face, soft lighting, "storytelling" composition |
| Pattern interrupt | Unusual angle (bird's eye, dutch tilt), unexpected object, motion jump |

## Platform-specific pacing

| Platform | Hook window | Must include |
|---|---|---|
| TikTok | 0-2s | Sound-on payoff + visual hook + first-sentence promise |
| Reels | 0-2s | Same |
| YouTube Shorts | 0-2s | Same + title-as-hook (Shorts shows title) |
| YouTube long-form | 0-15s | Full promise + preview of 3 things they'll learn |
| LinkedIn (text) | Line 1 | Visible in preview card — treat as newspaper headline |
| LinkedIn (video) | 0-3s | Burn-in text hook (auto-play muted default) |
| X (text) | Tweet 1 | Must stand alone as engagement post AND tease thread |
| Newsletter | Subject line | Subject = hook; first 50 words must earn scroll |

## Anti-patterns (don't)

- **"Did you know..."** — telegraphs a fact you could Google
- **"Today I'm going to show you..."** — meta-hook, wastes 2 seconds on preamble
- **"Hey guys..."** — generic greeting, zero promise
- **"This changed my life"** — unfalsifiable claim, reads as AI-generated
- **"Top 10 [thing] you need..."** — overdone; kept alive by old SEO habits
- **"Wait til the end..."** — begging for retention rather than earning it
- **Question hooks that answer themselves** — "Are you tired of [common pain]?" is a yes/no with no payoff

## Hook library structure

The agent maintains `memory/creative-style/hook-library.yaml`:

```yaml
- id: contrarian_agents_20260417
  register: contrarian
  text: "Everyone's wrong about agents"
  platform: youtube_shorts
  metric_primary: retention_at_30s
  value: 0.54
  baseline: 0.42
  lift: 0.29
  tested_against: listicle
  test_id: test_2026_04_17_hook
  status: winner              # or: retired | testing | candidate
```

Pruned periodically — retire hooks that worked once but haven't outperformed in 60 days.

## How to use this file

- `write-script` loads this when drafting hooks
- `creative-brief` uses this to generate 3 hook variants in different registers
- `variant-spray` spreads hook registers across variants
- `ab-test-hooks` tests hook registers against each other
