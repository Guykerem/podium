/**
 * Smoke test: exercise the real install.ts run() against the actual repo root.
 *
 * This is NOT a unit test of install.ts — the unit tests live in install.test.ts.
 * This asserts that, on this machine, the install step produces the blocks the
 * M8 spec promises, and that running it twice is idempotent (runs successfully
 * and leaves active-role.yaml in a stable state).
 *
 * Preconditions for this test to run as native:
 *   - Docker not available (this box) → runtime resolves to native.
 *   - node_modules present (vitest is installed from it).
 *
 * We capture whatever active-role.yaml looked like before the test and
 * restore it afterward so the test suite doesn't pollute real project state.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';

import { run, REPO_ROOT } from '../install.js';
import { resolveRuntime } from '../runtime.js';

const ACTIVE = path.join(REPO_ROOT, 'agent', 'memory', 'active-role.yaml');

describe('install.ts smoke (real repo root)', () => {
  let savedYaml: string | null = null;

  beforeAll(() => {
    // Preserve current active-role.yaml so we can restore after the test.
    if (fs.existsSync(ACTIVE)) savedYaml = fs.readFileSync(ACTIVE, 'utf-8');
  });

  afterAll(() => {
    if (savedYaml !== null) fs.writeFileSync(ACTIVE, savedYaml, 'utf-8');
  });

  it('detect emits a well-formed INSTALL block', async () => {
    const logs: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    const code = await run({ mode: 'detect' });
    expect(code).toBe(0);
    const block = logs.join('\n');
    expect(block).toMatch(/^=== PODIUM SETUP: INSTALL ===$/m);
    expect(block).toMatch(/^MODE: detect$/m);
    expect(block).toMatch(/^RUNTIME: (docker|native)$/m);
    expect(block).toMatch(/^STATUS: success$/m);
    expect(block).toMatch(/^=== END ===$/m);
    vi.restoreAllMocks();
  });

  // The real install is only exercised when the local runtime is native AND
  // node_modules already exists — otherwise we'd fire a real `npm install`
  // or `docker build`, which is out of scope for a unit-test smoke.
  const guardedIt =
    resolveRuntime() === 'native' &&
    fs.existsSync(path.join(REPO_ROOT, 'node_modules'))
      ? it
      : it.skip;

  guardedIt('install (native, node_modules present) is idempotent', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const first = await run({ mode: 'install' });
    expect(first).toBe(0);
    const yaml1 = fs.readFileSync(ACTIVE, 'utf-8');
    const parsed1 = parseYaml(yaml1) as Record<string, unknown>;
    expect(parsed1.runtime).toBe('native');

    const second = await run({ mode: 'install' });
    expect(second).toBe(0);
    const yaml2 = fs.readFileSync(ACTIVE, 'utf-8');
    expect(yaml2).toBe(yaml1);
    vi.restoreAllMocks();
  });
});
