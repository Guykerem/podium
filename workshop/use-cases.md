# Agent Use Cases — Workshop Examples

Five use cases designed for psychology undergraduates. Each one highlights a different critical element to show how agent components interact.

| Use Case | Critical Element | The Lesson |
|---|---|---|
| Research Literature | Memory | Without context, it's just search |
| Study & Exam Prep | Feedback loop | Without learning, it doesn't improve |
| Career Navigator | Knowledge base | Without the right external knowledge, recommendations are empty |
| Academic Writing Partner | Identity (agency tension) | Without the right boundaries, it replaces you |
| Stats Tutor | Feedback (Socratic vs. answers) | Without the right pedagogy, it creates dependency |

---

## 1. Research Literature Agent

### The Use Case
An agent that tracks your research interests, finds relevant papers, synthesizes across sources, remembers what you've already read, and builds a personalized knowledge base over time.

### Memory
- **What you've read** — titles, key findings, your notes/reactions. So it never recommends a paper you've already covered.
- **Your research interests** — topics, questions, theoretical orientations. Evolves as your interests sharpen.
- **Your project context** — what you're currently writing, what your thesis is about, what your advisor has said.
- **Source quality judgments** — papers you found useful vs. papers you dismissed. Over time, it learns what "relevant" means to you specifically.

### Agentic Loop
```
Trigger (new assignment, weekly check-in, or student asks a question)
  → Retrieve student profile + current project context
  → Search: knowledge base first, then academic databases (Scholar, PubMed, PsycINFO)
  → Filter: relevance to current project, recency, source quality, not already read
  → Synthesize: extract key claims, methods, findings from top results
  → Connect: link new findings to what the student already knows
  → Present: structured summary with citations and suggested next reads
  → Capture feedback: was this useful? which papers matter? what was missing?
  → Update memory: mark papers as read, adjust interest profile
```

### Actions
- Search academic databases and the agent's own knowledge base
- Read and extract key claims from papers (or abstracts when full text isn't available)
- Produce structured summaries (finding → method → relevance to your work)
- Compare and contrast findings across multiple sources
- Track and maintain a reading log
- Flag contradictions between sources

### How We Measure Success
- Student says "this answered my question" or uses the output in their work
- Papers recommended are actually relevant (not generic top results)
- Synthesis captures what matters, not just what's mentioned
- Over time: the agent's recommendations get more targeted, not less

### Feedback Loop
Each time the student interacts, the agent learns from signals:
- **Explicit:** "This paper was exactly what I needed" / "Not relevant, I'm past this topic"
- **Implicit:** Did the student ask follow-up questions? Did they use the citation in their work?
- **Correction:** "You missed the key finding — it's not about X, it's about Y"

### How to Give Good Feedback
Tell the agent *why* something was or wasn't useful, not just that it was. "This paper was too basic — I already understand attachment theory fundamentals, I need the critique of it" is far more useful than "not helpful." The more specific the correction, the faster the agent's model of "relevant to me" improves.

### Critical Element: Memory
Without memory, this is just a search engine. You'd get the same generic results every time. With memory — knowing what you've read, what your project is about, what you found useful last time — the agent becomes a research partner that gets smarter with every paper. The maker-or-breaker is whether the agent remembers *you*.

---

## 2. Study & Exam Preparation Agent

### The Use Case
An agent that helps you study smarter — tracking what you know well vs. where you're weak, generating practice at the right difficulty, and adapting to how you learn.

### Memory
- **What you know well** — topics where you've demonstrated mastery (correct answers, confident explanations)
- **Where you're weak** — topics where you struggled, got questions wrong, or asked for re-explanation
- **Your study history** — when you last studied each topic, how much time you spent, what method you used
- **Course structure** — syllabus, exam dates, topic weights, what's been covered in lectures
- **Your learning preferences** — do you learn better from examples, from practice questions, from summaries, from teaching back?

### Agentic Loop
```
Trigger (study session starts, or exam approaching)
  → Load student profile + course context + study history
  → Assess: what's coming up? what's the priority? (exam weight × weakness = study priority)
  → Select topic: focus on highest-priority gap
  → Generate: practice questions, concept summaries, or worked examples (based on preference)
  → Test: present material, check understanding
  → Evaluate: was the answer correct? confident or uncertain?
  → Adapt: update mastery map, adjust difficulty, schedule next review (spaced repetition)
  → Report: "Here's where you stand — strong on X, still shaky on Y"
```

### Actions
- Generate practice questions at appropriate difficulty
- Create concept summaries and worked examples
- Test the student and evaluate responses
- Track mastery across topics over time
- Schedule review sessions using spaced repetition principles
- Produce "readiness reports" before exams

### How We Measure Success
- Student's self-assessed confidence aligns with actual performance (calibrated confidence)
- Exam scores improve, especially on previously weak topics
- Study time becomes more efficient — less time on what they already know, more on gaps
- Student can explain concepts in their own words, not just recognize correct answers

### Feedback Loop
- **Per-question:** Did you get it right? Were you confident? (Tracks both accuracy and calibration)
- **Per-session:** "That session felt productive" vs. "I'm still confused about X"
- **Post-exam:** Actual results compared to the agent's readiness prediction — the strongest signal

### How to Give Good Feedback
After each study session, tell the agent how it felt — not just "good" or "bad" but "the practice questions were too easy" or "I need more examples like #3, that's where it clicked." After exams, share your results — which topics you got right and which you didn't. That's the gold standard feedback.

### Critical Element: Feedback Loop
Without learning, this agent stays static — the same generic practice questions forever. With a feedback loop that tracks what you get right, what you get wrong, and how your mastery evolves, the agent adapts in real time. The maker-or-breaker is whether the agent gets smarter about YOU with every session.

---

## 3. Career Navigator Agent

### The Use Case
An agent that helps you discover what you want to do after your degree, find opportunities that match, and prepare to go after them — and gets better at all three as it learns who you are.

### Memory
**Your profile (static, updated occasionally):**
- CV: education, coursework, grades, skills, languages
- Work experience: jobs, internships, volunteer work — what you did and what you learned
- Technical skills: SPSS, JASP, research methods, writing, languages, any coding

**Your values and preferences (evolves over time):**
- What energizes you: working with people vs. data vs. ideas? Structure vs. autonomy? Impact vs. stability?
- What you want to avoid: "I don't want to sit in an office all day" or "I don't want a role where I never interact with real people"
- Trade-offs you're willing to make: salary vs. meaning, location vs. opportunity, prestige vs. learning

**Your exploration history (grows with every interaction):**
- Jobs you've looked at and your reaction: "This looks interesting because..." / "Not for me — too corporate"
- Industries you've explored: clinical, organizational, UX, HR, tech, education, research
- People you've talked to: informational interviews, mentors, advice you received
- Decisions you've made and the reasoning behind them

**Market context (external, refreshed regularly):**
- What roles exist for psychology graduates — and which are growing
- What skills employers are looking for in 2026
- Salary ranges, typical career paths, entry requirements
- Local market (Israel) + global options

### Agentic Loop
```
Trigger (weekly scan, or student asks "what should I do after my degree?")
  → Load student profile + exploration history + current interests
  → Understand intent:
    - Exploration: "I don't even know what's out there"
    - Focused search: "Find me UX research internships in Tel Aviv"
    - Decision support: "I got two offers, help me think through them"
    - Preparation: "I have an interview Thursday"
  → Scan: job boards, company career pages, LinkedIn trends
  → Match: compare opportunities against profile, interests, and values
  → Rank: prioritize by fit (skills match × interest alignment × growth potential)
  → Present top 3-5 with specific reasons why each fits
  → Coach: surface tensions ("You said you value autonomy, but this role
    has heavy oversight — is that a trade-off you'd accept?")
  → If interested → help prepare (CV tailoring, cover letter scaffolding, interview prep)
  → Capture feedback: "This looks interesting because..." / "Not for me because..."
  → Update: refine profile, adjust search criteria, track direction
```

### Actions
| Action | What It Produces | When |
|---|---|---|
| Profile building | Structured summary of skills, values, interests | First session + ongoing |
| Opportunity scanning | Curated list of relevant roles with reasoning | Weekly or on demand |
| Fit analysis | "Here's why this matches / doesn't match you" | Per opportunity |
| Values coaching | Questions that surface tensions and clarify direction | When deciding |
| CV tailoring | Suggested modifications for a specific application | When applying |
| Cover letter scaffolding | Key points to hit, NOT the full letter | When applying |
| Interview preparation | Role-specific questions + talking points | Before interviews |
| Decision journaling | Captured reflections on why they chose or rejected | After decisions |
| Direction tracking | "Here's how your thinking has evolved" | Monthly or on reflection |

### How We Measure Success
- Student discovers opportunities they wouldn't have found alone
- Recommendations improve over time — fewer misses, better matches
- Student reports feeling clearer about their direction (not more overwhelmed)
- Applications submitted are higher quality and more targeted
- Student makes a career decision they feel confident about, grounded in self-knowledge

### Feedback Loop

| Signal | Example | What It Teaches |
|---|---|---|
| Dismissal | "Not interested" | Something was wrong — but what? |
| Rejection with reason | "Too corporate for me" | Updates values model directly |
| Interest | "Tell me more about this one" | Positive signal for this type of role |
| Application | Student applies | Strong positive — this matched well enough to act |
| Reflection | "I realized I want more people contact" | Deepest signal — reshapes the direction model |
| Outcome | "I got the interview" / "I didn't hear back" | Calibrates match assessment accuracy |

### How to Give Good Feedback
The most valuable thing you can share is *why* — why this role attracted you, why that one didn't, why you changed your mind. "Not interested" is noise. "Not interested because I realized I don't want to do pure data work — I need human interaction in my day" is signal that reshapes everything.

### Critical Element: Knowledge Base
This agent is only as good as what it knows about the job market, relevant industries, and career paths for psychology graduates. If the knowledge is stale or generic, the recommendations are useless. Building and maintaining the right knowledge base is an ongoing task, not a one-time setup — and it's a powerful example of why "what does the agent need to know?" is such an important design question.

---

## 4. Academic Writing Partner Agent

### The Use Case
An agent that knows your writing style, maintains your voice, tracks your common errors, and provides substantive feedback on argument structure — coaching you to write better, not writing for you.

### Memory
- **Your writing style** — vocabulary, sentence structure, voice. Learned from samples and refined over time.
- **Your common patterns** — recurring errors, APA formatting habits, argument structures you tend to use
- **Advisor preferences** — what your specific advisor has flagged, their standards and pet peeves
- **Project context** — what you're writing now, the thesis/argument, the target publication or assignment
- **Revision history** — what feedback you've received on past drafts and how you responded

### Agentic Loop
```
Trigger (student shares a draft, or asks for writing help)
  → Load student profile + writing style + project context + advisor preferences
  → Read: analyze for structure, argument flow, evidence use, clarity, APA compliance
  → Diagnose: identify the 2-3 most impactful issues (not every possible nit)
  → Feedback: explain each issue with a specific suggestion and the reasoning behind it
  → Demonstrate: show what a revision could look like for ONE example (not the whole piece)
  → Ask: "Does this make sense? Want me to go deeper on any of these?"
  → Capture: which feedback was accepted, rejected, and the student's reasoning
  → Update: refine understanding of the student's style and preferences
```

### Actions
- Analyze drafts for structure, argument flow, evidence quality, and formatting
- Identify the highest-impact issues (prioritized, not exhaustive)
- Provide specific, actionable feedback with reasoning
- Demonstrate revisions on small sections (never rewrite the whole piece)
- Check APA formatting, citation consistency, reference list accuracy
- Track recurring patterns — flag when the student keeps making the same error

### How We Measure Success
- Writing quality improves over time (grades, advisor feedback, self-assessment)
- Student produces better first drafts — the agent's feedback has been internalized
- Recurring errors decrease — the student learns, not just the agent
- Student feels supported, not replaced — they still own their voice

### Feedback Loop
- **Per-suggestion:** "This was helpful" / "I disagree, here's why" / "I see what you mean but I want to keep it this way"
- **Post-submission:** "My advisor said the argument was much clearer" or "They flagged the same issue you did"
- **Style calibration:** "That revision sounds too formal for me — I write more conversationally"

### How to Give Good Feedback
The most important feedback is when you *disagree*. "I know this sentence is long but I want the rhythm" teaches the agent about your voice. "My advisor actually prefers passive voice in methods sections" overrides generic APA advice. Push back when it's wrong about your style.

### Critical Element: Identity (Agency Tension)
The maker-or-breaker is the line between coach and ghostwriter. If the agent rewrites your work, your writing atrophies (cognitive debt). If it only points at problems without helping, you get frustrated. The right identity is: demonstrate on a small piece, explain the principle, then let you apply it. The design of this identity — where exactly you draw the line — is the hardest and most important decision.

---

## 5. Research Methods & Statistics Tutor Agent

### The Use Case
An agent that explains statistical concepts using your own data and psychological examples, guides you through analyses, and builds your competence through Socratic questioning rather than answer-giving.

### Memory
- **What you've mastered** — concepts, tests, and procedures you've demonstrated understanding of
- **Where you're stuck** — specific points of confusion (e.g., "understands p-value but confuses it with effect size")
- **Your course trajectory** — what's been covered, what's coming, what you need for your thesis
- **Your examples** — datasets, research questions, and studies you're actually working with
- **Explanations that worked** — which analogies and approaches clicked vs. which fell flat

### Agentic Loop
```
Trigger (student asks a question, or is working through an analysis)
  → Load student profile + mastery map + current project
  → Assess: what's the real question? (the stated question often masks a deeper confusion)
  → Check: does the student have the prerequisites? If not, scaffold.
  → BUT FIRST: ask a Socratic question — "What do you think this result means?"
  → Explain: using the student's own data when possible, with cognitive analogies
  → Check understanding: "Can you explain that back to me in your own words?"
  → If stuck → try a different angle (new analogy, simpler example, visual explanation)
  → If understood → advance to the next concept or application
  → Update mastery map: mark concept as "introduced," "practiced," or "mastered"
```

### Actions
- Explain statistical concepts using psychological examples and the student's own data
- Interpret JASP/SPSS output in plain language
- Generate practice problems at the right difficulty level
- Ask Socratic questions before giving answers
- Walk through analyses step by step, checking understanding at each stage
- Flag when the student is using a test incorrectly or misinterpreting results

### How We Measure Success
- Student can run and interpret analyses independently
- They explain concepts in their own words, not parrot definitions
- They catch their own errors before the agent does
- Stats anxiety decreases — they feel capable, not dependent

### Feedback Loop
- **Per-explanation:** "That analogy clicked" / "I'm still confused" / "Wait, so it's like [their own analogy]?"
- **Per-practice problem:** Correct/incorrect + confident/uncertain (tracks calibration)
- **Meta-feedback:** "You keep starting with the formula — I need the intuition first, then the math"

### How to Give Good Feedback
Tell the agent when something clicks — especially *what* made it click. "The restaurant analogy for variance made sense" is more useful than "I get it now." And tell it when you're pretending to understand. The agent can't help with confusion you hide.

### Critical Element: Feedback (Socratic vs. Answers)
The maker-or-breaker is HOW the agent teaches. An agent that gives answers produces dependency — you pass the exam but can't analyze data independently. An agent that asks questions ("What do you think this p-value means before I tell you?") produces competence. The design of the feedback loop — Socratic scaffolding vs. answer-giving — determines whether this agent builds skill or erodes it.
