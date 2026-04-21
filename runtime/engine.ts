/**
 * Podium Runtime Engine — role loader + message dispatcher.
 *
 * Port of runtime/engine.py. Preserves CLI and boot-summary surface:
 *
 *   npx tsx runtime/engine.ts                           # boot summary
 *   npx tsx runtime/engine.ts --message "hi"            # send one message
 *   npx tsx runtime/engine.ts --message "hi" --dry-run  # print context, no LLM call
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

import { assembleRoleContext } from "./context";
import { ClaudeCodeClient } from "./llm_client";

function moduleDir(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (import.meta as any);
    if (meta && typeof meta.url === "string") {
      return path.dirname(fileURLToPath(meta.url));
    }
  } catch {
    /* fall through */
  }
  // @ts-ignore — CJS fallback
  return typeof __dirname !== "undefined" ? __dirname : process.cwd();
}

function moduleFilename(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (import.meta as any);
    if (meta && typeof meta.url === "string") {
      return fileURLToPath(meta.url);
    }
  } catch {
    /* fall through */
  }
  // @ts-ignore — CJS fallback
  return typeof __filename !== "undefined" ? __filename : "";
}

export const ROOT = path.resolve(moduleDir(), "..");

function loadYaml(p: string): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = parseYaml(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function fileExists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function resolveActiveRole(root: string = ROOT): string {
  const envRole = process.env.PODIUM_ROLE;
  if (envRole) return envRole;
  const activeRoleFile = path.join(root, "agent", "memory", "active-role.yaml");
  const data = loadYaml(activeRoleFile);
  const role = data.role;
  if (typeof role === "string" && role.length > 0) return role;
  return "agent-architect";
}

export interface AgentConfig {
  identity: Record<string, unknown>;
  autonomy: Record<string, unknown>;
  has_program: boolean;
}

export function loadAgentConfig(root: string = ROOT): AgentConfig {
  return {
    identity: loadYaml(path.join(root, "agent", "identity", "style.yaml")),
    autonomy: loadYaml(path.join(root, "agent", "autonomy.yaml")),
    has_program: fileExists(path.join(root, "agent", "program.md")),
  };
}

export function loadRoleOverlay(role: string, root: string = ROOT): Record<string, unknown> {
  const roleDir = path.join(root, "roles", role);
  if (!fileExists(roleDir)) return {};
  return loadYaml(path.join(roleDir, "role.yaml"));
}

export interface DiscoveredSkills {
  core: string[];
  base: string[];
}

export function discoverSkills(role: string, root: string = ROOT): DiscoveredSkills {
  const coreDir = path.join(root, "agent", "skills", "core");
  const baseDir = path.join(root, "roles", role, "skills", "base");
  const listSkillDirs = (dir: string): string[] => {
    if (!fileExists(dir)) return [];
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    return entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
  };
  return { core: listSkillDirs(coreDir), base: listSkillDirs(baseDir) };
}

export interface RuntimeConfigs {
  providers: Record<string, unknown>;
  channels: Record<string, unknown>;
  scheduler: Record<string, unknown>;
}

export function loadRuntimeConfigs(root: string = ROOT): RuntimeConfigs {
  const runtimeDir = path.join(root, "runtime");
  return {
    providers: loadYaml(path.join(runtimeDir, "providers.yaml")),
    channels: loadYaml(path.join(runtimeDir, "channels.yaml")),
    scheduler: loadYaml(path.join(runtimeDir, "scheduler.yaml")),
  };
}

function bootSummary(role: string, root: string = ROOT): void {
  const agentCfg = loadAgentConfig(root);
  const roleOverlay = loadRoleOverlay(role, root);
  const skills = discoverSkills(role, root);
  const runtime = loadRuntimeConfigs(root);

  const providersCfg = runtime.providers;
  const channelsCfg = runtime.channels;
  const schedulerCfg = runtime.scheduler;

  const totalSkills = skills.core.length + skills.base.length;

  const bar = "=".repeat(50);
  const lines = [
    bar,
    "  Podium Runtime Engine",
    bar,
    `  Role:            ${role}`,
    `  Role overlay:    ${Object.keys(roleOverlay).length > 0 ? "loaded" : "not found"}`,
    `  Agent program:   ${agentCfg.has_program ? "found" : "missing"}`,
    `  Autonomy:        ${Object.keys(agentCfg.autonomy).length > 0 ? "loaded" : "not found"}`,
    `  Skills (core):   ${skills.core.length}`,
    `  Skills (base):   ${skills.base.length}`,
    `  Skills (total):  ${totalSkills}`,
    `  Provider:        ${(providersCfg.default_provider as string | undefined) ?? "none"}`,
    `  Channel:         ${(channelsCfg.default_channel as string | undefined) ?? "none"}`,
    `  Scheduler:       ${schedulerCfg.enabled ? "enabled" : "disabled"}`,
    bar,
    "",
    "Engine stub loaded successfully. Exiting.",
  ];
  for (const line of lines) console.log(line);
}

export async function runMessage(message: string, dryRun = false, root: string = ROOT): Promise<number> {
  const role = resolveActiveRole(root);
  const context = assembleRoleContext(role, root);
  if (dryRun) {
    console.log(context);
    return 0;
  }
  const client = new ClaudeCodeClient();
  const response = await client.complete(context, message);
  console.log(response.text);
  return 0;
}

interface ParsedArgs {
  message: string | null;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { message: null, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--message") {
      out.message = argv[i + 1] ?? "";
      i += 1;
    } else if (arg.startsWith("--message=")) {
      out.message = arg.slice("--message=".length);
    } else if (arg === "--dry-run") {
      out.dryRun = true;
    } else if (arg === "-h" || arg === "--help") {
      out.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function printHelp(): void {
  console.log("usage: podium-engine [--message TEXT] [--dry-run]");
  console.log("");
  console.log("Options:");
  console.log("  --message TEXT   Send one message to the active role and print the response");
  console.log("  --dry-run        With --message, print the assembled context instead of calling the LLM");
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error((err as Error).message);
    printHelp();
    return 2;
  }
  if (args.help) {
    printHelp();
    return 0;
  }
  if (args.message !== null) {
    return runMessage(args.message, args.dryRun);
  }
  const role = resolveActiveRole();
  bootSummary(role);
  return 0;
}

// Run when invoked as `tsx runtime/engine.ts` (not when imported by tests).
const invokedDirect = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    const self = moduleFilename();
    if (self && path.resolve(entry) === path.resolve(self)) return true;
    return path.resolve(entry).endsWith("engine.ts");
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
