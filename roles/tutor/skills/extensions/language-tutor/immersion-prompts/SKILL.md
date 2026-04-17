---
name: immersion-prompts
description: Schedule short, high-frequency target-language inputs throughout the day — news, podcasts, dialogues, readings — at calibrated difficulty
when_to_use: >
  Student is in a language-learning plan and wants daily exposure between
  sessions. Also for pre-travel cramming where sheer volume of input matters.
tier: extension
pack: language-tutor
---

# Immersion Prompts

Daily comprehensible input in small doses — 5-10 minute bursts several times a day. Research supports spaced, high-volume exposure for language acquisition more than single long sessions. This skill is the agent's input-scheduler.

## How It Works

### 1. Build the Input Library
Per target language, maintain a pool of inputs at varied difficulty and domain:
- **News snippets** from simplified (News in Slow X) up to native sources.
- **Podcast clips** — short, topic-scoped.
- **Dialogues** — scripted or extracted from media the student consumes.
- **Short readings** — graded readers, children's stories, op-ed excerpts.
- **Song lyrics** with glosses.

Tag each input: difficulty (CEFR), length, domain, grammatical forms exercised, vocabulary set.

### 2. Schedule by Routine
Given the student's daily rhythm (from `style-preferences`), schedule inputs:
- Morning — one easy input (warm-up).
- Midday — one medium input with a single comprehension question.
- Evening — one stretch input at i+1.

Frequencies tune to `style.new_vs_review` and student availability. Don't saturate; under-schedule and let the student ask for more.

### 3. Pair with Comprehension Check
Every input has a single short comprehension check — not a test, a nudge: "What did they say about X?" The check is light (one item, 30 seconds), but it forces active processing.

### 4. Track What Sticks
Log vocabulary and forms the student *didn't* understand. These feed `learning-plan`'s review queue at higher priority.

### 5. Cycle Difficulty
Weekly, rotate the difficulty mix based on comprehension-check accuracy. Steady climb toward native-level content; step back when signals say the climb is too fast.

### 6. Deliver Through Channels
Immersion inputs go out through email, mobile push, or calendar blocks per onboarding preferences. Quiet channels — don't turn the student's phone into a nag machine.

## Composition
- Composes `research-loop` (find and curate inputs), `quiz` (comprehension checks).
- Feeds `learning-plan` (vocabulary gap updates).

## Autonomy Behavior
- **L1** — Each scheduled input proposed; student approves before sending.
- **L2** — Routine scheduling and delivery; student reviews the weekly mix.
- **L3** — Full scheduling; student adjusts cadence via a single "more/less" knob.

## Activation
Extension. Activate when language-learning is an active domain and the student wants between-session exposure. Skip for students who've declared a preference for focused study over ambient input.
