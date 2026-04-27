/**
 * Podium chat REPL.
 *
 * Wraps runtime/engine's role-loader + ClaudeCodeClient in a readline loop so
 * students can type messages and read replies without crafting `--message`
 * shell incantations. Maintains an in-process transcript so multi-turn
 * exchanges feel like a real conversation; the transcript is prepended to
 * each user message before it hits `claude -p` (which is itself one-shot).
 *
 *   npm run chat
 *   $ tsx runtime/repl.ts
 *
 * Slash commands:
 *   /help    list commands
 *   /clear   forget this session's transcript
 *   /quit    exit
 */
import * as readline from "node:readline";
import { stdin, stdout } from "node:process";

import { assembleRoleContext } from "./context.js";
import { ClaudeCodeClient } from "./llm_client.js";
import { resolveActiveRole } from "./engine.js";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

export type Action =
  | { kind: "noop" }
  | { kind: "exit" }
  | { kind: "clear" }
  | { kind: "help" }
  | { kind: "send"; text: string };

/** Pure: classify a raw input line into an action. Trims whitespace. */
export function parseInput(line: string): Action {
  const trimmed = line.trim();
  if (!trimmed) return { kind: "noop" };
  if (trimmed === "/quit" || trimmed === "/exit" || trimmed === ":q") return { kind: "exit" };
  if (trimmed === "/clear") return { kind: "clear" };
  if (trimmed === "/help" || trimmed === "/?") return { kind: "help" };
  return { kind: "send", text: trimmed };
}

/**
 * Pure: render the in-memory transcript + the user's current message into a
 * single string suitable for `claude -p`. With an empty transcript we return
 * the message untouched so the first turn looks identical to a one-shot call.
 */
export function formatTranscript(turns: ReadonlyArray<Turn>, current: string): string {
  if (turns.length === 0) return current;
  const lines: string[] = ["[Conversation so far]"];
  for (const t of turns) {
    const speaker = t.role === "user" ? "You" : "Me";
    lines.push(`${speaker}: ${t.text}`);
  }
  lines.push("");
  lines.push("[Current message]");
  lines.push(current);
  return lines.join("\n");
}

const HELP_TEXT = [
  "  /help    show commands",
  "  /clear   forget this session's transcript",
  "  /quit    exit",
].join("\n");

function banner(role: string): string {
  const bar = "─".repeat(48);
  return [
    bar,
    `  Podium chat — role: ${role}`,
    bar,
    HELP_TEXT,
    bar,
  ].join("\n");
}

export async function main(): Promise<number> {
  const role = resolveActiveRole();

  let context: string;
  try {
    context = assembleRoleContext(role);
  } catch (err) {
    console.error(`Could not load role context for "${role}": ${(err as Error).message}`);
    console.error('Tip: confirm agent/memory/active-role.yaml points at a real role under roles/.');
    return 2;
  }

  let client: ClaudeCodeClient;
  try {
    client = new ClaudeCodeClient();
  } catch (err) {
    console.error((err as Error).message);
    console.error("Tip: install Claude Code (https://claude.ai/download) and run `claude login`.");
    return 2;
  }

  console.log(banner(role));

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const transcript: Turn[] = [];
  const writePrompt = () => stdout.write("\nyou> ");

  writePrompt();

  // for await over the readline interface yields each input line and exits
  // cleanly on stdin close (EOF, Ctrl-D) — the only way to consume buffered
  // lines reliably across a sync spawnSync child.
  outer: for await (const rawLine of rl) {
    const line = rawLine as string;
    const action = parseInput(line);

    if (action.kind === "exit") break outer;
    if (action.kind === "noop") {
      writePrompt();
      continue;
    }
    if (action.kind === "help") {
      console.log(HELP_TEXT);
      writePrompt();
      continue;
    }
    if (action.kind === "clear") {
      transcript.length = 0;
      console.log("(conversation cleared)");
      writePrompt();
      continue;
    }

    const userMessage = action.text;
    stdout.write("...\n");

    let response;
    try {
      response = await client.complete(context, formatTranscript(transcript, userMessage));
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      console.error(`error: ${msg}`);
      if (/auth|login|unauth/i.test(msg)) {
        console.error("Tip: run `claude login` and try again.");
      } else if (/timeout|timed out/i.test(msg)) {
        console.error("Tip: that took too long. Network slow or model busy — try again.");
      }
      writePrompt();
      continue;
    }

    transcript.push({ role: "user", text: userMessage });
    transcript.push({ role: "assistant", text: response.text });
    console.log(`\nagent> ${response.text}`);
    writePrompt();
  }

  rl.close();
  console.log("\nbye.");
  return 0;
}

// Run when invoked as `tsx runtime/repl.ts` (not when imported by tests).
const invokedDirect = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return entry.endsWith("repl.ts") || entry.endsWith("repl.js");
  } catch {
    return false;
  }
})();

if (invokedDirect) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  );
}
