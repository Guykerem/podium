/**
 * Onboarding runner (M5).
 *
 * Asks each question from the active role's onboarding/questions.yaml and
 * persists answers to roles/<role>/memory/context.md. The engine's context
 * assembler (runtime/context.ts) reads that file on every message so the first
 * interaction is already personalized.
 *
 * Two modes, mirrored on role-select (M4):
 *
 *   --mode list
 *     Reads the active role's questions.yaml (from agent/memory/active-role.yaml,
 *     written by M4) and emits an ONBOARDING status block whose DATA field is
 *     a JSON blob of every question in the normalized schema. The orchestrator
 *     (SKILL, M10) parses it and drives AskUserQuestion for each entry.
 *
 *   --mode commit --answers '<json>'
 *     Takes a JSON object keyed by question id, validates required answers,
 *     renders a markdown file with YAML frontmatter, writes it to
 *     roles/<role>/memory/context.md, and emits an ONBOARDING status block.
 *
 * Exit codes:
 *   0  success
 *   2  missing/invalid arguments or unreadable role state
 *   3  missing required answer(s)
 *   4  invalid role (active-role.yaml points at a role that doesn't exist)
 *   6  malformed answers JSON
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { emitStatus } from "./status.js";

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

export type QuestionType = "text" | "choice" | "multi";

export interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  memory_key: string;
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/* -------------------------------------------------------------------------- */
/* Args parser                                                                 */
/* -------------------------------------------------------------------------- */

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
/* Question schema loader + normalizer                                         */
/* -------------------------------------------------------------------------- */

/** Read agent/memory/active-role.yaml and return the `role` field, or null. */
export function resolveActiveRole(root: string = REPO_ROOT): string | null {
  const p = path.join(root, "agent", "memory", "active-role.yaml");
  if (!fs.existsSync(p)) return null;
  try {
    const parsed = parseYaml(fs.readFileSync(p, "utf-8")) as Record<string, unknown> | null;
    if (parsed && typeof parsed.role === "string" && parsed.role.length > 0) {
      return parsed.role;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Read the BOOTSTRAP-detected timezone if available; else use the local one. */
export function detectTimezone(): string {
  const fromEnv = process.env.PODIUM_TIMEZONE;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Normalize a single raw question entry to the M5 schema. Accepts current
 * (pre-M5) shapes from the four shipped roles and coerces them.
 *
 * Returns null if the entry is missing `id` or `prompt` — those are load-
 * bearing and un-recoverable.
 */
export function normalizeQuestion(raw: unknown): Question | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id.trim() : "";
  const prompt = typeof r.prompt === "string" ? r.prompt.trim() : "";
  if (!id || !prompt) return null;

  // type: accept the new names plus legacy aliases
  const typeRaw = typeof r.type === "string" ? r.type.trim() : "text";
  let type: QuestionType = "text";
  if (typeRaw === "text" || typeRaw === "open" || typeRaw === "yes_no") {
    type = "text";
  } else if (typeRaw === "choice" || typeRaw === "multiple_choice") {
    type = "choice";
  } else if (typeRaw === "multi" || typeRaw === "multi_select" || typeRaw === "multi_select_open") {
    type = "multi";
  }

  // options: accept either an array of strings or an array of {label, description}.
  const options: string[] = [];
  if (Array.isArray(r.options)) {
    for (const opt of r.options) {
      if (typeof opt === "string") {
        options.push(opt);
      } else if (opt && typeof opt === "object") {
        const o = opt as Record<string, unknown>;
        if (typeof o.label === "string") {
          const desc = typeof o.description === "string" ? ` — ${o.description}` : "";
          options.push(`${o.label}${desc}`);
        }
      }
    }
  }

  const required = r.required === undefined ? false : Boolean(r.required);
  const memory_key = typeof r.memory_key === "string" && r.memory_key.length > 0
    ? r.memory_key
    : id;

  return { id, prompt, type, options, required, memory_key };
}

/**
 * Load roles/<role>/onboarding/questions.yaml, normalize every entry, and
 * return the resulting list. Returns [] if the file is missing or malformed.
 */
export function loadQuestions(role: string, root: string = REPO_ROOT): Question[] {
  const p = path.join(root, "roles", role, "onboarding", "questions.yaml");
  if (!fs.existsSync(p)) return [];
  let parsed: unknown;
  try {
    parsed = parseYaml(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const rawQs = (parsed as { questions?: unknown }).questions;
  if (!Array.isArray(rawQs)) return [];
  const out: Question[] = [];
  for (const raw of rawQs) {
    const q = normalizeQuestion(raw);
    if (q) out.push(q);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Answer validation                                                           */
/* -------------------------------------------------------------------------- */

/** Return the list of question ids that are required but missing from answers. */
export function findMissingRequired(questions: Question[], answers: Answers): string[] {
  const missing: string[] = [];
  for (const q of questions) {
    if (!q.required) continue;
    const a = answers[q.id];
    if (a === undefined || a === null) {
      missing.push(q.id);
      continue;
    }
    if (typeof a === "string" && a.trim().length === 0) {
      missing.push(q.id);
      continue;
    }
    if (Array.isArray(a) && a.length === 0) {
      missing.push(q.id);
    }
  }
  return missing;
}

/* -------------------------------------------------------------------------- */
/* Frontmatter + body generator                                                */
/* -------------------------------------------------------------------------- */

/**
 * Set a value inside a nested object using a dotted path. Intermediate nodes
 * that don't exist (or are non-objects) are replaced with a fresh object.
 */
function setNested(target: Record<string, unknown>, dottedKey: string, value: unknown): void {
  const parts = dottedKey.split(".").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return;
  let node: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = node[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      node[key] = {};
    }
    node = node[key] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Build the frontmatter object from answers, using each question's memory_key
 * (supports dotted paths for nesting). Includes timezone + captured_at.
 */
export function buildFrontmatter(opts: {
  questions: Question[];
  answers: Answers;
  timezone: string;
  capturedAt: string;
}): Record<string, unknown> {
  const fm: Record<string, unknown> = {};
  for (const q of opts.questions) {
    const v = opts.answers[q.id];
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim().length === 0) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    setNested(fm, q.memory_key, v);
  }
  fm.timezone = opts.timezone;
  fm.captured_at = opts.capturedAt;
  return fm;
}

/**
 * Produce the markdown body — a 3-6 line narrative summary that references the
 * captured answers inline so the LLM has a human-readable profile alongside
 * the structured frontmatter. No LLM call; all template-driven.
 */
export function buildBody(opts: {
  role: string;
  questions: Question[];
  answers: Answers;
}): string {
  const { role, questions, answers } = opts;

  const name = typeof answers.name === "string" ? answers.name.trim() : "";
  const primary = typeof answers.primary_goal === "string" ? answers.primary_goal.trim() : "";

  const lines: string[] = [];
  lines.push("# What I know about you");
  lines.push("");

  // Opening narrative — 1-2 sentences, uses name + primary_goal when present.
  if (name && primary) {
    lines.push(
      `The user, ${name}, told me during setup that they want help with ${primary}.`,
    );
  } else if (name) {
    lines.push(`The user goes by ${name}.`);
  } else if (primary) {
    lines.push(
      `The user told me during setup that they want help with ${primary}.`,
    );
  } else {
    lines.push(
      "The user completed onboarding during setup. The structured answers are in the frontmatter above.",
    );
  }
  lines.push("");

  // Key goals section — always emitted so downstream code/templates can find it.
  lines.push("## Key goals");
  if (primary) {
    lines.push(`- ${primary}`);
  } else {
    lines.push("- (none captured during setup)");
  }
  lines.push("");

  // Preferred interaction style / other context — collect up to 3 secondary
  // answers that aren't name/primary_goal, rendered as bullets.
  const secondary: string[] = [];
  for (const q of questions) {
    if (q.id === "name" || q.id === "primary_goal") continue;
    const v = answers[q.id];
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length === 0) continue;
      secondary.push(`- **${q.id}**: ${t}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) continue;
      secondary.push(`- **${q.id}**: ${v.join(", ")}`);
    }
    if (secondary.length >= 4) break;
  }
  if (secondary.length > 0) {
    lines.push("## Preferred interaction style");
    lines.push(...secondary);
    lines.push("");
  }

  lines.push(
    `_Role at capture time: ${role}. This file is regenerated every time onboarding is re-run._`,
  );

  return lines.join("\n");
}

/** Serialize the memory file: YAML frontmatter + markdown body. */
export function renderMemoryFile(opts: {
  frontmatter: Record<string, unknown>;
  body: string;
}): string {
  const fmYaml = stringifyYaml(opts.frontmatter).trimEnd();
  return `---\n${fmYaml}\n---\n\n${opts.body}\n`;
}

/** Write roles/<role>/memory/context.md. Creates parent dirs. Returns path. */
export function writeMemoryFile(
  role: string,
  content: string,
  root: string = REPO_ROOT,
): string {
  const dir = path.join(root, "roles", role, "memory");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, "context.md");
  fs.writeFileSync(p, content, "utf-8");
  return p;
}

/* -------------------------------------------------------------------------- */
/* Modes                                                                       */
/* -------------------------------------------------------------------------- */

/** --mode list: load active role's questions and emit ONBOARDING block. */
export function runList(root: string = REPO_ROOT): number {
  const role = resolveActiveRole(root);
  if (!role) {
    emitStatus("ONBOARDING", {
      MODE: "list",
      STATUS: "no_active_role",
    });
    return 2;
  }
  const questions = loadQuestions(role, root);
  if (questions.length === 0) {
    emitStatus("ONBOARDING", {
      MODE: "list",
      ROLE: role,
      QUESTIONS_COUNT: 0,
      STATUS: "no_questions",
    });
    return 2;
  }
  const payload = JSON.stringify({ questions });
  emitStatus("ONBOARDING", {
    MODE: "list",
    ROLE: role,
    QUESTIONS_COUNT: questions.length,
    DATA: payload,
    STATUS: "success",
  });
  return 0;
}

export interface CommitOptions {
  /** Raw JSON string keyed by question id. */
  answersJson: string;
  /** Optional override of the role resolved from active-role.yaml — used in tests. */
  roleOverride?: string;
  /** Optional override of detected timezone — used in tests. */
  timezoneOverride?: string;
  /** Optional override of captured_at — used in tests. */
  capturedAtOverride?: string;
}

/** --mode commit: validate answers, write memory file, emit ONBOARDING block. */
export function runCommit(opts: CommitOptions, root: string = REPO_ROOT): number {
  const role = opts.roleOverride ?? resolveActiveRole(root);
  if (!role) {
    emitStatus("ONBOARDING", {
      MODE: "commit",
      STATUS: "no_active_role",
    });
    return 2;
  }

  // Parse answers JSON.
  let parsedAnswers: unknown;
  try {
    parsedAnswers = JSON.parse(opts.answersJson);
  } catch (err) {
    emitStatus("ONBOARDING", {
      MODE: "commit",
      ROLE: role,
      STATUS: "malformed_answers",
      ERROR: (err as Error).message,
    });
    return 6;
  }
  if (!parsedAnswers || typeof parsedAnswers !== "object" || Array.isArray(parsedAnswers)) {
    emitStatus("ONBOARDING", {
      MODE: "commit",
      ROLE: role,
      STATUS: "malformed_answers",
    });
    return 6;
  }

  // Coerce to Answers: accept string or string[]; anything else → string via String().
  const answers: Answers = {};
  for (const [k, v] of Object.entries(parsedAnswers as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      answers[k] = v.map((x) => String(x));
    } else if (v === null || v === undefined) {
      // skip
    } else {
      answers[k] = String(v);
    }
  }

  // Load + validate against the role's questions.
  const questions = loadQuestions(role, root);
  if (questions.length === 0) {
    emitStatus("ONBOARDING", {
      MODE: "commit",
      ROLE: role,
      STATUS: "no_questions",
    });
    return 4;
  }

  const missing = findMissingRequired(questions, answers);
  if (missing.length > 0) {
    emitStatus("ONBOARDING", {
      MODE: "commit",
      ROLE: role,
      MISSING_REQUIRED: missing.join(","),
      STATUS: "missing_required",
    });
    return 3;
  }

  const timezone = opts.timezoneOverride ?? detectTimezone();
  const capturedAt = opts.capturedAtOverride ?? new Date().toISOString();
  const frontmatter = buildFrontmatter({ questions, answers, timezone, capturedAt });
  const body = buildBody({ role, questions, answers });
  const content = renderMemoryFile({ frontmatter, body });
  const memoryPath = writeMemoryFile(role, content, root);

  // Count non-empty answers actually persisted (keys that survived coercion).
  const answerCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  }).length;

  // Report path relative to repo root so status blocks are portable.
  const relPath = path.relative(root, memoryPath);

  emitStatus("ONBOARDING", {
    MODE: "commit",
    ROLE: role,
    ANSWERS: answerCount,
    MEMORY_PATH: relPath,
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
  if (mode === "commit") {
    const answers = args.answers;
    if (answers === undefined || typeof answers !== "string") {
      emitStatus("ONBOARDING", {
        MODE: "commit",
        STATUS: "missing_answers",
      });
      return 2;
    }
    return runCommit({ answersJson: answers });
  }
  emitStatus("ONBOARDING", {
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
