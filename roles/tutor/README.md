# Private Tutor Role

A long-running AI tutor that researches domains, quizzes on mastery, adapts to how the student actually learns, and schedules retrieval practice using evidence-based spaced repetition.

Built for students who want more than a Q&A chatbot — this role sustains a learning relationship over weeks or months, tracking what's known, what's fading, and what's never been mastered.

## Structure

```
identity/                         Who the tutor is
  constitution.md                   Values, how you teach, what you never do
  style.yaml                        Personality + teaching sliders

skills/
  base/                           Always-active core capabilities
    research-loop/                  Continuous source curation (SIFT + CRAAP)
    synthesize/                     Level-calibrated explainers
    learning-plan/                  Concept graph + SRS (SM-2 / FSRS)
    quiz/                           Two-stage item generation + grading
    assess-progress/                Pattern detection + honest reporting
    podcast-pipeline/               NotebookLM packets
    adapt-style/                    Format/mode effectiveness tracking
    run-session/                    Session envelope orchestrator
  extensions/                      Opt-in specialization packs
    coding-tutor/                     code-review / project-mentor / debug-guide
    psychology-tutor/                 case-study-analysis / research-methods-coach / clinical-scenarios
    language-tutor/                   conversation-practice / grammar-drill / immersion-prompts
    exam-prep/                        practice-tests / study-schedule / weakness-targeting

knowledge/                        Reference the tutor teaches from
  learning-science/foundations.md   ZPD, cognitive load, retrieval, interleaving…
  spaced-repetition/algorithms.md   SM-2, FSRS, Leitner specifics
  mastery-modeling/models.md        BKT, PFA, IRT specifics
  blooms-taxonomy/levels-and-stems.md   Per-level stems + prompts
  source-evaluation/craap-and-sift.md   Hybrid flow
  research-methodology/design-and-validity.md   Four validities, threats
  adaptive-teaching/modes-and-scaffolding.md   Mode selection + fading

memory/                           Grows per student
  mastery/                          One file per concept (SRS state + history)
  style-preferences/                Declared + observed preferences
  learning-log/                     Session-by-session record
  sources/                          Curated, quality-scored research

learning/
  success-criteria.md               Per-skill + role-level success definitions

schedule.yaml                     7 scheduled jobs — research sweep, review,
                                  quiz, weekly review, podcast push, etc.

onboarding/
  questions.yaml                    13 onboarding questions for personalization

RESEARCH.md                       Full research report that informed the build
```

## Activation

Pick this role during onboarding if you want:
- A tutor on a specific domain with continuous research and curation.
- Spaced-repetition practice with honest mastery tracking.
- Adapted pedagogy — Socratic when you're ready, worked examples when you're not.
- Optional podcasts (via NotebookLM) for passive consumption of gap material.
- A structured path toward a stated goal, not open-ended Q&A.

## What It Doesn't Do

- **Therapy or clinical advice.** The psychology-tutor extension is for education — not real-patient work.
- **Autonomous authority.** Starts at autonomy level 1. Every scheduled action requires approval until the student raises autonomy explicitly.
- **Coverage theater.** Does not claim a concept is "learned" without retrieval evidence at interval.

## See Also

- `agent/skills/core/*` — the five core skills every role inherits (communicate, remember, observe, schedule, act)
- `agent/program.md` — how roles are composed onto the base agent
- [`roles/tutor/RESEARCH.md`](./RESEARCH.md) — the research that informed this role
