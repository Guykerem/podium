# What Is an AI Agent?

An AI agent is a system that can **perceive, reason, decide, and act** — autonomously, in a loop, toward a goal.

That's different from a chatbot. A chatbot waits for your input and responds. An agent decides what to do next on its own.

## The Agentic Loop

Every agent runs a version of this cycle:

```
Observe → Think → Decide → Act → Learn → (repeat)
```

1. **Observe** — take in new information (user input, data, environment state)
2. **Think** — reason about what's happening and what matters
3. **Decide** — choose what to do next
4. **Act** — execute the chosen action (call a tool, produce output, modify state)
5. **Learn** — capture what happened and update for next time

## The Cognitive Analogy

If you study psychology, you already know this loop:

| Agent Component | Cognitive Parallel |
|---|---|
| Observe | Perception, attention |
| Think | Working memory, reasoning |
| Decide | Executive function, judgment |
| Act | Motor output, behavior |
| Learn | Feedback processing, memory consolidation |

An agent is, in a sense, a simplified model of a cognitive system. Understanding one helps you understand the other.

## What Makes an Agent Different From a Chatbot?

| | Chatbot | Agent |
|---|---|---|
| **Loop** | Single turn: input → output | Multi-step: observe → think → decide → act → learn |
| **Autonomy** | Waits for instructions | Can decide what to do next |
| **Memory** | Usually none between sessions | Remembers context across interactions |
| **Tools** | Can only generate text | Can take actions (search, code, send messages) |
| **Identity** | Generic or lightly prompted | Has a constitution — values, personality, constraints |

## When Is a Use Case Right for an Agent?

Not every problem needs an agent. A good agent use case is:

- **Recurring** — you do it regularly, not once
- **Memory-dependent** — context from past rounds makes it better
- **Clear success criteria** — you can tell if it worked
- **Structured steps** — there's a process, not pure creative intuition
- **Recoverable mistakes** — you can review and course-correct

If your use case doesn't hit at least 3 of these, a simpler tool (a script, a chatbot, a spreadsheet) might serve you better.
