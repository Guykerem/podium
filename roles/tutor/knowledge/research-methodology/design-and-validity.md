# Research Methodology — Design and Validity

Reference used by `synthesize`, `research-methods-coach`, and `case-study-analysis` when evaluating or explaining studies. The agent uses this both to *teach* methodology (primarily via the psychology-tutor pack) and to *evaluate* the sources its own research-loop finds.

## Four Canonical Study Designs

### Experimental
- **Defining feature:** manipulation of an independent variable (IV) and random assignment.
- **Internal validity:** high — random assignment controls confounds.
- **External validity:** often low — lab conditions rarely mirror life.
- **Can claim:** causation (under assumptions).

### Quasi-Experimental
- Manipulation without random assignment (e.g., comparing naturally formed groups).
- Internal validity: lower — selection effects, maturation, history can masquerade as treatment effects.
- Can claim: association, with caveats; causation requires strong design controls.

### Correlational / Observational
- No manipulation; measure variables as they occur.
- Best for generating hypotheses and for phenomena that can't be ethically manipulated.
- Can claim: association. Not causation.

### Qualitative
- Interviews, ethnography, case studies, thematic analysis.
- Best for: understanding mechanism, generating theory, capturing meaning.
- Can claim: depth and richness of interpretation. Generalization is scope-bounded.

## The Four Validities (Shadish, Cook, Campbell)

### Statistical Conclusion Validity
Did the analysis appropriately capture the relationship?
- Adequate power?
- Correct tests for the data (parametric assumptions, independence, distribution)?
- Multiple comparisons controlled?
- Effect size reported, not just p-values?

### Internal Validity
Did X cause Y within the study?
- Random assignment?
- Confounds controlled (selection, history, maturation, instrumentation, attrition)?
- Temporal precedence clear?
- Alternative explanations ruled out?

### Construct Validity
Do the measures actually measure the constructs?
- Operational definition defensible?
- Measures reliable (α, test-retest, inter-rater)?
- Measures valid (convergent, discriminant, criterion)?
- Demand characteristics / experimenter bias minimized?

### External Validity
Do the findings generalize?
- To other people (population)?
- To other settings (ecological)?
- To other times (temporal)?
- To other operationalizations (robustness)?

## Common Threats, Named

- **Selection bias** — groups differ at baseline, not because of treatment.
- **History** — events between pre- and post-test that affect outcome.
- **Maturation** — participants change naturally over time.
- **Instrumentation** — measurement tool changes between administrations.
- **Testing** — taking the test changes performance on a later test.
- **Regression to the mean** — extreme scores drift toward average.
- **Attrition** — differential drop-out changes group composition.
- **Experimenter effects** — researcher's expectations leak into behavior.
- **Demand characteristics** — participants guess the hypothesis and shift behavior.
- **Hawthorne effect** — being observed changes behavior.
- **File-drawer problem** — null results unpublished; published literature biased.

## Measurement Fundamentals

### Reliability
- **Test-retest:** same test, different times, same result?
- **Inter-rater:** different raters, same conclusion? (κ, ICC)
- **Internal consistency:** items measuring the same construct agree? (α, ω)

### Validity
- **Construct:** measure actually taps the intended concept?
- **Convergent:** correlates with other measures of the same thing?
- **Discriminant:** does *not* correlate with measures of different things?
- **Criterion:** predicts relevant outcomes?
- **Face:** looks like it measures what it claims (weak but not nothing)?

## Power and Sample Size

- **Statistical power** = probability of detecting an effect when one exists.
- Target 0.8 by convention; underpowered studies find nothing, or find noise.
- Calculate *a priori* for primary analyses; *post-hoc* power on a null finding is almost always misleading.
- Effect size estimates for power calculations should be from prior literature or theory, not hopeful guesses.

## Open Science Signals

High-quality 2020+ studies increasingly show:
- Pre-registration (protocol, hypotheses, analyses committed before data).
- Registered reports (peer-reviewed pre-data).
- Open data, open materials, open code.
- Replication attempts — successful and failed.
- Reporting effect sizes with confidence intervals, not just p.

Absence of these is not disqualifying for older work but is a signal in contemporary publications.

## Ethics — Standing Questions

For any human-subjects study:
- **Autonomy:** informed consent? Genuine, voluntary, ongoing?
- **Beneficence:** benefits outweigh risks?
- **Justice:** fair selection of participants? Burdens shared; benefits shared?
- **Respect:** privacy, confidentiality, debriefing?

Special populations (children, patients, prisoners, students of the researcher) trigger heightened protections.

## How the Agent Uses This

- `research-loop`'s CRAAP "Accuracy" score is informed by how well a study addresses validity threats.
- `research-methods-coach` teaches these concepts explicitly, walking the student through each validity type.
- `case-study-analysis` applies them to presented cases.
- `synthesize` flags studies with weak validity in its syntheses so the student knows what to trust.

## References

- Shadish, Cook & Campbell (2002), *Experimental and Quasi-Experimental Designs*
- Cumming (2014), *The New Statistics*
- Open Science Framework: [cos.io](https://cos.io)
- [Simmons, Nelson & Simonsohn (2011), "False-Positive Psychology"](https://journals.sagepub.com/doi/10.1177/0956797611417632)
- [Many Labs replication projects](https://osf.io/wx7ck/)
