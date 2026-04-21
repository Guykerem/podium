/**
 * LLMClient interface + ClaudeCodeClient implementation.
 *
 * Port of runtime/llm_client.py.
 *
 * v0.1 shipped ClaudeCodeClient only. Additional providers (Anthropic SDK,
 * LiteLLM, OpenAI, Ollama, OpenRouter) will be dropped in alongside it; all
 * must satisfy the LLMClient interface so the engine stays provider-agnostic.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export interface LLMResponse {
  text: string;
  latency_ms: number;
}

export interface LLMClient {
  complete(systemPrompt: string, userMessage: string): Promise<LLMResponse> | LLMResponse;
}

/** Cross-platform `which` — finds an executable on PATH. */
function which(name: string): string | null {
  const envPath = process.env.PATH || "";
  const sep = process.platform === "win32" ? ";" : ":";
  const exts = process.platform === "win32" ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  for (const dir of envPath.split(sep)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = path.join(dir, name + ext);
      try {
        const stat = fs.statSync(candidate);
        if (stat.isFile()) return candidate;
      } catch {
        /* keep looking */
      }
    }
  }
  return null;
}

/** Shells out to `claude -p` with the role context as the system prompt. */
export class ClaudeCodeClient implements LLMClient {
  readonly timeoutSec: number;
  readonly binary: string;

  constructor(opts: { timeoutSec?: number; binary?: string } = {}) {
    this.timeoutSec = opts.timeoutSec ?? 60;
    const resolved = opts.binary ?? which("claude");
    if (!resolved) {
      throw new Error("`claude` CLI not found on PATH");
    }
    this.binary = resolved;
  }

  complete(systemPrompt: string, userMessage: string): LLMResponse {
    const start = Date.now();
    const result = spawnSync(
      this.binary,
      [
        "-p", userMessage,
        "--append-system-prompt", systemPrompt,
        "--output-format", "json",
      ],
      {
        encoding: "utf-8",
        timeout: this.timeoutSec * 1000,
      }
    );
    const latency = Date.now() - start;

    if (result.error) {
      throw new Error(`claude -p failed to spawn: ${result.error.message}`);
    }
    if (typeof result.status === "number" && result.status !== 0) {
      throw new Error(`claude -p failed (rc=${result.status}): ${result.stderr ?? ""}`);
    }

    const stdout = (result.stdout ?? "").toString();
    let text: string;
    try {
      const data = JSON.parse(stdout);
      if (data && typeof data === "object") {
        text = (data.result as string) ?? (data.text as string) ?? stdout;
      } else {
        text = stdout;
      }
    } catch {
      text = stdout.trim();
    }

    return { text, latency_ms: latency };
  }
}
