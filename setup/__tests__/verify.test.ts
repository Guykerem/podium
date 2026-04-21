/**
 * Tests for setup/verify.ts (M9 — end-to-end health check with personalized
 * probe).
 *
 * Coverage:
 *   - Boot check: role dir missing → STATUS failed, REASON role_dir_missing.
 *   - Boot check: identity files missing → STATUS failed, REASON identity_missing.
 *   - Boot check: skills_enabled contains an unknown skill → STATUS failed,
 *     REASON invalid_skills, INVALID_SKILLS list populated.
 *   - Boot check pass + memory missing (check mode) → STATUS partial,
 *     PROBE_STATUS skipped, REASON memory_not_present.
 *   - Boot check pass + memory missing (full mode) → STATUS partial,
 *     PROBE_STATUS skipped, probe runner not called.
 *   - Full mode + memory present + probe returns a greeting containing the
 *     user's name → STATUS success, PROBE_PERSONALIZED true, LATENCY_MS set.
 *   - Full mode + memory present + probe reply omits the name →
 *     STATUS partial, PROBE_PERSONALIZED false,
 *     REASON memory_not_loaded_by_runtime.
 *   - Full mode + probe timeout → STATUS partial, PROBE_STATUS timeout.
 *   - Full mode + probe failure (throw with stderr) → STATUS partial,
 *     PROBE_STATUS failed, ERROR populated.
 *   - responseContainsName is case-insensitive.
 *
 * We never spawn the real `claude` binary — the probe is injected via
 * VerifyOptions.probeRunner, which returns a pre-baked ProbeOutcome.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { stringify as stringifyYaml } from 'yaml';

import {
  extractMemoryName,
  listBaseSkillsOnDisk,
  resolveActiveRole,
  responseContainsName,
  runBootCheck,
  runCheck,
  runFull,
  run,
  type ProbeRunner,
} from '../verify.js';

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, 'utf-8');
}

/**
 * Build a fixture root that mirrors the slice of the repo M9 touches.
 *
 * Options:
 *   role                — role id to seed under roles/<role>/
 *   withIdentity        — write identity/constitution.md and identity/style.yaml
 *   baseSkills          — array of base skill names to create SKILL.md files for
 *   skillsEnabled       — value of skills_enabled in active-role.yaml
 *   withMemory          — write roles/<role>/memory/context.md (frontmatter name comes
 *                         from memoryName)
 *   memoryName          — name to inject into the memory frontmatter
 *   memoryWithoutName   — true → write memory file but omit the name field
 *   omitActiveRole      — skip writing active-role.yaml entirely
 *   activeRoleExtra     — extra keys to merge into active-role.yaml
 */
interface FixtureOpts {
  role?: string;
  withIdentity?: boolean;
  baseSkills?: string[];
  skillsEnabled?: string[];
  withMemory?: boolean;
  memoryName?: string;
  memoryWithoutName?: boolean;
  omitActiveRole?: boolean;
  activeRoleExtra?: Record<string, unknown>;
}

function makeFixtureRoot(opts: FixtureOpts = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'podium-m9-'));
  const role = opts.role ?? 'assistant';

  if (!opts.omitActiveRole) {
    const data: Record<string, unknown> = { role };
    if (opts.skillsEnabled !== undefined) {
      data.skills_enabled = opts.skillsEnabled;
    }
    if (opts.activeRoleExtra) {
      for (const [k, v] of Object.entries(opts.activeRoleExtra)) {
        data[k] = v;
      }
    }
    writeFile(
      path.join(root, 'agent', 'memory', 'active-role.yaml'),
      stringifyYaml(data),
    );
  }

  const roleDir = path.join(root, 'roles', role);
  // Always materialize the role directory so "identity missing" is
  // distinguishable from "role_dir_missing". Tests that want role_dir_missing
  // explicitly rm -rf the directory after the helper returns.
  mkdirp(roleDir);

  if (opts.withIdentity !== false) {
    // Default: write identity unless caller explicitly passes false. Tests
    // that want to exercise the identity_missing path pass `withIdentity: false`.
    writeFile(
      path.join(roleDir, 'identity', 'constitution.md'),
      '# Constitution\n',
    );
    writeFile(
      path.join(roleDir, 'identity', 'style.yaml'),
      'tone: warm\n',
    );
  }

  for (const skill of opts.baseSkills ?? []) {
    writeFile(
      path.join(roleDir, 'skills', 'base', skill, 'SKILL.md'),
      `---\nname: ${skill}\ndescription: ${skill} skill\n---\n\n# ${skill}\n`,
    );
  }

  if (opts.withMemory) {
    const fm: Record<string, string> = {
      primary_goal: 'help me ship Podium v0.2',
      timezone: 'America/New_York',
      captured_at: '2026-04-18T14:02:11Z',
    };
    if (!opts.memoryWithoutName) {
      fm.name = opts.memoryName ?? 'Guy';
    }
    const fmYaml = stringifyYaml(fm).trimEnd();
    const body =
      '# What I know about you\n\n' +
      `The user, ${opts.memoryName ?? 'Guy'}, told me during setup that they want help with v0.2.\n\n` +
      '## Key goals\n- ship v0.2\n';
    writeFile(
      path.join(roleDir, 'memory', 'context.md'),
      `---\n${fmYaml}\n---\n\n${body}`,
    );
  }

  return root;
}

function captureLogs(): string[] {
  const logs: string[] = [];
  vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
    logs.push(String(msg));
  });
  return logs;
}

/** Parse a VERIFY block's KEY: value lines into a map. */
function parseBlock(logs: string[]): Record<string, string> {
  const joined = logs.join('\n');
  const start = joined.indexOf('=== PODIUM SETUP: VERIFY ===');
  const end = joined.indexOf('=== END ===', start);
  if (start === -1 || end === -1) {
    throw new Error('no VERIFY block in output:\n' + joined);
  }
  const body = joined.slice(start, end).split('\n');
  const out: Record<string, string> = {};
  for (const line of body) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key || key.startsWith('===')) continue;
    out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// resolveActiveRole
// ---------------------------------------------------------------------------

describe('resolveActiveRole', () => {
  afterEach(() => {
    delete process.env.PODIUM_ROLE;
    vi.restoreAllMocks();
  });

  it('returns the role field from active-role.yaml', () => {
    const root = makeFixtureRoot({ role: 'tutor' });
    try {
      expect(resolveActiveRole(root)).toBe('tutor');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns null when active-role.yaml is missing', () => {
    const root = makeFixtureRoot({ omitActiveRole: true });
    try {
      expect(resolveActiveRole(root)).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('honors PODIUM_ROLE env override', () => {
    const root = makeFixtureRoot({ role: 'assistant' });
    try {
      process.env.PODIUM_ROLE = 'creator';
      expect(resolveActiveRole(root)).toBe('creator');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// listBaseSkillsOnDisk
// ---------------------------------------------------------------------------

describe('listBaseSkillsOnDisk', () => {
  it('returns alphabetized skill folder names', () => {
    const root = makeFixtureRoot({
      baseSkills: ['zebra', 'alpha', 'mango'],
    });
    try {
      expect(listBaseSkillsOnDisk('assistant', root)).toEqual([
        'alpha',
        'mango',
        'zebra',
      ]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns [] when base skills directory is absent', () => {
    const root = makeFixtureRoot({ baseSkills: [] });
    try {
      expect(listBaseSkillsOnDisk('assistant', root)).toEqual([]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// runBootCheck — pure disk reads, easy unit coverage
// ---------------------------------------------------------------------------

describe('runBootCheck', () => {
  it('reports role_unresolved when active-role.yaml is missing', () => {
    const root = makeFixtureRoot({ omitActiveRole: true });
    try {
      const boot = runBootCheck(root);
      expect(boot.reason).toBe('role_unresolved');
      expect(boot.role).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports role_dir_missing when active-role points at an absent role', () => {
    const root = makeFixtureRoot({ role: 'nonexistent' });
    // Remove the role dir we just created, keep the active-role.yaml.
    fs.rmSync(path.join(root, 'roles', 'nonexistent'), { recursive: true });
    try {
      const boot = runBootCheck(root);
      expect(boot.reason).toBe('role_dir_missing');
      expect(boot.roleDir).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports identity_missing when constitution.md is absent', () => {
    const root = makeFixtureRoot({
      role: 'assistant',
      withIdentity: false,
    });
    try {
      const boot = runBootCheck(root);
      expect(boot.reason).toBe('identity_missing');
      expect(boot.roleDir).toBe(true);
      expect(boot.identity).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports invalid_skills when skills_enabled references a missing skill', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate', 'manage-email'],
      skillsEnabled: ['communicate', 'summarize-unicorn'],
    });
    try {
      const boot = runBootCheck(root);
      expect(boot.reason).toBe('invalid_skills');
      expect(boot.skillsValid).toBe(false);
      expect(boot.invalidSkills).toEqual(['summarize-unicorn']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('empty skills_enabled is valid (user picked no base skills)', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      skillsEnabled: [],
    });
    try {
      const boot = runBootCheck(root);
      expect(boot.skillsValid).toBe(true);
      expect(boot.reason).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory absence is NOT a boot failure — boot still passes', () => {
    const root = makeFixtureRoot({ baseSkills: ['communicate'] });
    try {
      const boot = runBootCheck(root);
      expect(boot.reason).toBeNull();
      expect(boot.memory).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// extractMemoryName
// ---------------------------------------------------------------------------

describe('extractMemoryName', () => {
  it('reads top-level name from frontmatter', () => {
    const root = makeFixtureRoot({ withMemory: true, memoryName: 'Guy' });
    try {
      expect(extractMemoryName('assistant', root)).toBe('Guy');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns null when memory file is missing', () => {
    const root = makeFixtureRoot();
    try {
      expect(extractMemoryName('assistant', root)).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns null when name field is missing from frontmatter', () => {
    const root = makeFixtureRoot({
      withMemory: true,
      memoryWithoutName: true,
    });
    try {
      expect(extractMemoryName('assistant', root)).toBeNull();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// responseContainsName
// ---------------------------------------------------------------------------

describe('responseContainsName', () => {
  it('matches case-insensitively', () => {
    expect(responseContainsName('Hello GUY!', 'guy')).toBe(true);
    expect(responseContainsName('hello guy!', 'GUY')).toBe(true);
  });

  it('returns false when name absent', () => {
    expect(responseContainsName('Hello friend!', 'Guy')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(responseContainsName('', 'Guy')).toBe(false);
    expect(responseContainsName('Hello Guy', '')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// runCheck — boot check only
// ---------------------------------------------------------------------------

describe('runCheck (--mode check)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('role dir missing → exit 2, STATUS failed, REASON role_dir_missing', () => {
    const root = makeFixtureRoot({ role: 'gone' });
    fs.rmSync(path.join(root, 'roles', 'gone'), { recursive: true });
    try {
      const logs = captureLogs();
      const code = runCheck({ root });
      expect(code).toBe(2);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('failed');
      expect(block.BOOT_STATUS).toBe('failed');
      expect(block.REASON).toBe('role_dir_missing');
      expect(block.PROBE_STATUS).toBe('not_run');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('invalid skills → exit 2, INVALID_SKILLS populated', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      skillsEnabled: ['communicate', 'ghost'],
    });
    try {
      const logs = captureLogs();
      const code = runCheck({ root });
      expect(code).toBe(2);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('failed');
      expect(block.REASON).toBe('invalid_skills');
      expect(block.INVALID_SKILLS).toBe('ghost');
      expect(block.BOOT_SKILLS_VALID).toBe('false');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory missing → exit 1, STATUS partial, PROBE_STATUS skipped', () => {
    const root = makeFixtureRoot({ baseSkills: ['communicate'] });
    try {
      const logs = captureLogs();
      const code = runCheck({ root });
      expect(code).toBe(1);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.BOOT_STATUS).toBe('success');
      expect(block.BOOT_MEMORY).toBe('false');
      expect(block.PROBE_STATUS).toBe('skipped');
      expect(block.REASON).toBe('memory_not_present');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory present → exit 0, STATUS success', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
    });
    try {
      const logs = captureLogs();
      const code = runCheck({ root });
      expect(code).toBe(0);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('success');
      expect(block.BOOT_MEMORY).toBe('true');
      expect(block.PROBE_STATUS).toBe('skipped');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// runFull — mocked probe runner
// ---------------------------------------------------------------------------

describe('runFull (--mode full) with mocked probe', () => {
  afterEach(() => vi.restoreAllMocks());

  function makeProbe(outcome: Parameters<ProbeRunner>[0] extends never ? never : ReturnType<ProbeRunner>): {
    probe: ProbeRunner;
    called: { count: number; prompt: string | null };
  } {
    const called = { count: 0, prompt: null as string | null };
    const probe: ProbeRunner = (prompt) => {
      called.count += 1;
      called.prompt = prompt;
      return outcome;
    };
    return { probe, called };
  }

  it('boot failure → probe NOT called, STATUS failed', () => {
    const root = makeFixtureRoot({ role: 'ghost' });
    fs.rmSync(path.join(root, 'roles', 'ghost'), { recursive: true });
    try {
      const logs = captureLogs();
      const { probe, called } = makeProbe({
        kind: 'success',
        text: 'ignored',
        latencyMs: 10,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(2);
      expect(called.count).toBe(0);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('failed');
      expect(block.PROBE_STATUS).toBe('not_run');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory missing → probe NOT called, STATUS partial', () => {
    const root = makeFixtureRoot({ baseSkills: ['communicate'] });
    try {
      const logs = captureLogs();
      const { probe, called } = makeProbe({
        kind: 'success',
        text: 'ignored',
        latencyMs: 10,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(1);
      expect(called.count).toBe(0);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.PROBE_STATUS).toBe('skipped');
      expect(block.REASON).toBe('memory_not_present');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory present + probe greets by name → STATUS success, PROBE_PERSONALIZED true', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
      memoryName: 'Guy',
    });
    try {
      const logs = captureLogs();
      const { probe, called } = makeProbe({
        kind: 'success',
        text: 'Hi Guy! I know you want help with v0.2.',
        latencyMs: 2412,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(0);
      expect(called.count).toBe(1);
      expect(called.prompt).toMatch(/greet me by name/i);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('success');
      expect(block.BOOT_STATUS).toBe('success');
      expect(block.PROBE_STATUS).toBe('success');
      expect(block.PROBE_PERSONALIZED).toBe('true');
      expect(block.LATENCY_MS).toBe('2412');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory present + probe reply omits the name → STATUS partial, memory_not_loaded_by_runtime', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
      memoryName: 'Guy',
    });
    try {
      const logs = captureLogs();
      const { probe } = makeProbe({
        kind: 'success',
        text: 'Hello there, friend. How can I help?',
        latencyMs: 1800,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(1);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.PROBE_STATUS).toBe('success');
      expect(block.PROBE_PERSONALIZED).toBe('false');
      expect(block.REASON).toBe('memory_not_loaded_by_runtime');
      expect(block.LATENCY_MS).toBe('1800');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('probe timeout → STATUS partial, PROBE_STATUS timeout', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
      memoryName: 'Guy',
    });
    try {
      const logs = captureLogs();
      const { probe } = makeProbe({ kind: 'timeout', latencyMs: 30_000 });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(1);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.PROBE_STATUS).toBe('timeout');
      expect(block.PROBE_PERSONALIZED).toBe('false');
      expect(block.LATENCY_MS).toBe('30000');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('probe failure → STATUS partial, PROBE_STATUS failed, ERROR populated', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
      memoryName: 'Guy',
    });
    try {
      const logs = captureLogs();
      const { probe } = makeProbe({
        kind: 'failed',
        error: 'spawn npx ENOENT',
        latencyMs: 5,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(1);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.PROBE_STATUS).toBe('failed');
      expect(block.ERROR).toContain('spawn npx ENOENT');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('memory file missing name field → STATUS partial, probe NOT called', () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
      memoryWithoutName: true,
    });
    try {
      const logs = captureLogs();
      const { probe, called } = makeProbe({
        kind: 'success',
        text: 'never',
        latencyMs: 0,
      });
      const code = runFull({ root, probeRunner: probe });
      expect(code).toBe(1);
      expect(called.count).toBe(0);
      const block = parseBlock(logs);
      expect(block.STATUS).toBe('partial');
      expect(block.REASON).toBe('memory_name_missing');
      expect(block.PROBE_STATUS).toBe('skipped');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// run() dispatcher
// ---------------------------------------------------------------------------

describe('run() dispatcher', () => {
  afterEach(() => vi.restoreAllMocks());

  it('bad mode → exit 3, STATUS bad_mode', async () => {
    const logs = captureLogs();
    const code = await run({ mode: 'fly-to-moon' });
    expect(code).toBe(3);
    expect(logs.join('\n')).toContain('STATUS: bad_mode');
  });

  it('empty mode defaults to full (which then fails on the fake root)', async () => {
    // No root supplied, so REPO_ROOT is used. We expect at minimum a block is
    // emitted — the dispatcher didn't crash.
    const logs = captureLogs();
    await run({ mode: '' });
    expect(logs.join('\n')).toContain('=== PODIUM SETUP: VERIFY ===');
  });

  it('routes --mode check through runCheck', async () => {
    const root = makeFixtureRoot({
      baseSkills: ['communicate'],
      withMemory: true,
    });
    try {
      const logs = captureLogs();
      const code = await run({ mode: 'check', root });
      expect(code).toBe(0);
      const block = parseBlock(logs);
      expect(block.MODE).toBe('check');
      expect(block.STATUS).toBe('success');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
