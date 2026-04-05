# Getting Started With AI Agents

You don't need to be a programmer to start working with agents. You need curiosity, a terminal, and 20 minutes.

## Choose Your Tool

### Option 1: Claude Code (Recommended for beginners)
Anthropic's CLI agent. Works in your terminal. Understands natural language. Can read files, write code, search the web, and execute multi-step tasks.

**Setup:**
1. Install Node.js if you don't have it: https://nodejs.org/
2. Open your terminal
3. Run: `npm install -g @anthropic-ai/claude-code`
4. Run: `claude` to start
5. You're in. Ask it something.

**First thing to try:** Navigate to this repo's directory and ask Claude Code to explain what's in it.

### Option 2: OpenClaw (For the curious)
Open-source agent framework. You can see exactly how the agent works, modify its behavior, and learn by reading the code.

**Why this matters:** When you use Claude Code, the internals are hidden. OpenClaw lets you open the hood. Good for learning.

**Setup:** See the OpenClaw repository for installation instructions.

### Option 3: Any coding agent
Codex (OpenAI), Gemini Code Assist, Cursor, Windsurf — the landscape is growing. The concepts you learn here apply to all of them.

## Your First Session

Once you have a tool installed:

1. **Clone this repo** (if you haven't):
   ```
   git clone <repo-url>
   cd podium
   ```

2. **Read the agent's constitution:**
   Open `agent/identity/constitution.md` — this is who the agent is. Read it. Think about what you'd change.

3. **Explore a skill:**
   Open `agent/skills/research/prompt.md` — this is how the agent does research. Notice the structure: what it does, how it works, how autonomy changes its behavior.

4. **Try the brainstorming flow:**
   Use the agent to walk through the brainstorm-agent skill. Design your own agent. The agent helps you design an agent — that's meta, and it works.

5. **Modify something:**
   Change a value in `agent/identity/style.yaml`. See what happens. You just configured an agent.

## Key Concepts You'll Encounter

- **Terminal / CLI** — the text interface where you type commands. Not scary once you try it.
- **Repository (repo)** — a folder of code tracked by git. This is one.
- **Clone** — downloading a copy of a repo to your computer.
- **Fork** — making your own version of a repo that you can modify independently.
- **CLAUDE.md** — a file that gives an AI agent context about a project. Like a briefing document.

## When You Get Stuck

- Ask the agent. Seriously — "I'm stuck, help me understand what just happened" is a perfectly good prompt.
- Check `agent/knowledge/` for explanations of concepts.
- Ask a classmate — you're all learning this together.
