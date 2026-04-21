/**
 * Role preview rendering.
 *
 * Reads each `roles/<role>/role.yaml` plus every `roles/<role>/skills/base/<skill>/SKILL.md`
 * frontmatter and produces structured preview data that the orchestrating SKILL
 * (M10) consumes to drive AskUserQuestion.
 *
 * This module has no side effects on disk — it only reads. The step runner in
 * `setup/role-select.ts` emits the data via a status block.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

function moduleDir(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = import.meta as any;
    if (meta && typeof meta.url === "string") {
      return path.dirname(fileURLToPath(meta.url));
    }
  } catch {
    /* fall through */
  }
  // @ts-ignore — CJS fallback
  return typeof __dirname !== "undefined" ? __dirname : process.cwd();
}

export const REPO_ROOT = path.resolve(moduleDir(), "..");

/** Role-level yaml contract (see spec §C5, M4 role.yaml extension). */
export interface RoleYaml {
  name?: string;
  display_name?: string;
  blurb?: string;
  example_skills?: Array<{ name: string; one_liner: string }>;
}

/** Single-skill preview: the SKILL.md frontmatter's `name` + `description`. */
export interface SkillPreview {
  name: string;
  description: string;
}

/** Full preview card for one role. */
export interface RolePreview {
  id: string;
  display_name: string;
  blurb: string;
  example_skills: Array<{ name: string; one_liner: string }>;
  all_skills: SkillPreview[];
}

function exists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function readText(p: string): string {
  return fs.readFileSync(p, "utf-8");
}

/**
 * Parse YAML frontmatter out of a SKILL.md (or any markdown) file.
 *
 * Tries a full YAML parse first. If that throws (SKILL.md values sometimes
 * contain backtick-quoted snippets like `` `prep: true` `` which YAML rejects
 * as nested compact mappings), falls back to a line-by-line scan that extracts
 * top-level `key: value` pairs with simple string values. That's enough for
 * the two keys M4 actually cares about — `name` and `description`.
 *
 * Returns {} if no `---` fence is present.
 */
export function parseFrontmatter(raw: string): Record<string, unknown> {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = raw.slice(3, end).replace(/^\n/, "");
  try {
    const parsed = parseYaml(block);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through to line-based scan */
  }
  return scanSimpleKeys(block);
}

/**
 * Minimal line-based extractor used when strict YAML rejects the block.
 * Grabs only top-level `key: value` pairs where the value is on the same line.
 * Ignores block scalars (`key: >`), nested mappings, and lists — none of which
 * our picker needs for the `name` and `description` fields.
 */
function scanSimpleKeys(block: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const rawLine of block.split("\n")) {
    // Skip blank/comment/indented/list lines.
    if (rawLine.length === 0 || rawLine[0] === " " || rawLine[0] === "\t" || rawLine.startsWith("#") || rawLine.startsWith("-")) {
      continue;
    }
    const colon = rawLine.indexOf(":");
    if (colon === -1) continue;
    const key = rawLine.slice(0, colon).trim();
    const value = rawLine.slice(colon + 1).trim();
    // Skip block-scalar indicators — we don't walk the continuation here.
    if (value === ">" || value === "|" || value === "") continue;
    // Strip matching surrounding quotes.
    let v: string = value;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[key] = v;
  }
  return out;
}

/**
 * List every `roles/<role>/skills/base/<skill>/SKILL.md` and return
 * { name, description } tuples. Sorted alphabetically by skill folder name.
 */
export function listBaseSkills(role: string, root: string = REPO_ROOT): SkillPreview[] {
  const baseDir = path.join(root, "roles", role, "skills", "base");
  if (!exists(baseDir)) return [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return [];
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const out: SkillPreview[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(baseDir, entry.name, "SKILL.md");
    if (!exists(skillFile)) continue;
    const fm = parseFrontmatter(readText(skillFile));
    const name = typeof fm.name === "string" && fm.name.length > 0 ? fm.name : entry.name;
    const description = typeof fm.description === "string" ? fm.description : "";
    out.push({ name, description });
  }
  return out;
}

/** Load a role.yaml and return its parsed contents, or null if missing/invalid. */
export function loadRoleYaml(role: string, root: string = REPO_ROOT): RoleYaml | null {
  const p = path.join(root, "roles", role, "role.yaml");
  if (!exists(p)) return null;
  try {
    const parsed = parseYaml(readText(p));
    if (parsed && typeof parsed === "object") {
      return parsed as RoleYaml;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Discover every directory under roles/ that has a role.yaml. Sorted. */
export function discoverRoles(root: string = REPO_ROOT): string[] {
  const rolesDir = path.join(root, "roles");
  if (!exists(rolesDir)) return [];
  const ids: string[] = [];
  for (const entry of fs.readdirSync(rolesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (exists(path.join(rolesDir, entry.name, "role.yaml"))) {
      ids.push(entry.name);
    }
  }
  ids.sort();
  return ids;
}

/** Build a preview card for a single role. Throws if role.yaml missing. */
export function buildRolePreview(role: string, root: string = REPO_ROOT): RolePreview {
  const y = loadRoleYaml(role, root);
  if (!y) {
    throw new Error(`Role ${role}: role.yaml missing or invalid`);
  }
  return {
    id: role,
    display_name: y.display_name ?? y.name ?? role,
    blurb: y.blurb ?? "",
    example_skills: Array.isArray(y.example_skills) ? y.example_skills : [],
    all_skills: listBaseSkills(role, root),
  };
}

/** Build previews for every discovered role. */
export function renderRolePreviews(root: string = REPO_ROOT): RolePreview[] {
  return discoverRoles(root).map((id) => buildRolePreview(id, root));
}

/**
 * Produce a human-readable card string for a single role. Used by the status
 * block for humans who may be reading logs; the SKILL.md consumes the JSON
 * payload instead.
 */
export function formatRoleCard(p: RolePreview): string {
  const lines: string[] = [];
  lines.push(`### ${p.display_name}  (id: ${p.id})`);
  if (p.blurb) lines.push(p.blurb);
  if (p.example_skills.length > 0) {
    lines.push("Example skills:");
    for (const s of p.example_skills) {
      lines.push(`  - ${s.name}: ${s.one_liner}`);
    }
  }
  lines.push(`All base skills (${p.all_skills.length}):`);
  for (const s of p.all_skills) {
    lines.push(`  - ${s.name}: ${s.description}`);
  }
  return lines.join("\n");
}
