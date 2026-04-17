# Private Tutor — Research Notes

Source material and evidence base for the tutor role. Read this if you want to understand *why* the skills do what they do.

## 1. Open-source AI tutor agents

**Research-grade ITS:**
- [OATutor](https://github.com/CAHLR/OATutor) (Berkeley CAHLR, CHI 2023) — per-skill **Bayesian Knowledge Tracing**, stepped hints (hint → hint → bottom-out worked solution). The *per-step hint scaffolding pattern* is the model to steal.
- [Oppia](https://github.com/oppia/oppia) — branching "explorations" where wrong answers route to remediation sub-paths. Clean state-machine remediation loop.

**LLM-prompt tutors:**
- [Mr. Ranedeer](https://github.com/JushBJJ/Mr.-Ranedeer-AI-Tutor) — canonical GPT prompt tutor; typed sliders (depth, style, formality). Good quickstart UX template but weak substitute for structured memory.
- [Khanmigo](https://www.khanmigo.ai/) — *never give the answer*, ask progressively more specific leading questions, concede with worked example only after N failed attempts.

**Agent-native:**
- [DeepTutor](https://github.com/HKUDS/DeepTutor) — persistent tutor instances with independent workspace/memory/personality. Closest in spirit to Podium.
- [Open-TutorAI CE](https://github.com/Open-TutorAi/open-tutor-ai-CE) — local RAG on textbooks/PDFs.

**Shared patterns every system converges to:**
1. A **student model** (skills × mastery state)
2. A **content model** (items tagged by skill, Bloom level, difficulty)
3. A **tutor loop**: select next item → present → observe response → update student model → remediate or advance
4. A **remediation policy** (hint ladder, reteach, switch modality, abandon)
5. A **session envelope** (opening, targeted work, retrieval practice, closing summary)

## 2. Spaced repetition

| Algorithm | Variables | Use when |
|---|---|---|
| Leitner (1972) | Box 1-5 | MVP, teaching the concept |
| **SM-2 (1987, Anki default pre-2024)** | Ease factor (EF, starts 2.5, floor 1.3), interval, repetition | Small, transparent, cheap. Use from day 1. |
| FSRS (2023, Anki default since 2024) | Stability (S), Difficulty (D, 0-10), Retrievability (R = e^(-t/(9S))) | After ~200 reviews the 21-weight optimizer adds accuracy over SM-2. |
| SM-17 / SM-18 | DSR model, closed-source | Benchmark only. |

**SM-2 update formula** (quality q ∈ {0..5}):
- If q < 3: reset repetition=0, interval=1.
- Else n=1 → 1 day; n=2 → 6 days; n≥3 → `I_n = I_{n-1} * EF`.
- `EF' = EF + (0.1 - (5-q)(0.08 + (5-q)*0.02))`, floor 1.3.

**FSRS next-interval formula**: `I = (9S / ln(0.9)) * (target_retention^(1/decay) - 1)`. Target retention typically 0.9; expose as user slider (0.8 casual / 0.9 default / 0.95 exam-cram).

**Persistent card state**: `{card_id, concept_id, ef, interval_days, repetition, last_review, last_quality, stability, difficulty}`.

References: [fsrs4anki wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm), [SM-2 explainer](https://help.remnote.com/en/articles/6026144-the-anki-sm-2-spaced-repetition-algorithm).

## 3. Knowledge tracing / mastery modeling

Four canonical approaches ([Survey, arXiv 2105.15106](https://arxiv.org/html/2105.15106v4)):

- **BKT** — HMM per skill, 4 params: p(L_0) prior, p(T) transition, p(G) guess, p(S) slip. One tuple per skill. Interpretable, fast. Reference impl: [pyBKT](https://github.com/CAHLR/pyBKT).
- **DKT** — LSTM over interaction sequences. +25% AUC over BKT but needs thousands of interactions and loses interpretability. Overkill for single-student.
- **PFA (Performance Factors Analysis)** — logistic: `logit(correct) = β_skill + γ*successes + ρ*failures`. Two floats per skill per student + three global weights. Stronger than BKT on most benchmarks.
- **IRT** — 1PL (Rasch) = item difficulty; 2PL adds discrimination.

**Sweet spot for single-student long-running agent: PFA + 1PL IRT**. Per concept store `{concept_id, successes, failures, last_mastery_estimate, last_updated}`. Per item: `{item_id, difficulty, discrimination}`. Start simpler with BKT when data is thin; upgrade to PFA once there's history.

## 4. Bloom's taxonomy for question generation

Six levels (Anderson & Krathwohl 2001): Remember → Understand → Apply → Analyze → Evaluate → Create.

**Target Bloom calibration to mastery**: `target_level = floor(1 + mastery * 5)`. Low mastery → Remember; high mastery → Create.

**Stem patterns per level** ([Top Hat](https://tophat.com/blog/blooms-taxonomy-question-stems/)):
- Remember: "Define…", "List the…"
- Understand: "Explain in your own words…", "Give an example of…"
- Apply: "Use X to solve…", "What would happen if…"
- Analyze: "Compare X and Y", "Why does X cause Y?"
- Evaluate: "Which approach is better for…and why?", "Critique this claim…"
- Create: "Design a study that…", "Write an explanation for a 12-year-old of…"

**Prompt template — Bloom-calibrated item with anti-leak:**
```
You are a question writer for {domain}.
Concept: {concept_name}. Key idea: {one_sentence}.
Target Bloom level: {level}. Student mastery: {0..1}.
Generate ONE question that:
- Tests the target level (stem starters: {level_stems})
- Does NOT include the answer or defining phrase in the stem
- Uses a novel example, not the ones in: {prior_examples}
Return JSON: {question, answer, explanation, distractors[3], bloom_level, difficulty}.
```

**Hint ladder template:**
```
Question: {q}. Correct answer: {a}.
Generate 3 hints from most indirect to most direct:
1. Socratic redirect (question back to the student)
2. Partial prompt (name the relevant concept)
3. Near-bottom-out (show the setup, not the answer)
End with a bottom-out worked solution.
```

**Distractor generation** (KGGDG-style): mark each distractor with a `misconception:` label. Forces plausibility; 57% of flagged-bad MCQs have implausible distractors. ([arXiv 2506.00612](https://arxiv.org/html/2506.00612))

## 5. NotebookLM integration (2026 reality)

- **Enterprise API**: GA September 2025, v1alpha. Notebook CRUD, source CRUD, audio-overview create/get/download, queries. Requires Google Cloud enterprise tier — not a fit for a student repo. ([docs](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks))
- **Consumer NotebookLM has NO public API.** Confirmed across multiple sources in 2026.

**Automation options:**
- [notebooklm-py](https://github.com/teng-lin/notebooklm-py) — unofficial Python, browser-driven, fragile.
- [notebooklm-podcast-automator](https://github.com/israelbls/notebooklm-podcast-automator) — FastAPI + Playwright REST wrapper.
- [nblm-rs](https://github.com/K-dash/nblm-rs) — Rust SDK for Enterprise API.

**Recommended pattern**: default to manual-with-scaffolding. Agent emits a `podcast-packet` (sources + framing notes + suggested Deep Dive prompt) and offers the student (a) copy-paste upload with a prefilled "what to ask the hosts" note, or (b) opt-in Playwright automation as an advanced extension. Record podcast URLs back into memory so the agent can quiz on them.

## 6. Session-level learning analytics

Reliable signals ([MDPI 2025](https://www.mdpi.com/2673-6470/5/3/42), [Nature Scientific Reports 2025](https://www.nature.com/articles/s41598-025-32521-w)):

**Behavioral**: response latency (vs. per-concept baseline), abandonment mid-task, session duration vs. rolling average, time-of-day performance curve, hint usage frequency, follow-up-question rate (engagement proxy).

**Cognitive**: correct-first-try rate, correction frequency after hint, retrieval latency on previously-mastered items (forgetting detector), answer-length trend.

**Disengagement trigger rules (D3S3real)**: low clicks → consecutive inactivity → pre-assessment inactivity → engagement drop. Modern DL classifiers hit 96-99% F1 on 3-class engagement.

**Re-engagement**: unexpected reward, difficulty drop, modality switch, reduced session length with "finish this small thing" framing. Ask rather than push.

## 7. Adaptive teaching style

**Expertise-reversal effect** ([Tandfonline](https://www.tandfonline.com/doi/full/10.1080/20445911.2021.1890092)) decides mode:

- mastery < 0.3 → **worked examples** (direct instruction)
- 0.3 – 0.7 → **guided practice** (I-do / we-do / you-do)
- > 0.7 → **pure Socratic**

**Scaffolding (Vygotsky ZPD + Wood/Bruner)**: keep difficulty at `mastery + ε`. Fade scaffolds progressively. Modeling → guided practice → independent.

**Microlearning**: 5-15 minute chunks. Hard cap 25 min; force 5 min break after.

**Interleaving** ([Springer](https://link.springer.com/article/10.1007/s10648-021-09613-w)): **block during learning, interleave during review.** Interleaving trains *discrimination* (which method applies?) — feels harder, retains better.

**Modality switch**: failed twice in one modality → switch (diagram, analogy, podcast, code example).

## 8. Source evaluation — CRAAP + SIFT hybrid

- **CRAAP** ([CSU Fullerton](https://libraryguides.fullerton.edu/sourceevaluation)) — Currency, Relevance, Authority, Accuracy, Purpose. Best for academic sources.
- **SIFT** ([Mike Caulfield](https://merritt.libguides.com/c.php?g=1235656&p=9066623)) — Stop, Investigate, Find better, Trace. Best for web content and AI-generated material.

**Hybrid flow**: SIFT pass first (cheap, deflects garbage) → CRAAP on survivors → tag `{source_type, authority_tier, currency_year, domain_fit, confidence}`. Dedupe via embedding cosine > 0.85.

## 9. Quiz generation best practices

From [arXiv 2307.16338](https://arxiv.org/abs/2307.16338), [Coling 2025](https://aclanthology.org/2025.coling-main.154/), [ACL 2025](https://aclanthology.org/2025.acl-industry.93.pdf):

1. 8-shot in-context beats 1-shot.
2. CoT + skill explanation beats plain CoT.
3. Tag distractors with misconceptions.
4. Anti-leak constraint + self-check pass.
5. Provide target IRT b-parameter for difficulty.
6. Scenario framing for Apply/Analyze levels.
7. Generate `{answer, rubric, partial_credit_map}` in same call.
8. Generate-3 → critique → pick best.

## 10. Subject-specific pedagogy

### Coding
- **Rubber duck**: "walk me through what this line does out loud." Debugging is the teachable skill.
- **Read-before-write**: annotate existing code before producing your own.
- **Spiral project progression**: same project three times (make it work → make it right → make it fast).
- **Debug Socratic**: never fix the bug, ask the next diagnostic question.

### Psychology
- **Case-based learning** ([BMC 2023 meta](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-023-04525-5)) outperforms lecture on Bloom levels 3-6. Cases must be realistic, relevant, challenging.
- **Research methods** — separate design / method / stats / ethics into distinct sub-skills with explicit links; worked examples of *bad* designs are high-value.
- **Ethics checkpoint** — trigger anytime student proposes human-subjects study.

### Language
- **Comprehensible input (Krashen i+1)** as a *scheduling target*, not dogma. Adaptive systems can tune per learner.
- **Output hypothesis (Swain)** — force production once mastery > 0.5 to surface gaps.
- **Grammar-in-context** first, drill to automate; interleave when reviewing.
- **Spaced immersion** — SRS (FSRS) paired with daily 5-10 min CI bursts.

### Exam prep
- **Weakness scan**: bottom-quartile concepts → 3-5× oversampling.
- **Practice-test cadence**: 4w, 2w, 1w, 2d out. Analyze *errors*, not scores.
- **Final 2 weeks**: interleaved across-topic review.
- **Test-taking strategy** as a skill: elimination, time budgeting, flagging.

---

## Design implications folded into this role

- `research-loop` uses SIFT→CRAAP hybrid, dedupes with fingerprints and embeddings.
- `quiz` is two-stage (generate-N → critique → pick). Includes anti-leak self-check and misconception-tagged distractors. Target Bloom derived from mastery.
- `assess-progress` persists PFA state per concept; surfaces bottom-quartile weaknesses.
- `learning-plan` keeps SM-2 schedule per card; expose target-retention slider.
- `adapt-style` switches mode by expertise-reversal rule and enforces 25-min session cap.
- `podcast-pipeline` defaults to manual-with-scaffolding packets; Playwright is opt-in extension.
- Extension packs: rubber-duck / debug-socratic / project-mentor (coding); case-study-analysis / research-methods-coach / clinical-scenarios (psychology); conversation-practice / grammar-drill / immersion-prompts (language); practice-tests / study-schedule / weakness-targeting (exam-prep).
