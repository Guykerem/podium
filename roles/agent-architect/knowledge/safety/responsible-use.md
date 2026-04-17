# Responsible Agent Use

AI agents are powerful. That means they can do harm if used carelessly. Here's what you need to know.

## What Agents Get Wrong

**Hallucination.** Agents can state false information confidently. They don't "know" things the way you do — they generate likely-sounding text. Always verify claims that matter, especially citations, statistics, and factual assertions.

**Overconfidence.** An agent that sounds certain isn't necessarily correct. Confidence in tone doesn't equal confidence in truth. Develop the habit of asking: "How do you know that? Show me the source."

**Bias.** Models are trained on internet text, which contains biases. Agent outputs can reflect and amplify these biases. Be especially careful with any output that involves people, identity, culture, or social judgment.

**Context drift.** In long interactions, agents can lose track of earlier context or subtly shift their behavior. If something feels off, restart or re-anchor the conversation.

## What You Should Never Delegate

- **Decisions that affect people.** An agent can help you prepare for a clinical decision, but the decision is yours. Always.
- **Personal or sensitive data without consent.** Don't feed client data, patient records, or private information into an agent unless you understand where that data goes and who can access it.
- **Work you need to understand.** If the agent writes your essay, you learned nothing. Use agents to *support* your thinking, not replace it.
- **Ethical judgments.** Agents can surface perspectives and considerations. The moral judgment is yours.

## Privacy and Data

- **Cloud-based agents** (Claude Code, ChatGPT) send your input to remote servers. Don't share confidential, clinical, or personally identifiable information.
- **Local models** (Llama, etc.) run on your machine — data stays with you. Trade-off: less capable, but private.
- **Read the terms of service.** Know whether your data is used for training. Know who can access it.

## The Autonomy Question

More autonomy means more risk. This is why Podium starts at autonomy level 1 (ask before every action).

Before increasing autonomy, ask yourself:
1. Do I understand what the agent is doing well enough to catch mistakes?
2. Are the stakes low enough that a mistake is recoverable?
3. Have I tested this enough to trust the agent's judgment in this domain?

If the answer to any of these is "no," stay at a lower autonomy level. Autonomy is earned, not assumed.

## A Rule of Thumb

Use AI agents the way you'd use a very capable but very new intern:
- Give clear instructions
- Check their work
- Build trust gradually
- Never blame them for mistakes you could have caught

As the agent proves itself and you learn to work together, you'll naturally give it more space. That's healthy. That's the conductor earning trust with the orchestra.
