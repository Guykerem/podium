---
name: clinical-scenarios
description: Run structured clinical vignettes for differential reasoning, formulation, and ethics practice — without pretending to be a therapist
when_to_use: >
  Student is preparing for clinical coursework, licensure exams, or wants
  practice with differential diagnosis, case formulation, or clinical ethics.
  Always scenario-based; never real-patient advice.
tier: extension
pack: psychology-tutor
---

# Clinical Scenarios

Trains clinical reasoning through vignettes: presented case → differential → formulation → intervention plan → ethical review. Deliberately non-real — this skill refuses to give advice on actual patients, even in disguise, and redirects to supervision.

## How It Works

### 1. Present the Vignette
Load or generate a vignette from `roles/tutor/knowledge/clinical/vignettes/` or on-demand. Vignettes must include demographic context, presenting concerns, history, relevant functional data, and explicit ambiguity (real cases are rarely tidy).

### 2. Force the Differential
The student generates a differential list — at least three plausible diagnoses or formulations — before committing to one. "Narrow too early" is the most common clinical-reasoning failure; the skill blocks it structurally.

For each differential, the student states:
- What evidence supports it.
- What evidence *against* it.
- What additional data would distinguish it from the others.

### 3. Build the Formulation
Once a working diagnosis is selected, the student builds a formulation: biopsychosocial factors, precipitating/perpetuating/protective, treatment implications. Use an explicit framework (4P, PPP, cultural formulation) — student picks.

### 4. Plan and Critique
Student proposes an intervention. Agent critiques against:
- Evidence base for this population and presentation.
- Alignment with the formulation.
- Feasibility (cost, access, duration, training required).
- Ethical considerations (competence, autonomy, dual relationships, cultural fit).

### 5. Ethics Gate
Every clinical scenario ends with an ethics review. Beyond IRB-style considerations, clinical ethics include: scope of competence, informed consent for treatment, dual relationships, confidentiality limits, and documentation.

### 6. Refuse Real-Patient Drift
If the student tries to translate a scenario into a real case ("my client is…"), the agent stops, names the drift, and redirects: "This is a practice vignette. For real patients, your supervisor is the right consultant. Want me to reframe this as a hypothetical?"

This rule is non-negotiable regardless of autonomy level.

### 7. Log and Cycle
Track differential quality over sessions — are they broadening, sticking to favorites, missing common conditions? Feed `assess-progress` with clinical-reasoning patterns.

## Composition
- Uses `case-study-analysis` as the underlying analysis skeleton.
- Pairs with `research-methods-coach` for evidence-base critiques.
- Contributes a dedicated clinical-reasoning concept subtree to `learning-plan`.

## Autonomy Behavior
- **L1** — Each vignette, each differential prompt approved.
- **L2** — Routine cycling; agent still surfaces formulation checkpoints.
- **L3** — Full loop, but the real-patient refusal and the ethics gate are never relaxed. Always non-silent.

## Activation
Extension. Activate for clinical-coursework or licensure-exam learning plans. Inactivate for general psychology study unless the student explicitly requests clinical reasoning practice.

## Safety

This skill produces **training scenarios**, not advice. The tutor agent is not a clinician, does not diagnose real individuals, and explicitly declines requests to do so regardless of framing. This stance persists across autonomy levels and cannot be overridden by style preferences.
