# Troubleshooting — Podium

Welcome. If something broke during setup or while chatting with your agent,
find the closest **symptom** below and work through the **fix**. Each entry
also shows what a healthy result looks like, so you can tell when the problem
is really gone.

If none of these match, flag a TA — but please try the matching section first,
because nine times out of ten the fix is one of the things on this page.

> **How to read this guide.** Anything in a grey box is a command you type
> into your terminal. Copy the whole line. If the command starts with a `$`,
> don't type the `$` — it's just the terminal's way of saying "type here".

---

## Quick triage

Before opening anything below, run these two commands in your terminal and
keep the output visible:

```
node --version
claude --version
```

A healthy Mac/Linux/WSL setup prints something like:

```
v20.11.0
1.0.x (Claude Code)
```

If either command says `command not found`, jump straight to the relevant
section (#1 or #5). If both print versions but your agent still misbehaves,
scroll to the bottom half of the guide.

---

## 1. `claude: command not found`

**Symptom.** You run `claude` (or the agent tries to reach it) and your shell
says:

```
claude: command not found
```

You may also see this wrapped inside a Podium error like:

> `` `claude` CLI not found on PATH ``

(That exact phrase is raised by `runtime/llm_client.ts` when the engine can't
find the CLI.)

**Cause.** The Claude Code CLI isn't installed, or it's installed somewhere
your shell doesn't look. Podium's runtime shells out to `claude -p` for every
reply, so without the CLI no message can be answered.

**Fix.** Install it globally with npm:

```
npm install -g @anthropic-ai/claude-code
```

Then confirm:

```
claude --version
```

Healthy output looks something like:

```
1.0.x (Claude Code)
```

> **Tip.** If `npm install -g` fails with a permissions error on macOS, you
> probably need `sudo` in front — but ask the TA first before running sudo.

---

## 2. Claude Code says "not authenticated" (or similar)

**Symptom.** `claude --version` works, but sending a message produces an
error about being signed out, missing credentials, or not authenticated.
Inside Podium this may surface as:

> `engine_failed` — `claude -p failed (rc=…)` with an auth-related detail.

**Cause.** The CLI is installed but has no credentials. It needs either a
logged-in account or an API key in the environment.

**Fix — option A (interactive login, recommended for the classroom):**

```
claude login
```

Follow the browser prompts. When it finishes, `claude --version` should
still work, and a quick test chat should succeed:

```
claude -p "say hi in one word"
```

Healthy output is something like:

```
Hi.
```

**Fix — option B (API key, if a TA gave you one):**

macOS / Linux / WSL:

```
export ANTHROPIC_API_KEY="sk-ant-..."
```

Windows PowerShell:

```
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

The export only lasts for the current terminal window. If you close the
terminal, you'll need to set it again.

---

## 3. `Cannot connect to the Docker daemon`

**Symptom.** When the container build or run step runs, you see something
like:

> `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`

**Cause.** Docker is installed, but **Docker Desktop isn't running**. The
`docker` command talks to a background service; that service has to be
started before any command works.

**Fix.**

- **macOS.** Open Spotlight (`Cmd + Space`), type "Docker", press Enter.
  Wait until the Docker icon in the menu bar stops animating (it should
  show a steady whale).
- **Windows.** Open the Start menu, type "Docker Desktop", press Enter.
  Wait for the tray icon to settle.

Confirm it's healthy:

```
docker info
```

Healthy output is a long block of info starting with something like
`Client:` and `Server:`. If you see the daemon error again, Docker
Desktop hasn't finished starting yet — wait 30 seconds and retry.

---

## 4. `docker: command not found`

**Symptom.**

```
docker: command not found
```

**Cause.** Docker Desktop isn't installed.

**Fix.** You have two options:

- **Easiest — install Docker Desktop:**
  - macOS: <https://www.docker.com/products/docker-desktop/>
  - Windows: <https://www.docker.com/products/docker-desktop/>

  After install, open it once (so the daemon starts), then re-run whatever
  command failed.

- **Skip Docker entirely.** Podium has a native fallback — see section
  **#10** at the bottom of this guide.

---

## 5. Node version too old / "engines" warning

**Symptom.** `npm install` or `npm run setup` prints a warning like:

> `npm WARN EBADENGINE Unsupported engine ... required: { node: '>=20' }`

…or the bootstrap step emits:

```
=== PODIUM SETUP: BOOTSTRAP ===
...
NODE_OK: false
STATUS: node_missing
=== END ===
```

**Cause.** Podium's `package.json` requires Node 20 or newer. Older versions
(18, 16, etc.) will fail the preflight check in `setup.sh`.

**Fix.** Upgrade Node.

- **macOS / Linux / WSL with nvm:**

  ```
  nvm install 20
  nvm use 20
  ```

- **Anywhere without nvm:** download the LTS installer from
  <https://nodejs.org/> and run it.

Confirm:

```
node --version
```

Healthy output looks something like:

```
v20.11.0
```

(Any `v20.x.x`, `v22.x.x`, or higher works.)

---

## 6. `npm run setup` crashes

**Symptom.** Running `npm run setup` (which invokes `tsx setup/index.ts`)
exits early with a stack trace, or stops partway through. This is a known
rough edge in v0.2 — the bash preflight is solid, but the interactive
setup flow behind it is still being hardened.

**Fix (pre-lecture workaround).** Don't run `npm run setup`. Instead, open a
`claude` session in this repo and use the setup skill:

```
claude
```

Inside the session, type:

```
/podium-setup
```

That runs the AI-native setup flow and produces the same end state:
an `agent/memory/active-role.yaml` pointing at your chosen role and
the role's memory seeded from your onboarding answers.

---

## 7. Windows: `bash: setup.sh: No such file` or CRLF errors

**Symptom.** On a plain Windows terminal you see one of:

> `bash: setup.sh: No such file or directory`
> `'\r': command not found`
> `./setup.sh: /bin/bash^M: bad interpreter`

**Cause.** `setup.sh` is a bash script. It doesn't run in `cmd.exe` or
PowerShell, and if git checked it out with Windows-style line endings
(`\r\n`), bash chokes on the invisible `\r`.

**Fix — preferred: use WSL2.**

1. Install WSL2 if you haven't: open PowerShell **as Administrator** and run
   `wsl --install`. Reboot when it asks.
2. Open "Ubuntu" from the Start menu.
3. Inside that shell, `cd` to the repo (your Windows drives live under
   `/mnt/c/...`, so `cd /mnt/c/Users/<you>/podium`).
4. Run `./setup.sh` from there.

**Fix — alternative: use Docker.** If Docker Desktop is running, you don't
need `setup.sh` at all. Jump to `container/README.md` for the `docker run`
one-liner, or ask the TA for the classroom Docker command.

---

## 8. Agent sits silent after you send a message

**Symptom.** You type a message, hit Enter, and nothing comes back — no
reply, no error, just a long wait or an eventual timeout.

**Cause.** Usually one of three things:

1. The Claude Code session died or was never really alive.
2. The API key has no quota, or the login expired.
3. The network call is blocked (school Wi-Fi, VPN, etc.).

**Fix — check the CLI in isolation:**

```
claude -p "say hi in one word"
```

Healthy output looks something like:

```
Hi.
```

- If **that** command hangs or errors, the problem is with Claude Code,
  not with Podium. Work through sections **#1** and **#2** above.
- If that command works but Podium is still silent, check your API key is
  still exported (`echo $ANTHROPIC_API_KEY` should print a non-empty key on
  macOS/Linux/WSL) and make sure you're not inside a VPN that blocks
  `api.anthropic.com`.

---

## 9. Setup ran, you picked a role, but nothing happens

**Symptom.** You went through `/podium-setup`, chose a role (e.g. `tutor`),
and now messages produce strange replies — or the boot summary shows:

```
  Role:            agent-architect
```

…even though you picked something else.

**Cause.** The engine resolves the active role from
`agent/memory/active-role.yaml` (see `runtime/engine.ts`). If that file is
missing, empty, or doesn't have a `role:` field, the engine silently falls
back to `agent-architect`.

**Fix — verify the file:**

```
cat agent/memory/active-role.yaml
```

Healthy output looks something like:

```yaml
role: tutor
```

(The value will match whichever role you picked — `assistant`, `tutor`,
`creator`, or `agent-architect`.)

If the file is missing or the `role:` line is blank, re-run
`/podium-setup` inside a `claude` session. You can also override the role
temporarily by exporting:

macOS / Linux / WSL:

```
export PODIUM_ROLE=tutor
```

Windows PowerShell:

```
$env:PODIUM_ROLE="tutor"
```

---

## 10. Laptop too slow for Docker — native fallback

**Symptom.** Your laptop doesn't have enough RAM for Docker Desktop, the
container takes forever to build, or Docker just won't start.

**Fix.** Skip the container entirely. Podium runs natively on Node 20+.

1. Make sure Node is OK (section **#5**) and Claude Code is installed and
   logged in (sections **#1** and **#2**).
2. From the repo root:

   ```
   npm install
   ```

   Healthy output ends with a line like:

   ```
   added N packages in Xs
   ```

3. Open a `claude` session in the repo and run:

   ```
   /podium-setup
   ```

   When it asks about runtime, pick the native option (it'll skip the
   Docker build step).

4. After setup finishes, you should be able to chat with your agent through
   whichever channel you configured. You can also quickly sanity-check the
   engine directly:

   ```
   npx tsx runtime/engine.ts
   ```

   Healthy output looks something like:

   ```
   ==================================================
     Podium Runtime Engine
   ==================================================
     Role:            tutor
     ...
     Skills (total):  N
     Provider:        ...
     Channel:         ...
   ==================================================

   Engine stub loaded successfully. Exiting.
   ```

That's the native path. It's slightly slower on first message (no warmed
container) but uses far less RAM.

---

## Still stuck?

Screenshot the exact error (including the command you ran) and show it to
the TA. The specific wording matters more than you'd think — two errors
that *look* similar can have totally different fixes.
