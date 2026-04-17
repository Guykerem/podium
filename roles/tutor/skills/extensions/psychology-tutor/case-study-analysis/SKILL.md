---
name: case-study-analysis
description: Guide structured analysis of psychology cases — context, constructs, methods, threats, alternatives
when_to_use: >
  Student is given a case study (clinical vignette, historical experiment,
  research scenario), or learning-plan calls for applied analysis practice.
  Also for DSM-style differential reasoning practice.
tier: extension
pack: psychology-tutor
---

# Case Study Analysis

Case-based learning outperforms lecture on Bloom levels 3-6 ([BMC 2023 meta](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-023-04525-5)). This skill structures the analysis so the student builds an explicit framework they can carry to novel cases.

## How It Works

### 1. Frame the Case
Load the case and clarify: who, what, when, where. Surface what's present *and what's absent* — missing information shapes interpretation. The student names at least three facts and two unknowns before analysis begins.

### 2. Apply the 5-Part Framework
For each case, walk through:
1. **Context** — situational, cultural, developmental factors.
2. **Constructs** — which psychological constructs are relevant (attachment, cognitive dissonance, working memory, etc.) and why.
3. **Method / Evidence** — how was the data gathered? What's the quality?
4. **Threats** — confounds, alternative explanations, measurement issues, population generalizability.
5. **Alternatives** — given the evidence, what are 2-3 plausible interpretations, and what evidence would distinguish them?

The student produces each section; the agent asks Socratic follow-ups that surface weak reasoning.

### 3. Force Alternative Explanations
Psychology's most common student failure is locking onto one interpretation. The agent always asks: "What else could explain this? What would a behaviorist say? A developmentalist? A critic?"

### 4. Connect to Research
Tie the case to relevant primary literature from `memory/sources/`. If citations are thin, trigger `research-loop` to find contemporary evidence.

### 5. Update Mastery
Log which constructs the case exercised. Update concept mastery based on the quality of the student's application (not just whether they named the construct).

### 6. Transfer Test
End with a variation: "Same case, but change X. Does your analysis change? How?" This is the Bloom-level check that turns recognition into mastery.

## Composition
- Uses `synthesize` to produce a construct-calibrated explainer if the student lacks the needed construct.
- Uses `quiz` for the transfer-test and for Socratic follow-ups.
- Feeds `assess-progress` with construct-mastery signals and pattern-of-reasoning notes.

## Autonomy Behavior
- **L1** — Each section proposed; student approves framework before analyzing.
- **L2** — Framework applied automatically; agent still asks before declaring mastery.
- **L3** — Full loop; logs to learning-log and surfaces weekly.

## Activation
Extension. Activate for psychology-domain learning plans or whenever the student brings a case to analyze. Inactive for pure-theory or pure-methods sessions.
