# Prompting Essentials

You learned the 6-stage framework, Chain-of-Thought, few-shot, task decomposition, and more in session 2. This guide covers what's changed since, what's coming next, and how prompting connects to building agents.

## The Big Shift: From Prompting to Context Engineering

In June 2025, Andrej Karpathy (co-founder of OpenAI, former Tesla AI lead) reframed the entire field:

> "The LLM is the CPU, the context window is the RAM, and you are the operating system."

**Context engineering** is the discipline of designing dynamic systems that provide the right information, tools, and state to an LLM at the right time — not just writing a better single instruction.

In practice this means assembling **modular context**:
- System instructions (who the model is, what it values)
- Conversation history (what's happened so far)
- Retrieved documents (RAG — grounding in external sources)
- Tool definitions (what the model can do)
- Memory (what the model remembers across sessions)
- Dynamic state (what's happening right now)

**A prompt asks a question. Context engineering builds the information environment in which the model reasons.**

This is exactly what you'll be doing when you design agents — defining the context that shapes how the agent thinks and acts. The 6-stage prompt framework you learned is one component; context engineering is the whole architecture.

## What's Changed for 2025-2026 Models

### Now obsolete or counterproductive
- **"Think step by step"** — reasoning models (Claude Extended Thinking, GPT o-series, Gemini Thinking Mode) handle chain-of-thought internally. Adding explicit CoT instructions is redundant or even harmful for these models. Standard models still benefit.
- **ALL-CAPS imperatives and "YOU MUST"** — overtrigger Claude's safety systems and degrade output quality. Clear, calm instructions work better.
- **Long monolithic prompts** — performance degrades around 3,000 tokens of instruction. The sweet spot is 150-300 words. Say what you need, not everything you can think of.

### Still works well
- **Few-shot examples** (3-5 diverse examples) remain the highest-ROI technique across all models.
- **Structured formatting** — XML tags for Claude, markdown for GPT. A prompt formatted in XML can outperform markdown by 30% on Claude.
- **Specificity** — "Be explicit. Be specific. Be structured." (from your session 2) remains the universal foundation.

### New patterns
- **Confidence calibration** — "Rate your confidence 1-10" works, but you can now also ask reasoning models to show their uncertainty in-line.
- **Meta-prompting at scale** — using AI to critique and rewrite prompts (you learned this in session 2) is now a standard production practice. OPRO research showed optimized prompts improve accuracy by 8-50% (Yang et al., 2023).

## From Prompts to Agent Instructions

Writing a system prompt or agent constitution (like a CLAUDE.md file) is different from writing a one-off prompt. Here's what transfers and what doesn't:

### What transfers
- Clarity and specificity
- Few-shot examples
- Structured formatting
- Defining success criteria

### What doesn't transfer
- Conversational tone — agent instructions are contracts, not conversations
- Step-by-step hand-holding — the agent needs principles, not procedures
- Emotional appeals — "please try harder" never worked, and still doesn't

### The key difference: Identity-Rules-Output
Effective agent instructions follow a three-part structure:
1. **Identity** — who the agent is, what it values, how it behaves
2. **Rules** — what constraints it operates under, what it should never do
3. **Output** — what format it produces, how it structures responses

Anthropic's Claude Constitution (January 2026) demonstrated that teaching an AI *why* to behave produces better results than prescribing *what* to do. This is the same principle you'll use in the workshop when you define your agent's identity.

## Psychology-Specific Prompting Patterns

### Qualitative research
This is where AI prompting has the most mature psychology-specific frameworks:
- **GAITA** (Guided AI Thematic Analysis) — adapts template analysis into four AI-assisted stages: familiarization, preliminary coding, template formation, theme development (Dellafiore et al., 2026)
- **GAATA** (Generative AI-Augmented Thematic Analysis) — three phases with generic prompt templates for researchers with less technical expertise (Jayawardene & Ewing, 2026)

### Clinical documentation
~10% of psychologists now use AI monthly for note-taking (APA Practitioner Pulse Survey, 2024). Trust is sustained when AI handles low-stakes roles (documentation, brainstorming) but diminishes for high-stakes clinical judgment.

### Critical limitation
LLMs struggle with latent meanings, symbolic references, emotional undertones, and context-specific subtexts that require deep cultural familiarity. Human validation remains non-negotiable for qualitative and clinical work.

## Best Resources to Bookmark

| Resource | What It Is |
|---|---|
| [Anthropic Prompt Engineering Docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) | Official guide, kept current |
| [Anthropic Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) | Learn by doing — Jupyter notebooks |
| [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) | GPT-specific patterns |
| [promptingguide.ai](https://www.promptingguide.ai/) | Community-maintained, comprehensive |
| [Context Engineering Guide](https://www.promptingguide.ai/guides/context-engineering-guide) | The evolution beyond prompting |

## Key References

- Karpathy, A. (2025). Context engineering. https://x.com/karpathy/status/1937902205765607626
- Gartner (2025). Context Engineering. https://www.gartner.com/en/articles/context-engineering
- Dellafiore et al. (2026). GAITA: AI in Qualitative Research. *Journal of Mixed Methods Research.*
- Jayawardene & Ewing (2026). GAATA. *International Journal of Market Research.*
- Yang et al. (2023). Large Language Models as Optimizers (OPRO).
- Mollick et al. (2024). Playing Pretend — role prompting.
- APA (2024). Practitioner Pulse Survey.
