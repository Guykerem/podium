/**
 * Routine designer step (M7).
 *
 * Asks the user what the agent should do on a recurring schedule, structures
 * their natural-language description into a routine YAML using the runtime's
 * LLM client, then commits the approved routines to
 * `roles/<role>/schedule.yaml` (overwriting the shipped template).
 *
 * Four modes (driven by /podium-setup SKILL orchestrator):
 *
 *   --mode list
 *     Emits a ROUTINE status block with 3 role-appropriate starter prompts
 *     so the SKILL can seed AskUserQuestion with examples.
 *
 *   --mode generate --description "<text>"
 *     Calls runtime/llm_client to transform a NL description into a single
 *     routine YAML. Prints the structured routine inside the ROUTINE block.
 *     Does NOT write any file.
 *
 *   --mode commit --routines '<json>'
 *     Validates the array of routines against the schema, writes them (with
 *     header + restore hint) to roles/<role>/schedule.yaml.
 *
 *   --mode skip
 *     Writes an empty-routines YAML (just a comment + `routines: []`) so
 *     the scheduler has a well-formed file to read.
 *
 * Exit codes:
 *   0  success
 *   2  missing/invalid arguments or unreadable role state
 *   3  LLM generation failed (for --mode generate)
 *   4  schema validation failed (for --mode commit or --mode generate)
 *   5  malformed routines JSON (for --mode commit)
 *   6  I/O failure writing the schedule file
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import { emitStatus } from "./status.js";

/* -------------------------------------------------------------------------- */
/* Repo root                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/** A validated routine, exactly the shape committed to disk. */
export interface Routine {
  id: string;
  name: string;
  when: string;
  what: string;
  inputs: string[];
  enabled: boolean;
}

/** Optional LLM injection point, used by tests to stub out the real client. */
export interface RoutineLLM {
  complete(systemPrompt: string, userMessage: string): Promise<string> | string;
}

/* -------------------------------------------------------------------------- */
/* Argument parsing                                                            */
/* -------------------------------------------------------------------------- */

/** Parse `--key value` / `--flag` style args. Values are never interpreted. */
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

/* -------------------------------------------------------------------------- */
/* Active role + memory                                                        */
/* -------------------------------------------------------------------------- */

/** Read agent/memory/active-role.yaml and return `role`, or null if missing. */
export function resolveActiveRole(root: string = REPO_ROOT): string | null {
  const p = path.join(root, "agent", "memory", "active-role.yaml");
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = parseYaml(fs.readFileSync(p, "utf-8")) as
      | Record<string, unknown>
      | null;
    if (parsed && typeof parsed.role === "string" && parsed.role.length > 0) {
      return parsed.role;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Read roles/<role>/memory/context.md frontmatter if present. Used by
 * --mode list to tailor starter prompts (e.g. interpolate primary_goal for
 * the tutor role). Returns an empty object when the file is absent.
 */
export function loadMemoryFrontmatter(
  role: string,
  root: string = REPO_ROOT,
): Record<string, unknown> {
  const p = path.join(root, "roles", role, "memory", "context.md");
  if (!fs.existsSync(p)) return {};
  let raw: string;
  try {
    raw = fs.readFileSync(p, "utf-8");
  } catch {
    return {};
  }
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};
  const yamlBlock = raw.slice(3, end).replace(/^\n/, "");
  try {
    const parsed = parseYaml(yamlBlock);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

/* -------------------------------------------------------------------------- */
/* Starter prompts (--mode list)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Role-appropriate starter suggestions the SKILL shows the user before they
 * describe their own routine. Templates may reference `<primary_goal>` or
 * `<name>`; we interpolate from the memory frontmatter when present, else
 * leave the placeholder visible so the user knows what to fill in.
 */
const STARTER_TEMPLATES: Record<string, string[]> = {
  assistant: [
    "Summarize my inbox each morning at 8am — group by sender and flag anything urgent.",
    "Give me a 5-minute daily brief at 7:30 weekdays: calendar, priorities, unread count.",
    "Weekly relationship sweep every Monday at 10am — surface people I haven't talked to in 3+ weeks.",
  ],
  tutor: [
    "Brief me on new developments in <primary_goal> twice a week — the 3 most important items with sources.",
    "Build me a 5-question spaced-review quiz every weekday at 9am from concepts due for practice.",
    "Every Sunday at 6pm, summarize what I learned this week and suggest next week's focus.",
  ],
  creator: [
    "Suggest 2-3 content ideas every Friday at 10am, based on captures I've added this week.",
    "Every Tuesday at 2pm, surface any drafts sitting untouched for 10+ days — finish, repurpose, or archive?",
    "Monthly on the 1st, review the last 30 days of content — what hit, what flopped, what experiments to try.",
  ],
  "agent-architect": [
    "Every Monday at 9am, remind me what agent component I'm exploring this week and what to try next.",
    "Weekly on Friday, summarize what I changed in my Podium clone this week and what's unfinished.",
    "Daily at 8am for the next 7 days, suggest one small customization exercise to deepen my mental model.",
  ],
};

/** Generic fallback when a role has no bespoke template. */
const GENERIC_STARTERS = [
  "Summarize my day every evening at 6pm — what I did, what's pending, what needs attention tomorrow.",
  "Give me a weekly digest every Sunday at 8pm covering the last 7 days.",
  "Every weekday at 9am, check in on my top priority and ask if I need anything.",
];

/** Interpolate frontmatter values (primary_goal, name) into a template. */
function interpolate(
  template: string,
  fm: Record<string, unknown>,
): string {
  return template.replace(/<([a-z_]+)>/gi, (match, key) => {
    const v = fm[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
    if (Array.isArray(v) && v.length > 0) return String(v[0]);
    return match; // leave placeholder visible if no memory captured yet
  });
}

/** Build the 3 starter prompts for the given role, interpolated from memory. */
export function buildStarterPrompts(
  role: string,
  root: string = REPO_ROOT,
): string[] {
  const templates = STARTER_TEMPLATES[role] ?? GENERIC_STARTERS;
  const fm = loadMemoryFrontmatter(role, root);
  return templates.map((t) => interpolate(t, fm));
}

/* -------------------------------------------------------------------------- */
/* Schema validation                                                           */
/* -------------------------------------------------------------------------- */

/** 5- or 6-field cron-ish; each field is a *, ?, or a comma/range/step mix. */
const CRON_FIELD = /^(\*|\?|[0-9A-Za-z*/,\-]+)$/;

/**
 * Loose-but-honest cron check. Accepts 5 or 6 fields. Field-level syntax is
 * validated only to the extent that it rejects gibberish. The scheduler
 * executor (v0.3) is the final source of truth for cron parsing.
 */
export function isCronExpression(s: string): boolean {
  const parts = s.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) return false;
  return parts.every((p) => CRON_FIELD.test(p));
}

/** "every N <unit>" interval grammar used as a cron alternative. */
export function isIntervalExpression(s: string): boolean {
  return /^every\s+\d+\s+(minute|minutes|hour|hours|day|days|week|weeks)$/i.test(
    s.trim(),
  );
}

export function isValidWhen(s: string): boolean {
  if (typeof s !== "string" || s.trim().length === 0) return false;
  return isCronExpression(s) || isIntervalExpression(s);
}

/** id slug: starts with a letter, lowercase alphanumeric + hyphens. */
const ID_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;
/** Source / tool name: same as id but no trailing constraint and shorter. */
const INPUT_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Result of a single-routine validation. */
export interface ValidationResult {
  ok: boolean;
  errors: string[];
  routine?: Routine;
}

/**
 * Validate (and normalize) a single raw routine against the schema.
 * Accepts objects with extra keys — strips them — and coerces `enabled`
 * when missing to `true`.
 */
export function validateRoutine(raw: unknown): ValidationResult {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: ["routine must be an object"] };
  }
  const r = raw as Record<string, unknown>;

  // id
  const id = typeof r.id === "string" ? r.id.trim() : "";
  if (!id) errors.push("id: required string");
  else if (!ID_PATTERN.test(id) || id.length > 64) {
    errors.push("id: must be a lowercase slug, 2-64 chars, matching [a-z][a-z0-9-]*[a-z0-9]");
  }

  // name
  const name = typeof r.name === "string" ? r.name.trim() : "";
  if (!name) errors.push("name: required string");
  else if (name.length > 120) errors.push("name: too long (max 120)");

  // when
  const when = typeof r.when === "string" ? r.when.trim() : "";
  if (!when) errors.push("when: required string");
  else if (!isValidWhen(when))
    errors.push(`when: must be cron (5 or 6 fields) or "every N <unit>"`);

  // what
  const what = typeof r.what === "string" ? r.what.trim() : "";
  if (!what) errors.push("what: required string");
  else if (what.length < 4 || what.length > 600)
    errors.push("what: length must be 4-600 chars");

  // inputs — normalize undefined/null to []
  let inputs: string[] = [];
  if (r.inputs === undefined || r.inputs === null) {
    inputs = [];
  } else if (Array.isArray(r.inputs)) {
    const clean: string[] = [];
    const seen = new Set<string>();
    for (const raw of r.inputs) {
      if (typeof raw !== "string") {
        errors.push("inputs: every entry must be a string");
        continue;
      }
      const v = raw.trim().toLowerCase();
      if (!v) continue;
      if (!INPUT_PATTERN.test(v) || v.length > 32) {
        errors.push(`inputs: "${raw}" must match [a-z][a-z0-9-]* and be ≤32 chars`);
        continue;
      }
      if (!seen.has(v)) {
        seen.add(v);
        clean.push(v);
      }
    }
    if (clean.length > 8) errors.push("inputs: max 8 entries");
    inputs = clean;
  } else {
    errors.push("inputs: must be an array of strings");
  }

  // enabled — default true
  let enabled: boolean;
  if (r.enabled === undefined) enabled = true;
  else if (typeof r.enabled === "boolean") enabled = r.enabled;
  else {
    errors.push("enabled: must be a boolean");
    enabled = true;
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    routine: { id, name, when, what, inputs, enabled },
  };
}

/**
 * Validate an array of routines. Surfaces per-routine errors AND cross-cuts
 * (duplicate ids).
 */
export function validateRoutines(raw: unknown): {
  ok: boolean;
  errors: string[];
  routines: Routine[];
} {
  if (!Array.isArray(raw)) {
    return { ok: false, errors: ["routines: must be an array"], routines: [] };
  }
  const errors: string[] = [];
  const routines: Routine[] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const result = validateRoutine(item);
    if (!result.ok || !result.routine) {
      for (const e of result.errors) errors.push(`routines[${index}]: ${e}`);
      return;
    }
    if (seen.has(result.routine.id)) {
      errors.push(`routines[${index}]: duplicate id "${result.routine.id}"`);
      return;
    }
    seen.add(result.routine.id);
    routines.push(result.routine);
  });
  return { ok: errors.length === 0, errors, routines };
}

/* -------------------------------------------------------------------------- */
/* LLM generation (--mode generate)                                            */
/* -------------------------------------------------------------------------- */

/** System prompt for the structure step. Kept verbatim in code for auditability. */
export const GENERATE_SYSTEM_PROMPT = `You transform user-described recurring routines into structured YAML.

Output ONLY a YAML object (no markdown fences, no prose) with exactly these keys:
  id       — slug (lowercase, hyphens only)
  name     — short human label
  when     — cron expression (5 or 6 fields) OR "every N <unit>"
  what     — one-sentence instruction for the agent
  inputs   — array of tool/source names (gmail, calendar, web, rss, drive, etc.)
  enabled  — true

Examples of good output:

id: morning-inbox
name: "Morning inbox summary"
when: "0 8 * * *"
what: "Summarize my unread email from the last 24 hours, group by sender, flag anything time-sensitive."
inputs: [gmail]
enabled: true

id: weekly-field-brief
name: "Weekly field brief"
when: "0 9 * * MON"
what: "Scan sources for new developments in <primary_goal> and summarize the 3 most important."
inputs: [web, rss]
enabled: true

Rules:
- If the user names a time, convert it to cron. If they say "every N minutes/hours/etc", use the interval form.
- If they don't specify a time, pick a sensible default and state it.
- Use only lowercase hyphenated slugs for id.
- inputs defaults to [] if no tools are implied.
- Output NOTHING except the YAML object.`;

/**
 * Strip common wrappers the LLM may wrap the YAML in (markdown fences,
 * stray prose). Returns the inner YAML string.
 */
export function stripYamlFences(s: string): string {
  let t = s.trim();
  // Strip ```yaml / ``` fences if present.
  const fenceMatch = t.match(/^```(?:yaml|yml)?\s*\n?([\s\S]*?)\n?```\s*$/i);
  if (fenceMatch) t = fenceMatch[1].trim();
  return t;
}

/** Parse the LLM's YAML output into a raw object, ready for validation. */
export function parseGeneratedYaml(raw: string): unknown {
  const clean = stripYamlFences(raw);
  return parseYaml(clean);
}

/**
 * Default LLM adapter — shells out to the runtime's ClaudeCodeClient. Kept
 * behind an interface so tests can inject a mock without spawning a child
 * process.
 */
async function defaultLLM(): Promise<RoutineLLM> {
  const mod = await import("../runtime/llm_client.js");
  const client = new mod.ClaudeCodeClient();
  return {
    complete: (sys, msg) => {
      const resp = client.complete(sys, msg);
      // The runtime's LLMClient interface allows `complete` to return either
      // a Promise<LLMResponse> or a plain LLMResponse. We normalize to the
      // `.text` field so tests and callers see the same shape.
      const maybeThenable = resp as unknown as { then?: unknown };
      if (maybeThenable && typeof maybeThenable.then === "function") {
        return Promise.resolve(resp as unknown as Promise<{ text: string }>).then(
          (r) => r.text,
        );
      }
      return (resp as { text: string }).text;
    },
  };
}

export interface GenerateOptions {
  description: string;
  /** Optional LLM override — tests inject a stub here. */
  llm?: RoutineLLM;
}

export interface GenerateResult {
  routine: Routine | null;
  rawOutput: string;
  errors: string[];
  /** True if the LLM itself threw (network, missing binary, timeout). */
  llmFailed: boolean;
}

/** Call the LLM and validate its output; never throws. */
export async function generateRoutine(
  opts: GenerateOptions,
): Promise<GenerateResult> {
  const description = opts.description?.trim() ?? "";
  if (!description) {
    return {
      routine: null,
      rawOutput: "",
      errors: ["description is empty"],
      llmFailed: false,
    };
  }

  let llm: RoutineLLM;
  try {
    llm = opts.llm ?? (await defaultLLM());
  } catch (err) {
    return {
      routine: null,
      rawOutput: "",
      errors: [`LLM init failed: ${(err as Error).message}`],
      llmFailed: true,
    };
  }

  let rawOutput: string;
  try {
    const out = await llm.complete(GENERATE_SYSTEM_PROMPT, description);
    rawOutput = typeof out === "string" ? out : String(out ?? "");
  } catch (err) {
    return {
      routine: null,
      rawOutput: "",
      errors: [`LLM call failed: ${(err as Error).message}`],
      llmFailed: true,
    };
  }

  let parsed: unknown;
  try {
    parsed = parseGeneratedYaml(rawOutput);
  } catch (err) {
    return {
      routine: null,
      rawOutput,
      errors: [`YAML parse failed: ${(err as Error).message}`],
      llmFailed: false,
    };
  }

  const result = validateRoutine(parsed);
  if (!result.ok) {
    return { routine: null, rawOutput, errors: result.errors, llmFailed: false };
  }
  return { routine: result.routine!, rawOutput, errors: [], llmFailed: false };
}

/* -------------------------------------------------------------------------- */
/* schedule.yaml writer (--mode commit / --mode skip)                          */
/* -------------------------------------------------------------------------- */

/** Build the full schedule.yaml text for a role, with header + body. */
export function renderScheduleYaml(role: string, routines: Routine[]): string {
  const header = [
    `# Podium schedule for ${role} role.`,
    `# Generated during /podium-setup.`,
    `# Restore template: git checkout HEAD -- roles/${role}/schedule.yaml`,
    "",
  ].join("\n");

  if (routines.length === 0) {
    // Minimal but valid YAML — empty array, not null, so YAML loaders hand
    // back a list directly without downstream `.routines ?? []` needed.
    return (
      `${header}# No routines configured.\nroutines: []\n`
    );
  }

  // Serialize each routine individually so we control key ordering and can
  // keep inputs on one line when it's short. yaml.stringify honors key
  // insertion order on plain objects.
  const orderedRoutines = routines.map((r) => ({
    id: r.id,
    name: r.name,
    when: r.when,
    what: r.what,
    inputs: r.inputs,
    enabled: r.enabled,
  }));
  const body = stringifyYaml(
    { routines: orderedRoutines },
    { lineWidth: 0 }, // don't fold long `what` strings
  );
  return `${header}${body}`;
}

/** Write roles/<role>/schedule.yaml atomically-ish. Returns path. */
export function writeScheduleFile(
  role: string,
  content: string,
  root: string = REPO_ROOT,
): string {
  const dir = path.join(root, "roles", role);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, "schedule.yaml");
  fs.writeFileSync(p, content, "utf-8");
  return p;
}

/* -------------------------------------------------------------------------- */
/* Mode runners                                                                */
/* -------------------------------------------------------------------------- */

/** --mode list */
export function runList(root: string = REPO_ROOT): number {
  const role = resolveActiveRole(root);
  if (!role) {
    emitStatus("ROUTINE", {
      MODE: "list",
      STATUS: "no_active_role",
    });
    return 2;
  }
  const starters = buildStarterPrompts(role, root);
  emitStatus("ROUTINE", {
    MODE: "list",
    ROLE: role,
    STARTER_PROMPTS: starters.length,
    DATA: JSON.stringify({ starters }),
    STATUS: "success",
  });
  return 0;
}

export interface GenerateRunOptions {
  description: string;
  llm?: RoutineLLM;
}

/** --mode generate */
export async function runGenerate(
  opts: GenerateRunOptions,
  _root: string = REPO_ROOT,
): Promise<number> {
  const result = await generateRoutine({
    description: opts.description,
    llm: opts.llm,
  });

  if (result.llmFailed) {
    emitStatus("ROUTINE", {
      MODE: "generate",
      VALIDATED: false,
      ERROR: result.errors.join("; "),
      STATUS: "generation_failed",
    });
    return 3;
  }

  if (!result.routine) {
    emitStatus("ROUTINE", {
      MODE: "generate",
      VALIDATED: false,
      ERROR: result.errors.join("; "),
      DATA: JSON.stringify({ raw: result.rawOutput }),
      STATUS: "invalid_schema",
    });
    return 4;
  }

  emitStatus("ROUTINE", {
    MODE: "generate",
    VALIDATED: true,
    DATA: JSON.stringify({ routine: result.routine }),
    STATUS: "success",
  });
  return 0;
}

export interface CommitRunOptions {
  routinesJson: string;
  roleOverride?: string;
}

/** --mode commit */
export function runCommit(
  opts: CommitRunOptions,
  root: string = REPO_ROOT,
): number {
  const role = opts.roleOverride ?? resolveActiveRole(root);
  if (!role) {
    emitStatus("ROUTINE", {
      MODE: "commit",
      STATUS: "no_active_role",
    });
    return 2;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(opts.routinesJson);
  } catch (err) {
    emitStatus("ROUTINE", {
      MODE: "commit",
      ROLE: role,
      STATUS: "malformed_routines",
      ERROR: (err as Error).message,
    });
    return 5;
  }

  const { ok, errors, routines } = validateRoutines(parsed);
  if (!ok) {
    emitStatus("ROUTINE", {
      MODE: "commit",
      ROLE: role,
      VALIDATED: false,
      ERRORS: errors.join("; "),
      STATUS: "invalid_schema",
    });
    return 4;
  }

  const content = renderScheduleYaml(role, routines);
  let filePath: string;
  try {
    filePath = writeScheduleFile(role, content, root);
  } catch (err) {
    emitStatus("ROUTINE", {
      MODE: "commit",
      ROLE: role,
      STATUS: "write_failed",
      ERROR: (err as Error).message,
    });
    return 6;
  }
  const relPath = path.relative(root, filePath);

  emitStatus("ROUTINE", {
    MODE: "commit",
    ROLE: role,
    ROUTINES_CREATED: routines.length,
    SCHEDULE_PATH: relPath,
    STATUS: "success",
  });
  return 0;
}

/** --mode skip */
export function runSkip(root: string = REPO_ROOT): number {
  const role = resolveActiveRole(root);
  if (!role) {
    emitStatus("ROUTINE", {
      MODE: "skip",
      STATUS: "no_active_role",
    });
    return 2;
  }
  const content = renderScheduleYaml(role, []);
  let filePath: string;
  try {
    filePath = writeScheduleFile(role, content, root);
  } catch (err) {
    emitStatus("ROUTINE", {
      MODE: "skip",
      ROLE: role,
      STATUS: "write_failed",
      ERROR: (err as Error).message,
    });
    return 6;
  }
  const relPath = path.relative(root, filePath);
  emitStatus("ROUTINE", {
    MODE: "skip",
    ROLE: role,
    ROUTINES_CREATED: 0,
    SCHEDULE_PATH: relPath,
    STATUS: "success",
  });
  return 0;
}

/* -------------------------------------------------------------------------- */
/* Entrypoint                                                                  */
/* -------------------------------------------------------------------------- */

export async function run(args: Record<string, unknown>): Promise<number> {
  const mode = (args.mode as string | undefined) ?? "list";

  if (mode === "list") {
    return runList();
  }
  if (mode === "skip") {
    return runSkip();
  }
  if (mode === "generate") {
    const description = args.description;
    if (description === undefined || typeof description !== "string") {
      emitStatus("ROUTINE", {
        MODE: "generate",
        STATUS: "missing_description",
      });
      return 2;
    }
    return runGenerate({ description });
  }
  if (mode === "commit") {
    const routines = args.routines;
    if (routines === undefined || typeof routines !== "string") {
      emitStatus("ROUTINE", {
        MODE: "commit",
        STATUS: "missing_routines",
      });
      return 2;
    }
    return runCommit({ routinesJson: routines });
  }
  emitStatus("ROUTINE", {
    MODE: String(mode),
    STATUS: "unknown_mode",
  });
  return 2;
}

const isDirectRun = (() => {
  try {
    return (
      process.argv[1] !== undefined &&
      fileURLToPath(import.meta.url) === process.argv[1]
    );
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);
  run(parsed).then((code) => process.exit(code));
}
