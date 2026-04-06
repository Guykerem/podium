# Student AI Usage Profiles — Internal Reference

> Anonymized patterns from the prompts survey (session 2 homework). Informs how we pitch the demo and workshop.

## Sample Size

~7 respondents (small sample — directional, not definitive)

## Tools Used

- **ChatGPT:** dominant tool, used by nearly all respondents
- **Gemini:** used by 2-3 students, one specifically for academic article analysis
- No mention of: Claude, Copilot, local models, CLI tools, coding agents

## What They Use AI For

| Use Case | Frequency | Sophistication |
|---|---|---|
| Translation (Hebrew ↔ English) | High | Basic prompts |
| Article summarization (academic) | High | Structured framework prompts |
| Rephrasing / improving text | Medium | Basic to moderate |
| Image generation | Medium | Struggles with specificity |
| Clinical teaching support | Low | One sophisticated user |
| Video transcript processing | Low | One very detailed system prompt |

## Skill Distribution

**Most students:** basic ChatGPT users. Simple, short prompts in Hebrew. "Translate this," "Summarize this article." Limited awareness of structure or technique.

**1-2 outliers:** notably more sophisticated. One student built a detailed system prompt for video transcript translation with specific rules for statistical notation, formatting, and error handling. Another uses role prompting for clinical teaching scenarios with reflection questions.

**Common failure pattern:** image generation. Multiple students reported frustration with "create an image of X" — the requests are vague, and they don't know how to specify visual parameters.

## What This Tells Us

1. **They're early.** Most are at the "use AI as Google/translator" stage. The leap to "design an agent" is significant — we need strong scaffolding.

2. **Hebrew is their natural language.** All prompts are in Hebrew. Technical English terms are mixed in naturally.

3. **Academic use is the anchor.** Articles, research, writing — this is their world. Agent use cases should connect to academic work (research agent, study planner, literature review).

4. **They don't know what they don't know.** The gap between "translate this sentence" and "build an agent with memory and tools" is vast. The architecture section needs to make this leap feel natural, not intimidating.

5. **The sophisticated users are potential early adopters.** The student who built the translation system prompt already thinks in terms of rules, constraints, and structured output. They'll likely be the first to build on Podium.

6. **Image generation frustration = opportunity.** They've experienced the gap between intention and output. The conductor metaphor lands here: "the gap isn't the AI's capability — it's the interface between your intention and its execution."
