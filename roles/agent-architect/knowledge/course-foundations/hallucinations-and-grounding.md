# Hallucinations and Grounding

You learned about hallucinations in session 1 — what they are, why they happen, and how RAG helps. This guide goes deeper: how the field is fighting hallucinations in 2026, how to build verification habits, and why this matters especially for psychology.

## The Hard Truth

A 2025 mathematical proof confirmed that hallucinations are **structurally inevitable** under current LLM architectures. Models predict the most likely next token — not the most truthful one. "Sounds right" and "is right" are different optimization targets. This won't be fully solved by making models bigger or training them longer.

What HAS improved dramatically: the rate. Combining RAG, reinforcement learning, and guardrails yields up to 96% reduction in hallucinations versus baseline (Stanford, 2025). But "reduced" is not "eliminated."

## Beyond Basic RAG — What's New in 2026

You know RAG adds external documents to ground the model's responses. Here's what's layered on top now:

**Reasoning chains.** Models now show their step-by-step reasoning (Chain-of-Thought), which exposes logical gaps before they reach you. If the reasoning doesn't hold up, the answer probably doesn't either.

**Confidence scoring and routing.** Systems assess their own confidence before responding. Low-confidence outputs get routed to fallback paths — a refusal, a request for clarification, or a flag for human review — rather than being delivered as if certain.

**Citation-grounded generation.** Anthropic's Citations API (2025) lets Claude anchor responses to exact passages in source documents. One enterprise user reported reducing source hallucinations from 10% to 0%. The key: the model can now point to *exactly* where in your document it found something.

**Self-consistency checking.** Run the same query 3-5 times. If the answers diverge significantly, that's a hallucination signal. Consistent answers across runs are more likely to be grounded.

**Temperature reduction.** Dropping temperature from 1.0 to 0.3 reduced hallucination rates by ~22%. Lower creativity = less confabulation.

## Practical Verification Habits

Not just "be critical" — here's what to actually do:

### 1. Decompose claims into atomic assertions
Before checking anything, break AI output into individual factual claims. A fluent-sounding paragraph can hide multiple errors. Isolate each claim: "This study found X." "The authors concluded Y." "This was published in Z."

### 2. Spot-check 3-5 claims against primary sources
Prioritize: statistics, named citations, dates, and anything that surprises you. Use Google Scholar, PubMed, or APA PsycINFO for psychology-specific verification.

### 3. Always verify that citations exist
A Deakin University study found GPT-4o fabricated roughly 1 in 5 academic citations, with 56% of all citations containing errors or being entirely fake. Before you use any AI-generated citation:
- Does the paper exist?
- Did the named authors write it?
- Does it actually say what the AI claims?

### 4. Use verification tools
- **Scite.ai** — shows how a paper has been cited (supporting, contrasting, mentioning)
- **Elicit** — extracts specific claims from papers directly
- **Consensus** — searches across peer-reviewed literature
- **Perplexity Pro** — web-grounded answers with open citations

### 5. Cross-model verification
Run the same question through a second model. Disagreement between models is a useful hallucination signal.

## When to Trust More vs. Less

| Trust more | Trust less |
|---|---|
| Brainstorming, ideation, outlining | Specific facts, statistics, dates |
| Summarizing text *you* provide | Generating citations or references |
| Well-studied, mainstream topics | Niche, emerging, or contested topics |
| Tasks where you can verify output | Tasks where errors are invisible to you |
| Structuring and formatting | Clinical recommendations, legal claims |

**The practical heuristic:** The more specialized the knowledge and the higher the stakes of being wrong, the less you should trust unverified AI output. General RAG-based responses hallucinate ~3% of the time. Legal queries without RAG: 58-82%. Specialized domains without grounding: 60-80%.

## Psychology-Specific Risks

Your field sits at a particularly dangerous intersection: it involves vulnerable populations, the evidence base contains many niche or contested findings, and students may lack the expertise to catch subtle errors.

**Citation fabrication scales with topic obscurity.** In mental health literature reviews, depression citations were 94% real — it's well-studied, with massive training data. But binge eating disorder and body dysmorphic disorder saw fabrication rates near 30%. The less-studied the topic, the higher the risk.

**"AI Psychosis" as clinical phenomenon.** In 2025, UCSF psychiatrist Keith Sakata reported treating 12 patients with psychosis-like symptoms tied to extended chatbot use. JMIR Mental Health published a case series on delusional experiences emerging from AI chatbot interactions. This is a real clinical consideration, not a scare story.

**Even experts miss fabricated references.** GPTZero found 100+ AI-hallucinated citations across 53+ papers accepted at NeurIPS 2025 — one of the world's top AI conferences. Expert peer reviewers didn't catch them.

## Calibrated Trust — The Right Mental Model

The goal isn't paranoid rejection or blind trust. It's **calibrated trust** — your confidence in the output should match the system's actual capability for that specific task.

Key principles:
- **Trust is task-specific, not model-specific.** You can appropriately trust the same model for brainstorming while distrusting it for clinical fact retrieval.
- **Calibration improves with experience.** The more you use AI and verify outputs, the better your intuition becomes for when something "smells off."
- **When in doubt, verify.** The cost of checking is minutes. The cost of trusting a hallucination in a clinical or academic context can be enormous.

## Key References

- Anthropic (2025). Introducing Citations API. https://claude.com/blog/introducing-citations-api
- Deakin University / StudyFinds (2025). ChatGPT's Hallucination Problem: Fabricated References.
- Fortune (2026). NeurIPS Papers Contained 100+ AI-Hallucinated Citations.
- JMIR Mental Health (2025). AI Psychosis: Delusional Experiences from AI Chatbot Interactions.
- Arxiv (2025). Mitigating Hallucination in LLMs: RAG, Reasoning, and Agentic Systems.
- Anthropic (2025). Reduce Hallucinations. https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
