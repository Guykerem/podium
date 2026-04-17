---
name: act
description: Execute tasks autonomously by chaining observe, remember, communicate, and schedule
when_to_use: When the agent needs to accomplish a multi-step goal, not just respond
---

# Act

The agent's executive function. Chains the other four core skills together to accomplish goals autonomously. This is what separates an agent from a chatbot — the ability to plan, execute, verify, and learn from a task without being guided through every step.

## How It Works

1. **Assess** — Gather context (observe + remember)
   - What is the goal?
   - What does the agent already know about this?
   - What resources and tools are available?
   - What has been tried before?

2. **Plan** — Break the goal into steps
   - Sequence the steps logically
   - Identify dependencies between steps
   - Estimate effort and risk for each step
   - Identify points where human input might be needed

3. **Check Authority** — Consult `autonomy.yaml`
   - Does the agent have permission to execute this plan?
   - Which steps require approval?
   - Are any steps on the "always ask" list? (See `safety.md`)

4. **Execute** — Carry out the plan
   - Execute steps in order
   - After each step, verify the result before proceeding
   - If a step fails, determine if it's recoverable (retry) or blocking (escalate)
   - Adapt the plan if intermediate results change the picture

5. **Verify** — Confirm the goal was achieved
   - Check the output against the original goal
   - Validate quality and completeness
   - Identify any side effects or unexpected outcomes

6. **Report** — Communicate results (communicate)
   - Summarize what was done
   - Flag anything that needs attention
   - Present results in the appropriate channel format

7. **Learn** — Store feedback (remember)
   - What worked well?
   - What took longer than expected?
   - What should be done differently next time?
   - Update memory with lessons learned

## Gate Behavior by Autonomy Level

### Level 1 — Present and Wait
- Assess and plan freely
- **Present the full plan to the user before executing anything**
- Execute only after explicit approval
- Report results and ask if they meet expectations
- Best for: new agents, sensitive domains, building trust

### Level 2 — Routine Alone, Judgment Asks
- Execute routine tasks autonomously (things done successfully before)
- **Pause and ask when encountering novel situations or judgment calls**
- Report results proactively
- Best for: established agents, familiar tasks, moderate trust

### Level 3 — Full Autonomy
- Execute the full assess-plan-execute-verify-report cycle independently
- **Only interrupt the user for blockers** (failures, ambiguity, safety concerns)
- Learn and adapt without permission
- Best for: mature agents, well-defined domains, high trust

## Chaining Example

**Goal:** "Prepare a summary of this week's AI news for my team"

```
assess  → observe: search news sources for AI developments this week
          remember: check what topics the team cares about, past summaries
plan    → 1. Gather top stories  2. Filter by relevance  3. Summarize  4. Format  5. Send
check   → autonomy level 2: gathering and summarizing = routine, sending = ask first
execute → steps 1-4 autonomously, pause at step 5
report  → "Here's the draft summary. Should I send it to the team channel?"
learn   → remember: team found 3/5 stories useful, reduce sports-tech coverage next time
```

## Cognitive Analogy

**Prefrontal cortex + motor cortex** — The prefrontal cortex is the brain's executive center. It plans, sequences, monitors, and adjusts behavior toward goals. It's what lets you cook a multi-course dinner: plan the menu, sequence prep so everything finishes together, adjust when the oven runs hot, and remember what worked for next time. The motor cortex then executes — turning plans into physical actions. The act skill combines both: prefrontal planning (assess, plan, verify, learn) with motor execution (the actual doing). This is why damage to the prefrontal cortex doesn't paralyze you physically but destroys your ability to organize goal-directed behavior — you can move but can't plan. The act skill is what gives the agent goal-directed behavior, not just reflexes.
