/**
 * Role + skill picker step (M4).
 *
 * This TS module has two modes:
 *   --mode list
 *     Emits a PREVIEW status block containing a JSON payload with every role,
 *     its blurb, its example skills, and its full base-skill list. The
 *     orchestrating podium-setup SKILL (M10) parses the JSON and uses
 *     Claude Code's AskUserQuestion to prompt the user. It then calls us back
 *     in --mode commit.
 *
 *   --mode commit --role <id> --skills <csv>
 *     Validates the role exists, validates every skill resolves to a
 *     roles/<role>/skills/base/<skill>/ folder, writes
 *     agent/memory/active-role.yaml per §C3, and emits a ROLE_CHOICE block.
 *
 * Exit codes:
 *   0  success
 *   2  missing or invalid arguments
 *   4  invalid role
 *   5  invalid skill(s)
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify as stringifyYaml } from "yaml";
import { emitStatus } from "./status.js";
import {
  REPO_ROOT,
  discoverRoles,
  renderRolePreviews,
  listBaseSkills,
  loadRoleYaml,
} from "./role-preview.js";

/** Parse `--key value` style args into a flat map. Also supports `--flag` booleans. */
function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

/** --mode list: emit PREVIEW status block with JSON payload. */
export function runList(root: string = REPO_ROOT): number {
  const previews = renderRolePreviews(root);
  // Compact JSON — the SKILL parser reads this line directly.
  const payload = JSON.stringify({ roles: previews });
  emitStatus("PREVIEW", {
    ROLES_SHOWN: previews.length,
    DATA: payload,
    STATUS: "success",
  });
  return 0;
}

/**
 * Validate a comma-separated skill list against the role's base-skill folders.
 * Returns { ok, invalid } — invalid is the list of skill names that don't
 * resolve to a folder.
 */
export function validateSkills(
  role: string,
  skills: string[],
  root: string = REPO_ROOT,
): { ok: boolean; invalid: string[]; available: number } {
  const available = listBaseSkills(role, root);
  const availableNames = new Set(available.map((s) => s.name));
  const invalid: string[] = [];
  for (const s of skills) {
    if (!availableNames.has(s)) invalid.push(s);
  }
  return { ok: invalid.length === 0, invalid, available: available.length };
}

/** Write agent/memory/active-role.yaml per §C3. Overwrites any existing file. */
export function writeActiveRole(
  opts: {
    role: string;
    skills_enabled: string[];
    channels?: string[];
    timezone?: string;
    installed_at?: string;
  },
  root: string = REPO_ROOT,
): string {
  const dir = path.join(root, "agent", "memory");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, "active-role.yaml");
  const payload = {
    role: opts.role,
    skills_enabled: opts.skills_enabled,
    channels: opts.channels ?? ["cli"],
    timezone: opts.timezone ?? "",
    installed_at: opts.installed_at ?? new Date().toISOString(),
  };
  fs.writeFileSync(p, stringifyYaml(payload));
  return p;
}

/**
 * --mode commit. Validates, writes active-role.yaml, emits ROLE_CHOICE.
 * Returns the exit code to propagate.
 */
export function runCommit(
  opts: { role: string; skills: string; channels?: string; timezone?: string },
  root: string = REPO_ROOT,
): number {
  const validRoles = new Set(discoverRoles(root));
  if (!validRoles.has(opts.role)) {
    emitStatus("ROLE_CHOICE", {
      ROLE: opts.role,
      AVAILABLE_ROLES: [...validRoles].join(","),
      STATUS: "invalid_role",
    });
    return 4;
  }
  // Sanity-check role.yaml actually loads; if it's corrupt, treat as invalid_role.
  if (loadRoleYaml(opts.role, root) === null) {
    emitStatus("ROLE_CHOICE", {
      ROLE: opts.role,
      STATUS: "invalid_role",
    });
    return 4;
  }

  const skills = opts.skills
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const { ok, invalid, available } = validateSkills(opts.role, skills, root);
  if (!ok) {
    emitStatus("ROLE_CHOICE", {
      ROLE: opts.role,
      INVALID_SKILLS: invalid.join(","),
      SKILLS_AVAILABLE: available,
      STATUS: "invalid_skill",
    });
    return 5;
  }

  const channels = opts.channels
    ? opts.channels.split(",").map((c) => c.trim()).filter(Boolean)
    : ["cli"];
  const installed_at = new Date().toISOString();
  writeActiveRole(
    {
      role: opts.role,
      skills_enabled: skills,
      channels,
      timezone: opts.timezone ?? "",
      installed_at,
    },
    root,
  );

  emitStatus("ROLE_CHOICE", {
    ROLE: opts.role,
    SKILLS_ENABLED: skills.join(","),
    SKILLS_AVAILABLE: available,
    CHANNELS: channels.join(","),
    INSTALLED_AT: installed_at,
    STATUS: "success",
  });
  return 0;
}

/** Main entrypoint. Exported for testability; also wired to CLI at bottom. */
export async function run(args: Record<string, unknown>): Promise<number> {
  const mode = (args.mode as string | undefined) ?? "list";
  if (mode === "list") {
    return runList();
  }
  if (mode === "commit") {
    const role = args.role as string | undefined;
    const skills = args.skills as string | undefined;
    if (!role || typeof role !== "string") {
      emitStatus("ROLE_CHOICE", {
        STATUS: "missing_role",
      });
      return 2;
    }
    if (skills === undefined) {
      emitStatus("ROLE_CHOICE", {
        ROLE: role,
        STATUS: "missing_skills",
      });
      return 2;
    }
    return runCommit({
      role,
      skills: String(skills),
      channels: args.channels as string | undefined,
      timezone: args.timezone as string | undefined,
    });
  }
  emitStatus("ROLE_CHOICE", {
    MODE: mode,
    STATUS: "unknown_mode",
  });
  return 2;
}

// CLI entry: `npx tsx setup/role-select.ts --mode list`
const isDirectRun = (() => {
  try {
    return process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);
  run(parsed).then((code) => process.exit(code));
}
