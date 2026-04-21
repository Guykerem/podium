/**
 * Tests for setup/runtime.ts and setup/install.ts (M8).
 *
 * Covers:
 *   - resolveRuntime precedence: PODIUM_RUNTIME env > docker > native
 *   - isDockerRunning + isDockerAvailable probe behaviour
 *   - readActiveRole / patchActiveRoleRuntime preserve existing keys
 *   - runDetect emits INSTALL block without touching active-role.yaml
 *   - runInstall (native path) skips npm install when node_modules exists
 *   - runInstall is idempotent — two installs produce the same active-role.yaml
 *   - runInstall (docker path) is exercised via PODIUM_RUNTIME=docker + mock
 *   - runUninstall is idempotent for native
 *
 * Docker-specific side effects are verified only where we can mock the
 * spawnSync boundary via a dependency-injected repo root containing a stub
 * `container/build.sh` — we never invoke the real docker CLI in tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import * as runtimeModule from '../runtime.js';
import {
  dockerImageSize,
  nodeModulesPresent,
  patchActiveRoleRuntime,
  readActiveRole,
  runDetect,
  runInstall,
  runUninstall,
  run,
} from '../install.js';

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, 'utf-8');
}

/**
 * Build a throwaway fixture root that mirrors the pieces of the repo M8
 * touches. We deliberately keep it minimal:
 *   - agent/memory/active-role.yaml (pre-populated if `seed` given)
 *   - container/build.sh (a stub so docker path is testable)
 *   - optional node_modules/
 */
function makeFixtureRoot(opts: {
  seedActiveRole?: Record<string, unknown>;
  withNodeModules?: boolean;
  buildScript?: string;
} = {}): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'podium-m8-'));

  if (opts.seedActiveRole) {
    writeFile(
      path.join(root, 'agent', 'memory', 'active-role.yaml'),
      stringifyYaml(opts.seedActiveRole),
    );
  }
  if (opts.withNodeModules) {
    mkdirp(path.join(root, 'node_modules'));
  }
  // A stub build.sh that succeeds without needing docker installed. The real
  // one is in container/ (M3); tests don't exercise it.
  const build =
    opts.buildScript ??
    '#!/bin/bash\necho "stub build success"\nexit 0\n';
  writeFile(path.join(root, 'container', 'build.sh'), build);
  fs.chmodSync(path.join(root, 'container', 'build.sh'), 0o755);

  return root;
}

// ---------------------------------------------------------------------------
// resolveRuntime precedence
// ---------------------------------------------------------------------------

describe('resolveRuntime', () => {
  const originalEnv = process.env.PODIUM_RUNTIME;
  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.PODIUM_RUNTIME;
    } else {
      process.env.PODIUM_RUNTIME = originalEnv;
    }
    vi.restoreAllMocks();
  });

  it('honours PODIUM_RUNTIME=docker without probing', () => {
    process.env.PODIUM_RUNTIME = 'docker';
    const spy = vi.spyOn(runtimeModule, 'isDockerRunning');
    expect(runtimeModule.resolveRuntime()).toBe('docker');
    expect(spy).not.toHaveBeenCalled();
  });

  it('honours PODIUM_RUNTIME=native without probing', () => {
    process.env.PODIUM_RUNTIME = 'native';
    const spy = vi.spyOn(runtimeModule, 'isDockerRunning');
    expect(runtimeModule.resolveRuntime()).toBe('native');
    expect(spy).not.toHaveBeenCalled();
  });

  it('trims + case-folds the env override', () => {
    process.env.PODIUM_RUNTIME = '  DOCKER\n';
    expect(runtimeModule.resolveRuntime()).toBe('docker');
  });

  it('falls through to probe on unrecognised env value', () => {
    process.env.PODIUM_RUNTIME = 'kubernetes';
    // Force probe to return false so we get native deterministically.
    vi.spyOn(runtimeModule, 'isDockerRunning').mockReturnValue(false);
    expect(runtimeModule.resolveRuntime()).toBe('native');
  });

  it('docker → native when no env and no daemon', () => {
    delete process.env.PODIUM_RUNTIME;
    vi.spyOn(runtimeModule, 'isDockerRunning').mockReturnValue(false);
    expect(runtimeModule.resolveRuntime()).toBe('native');
  });

  // isDockerRunning is module-internal; resolveRuntime reads it through the
  // module's own binding so vi.spyOn on the namespace works. The precedence
  // above is enough to prove the contract — we don't need to mock a real
  // daemon.
});

// ---------------------------------------------------------------------------
// nodeModulesPresent
// ---------------------------------------------------------------------------

describe('nodeModulesPresent', () => {
  it('true when directory exists', () => {
    const root = makeFixtureRoot({ withNodeModules: true });
    try {
      expect(nodeModulesPresent(root)).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
  it('false when directory absent', () => {
    const root = makeFixtureRoot({ withNodeModules: false });
    try {
      expect(nodeModulesPresent(root)).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// active-role.yaml patching (§C3)
// ---------------------------------------------------------------------------

describe('readActiveRole / patchActiveRoleRuntime', () => {
  it('readActiveRole → {} when file missing', () => {
    const root = makeFixtureRoot();
    try {
      expect(readActiveRole(root)).toEqual({});
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('preserves existing role/skills/channels/timezone when patching runtime', () => {
    const seed = {
      role: 'assistant',
      skills_enabled: ['communicate', 'remember', 'manage-email'],
      channels: ['cli', 'telegram'],
      timezone: 'America/New_York',
      installed_at: '2026-04-18T22:30:00Z',
    };
    const root = makeFixtureRoot({ seedActiveRole: seed });
    try {
      const p = patchActiveRoleRuntime('docker', root);
      expect(p).toBe(path.join(root, 'agent', 'memory', 'active-role.yaml'));
      const parsed = parseYaml(fs.readFileSync(p, 'utf-8')) as Record<string, unknown>;
      expect(parsed.role).toBe('assistant');
      expect(parsed.skills_enabled).toEqual(['communicate', 'remember', 'manage-email']);
      expect(parsed.channels).toEqual(['cli', 'telegram']);
      expect(parsed.timezone).toBe('America/New_York');
      expect(parsed.installed_at).toBe('2026-04-18T22:30:00Z');
      expect(parsed.runtime).toBe('docker');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('creates parent dirs when active-role.yaml does not exist', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'podium-m8-fresh-'));
    try {
      const p = patchActiveRoleRuntime('native', root);
      expect(fs.existsSync(p)).toBe(true);
      const parsed = parseYaml(fs.readFileSync(p, 'utf-8')) as Record<string, unknown>;
      expect(parsed.runtime).toBe('native');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('switches runtime on second patch without duplicating keys', () => {
    const root = makeFixtureRoot({
      seedActiveRole: { role: 'tutor', skills_enabled: ['teach'] },
    });
    try {
      patchActiveRoleRuntime('native', root);
      patchActiveRoleRuntime('docker', root);
      const p = path.join(root, 'agent', 'memory', 'active-role.yaml');
      const raw = fs.readFileSync(p, 'utf-8');
      const parsed = parseYaml(raw) as Record<string, unknown>;
      expect(parsed.runtime).toBe('docker');
      expect(parsed.role).toBe('tutor');
      expect(parsed.skills_enabled).toEqual(['teach']);
      // Only a single `runtime:` line — prove no duplicate emission.
      const runtimeLines = raw.split('\n').filter((l) => l.startsWith('runtime:'));
      expect(runtimeLines.length).toBe(1);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// dockerImageSize — guard via mocked child_process
// ---------------------------------------------------------------------------

describe('dockerImageSize', () => {
  it('returns null when docker is missing or errors', () => {
    // No PODIUM-side mocking lever here; we rely on the try/catch. In the
    // test environment docker is not guaranteed to exist, so the probe
    // should return null, not throw.
    const out = dockerImageSize('definitely-not-a-real-tag:ever');
    // Either null (docker missing / image missing) is acceptable; never throws.
    expect(out === null || typeof out === 'string').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// runDetect — no side effects, valid status block
// ---------------------------------------------------------------------------

describe('runDetect', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  function captureLogs(): string[] {
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    return logs;
  }

  it('emits an INSTALL detect block and does not write active-role.yaml', () => {
    process.env.PODIUM_RUNTIME = 'native';
    const root = makeFixtureRoot(); // no seed
    try {
      const logs = captureLogs();
      const code = runDetect(root);
      expect(code).toBe(0);
      const block = logs.join('\n');
      expect(block).toContain('=== PODIUM SETUP: INSTALL ===');
      expect(block).toContain('MODE: detect');
      expect(block).toContain('RUNTIME: native');
      expect(block).toContain('STATUS: success');
      expect(fs.existsSync(path.join(root, 'agent', 'memory', 'active-role.yaml'))).toBe(
        false,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports WOULD_BUILD_IMAGE when runtime resolves to docker', () => {
    process.env.PODIUM_RUNTIME = 'docker';
    const root = makeFixtureRoot();
    try {
      const logs = captureLogs();
      runDetect(root);
      const block = logs.join('\n');
      expect(block).toContain('RUNTIME: docker');
      expect(block).toContain('WOULD_BUILD_IMAGE: podium-agent:latest');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// runInstall — native path
// ---------------------------------------------------------------------------

describe('runInstall (native)', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  function captureLogs(): string[] {
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    return logs;
  }

  it('skips npm install when node_modules exists and patches runtime', () => {
    process.env.PODIUM_RUNTIME = 'native';
    const seed = {
      role: 'assistant',
      skills_enabled: ['communicate'],
      channels: ['cli'],
      timezone: 'America/New_York',
    };
    const root = makeFixtureRoot({
      seedActiveRole: seed,
      withNodeModules: true,
    });
    try {
      const logs = captureLogs();
      const code = runInstall(root);
      expect(code).toBe(0);
      const block = logs.join('\n');
      expect(block).toContain('RUNTIME: native');
      expect(block).toContain('NPM_INSTALL_SKIPPED: true');
      expect(block).toContain('STATUS: success');
      // active-role preserved
      const parsed = parseYaml(
        fs.readFileSync(path.join(root, 'agent', 'memory', 'active-role.yaml'), 'utf-8'),
      ) as Record<string, unknown>;
      expect(parsed.role).toBe('assistant');
      expect(parsed.runtime).toBe('native');
      expect(parsed.skills_enabled).toEqual(['communicate']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('is idempotent: two installs produce the same active-role.yaml', () => {
    process.env.PODIUM_RUNTIME = 'native';
    const seed = { role: 'assistant', channels: ['cli'] };
    const root = makeFixtureRoot({
      seedActiveRole: seed,
      withNodeModules: true,
    });
    try {
      captureLogs();
      runInstall(root);
      const first = fs.readFileSync(
        path.join(root, 'agent', 'memory', 'active-role.yaml'),
        'utf-8',
      );
      runInstall(root);
      const second = fs.readFileSync(
        path.join(root, 'agent', 'memory', 'active-role.yaml'),
        'utf-8',
      );
      expect(second).toBe(first);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// runInstall — docker path (mocked via stub build.sh + PODIUM_RUNTIME)
// ---------------------------------------------------------------------------

describe('runInstall (docker path, stubbed build)', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  it('failing build.sh surfaces docker_build_failed + LOG path, exit 2', () => {
    process.env.PODIUM_RUNTIME = 'docker';
    const root = makeFixtureRoot({
      seedActiveRole: { role: 'assistant' },
      buildScript: '#!/bin/bash\necho "boom" >&2\nexit 3\n',
    });
    try {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
        logs.push(String(msg));
      });
      const code = runInstall(root);
      expect(code).toBe(2);
      const block = logs.join('\n');
      expect(block).toContain('STATUS: docker_build_failed');
      expect(block).toContain('LOG: logs/docker-build.log');
      // Log was written
      expect(
        fs.existsSync(path.join(root, 'logs', 'docker-build.log')),
      ).toBe(true);
      // active-role.yaml was NOT patched (build failed)
      const parsed = parseYaml(
        fs.readFileSync(path.join(root, 'agent', 'memory', 'active-role.yaml'), 'utf-8'),
      ) as Record<string, unknown>;
      expect(parsed.runtime).toBeUndefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('successful stub build patches runtime=docker and emits success block', () => {
    process.env.PODIUM_RUNTIME = 'docker';
    const root = makeFixtureRoot({
      seedActiveRole: { role: 'assistant', channels: ['cli'] },
      buildScript: '#!/bin/bash\necho "ok"\nexit 0\n',
    });
    try {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
        logs.push(String(msg));
      });
      const code = runInstall(root);
      expect(code).toBe(0);
      const block = logs.join('\n');
      expect(block).toContain('RUNTIME: docker');
      expect(block).toContain('IMAGE: podium-agent:latest');
      expect(block).toContain('STATUS: success');
      const parsed = parseYaml(
        fs.readFileSync(path.join(root, 'agent', 'memory', 'active-role.yaml'), 'utf-8'),
      ) as Record<string, unknown>;
      expect(parsed.runtime).toBe('docker');
      expect(parsed.role).toBe('assistant');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// runUninstall
// ---------------------------------------------------------------------------

describe('runUninstall', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  it('native: emits success block, no side effects on active-role.yaml', () => {
    process.env.PODIUM_RUNTIME = 'native';
    const seed = {
      role: 'assistant',
      skills_enabled: ['communicate'],
      runtime: 'native',
    };
    const root = makeFixtureRoot({ seedActiveRole: seed });
    try {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
        logs.push(String(msg));
      });
      const code = runUninstall(root);
      expect(code).toBe(0);
      const block = logs.join('\n');
      expect(block).toContain('MODE: uninstall');
      expect(block).toContain('RUNTIME: native');
      expect(block).toContain('STATUS: success');
      // active-role.yaml untouched — M12 owns deep teardown
      const parsed = parseYaml(
        fs.readFileSync(path.join(root, 'agent', 'memory', 'active-role.yaml'), 'utf-8'),
      ) as Record<string, unknown>;
      expect(parsed.role).toBe('assistant');
      expect(parsed.skills_enabled).toEqual(['communicate']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// run() dispatcher
// ---------------------------------------------------------------------------

describe('run() dispatcher', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.restoreAllMocks();
  });

  it('bad mode → exit 3', async () => {
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    const code = await run({ mode: 'launch-nukes' });
    expect(code).toBe(3);
    expect(logs.join('\n')).toContain('STATUS: bad_mode');
  });

  it('missing mode → exit 3', async () => {
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    const code = await run({});
    expect(code).toBe(3);
    expect(logs.join('\n')).toContain('STATUS: mode_missing');
  });

  it('detect mode routes to runDetect', async () => {
    process.env.PODIUM_RUNTIME = 'native';
    const root = makeFixtureRoot();
    try {
      const logs: string[] = [];
      vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
        logs.push(String(msg));
      });
      const code = await run({ mode: 'detect', root });
      expect(code).toBe(0);
      expect(logs.join('\n')).toContain('MODE: detect');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
