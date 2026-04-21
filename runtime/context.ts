/**
 * Assemble a role's context (identity + skills + memory) into a system prompt string.
 *
 * Port of runtime/context.py. Section ordering and headings are preserved so
 * that downstream modules (e.g. verify, onboarding) can continue to grep for
 * the same anchors.
 *
 * v0.2 extension: if `roles/<role>/memory/context.md` exists, its YAML
 * frontmatter is parsed and its markdown body appended under a "Memory"
 * section. The frontmatter keys (name, pronouns, primary_goal, timezone) are
 * seeded by M5 (onboarding) and must be visible to the LLM on every call.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

// Resolve the directory of this file in a way that works under both CJS and ESM.
// tsx exposes `import.meta.url` in both modes; in CJS builds that don't support
// `import.meta`, `__dirname` is already defined and we fall back to that.
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

export const ROOT = path.resolve(moduleDir(), "..");

/** Frontmatter + body split of a markdown file. */
export interface MemoryFile {
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
  path: string;
}

function readText(p: string): string {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return "";
  }
}

function exists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

/** Parse `---\n<yaml>\n---\n<body>` into (frontmatter, body). Returns empty frontmatter if none. */
export function splitFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }
  // Find closing fence. Accept "\n---" or "\n---\n".
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: raw };
  }
  const yamlBlock = raw.slice(3, end).replace(/^\n/, "");
  let frontmatter: Record<string, unknown> = {};
  try {
    const parsed = parseYaml(yamlBlock);
    if (parsed && typeof parsed === "object") {
      frontmatter = parsed as Record<string, unknown>;
    }
  } catch {
    frontmatter = {};
  }
  // Body starts after the closing fence line.
  let bodyStart = end + 4; // past "\n---"
  if (raw[bodyStart] === "\n") bodyStart += 1;
  const body = raw.slice(bodyStart);
  return { frontmatter, body };
}

/** Load roles/<role>/memory/context.md if present. Returns null if missing. */
export function loadMemory(role: string, root: string = ROOT): MemoryFile | null {
  const memPath = path.join(root, "roles", role, "memory", "context.md");
  if (!exists(memPath)) return null;
  const raw = readText(memPath);
  const { frontmatter, body } = splitFrontmatter(raw);
  return { frontmatter, body, raw, path: memPath };
}

/** Return [name, description] tuples for SKILL.md files in directory (sorted). */
export function listSkills(directory: string): Array<[string, string]> {
  const results: Array<[string, string]> = [];
  if (!exists(directory)) return results;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return results;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(directory, entry.name, "SKILL.md");
    if (!exists(skillFile)) continue;
    const text = readText(skillFile);
    let description = "";
    if (text.startsWith("---")) {
      const end = text.indexOf("\n---", 3);
      if (end !== -1) {
        const block = text.slice(3, end);
        for (const line of block.split("\n")) {
          const trimmed = line.trim();
          if (trimmed.startsWith("description:")) {
            description = trimmed.slice("description:".length).trim();
            break;
          }
        }
      }
    }
    results.push([entry.name, description]);
  }
  return results;
}

/**
 * Build a system-prompt string for a role.
 *
 * Sections (in order):
 *   1. `# Agent: Podium (<role>)`
 *   2. `## Identity`      — shared + role constitution
 *   3. `## Style`         — shared + role style.yaml
 *   4. `## Available Skills` — core + base
 *   5. `## Memory`        — only if roles/<role>/memory/context.md exists
 */
export function assembleRoleContext(role: string, root: string = ROOT): string {
  const roleDir = path.join(root, "roles", role);
  const sharedConstitution = readText(path.join(root, "agent", "identity", "constitution.md"));
  const roleConstitution = readText(path.join(roleDir, "identity", "constitution.md"));
  const sharedStyle = readText(path.join(root, "agent", "identity", "style.yaml"));
  const roleStyle = readText(path.join(roleDir, "identity", "style.yaml"));

  const coreSkills = listSkills(path.join(root, "agent", "skills", "core"));
  const baseSkills = listSkills(path.join(roleDir, "skills", "base"));

  const parts: string[] = [
    `# Agent: Podium (${role})`,
    "",
    "## Identity",
    sharedConstitution.trim(),
    "",
    roleConstitution.trim(),
    "",
    "## Style",
    sharedStyle.trim(),
    "",
    roleStyle.trim(),
    "",
    "## Available Skills",
    "",
    "### Core (shared across all roles)",
  ];
  for (const [name, desc] of coreSkills) {
    parts.push(desc ? `- **${name}** — ${desc}` : `- **${name}**`);
  }
  parts.push("");
  parts.push(`### Base (specific to ${role})`);
  for (const [name, desc] of baseSkills) {
    parts.push(desc ? `- **${name}** — ${desc}` : `- **${name}**`);
  }

  const memory = loadMemory(role, root);
  if (memory) {
    parts.push("");
    parts.push("## Memory");
    parts.push("");
    parts.push("(Seeded during setup onboarding. Treat this as ground truth about the user.)");
    parts.push("");
    const fmKeys = Object.keys(memory.frontmatter);
    if (fmKeys.length > 0) {
      parts.push("### Profile");
      for (const key of fmKeys) {
        const value = memory.frontmatter[key];
        if (value === null || value === undefined || value === "") continue;
        parts.push(`- **${key}**: ${String(value)}`);
      }
      parts.push("");
    }
    const body = memory.body.trim();
    if (body) {
      parts.push("### Notes");
      parts.push(body);
    }
  }

  return parts.join("\n");
}
