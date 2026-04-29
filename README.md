# Podium

**A starter kit for your own AI agent. Pick a role, answer a few questions, start talking. About 5 minutes once you're set up.**

Podium gives you a working AI agent on your computer. It comes with four ready-made roles — pick one, personalize it, and you're done. No coding required.

---

## Before you start

You'll need three free things installed. If you've never done this before, that's fine — each one is just a download and double-click.

### 1. Node.js (the engine that runs Podium)

- Go to **[nodejs.org](https://nodejs.org/)**
- Click the big green button labeled **"LTS"** (it stands for Long Term Support)
- Open the file you just downloaded and click through the installer

**Check it worked:** open your terminal (instructions below in [Step 4](#step-4-open-your-terminal)) and type `node --version`. You should see something like `v20.18.0` or higher.

### 2. Git (the tool that downloads the project)

- **Mac:** open Terminal and type `git --version`. If it asks to install developer tools, click **Install** and wait a few minutes. Done.
- **Windows:** download from **[git-scm.com](https://git-scm.com/download/win)** and click through the installer. Accept all the defaults.

**Check it worked:** type `git --version` in your terminal — you should see something like `git version 2.42.0`.

### 3. Claude Code (the app that talks to the agent)

- Go to **[claude.ai/download](https://claude.ai/download)** and follow the install instructions for your operating system.
- You'll also need a free **Claude account** — sign up at [claude.ai](https://claude.ai) if you don't have one.
- The first time you run `claude` from your terminal, it'll ask you to log in. Follow the prompts in your browser — it only takes a moment.

**Check it worked:** type `claude --version` in your terminal. If you see a version number, you're good.

---

## Get it running

### Step 4: Open your terminal

This is the app where you'll type the next few commands. Don't be intimidated — you only need to copy/paste.

- **Mac:** press `Cmd + Space`, type `Terminal`, hit Enter
- **Windows:** open the Start menu, type `PowerShell`, hit Enter

### Step 5: Download Podium

Copy the line below, paste it into your terminal, hit Enter:

```bash
git clone https://github.com/Guykerem/podium.git
```

This downloads the project into a folder called `podium` in your home directory.

### Step 6: Go into the folder

```bash
cd podium
```

### Step 7: Install the project's dependencies

```bash
npm install
```

You'll see a wall of text scroll by. That's normal — it takes 30–60 seconds. When the prompt comes back, you're done.

### Step 8: Start Claude Code

```bash
claude
```

This opens Claude Code in your terminal. (If this is your first time running `claude`, it'll ask you to log in to your Claude account — do that now.)

### Step 9: Run the setup

Once Claude Code is open and showing its prompt, type:

```
/podium-setup
```

Follow the questions on screen. It walks you through 9 short steps:

- Pick a role
- Choose your skills
- Answer a few personalization questions
- Optionally connect a channel (Telegram, etc.)
- Optionally schedule recurring tasks

When it finishes, your agent is alive and ready to talk to. **The whole thing takes about 15 minutes the first time.**

> **First time using a terminal?** Don't worry — every line above is just a single command. If something goes sideways, close the window and start over. Nothing on your computer breaks.

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

**Or open a fresh chat anytime later** — open your terminal, then run:

```bash
cd podium
npm run chat
```

That's all you need day to day.

---

## Something not working?

Inside Claude Code, type:

```
/podium-verify
```

It runs a quick health check and tells you exactly what's wrong.

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
