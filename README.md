# Podium

**A starter kit for your own AI agent. Pick a role, answer a few questions, start talking. About 5 minutes.**

Podium gives you a working AI agent on your computer. It comes with four ready-made roles — pick one, personalize it, and you're done. No coding required.

---

## What you'll need

Before you start, install these two things. They're free.

1. **Node.js 20 or newer** — download from [nodejs.org](https://nodejs.org/) (pick the "LTS" version, click through the installer)
2. **Claude Code** — download from [claude.ai/download](https://claude.ai/download) (this is the app that runs the agent)

That's it. You don't need to know how to code.

---

## Get it running (5 minutes)

Open your **Terminal** app (on Mac: press `Cmd + Space`, type "Terminal", hit Enter. On Windows: open "PowerShell" from the Start menu).

Copy and paste each line below, one at a time, pressing Enter after each:

```bash
git clone https://github.com/Guykerem/podium.git
cd podium
npm install
claude
```

The last command opens Claude Code. Once you see its prompt, type:

```
/podium-setup
```

Follow the questions on screen. It'll ask you to pick a role, answer a few things about yourself, and then your agent is ready.

> **First time using a terminal?** Don't worry — every line above just runs a single command. If something goes wrong, you can always close the window and start over. Nothing on your computer breaks.

---

## Pick a role

During setup you'll choose one of these. You can re-run setup later to switch.

| Role | What it does |
|---|---|
| **`tutor`** | Helps you learn anything — research, study plans, quizzes |
| **`assistant`** | Personal assistant — tasks, calendar, email, reminders |
| **`creator`** | Content creator — scripts, transcription, social media |
| **`agent-architect`** | Helps you design and build your own custom agent |

**Not sure?** Pick `tutor`. It's the friendliest starting point.

---

## Talking to your agent

After setup, you can talk to your agent two ways:

**The easy way** — just keep typing in the Claude Code window that's already open.

**Or open a chat anytime later:**

```bash
npm run chat
```

That's all you need to use it day to day.

---

## Something not working?

Inside Claude Code, type:

```
/podium-verify
```

It runs a quick health check and tells you what's wrong.

If you're stuck, ask the agent itself — it knows how it's built and can usually walk you through the fix.

---

## Want to go deeper?

Once you're comfortable, there's more under the hood:

- **`agent/program.md`** — exactly how the agent thinks, on one page
- **`roles/`** — every role is just a folder of plain text files. Open one and read it
- **`workshop/design-template.md`** — design and build your own role from scratch

Everything in Podium is just files. No magic, no hidden config. Open them, change them, see what happens.

---

## Enjoying it? Help spread the word

If Podium clicked for you:

- **Star this repo** (the ★ button at the top right of the GitHub page) — it genuinely helps
- **Tell a friend** — send them the link, or this single command:
  ```
  git clone https://github.com/Guykerem/podium.git
  ```
- **Share what you built** — tag the repo if you post about your agent online

That's how small projects like this stay alive. Thanks for trying it.
