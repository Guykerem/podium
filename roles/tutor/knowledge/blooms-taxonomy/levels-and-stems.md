# Bloom's Taxonomy — Levels, Stems, and Calibration

The tutor targets Bloom level per question based on the student's current mastery. Low mastery → lower Bloom (Remember/Understand); high mastery → upper Bloom (Analyze/Evaluate/Create). This file is the reference the `quiz` skill uses to generate and validate items.

## The Six Levels (Anderson & Krathwohl 2001 Revision)

| Level | Cognitive action | Verbs |
|---|---|---|
| 1. Remember | Retrieve facts, concepts | define, list, recall, name, identify |
| 2. Understand | Explain, classify, summarize | explain, paraphrase, classify, summarize |
| 3. Apply | Use a procedure in a new situation | apply, use, solve, demonstrate, compute |
| 4. Analyze | Break into parts, identify relationships | compare, contrast, differentiate, organize |
| 5. Evaluate | Judge against criteria | critique, justify, assess, defend, prioritize |
| 6. Create | Produce new work | design, construct, develop, compose, generate |

## Mastery → Bloom Calibration

```
target_bloom = min(6, max(1, 1 + floor(mastery * 5)))
```

- mastery 0.00-0.19 → Remember
- mastery 0.20-0.39 → Understand
- mastery 0.40-0.59 → Apply
- mastery 0.60-0.79 → Analyze
- mastery 0.80-0.95 → Evaluate
- mastery > 0.95 → Create

A good quiz set **spans 2 adjacent levels** — the current target and one level below, for reinforcement.

## Stems by Level

### Remember
- "Define {concept}."
- "List the {N} components of {topic}."
- "What is the term for {description}?"
- "Identify the {structure/part/person/date} that {role}."

### Understand
- "In your own words, explain why {claim}."
- "Give an example of {concept} in a context I haven't described."
- "What does {equation/definition} mean?"
- "Summarize {passage/idea} in one sentence."
- "Classify {item} as {A, B, or C} and justify."

### Apply
- "Use {method} to solve: {fresh problem}."
- "Given {scenario}, calculate/determine {outcome}."
- "What would happen if {variable changes}?"
- "Demonstrate how {concept} works with this new input: {input}."

### Analyze
- "Compare {X} and {Y}. How are they similar? How do they differ?"
- "Why does {phenomenon} happen? What causes it?"
- "What assumptions does {argument} rely on?"
- "Break {system} into its components and explain how they interact."
- "What evidence would distinguish {hypothesis A} from {hypothesis B}?"

### Evaluate
- "Which of these approaches is better for {goal}, and why?"
- "Critique this claim: {claim}. What's strong? What's weak?"
- "Is {study/argument/solution} sound? Defend your answer."
- "Prioritize {list} by {criterion}. Explain the ordering."

### Create
- "Design a {study/algorithm/essay/lesson} that {objective}."
- "Write an explanation of {concept} for {audience: 12-year-old / expert / skeptic}."
- "Propose a new {method/solution/example} that {constraint}."
- "Build on {existing work} to address {gap}."

## Item-Format Fit by Level

| Level | MCQ | Short answer | Generative | Scenario |
|---|---|---|---|---|
| Remember | ✅ | ✅ | ❌ | ❌ |
| Understand | ✅ | ✅ | Short | ❌ |
| Apply | ✅ (compute) | ✅ | ✅ | ✅ |
| Analyze | Limited | ✅ | ✅ | ✅ |
| Evaluate | ❌ (forced) | ✅ | ✅ | ✅ |
| Create | ❌ | ❌ | ✅ | ✅ |

MCQ becomes forced/artificial at Evaluate and Create — use generative or scenario formats instead.

## Prompt Template for LLM Item Generation

```
You are a question writer for {domain}.

Concept: {concept_name}
Key idea: {one_sentence_from_synthesis}

Target Bloom level: {level}
Stem starters for this level: {level_stems_list}

Student mastery: {mastery_0_to_1}
Target item difficulty (IRT b): {b_near_mastery}

Item format: {MCQ | short_answer | scenario | generative}

CONSTRAINTS:
- Do NOT include any of these keywords in the stem: {answer_keywords}
- Use a novel example; avoid these prior examples: {prior_examples}
- For MCQ: 4 options total. Label each distractor with the misconception it targets.
- Generate rubric for open-response items.

Return JSON:
{
  "question": "...",
  "answer": "...",
  "explanation": "...",
  "distractors": [{"text": "...", "misconception": "..."}, ...],
  "rubric": [...],
  "bloom_level": "...",
  "difficulty_b": <float>,
  "item_format": "..."
}
```

## Distractor Quality Checklist

Every distractor must:
- [ ] Be plausibly wrong (tag with the misconception it represents)
- [ ] Be parallel to the correct answer in length and form
- [ ] NOT be a synonym or rephrasing of the correct answer
- [ ] NOT contain cues (grammatical agreement, specificity, etc.) that reveal it as wrong

A distractor without a tagged misconception fails review. 57% of flagged-bad MCQs suffer from implausible distractors ([research on distractor quality](https://arxiv.org/abs/2307.16338)).

## Anti-Leak Self-Check

Before shipping a generated item, the validator runs:

```
answer_keywords = top-3 content terms from the correct answer
if any(word in stem for word in answer_keywords):
    REGENERATE
if answer is trivially deducible from the stem without knowing the concept:
    REGENERATE
```

## Review-and-Revise Pass

For consequential items (practice tests, assessments), generate 3 candidates, critique each against this checklist, pick the best. Cheap quality bump — the cost is one extra LLM call per item.

## References

- [Anderson & Krathwohl, *A Taxonomy for Learning, Teaching, and Assessing* (2001)](https://quincycollege.edu/content/uploads/Anderson-and-Krathwohl_Revised-Blooms-Taxonomy.pdf)
- [Bloom's Question Stems (Top Hat)](https://tophat.com/blog/blooms-taxonomy-question-stems/)
- [BloomLLM](https://link.springer.com/chapter/10.1007/978-3-031-72312-4_11)
- [Distractor Generation (arXiv 2307.16338)](https://arxiv.org/abs/2307.16338)
- [MCQ Generation COLING 2025](https://aclanthology.org/2025.coling-main.154/)
