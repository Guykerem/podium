/**
 * Verify step.
 *
 * End-to-end health check for the active Podium role. Proves that the runtime
 * actually loads the memory seeded during onboarding — the probe's pass/fail
 * criterion is whether the model greets the user by the name captured in
 * roles/<role>/memory/context.md.
 *
 * Two modes:
 *
 *   --mode check
 *     Boot check only — no LLM call. Fast. Used by the orchestrator when it
 *     wants a structural sanity check (role dir exists, identity files
 *     present, skills_enabled is a subset of what's on disk, memory file
 *     exists). Exits 0 on pass, 2 on any boot-level failure.
 *
 *   --mode full   (default)
 *     Boot check followed by a single live probe via
 *     `npx tsx runtime/engine.ts --message "<prompt>"`. The probe is
 *     considered personalized if the response contains the name from the
 *     memory frontmatter, case-insensitive. Exits 0 if everything passes,
 *     1 on partial (boot ok, probe failed or skipped), 2 on boot failure.
 *
 * Status block shape (§C1):
 *
 *   === PODIUM SETUP: VERIFY ===
 *   MODE: check|full
 *   ROLE: <role>
 *   BOOT_ROLE_DIR: true|false
 *   BOOT_IDENTITY: true|false
 *   BOOT_SKILLS_VALID: true|false
 *   BOOT_MEMORY: true|false
 *   BOOT_STATUS: success|failed
 *   [REASON: role_dir_missing|invalid_skills|...]
 *   [INVALID_SKILLS: a,b,c]
 *   PROBE_STATUS: success|skipped|timeout|failed|not_run
 *   PROBE_PERSONALIZED: true|false
 *   [LATENCY_MS: <int>]
 *   [HINT: <remediation>]
 *   STATUS: success|partial|failed
 *   === END ===
 *
 * Exit codes:
 *   0  STATUS: success
 *   1  STATUS: partial
 *   2  STATUS: failed (boot-level)
 *   3  bad args (unknown mode, etc.)
 */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

import { emitStatus } from './status.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

function moduleDir(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = import.meta as any;
    if (meta && typeof meta.url === 'string') {
      return path.dirname(fileURLToPath(meta.url));
    }
  } catch {
    /* fall through */
  }
  return process.cwd();
}

export const REPO_ROOT = path.resolve(moduleDir(), '..');

const DEFAULT_PROBE_PROMPT =
  'Greet me by name and summarize what you know about me in one sentence.';

const DEFAULT_PROBE_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Active role resolution
// ---------------------------------------------------------------------------

/**
 * Read `agent/memory/active-role.yaml` and return the `role` field. Returns
 * null if the file is missing, malformed, or lacks a role entry — callers
 * treat that as a boot failure (role_unresolved).
 */
export function resolveActiveRole(root: string = REPO_ROOT): string | null {
  const envRole = process.env.PODIUM_ROLE;
  if (envRole && envRole.trim().length > 0) return envRole.trim();
  const file = path.join(root, 'agent', 'memory', 'active-role.yaml');
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = parseYaml(fs.readFileSync(file, 'utf-8')) as
      | Record<string, unknown>
      | null;
    if (parsed && typeof parsed.role === 'string' && parsed.role.length > 0) {
      return parsed.role;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Read the `skills_enabled` array from active-role.yaml, if any. */
export function readSkillsEnabled(root: string = REPO_ROOT): string[] {
  const file = path.join(root, 'agent', 'memory', 'active-role.yaml');
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = parseYaml(fs.readFileSync(file, 'utf-8')) as
      | Record<string, unknown>
      | null;
    if (!parsed) return [];
    const skills = parsed.skills_enabled;
    if (Array.isArray(skills)) {
      return skills.filter((s): s is string => typeof s === 'string' && s.length > 0);
    }
  } catch {
    /* fall through */
  }
  return [];
}

// ---------------------------------------------------------------------------
// Boot checks
// ---------------------------------------------------------------------------

export interface BootCheckResult {
  /** The role resolved from active-role.yaml (or the env override). */
  role: string | null;
  roleDir: boolean;
  identity: boolean;
  skillsValid: boolean;
  memory: boolean;
  /** Names in skills_enabled that are not present on disk. */
  invalidSkills: string[];
  /** Boot-level failure reason, if any. */
  reason: string | null;
  /** Which base skills are on disk for this role. Used by the status block. */
  availableSkills: string[];
}

/** List base skills present on disk for a role. */
export function listBaseSkillsOnDisk(
  role: string,
  root: string = REPO_ROOT,
): string[] {
  const baseDir = path.join(root, 'roles', role, 'skills', 'base');
  if (!fs.existsSync(baseDir)) return [];
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/**
 * Run the structural boot checks for the active role. Doesn't emit anything
 * or touch the LLM — pure disk reads. Returns a structured result that the
 * status-block builder consumes.
 */
export function runBootCheck(root: string = REPO_ROOT): BootCheckResult {
  const role = resolveActiveRole(root);
  const result: BootCheckResult = {
    role,
    roleDir: false,
    identity: false,
    skillsValid: false,
    memory: false,
    invalidSkills: [],
    reason: null,
    availableSkills: [],
  };

  if (!role) {
    result.reason = 'role_unresolved';
    return result;
  }

  const roleDir = path.join(root, 'roles', role);
  result.roleDir = fs.existsSync(roleDir) && fs.statSync(roleDir).isDirectory();
  if (!result.roleDir) {
    result.reason = 'role_dir_missing';
    return result;
  }

  const constitution = path.join(roleDir, 'identity', 'constitution.md');
  const style = path.join(roleDir, 'identity', 'style.yaml');
  result.identity = fs.existsSync(constitution) && fs.existsSync(style);
  if (!result.identity) {
    result.reason = 'identity_missing';
    return result;
  }

  // Skills subset check: every entry in skills_enabled must correspond to
  // a roles/<role>/skills/base/<name>/ folder. Empty skills_enabled is fine
  // — the user may have picked no base skills during role-select.
  const enabled = readSkillsEnabled(root);
  const available = listBaseSkillsOnDisk(role, root);
  result.availableSkills = available;
  const invalid = enabled.filter((s) => !available.includes(s));
  result.invalidSkills = invalid;
  result.skillsValid = invalid.length === 0;
  if (!result.skillsValid) {
    result.reason = 'invalid_skills';
    return result;
  }

  const memoryFile = path.join(roleDir, 'memory', 'context.md');
  result.memory = fs.existsSync(memoryFile);
  // Memory missing is NOT a boot failure — §M9 says boot still succeeds and
  // probe is skipped with a hint. We record the signal but don't set a
  // `reason` here.

  return result;
}

// ---------------------------------------------------------------------------
// Memory probe setup
// ---------------------------------------------------------------------------

/**
 * Extract the `name` field from roles/<role>/memory/context.md's YAML
 * frontmatter. Returns null if the file is missing, has no frontmatter, or
 * the name field is empty. This is the probe's personalization target.
 */
export function extractMemoryName(
  role: string,
  root: string = REPO_ROOT,
): string | null {
  const file = path.join(root, 'roles', role, 'memory', 'context.md');
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf-8');
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = raw.slice(3, end).replace(/^\n/, '');
  let parsed: unknown;
  try {
    parsed = parseYaml(block);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const fm = parsed as Record<string, unknown>;
  // Accept either a top-level `name` or a nested profile.name — onboarding
  // uses dotted memory_keys so both shapes are legal.
  const direct = fm.name;
  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }
  const profile = fm.profile;
  if (profile && typeof profile === 'object') {
    const nested = (profile as Record<string, unknown>).name;
    if (typeof nested === 'string' && nested.trim().length > 0) {
      return nested.trim();
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Live probe
// ---------------------------------------------------------------------------

export type ProbeOutcome =
  | { kind: 'success'; text: string; latencyMs: number }
  | { kind: 'timeout'; latencyMs: number }
  | { kind: 'failed'; error: string; latencyMs: number };

/**
 * Shell out to `npx tsx runtime/engine.ts --message "<prompt>"`, capture
 * stdout, enforce a timeout. All failure modes return structured outcomes —
 * the caller decides how to translate into a status block.
 *
 * Exposed as an export so tests can override it with a stub that returns
 * deterministic responses without spawning a subprocess or hitting the LLM.
 */
export type ProbeRunner = (
  prompt: string,
  opts: { root: string; timeoutMs: number },
) => ProbeOutcome;

export const defaultProbeRunner: ProbeRunner = (prompt, opts) => {
  const start = Date.now();
  try {
    const stdout = execFileSync(
      'npx',
      ['tsx', 'runtime/engine.ts', '--message', prompt],
      {
        cwd: opts.root,
        encoding: 'utf-8',
        timeout: opts.timeoutMs,
        // Don't inherit stderr — keep the VERIFY status block clean.
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const latencyMs = Date.now() - start;
    return { kind: 'success', text: stdout, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - start;
    // Node's execFileSync annotates timeout with `signal === 'SIGTERM'` and
    // `error.code === 'ETIMEDOUT'` — handle both paths for portability.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    if (
      e?.code === 'ETIMEDOUT' ||
      e?.signal === 'SIGTERM' ||
      (e?.killed === true && latencyMs >= opts.timeoutMs - 100)
    ) {
      return { kind: 'timeout', latencyMs };
    }
    const message = e?.stderr?.toString?.() || e?.message || String(err);
    return { kind: 'failed', error: String(message), latencyMs };
  }
};

/** Case-insensitive substring match. Used to decide PROBE_PERSONALIZED. */
export function responseContainsName(
  response: string,
  name: string,
): boolean {
  if (!response || !name) return false;
  return response.toLowerCase().includes(name.toLowerCase());
}

// ---------------------------------------------------------------------------
// Status-block composition
// ---------------------------------------------------------------------------

/** Build the status fields for a boot-only failure. Role may be null. */
function bootFailureFields(
  mode: 'check' | 'full',
  boot: BootCheckResult,
): Record<string, string | number | boolean> {
  const fields: Record<string, string | number | boolean> = {
    MODE: mode,
    ROLE: boot.role ?? 'unknown',
    BOOT_ROLE_DIR: boot.roleDir,
    BOOT_IDENTITY: boot.identity,
    BOOT_SKILLS_VALID: boot.skillsValid,
    BOOT_MEMORY: boot.memory,
    BOOT_STATUS: 'failed',
    REASON: boot.reason ?? 'unknown',
  };
  if (boot.invalidSkills.length > 0) {
    fields.INVALID_SKILLS = boot.invalidSkills.join(',');
  }
  fields.PROBE_STATUS = 'not_run';
  fields.PROBE_PERSONALIZED = false;
  fields.STATUS = 'failed';
  // Remediation hints per reason.
  switch (boot.reason) {
    case 'role_unresolved':
      fields.HINT =
        'agent/memory/active-role.yaml is missing or empty — run /podium-setup.';
      break;
    case 'role_dir_missing':
      fields.HINT =
        'active-role.yaml points at a role that has no folder — run /podium-setup and pick an existing role.';
      break;
    case 'identity_missing':
      fields.HINT =
        'identity/constitution.md or identity/style.yaml is missing — the role overlay looks corrupted.';
      break;
    case 'invalid_skills':
      fields.HINT =
        'skills_enabled in active-role.yaml references skills that no longer exist — re-run /podium-setup.';
      break;
    default:
      fields.HINT = 'run /podium-setup to repair state.';
  }
  return fields;
}

// ---------------------------------------------------------------------------
// Runners
// ---------------------------------------------------------------------------

export interface VerifyOptions {
  root?: string;
  /** For tests: swap the probe without touching exec. */
  probeRunner?: ProbeRunner;
  /** For tests: override the probe prompt. */
  probePrompt?: string;
  /** For tests: override the probe timeout. */
  probeTimeoutMs?: number;
}

/** --mode check: boot check only, no probe. */
export function runCheck(opts: VerifyOptions = {}): number {
  const root = opts.root ?? REPO_ROOT;
  const boot = runBootCheck(root);

  if (boot.reason) {
    emitStatus('VERIFY', bootFailureFields('check', boot));
    return 2;
  }

  // Boot passed. Memory may still be missing — in check mode that's a partial
  // result (boot success, probe skipped, overall partial).
  const fields: Record<string, string | number | boolean> = {
    MODE: 'check',
    ROLE: boot.role as string,
    BOOT_ROLE_DIR: boot.roleDir,
    BOOT_IDENTITY: boot.identity,
    BOOT_SKILLS_VALID: boot.skillsValid,
    BOOT_MEMORY: boot.memory,
    BOOT_STATUS: 'success',
    PROBE_STATUS: 'skipped',
    PROBE_PERSONALIZED: false,
  };
  if (!boot.memory) {
    fields.REASON = 'memory_not_present';
    fields.HINT =
      "onboarding didn't complete — re-run /podium-setup to seed roles/<role>/memory/context.md.";
    fields.STATUS = 'partial';
    emitStatus('VERIFY', fields);
    return 1;
  }
  fields.STATUS = 'success';
  emitStatus('VERIFY', fields);
  return 0;
}

/** --mode full: boot check + live probe. */
export function runFull(opts: VerifyOptions = {}): number {
  const root = opts.root ?? REPO_ROOT;
  const probe = opts.probeRunner ?? defaultProbeRunner;
  const prompt = opts.probePrompt ?? DEFAULT_PROBE_PROMPT;
  const timeoutMs = opts.probeTimeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS;

  const boot = runBootCheck(root);

  if (boot.reason) {
    emitStatus('VERIFY', bootFailureFields('full', boot));
    return 2;
  }

  // Memory missing → skip probe, partial status (per §M9 failure matrix).
  if (!boot.memory) {
    emitStatus('VERIFY', {
      MODE: 'full',
      ROLE: boot.role as string,
      BOOT_ROLE_DIR: boot.roleDir,
      BOOT_IDENTITY: boot.identity,
      BOOT_SKILLS_VALID: boot.skillsValid,
      BOOT_MEMORY: false,
      BOOT_STATUS: 'success',
      PROBE_STATUS: 'skipped',
      PROBE_PERSONALIZED: false,
      REASON: 'memory_not_present',
      HINT:
        "onboarding didn't complete — re-run /podium-setup to seed roles/<role>/memory/context.md.",
      STATUS: 'partial',
    });
    return 1;
  }

  // Name absent from memory → probe can't verify personalization. Treat as
  // partial; hint points at onboarding.
  const role = boot.role as string;
  const name = extractMemoryName(role, root);
  if (!name) {
    emitStatus('VERIFY', {
      MODE: 'full',
      ROLE: role,
      BOOT_ROLE_DIR: boot.roleDir,
      BOOT_IDENTITY: boot.identity,
      BOOT_SKILLS_VALID: boot.skillsValid,
      BOOT_MEMORY: true,
      BOOT_STATUS: 'success',
      PROBE_STATUS: 'skipped',
      PROBE_PERSONALIZED: false,
      REASON: 'memory_name_missing',
      HINT:
        "onboarding didn't capture the user's name — re-run /podium-setup.",
      STATUS: 'partial',
    });
    return 1;
  }

  // Fire the probe.
  const outcome = probe(prompt, { root, timeoutMs });

  if (outcome.kind === 'timeout') {
    emitStatus('VERIFY', {
      MODE: 'full',
      ROLE: role,
      BOOT_ROLE_DIR: boot.roleDir,
      BOOT_IDENTITY: boot.identity,
      BOOT_SKILLS_VALID: boot.skillsValid,
      BOOT_MEMORY: true,
      BOOT_STATUS: 'success',
      PROBE_STATUS: 'timeout',
      PROBE_PERSONALIZED: false,
      LATENCY_MS: outcome.latencyMs,
      HINT: `probe exceeded ${Math.round(timeoutMs / 1000)}s — check 'claude --version' and network.`,
      STATUS: 'partial',
    });
    return 1;
  }

  if (outcome.kind === 'failed') {
    emitStatus('VERIFY', {
      MODE: 'full',
      ROLE: role,
      BOOT_ROLE_DIR: boot.roleDir,
      BOOT_IDENTITY: boot.identity,
      BOOT_SKILLS_VALID: boot.skillsValid,
      BOOT_MEMORY: true,
      BOOT_STATUS: 'success',
      PROBE_STATUS: 'failed',
      PROBE_PERSONALIZED: false,
      LATENCY_MS: outcome.latencyMs,
      ERROR: outcome.error.slice(0, 240),
      HINT: 'runtime/engine.ts failed — check `npx tsx runtime/engine.ts` manually.',
      STATUS: 'partial',
    });
    return 1;
  }

  const personalized = responseContainsName(outcome.text, name);
  if (!personalized) {
    emitStatus('VERIFY', {
      MODE: 'full',
      ROLE: role,
      BOOT_ROLE_DIR: boot.roleDir,
      BOOT_IDENTITY: boot.identity,
      BOOT_SKILLS_VALID: boot.skillsValid,
      BOOT_MEMORY: true,
      BOOT_STATUS: 'success',
      PROBE_STATUS: 'success',
      PROBE_PERSONALIZED: false,
      LATENCY_MS: outcome.latencyMs,
      REASON: 'memory_not_loaded_by_runtime',
      HINT:
        'probe replied but did not greet by name — check runtime/context.ts memory assembly.',
      STATUS: 'partial',
    });
    return 1;
  }

  emitStatus('VERIFY', {
    MODE: 'full',
    ROLE: role,
    BOOT_ROLE_DIR: boot.roleDir,
    BOOT_IDENTITY: boot.identity,
    BOOT_SKILLS_VALID: boot.skillsValid,
    BOOT_MEMORY: true,
    BOOT_STATUS: 'success',
    PROBE_STATUS: 'success',
    PROBE_PERSONALIZED: true,
    LATENCY_MS: outcome.latencyMs,
    STATUS: 'success',
  });
  return 0;
}

// ---------------------------------------------------------------------------
// Step runner entrypoint (§C2)
// ---------------------------------------------------------------------------

export interface VerifyRunArgs {
  mode?: string;
  root?: string;
}

export async function run(args: VerifyRunArgs = {}): Promise<number> {
  const mode = (args.mode ?? 'full').trim();
  const root = args.root ?? REPO_ROOT;

  switch (mode) {
    case 'check':
      return runCheck({ root });
    case 'full':
    case '':
      return runFull({ root });
    default:
      emitStatus('VERIFY', {
        MODE: mode,
        STATUS: 'bad_mode',
        HINT: 'Use --mode check or --mode full.',
      });
      return 3;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface ParsedArgs {
  mode: string | null;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { mode: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') {
      out.mode = argv[i + 1] ?? '';
      i += 1;
    } else if (a.startsWith('--mode=')) {
      out.mode = a.slice('--mode='.length);
    } else if (a === '-h' || a === '--help') {
      out.help = true;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return out;
}

function printHelp(): void {
  console.log('usage: verify --mode <check|full>');
  console.log('');
  console.log('Modes:');
  console.log('  check  Boot check only — no LLM probe.');
  console.log('  full   Boot check + live probe via runtime/engine.ts (default).');
}

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error((err as Error).message);
    printHelp();
    return 3;
  }
  if (args.help) {
    printHelp();
    return 0;
  }
  return run({ mode: args.mode ?? undefined });
}

const invokedDirect = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = import.meta as any;
    if (meta && typeof meta.url === 'string') {
      const self = fileURLToPath(meta.url);
      if (self && path.resolve(entry) === path.resolve(self)) return true;
    }
    return path.resolve(entry).endsWith('verify.ts');
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
    },
  );
}
