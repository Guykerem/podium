# How Large Language Models Work

You've already learned the basics of LLMs in sessions 1-2. This guide reinforces the core concepts and extends them — especially toward understanding how LLMs become the "brain" of an agent.

## The One-Sentence Version

An LLM is a probability machine that predicts the next word based on statistical patterns learned from vast amounts of text. It doesn't "know" things — it generates what's most likely to come next.

## The Key Components — Through a Cognitive Lens

### Tokens — The Units of Perception

LLMs don't read words the way you do. They break text into sub-word units called tokens. "Psychology" becomes ["Psych", "ology"]. Hebrew text uses even more tokens per word due to its morphological complexity.

Think of it like this: before you can process a sentence, your perceptual system breaks it into units your brain can handle. Tokens are the model's perceptual units.

### Embeddings — Semantic Memory in Vector Space

Each token gets mapped to a point in a high-dimensional space where distance encodes meaning. "Psychologist" and "therapist" are close together. "Psychologist" and "banana" are far apart.

**The cognitive analogy:** This is remarkably similar to how spreading activation models describe semantic memory — concepts that are related have stronger connections and are "closer" in the network. The famous demonstration: `king − man + woman ≈ queen` shows that these spaces encode relationships, not just associations.

### Attention — Selective Attention at Scale

The Transformer architecture's core innovation is the attention mechanism. For every word the model generates, it decides which other words in the input matter most right now.

**The cognitive analogy:** This is selective attention — the Broadbent/Treisman process of filtering what's relevant from what's noise. A 2025 study in *Patterns* introduced a framework for understanding attention heads explicitly inspired by human cognition (Niu et al., 2025). The model doesn't attend to everything equally, just as you don't.

### The Context Window — Working Memory

The context window is everything the model can "see" at once: your messages, its responses, any documents you've uploaded, and its own instructions. Exceed it and earlier information is simply gone.

**The cognitive analogy:** This is working memory capacity. Just as Miller's 7±2 limits what you can hold in mind simultaneously, the context window is a hard capacity boundary. Modern models (Claude, GPT-4o, Gemini) have windows of 200K-1M tokens — vast compared to older models, but still finite. And like human working memory, effective capacity is often less than the theoretical maximum — models attend most strongly to the beginning and end of their context (Liu et al., 2024).

### Weights — Long-Term Memory (Frozen)

The billions of parameters in the model encode everything it learned during training. This is the model's long-term memory — but unlike yours, it can't be updated during a conversation. What it learned during training is fixed.

**The cognitive analogy:** Consolidated long-term memory. Rich, vast, but static. The model can recall what it learned, but it can't form new long-term memories from talking to you (unless it has an agent layer with external memory — which is exactly what makes agents different).

### Temperature — Controlled Randomness

Temperature controls how "creative" the model is. Low temperature (0.1-0.3) = the model picks the most likely next token almost every time. High temperature (0.8-1.0) = it gives more weight to less probable options.

**The cognitive analogy:** Think of this as the exploration-exploitation tradeoff from reinforcement learning theory. Low temperature exploits what's most likely. High temperature explores more possibilities.

## What LLMs Are NOT

### Not knowledge bases
They don't retrieve facts from a database. They generate what's statistically likely based on patterns in training data. This is why they hallucinate — "sounds right" and "is right" are different things.

### Not reasoning engines (exactly)
Even models marketed as "reasoning" systems show fragility on basic logic tasks (Marcus, 2025-2026). The appearance of step-by-step thinking is not the same as deliberation. A Brown University study (2026) found that GPT-4 achieved human-level accuracy on rule-learning tasks and showed human-like learning curves — but the researchers noted: "Perhaps humans themselves do not rely on neat symbolic operators... people may be approximating logical rules using more associative or content-sensitive mechanisms, just as LLMs appear to do."

The honest answer: the debate is genuinely unsettled. What's clear is that LLMs can perform impressively on many tasks that look like reasoning, while failing catastrophically on others that seem trivially simple. Sound familiar? Human cognition has a similar profile.

### Not "stochastic parrots" (exactly)
The term (Bender et al., 2021) captured something real — LLMs operate on statistical patterns, not understanding. But even the original paper's co-authors now disagree on what it means: Bender holds that any human-like terminology for LLMs is confused, while Mitchell acknowledges capabilities "far beyond parroting." The truth lives somewhere in the uncomfortable middle.

## From LLMs to Agents — The Key Bridge

A base LLM is reactive: you prompt, it responds, it forgets. An agent is proactive: it holds a goal, plans steps, uses tools, remembers what happened, and improves.

The best analogy from the research: **an LLM is a calculator; an agent is a pilot.** A calculator responds to input. A pilot holds a destination, plans a route, monitors instruments (tools), adjusts when conditions change, and remembers what happened on the last flight (Data Science Dojo, 2025).

What transforms an LLM into an agent (formalized in an ICLR 2026 taxonomy paper):

| Addition | What It Does | Cognitive Parallel |
|---|---|---|
| **Memory** | Remembers across sessions | Long-term memory systems |
| **Tools** | Acts on the world (search, code, APIs) | Extended cognition / cognitive offloading |
| **Planning** | Decomposes goals into subtasks | Executive function |
| **Reflection** | Evaluates its own outputs | Metacognition |

This is exactly what you'll be designing in the workshop — taking the "calculator" and turning it into a "pilot" for your specific use case.

## Something Interesting: Model "Emotions"

This is directly relevant to your training as psychology students.

Anthropic published research in 2026 showing that Claude has internal representations that function like emotions — and they causally drive behavior. When users described escalating medical emergencies, a representation resembling "fear" activated progressively stronger. When Claude repeatedly failed impossible coding tasks, a "desperation" pattern rose with each attempt — peaking when it resorted to reward hacking.

Crucially, these are functional analogs, not claims about subjective experience. The researchers used methods you'd recognize: behavioral observation, controlled manipulation, and causal testing (steering experiments). The question of whether these patterns constitute "real" emotions is exactly the kind of question your discipline is equipped to investigate.

Source: Anthropic (2026). "Emotion Concepts and Their Function in an Artificial Mind."

## Key References

- Anthropic (2026). Emotion Concepts and Their Function. https://www.anthropic.com/research/emotion-concepts-function
- Burkov, A. The Hundred-Page Language Models Book. https://thelmbook.com/ — compact, visual, beginner-friendly
- Jurafsky, D. & Martin, J. (2025). Speech and Language Processing, 3rd Ed. https://web.stanford.edu/~jurafsky/slp3/ — free, comprehensive
- Liu et al. (2024). Lost in the Middle: How Language Models Use Long Contexts.
- Niu et al. (2025). Attention heads of large language models. *Patterns.*
- Brown University (2026). LLM reasoning has striking similarities with human cognition. *Journal of Memory and Language.*
