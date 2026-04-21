/**
 * Install step (M8).
 *
 * Commits the machine to a runtime (Docker or native Node) and prepares it.
 * Re-runs must be safe — the step is idempotent:
 *   - Docker path: `docker build` is itself layer-cached.
 *   - Native path: skips `npm install` when node_modules/ already exists.
 *   - active-role.yaml: read-patch-write, never clobbers sibling keys.
 *
 * Modes:
 *   --mode detect
 *     Report what would happen. No side effects, no yaml edits.
 *
 *   --mode install
 *     Do the real work. Build the image (docker) or install deps (native),
 *     then patch active-role.yaml with `runtime: <choice>`. Emits the
 *     INSTALL block.
 *
 *   --mode uninstall
 *     Reverse the install. For docker, remove `podium-agent:latest` if the
 *     image exists. For native, do nothing (node_modules is cheap to
 *     regenerate and we don't own it). Idempotent.
 *
 * Invocation:
 *   npx tsx setup/install.ts --mode detect
 *   npx tsx setup/install.ts --mode install
 *   npx tsx setup/install.ts --mode uninstall
 *
 * Exit codes:
 *   0 — success
 *   2 — install failed (docker build, npm install) — detail in status block
 *   3 — bad arguments (unknown mode, etc.)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { emitStatus } from './status.js';
import {
  isDockerAvailable,
  isDockerRunning,
  resolveRuntime,
  type RuntimeChoice,
} from './runtime.js';

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

/** Default repo root: one level up from `setup/`. */
export const REPO_ROOT = path.resolve(moduleDir(), '..');

const LOG_DIR_NAME = 'logs';
const DOCKER_BUILD_LOG = 'docker-build.log';
const DEFAULT_IMAGE_TAG = 'podium-agent:latest';
const NPM_INSTALL_TIMEOUT_MS = 90_000;

// ---------------------------------------------------------------------------
// active-role.yaml patching (§C3)
// ---------------------------------------------------------------------------

/**
 * Read active-role.yaml into a plain object. Missing file or malformed
 * content → {}. Never throws so that install can proceed on a greenfield
 * machine (the earlier role-select step is the one that owns creation).
 */
export function readActiveRole(root: string = REPO_ROOT): Record<string, unknown> {
  const file = path.join(root, 'agent', 'memory', 'active-role.yaml');
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = parseYaml(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

/**
 * Patch active-role.yaml with `runtime: <choice>`, preserving every other key.
 * Creates the file and its parent directory if they don't exist.
 *
 * Uses spread merge, not `Object.assign` in place, so that `yaml.stringify`
 * keeps the original key order where possible — existing keys stay where
 * they were; `runtime` is appended only on first write.
 *
 * Returns the absolute path written.
 */
export function patchActiveRoleRuntime(
  choice: RuntimeChoice,
  root: string = REPO_ROOT,
): string {
  const dir = path.join(root, 'agent', 'memory');
  const file = path.join(dir, 'active-role.yaml');
  fs.mkdirSync(dir, { recursive: true });
  const current = readActiveRole(root);
  const next: Record<string, unknown> = { ...current, runtime: choice };
  fs.writeFileSync(file, stringifyYaml(next), 'utf-8');
  return file;
}

// ---------------------------------------------------------------------------
// Probes
// ---------------------------------------------------------------------------

/**
 * Does `node_modules/` exist at the repo root? We intentionally don't verify
 * individual deps — `npm install` itself is responsible for reconciling the
 * lockfile against package.json. This is a cheap signal to skip a slow op.
 */
export function nodeModulesPresent(root: string = REPO_ROOT): boolean {
  try {
    const stat = fs.statSync(path.join(root, 'node_modules'));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Look up the on-disk size of an image tag. Returns null if docker isn't
 * available or the image isn't found. Uses `docker image ls --format` so
 * we parse a single line rather than a whole table.
 */
export function dockerImageSize(
  tag: string = DEFAULT_IMAGE_TAG,
): string | null {
  try {
    const out = execFileSync(
      'docker',
      ['image', 'ls', tag, '--format', '{{.Size}}'],
      { encoding: 'utf-8', timeout: 5000 },
    ).trim();
    // Docker prints a blank line when the image is absent rather than erroring.
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Docker build
// ---------------------------------------------------------------------------

interface DockerBuildResult {
  ok: boolean;
  tag: string;
  durationSec: number;
  /** Non-null only on failure; absolute path to a log with the tail. */
  logPath?: string;
  /** Exit status from the build script. */
  exitCode: number;
}

/**
 * Run container/build.sh and capture stdout+stderr. On failure, write the
 * combined log to logs/docker-build.log so the status block can reference it.
 */
export function runDockerBuild(
  root: string = REPO_ROOT,
  tag: string = DEFAULT_IMAGE_TAG,
): DockerBuildResult {
  const script = path.join(root, 'container', 'build.sh');
  const start = Date.now();
  // Derive the tag from "name:tag"; build.sh accepts the tag component only.
  const tagArg = tag.includes(':') ? tag.split(':', 2)[1] : tag;
  const result = spawnSync('bash', [script, tagArg], {
    cwd: root,
    encoding: 'utf-8',
    // Long builds can easily exceed 10 minutes on cold caches; we lean on
    // Docker's own networking timeouts rather than killing a healthy build.
  });
  const durationSec = Math.round((Date.now() - start) / 1000);
  const exitCode = typeof result.status === 'number' ? result.status : 1;
  const ok = exitCode === 0;

  if (!ok) {
    const logDir = path.join(root, LOG_DIR_NAME);
    fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, DOCKER_BUILD_LOG);
    const body =
      `# docker build failed at ${new Date().toISOString()}\n` +
      `# exit: ${exitCode}\n` +
      `# script: ${script}\n` +
      `# tag: ${tag}\n\n` +
      `--- stdout ---\n${result.stdout ?? ''}\n` +
      `--- stderr ---\n${result.stderr ?? ''}\n`;
    fs.writeFileSync(logPath, body, 'utf-8');
    return { ok, tag, durationSec, logPath, exitCode };
  }

  return { ok, tag, durationSec, exitCode };
}

/** Remove the Podium agent image. No-op (success) if it doesn't exist. */
export function removeDockerImage(tag: string = DEFAULT_IMAGE_TAG): {
  removed: boolean;
  existed: boolean;
} {
  const existed = dockerImageSize(tag) !== null;
  if (!existed) return { removed: false, existed: false };
  const res = spawnSync('docker', ['rmi', tag], {
    stdio: 'ignore',
    timeout: 30_000,
  });
  return { removed: res.status === 0, existed: true };
}

// ---------------------------------------------------------------------------
// Native npm install
// ---------------------------------------------------------------------------

interface NpmInstallResult {
  ok: boolean;
  skipped: boolean;
  durationSec: number;
  exitCode: number;
  logPath?: string;
}

/**
 * Run `npm install` at `root`. Skips if node_modules/ already exists. The
 * caller is responsible for deciding whether a skip is acceptable (it always
 * is for the first install; subsequent `--mode install` calls land here).
 */
export function runNpmInstall(root: string = REPO_ROOT): NpmInstallResult {
  if (nodeModulesPresent(root)) {
    return { ok: true, skipped: true, durationSec: 0, exitCode: 0 };
  }
  const start = Date.now();
  const result = spawnSync(
    'npm',
    ['install', '--no-audit', '--no-fund', '--prefer-offline'],
    {
      cwd: root,
      encoding: 'utf-8',
      timeout: NPM_INSTALL_TIMEOUT_MS,
    },
  );
  const durationSec = Math.round((Date.now() - start) / 1000);
  const exitCode = typeof result.status === 'number' ? result.status : 1;
  const ok = exitCode === 0;
  if (!ok) {
    const logDir = path.join(root, LOG_DIR_NAME);
    fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, 'npm-install.log');
    fs.writeFileSync(
      logPath,
      `# npm install failed at ${new Date().toISOString()}\n` +
        `# exit: ${exitCode}\n\n` +
        `--- stdout ---\n${result.stdout ?? ''}\n` +
        `--- stderr ---\n${result.stderr ?? ''}\n`,
      'utf-8',
    );
    return { ok, skipped: false, durationSec, exitCode, logPath };
  }
  return { ok, skipped: false, durationSec, exitCode };
}

// ---------------------------------------------------------------------------
// Mode runners
// ---------------------------------------------------------------------------

/** --mode detect: no side effects; just report the plan. */
export function runDetect(root: string = REPO_ROOT): number {
  const runtime = resolveRuntime();
  const dockerAvailable = isDockerAvailable();
  const dockerRunning = isDockerRunning();
  const nm = nodeModulesPresent(root);

  const fields: Record<string, string | number | boolean> = {
    MODE: 'detect',
    RUNTIME: runtime,
    DOCKER_AVAILABLE: dockerAvailable,
    DOCKER_RUNNING: dockerRunning,
    NODE_MODULES: nm ? 'present' : 'absent',
  };
  if (runtime === 'docker') {
    fields.WOULD_BUILD_IMAGE = 'podium-agent:latest';
  } else {
    fields.WOULD_NPM_INSTALL = !nm;
  }
  fields.STATUS = 'success';
  emitStatus('INSTALL', fields);
  return 0;
}

/** --mode install: do the real work, patch active-role.yaml. */
export function runInstall(root: string = REPO_ROOT): number {
  const runtime = resolveRuntime();

  if (runtime === 'docker') {
    const build = runDockerBuild(root);
    if (!build.ok) {
      emitStatus('INSTALL', {
        MODE: 'install',
        RUNTIME: 'docker',
        IMAGE: build.tag,
        BUILD_DURATION_SEC: build.durationSec,
        EXIT_CODE: build.exitCode,
        LOG: build.logPath
          ? path.relative(root, build.logPath) || build.logPath
          : '',
        STATUS: 'docker_build_failed',
      });
      return 2;
    }
    // Patch active-role.yaml after a successful build so a failed build
    // doesn't falsely advertise `runtime: docker` in persistent state.
    patchActiveRoleRuntime('docker', root);
    const size = dockerImageSize(build.tag) ?? 'unknown';
    emitStatus('INSTALL', {
      MODE: 'install',
      RUNTIME: 'docker',
      IMAGE: build.tag,
      IMAGE_SIZE: size,
      BUILD_DURATION_SEC: build.durationSec,
      STATUS: 'success',
    });
    return 0;
  }

  // native path
  const npm = runNpmInstall(root);
  if (!npm.ok) {
    emitStatus('INSTALL', {
      MODE: 'install',
      RUNTIME: 'native',
      NODE_MODULES: nodeModulesPresent(root) ? 'present' : 'absent',
      NPM_INSTALL_SKIPPED: npm.skipped,
      NPM_DURATION_SEC: npm.durationSec,
      EXIT_CODE: npm.exitCode,
      LOG: npm.logPath ? path.relative(root, npm.logPath) || npm.logPath : '',
      STATUS: 'npm_install_failed',
    });
    return 2;
  }
  patchActiveRoleRuntime('native', root);
  emitStatus('INSTALL', {
    MODE: 'install',
    RUNTIME: 'native',
    NODE_MODULES: 'present',
    NPM_INSTALL_SKIPPED: npm.skipped,
    NPM_DURATION_SEC: npm.durationSec,
    STATUS: 'success',
  });
  return 0;
}

/**
 * --mode uninstall: reverse install side-effects.
 *   - Docker: remove `podium-agent:latest` if present. Idempotent.
 *   - Native: no-op. node_modules is cheap; M12 (podium-uninstall skill)
 *     owns the deep clean.
 *
 * Does NOT touch active-role.yaml — M12 handles that explicitly. We just
 * undo the runtime artifact we created.
 */
export function runUninstall(root: string = REPO_ROOT): number {
  // Runtime for uninstall decisions: prefer the one recorded in
  // active-role.yaml (what we actually installed), not the current
  // environment. This lets uninstall work even if Docker later
  // disappeared from PATH.
  const persisted = readActiveRole(root).runtime;
  const runtime: RuntimeChoice =
    persisted === 'docker' || persisted === 'native'
      ? persisted
      : resolveRuntime();

  if (runtime === 'docker') {
    if (!isDockerAvailable()) {
      emitStatus('INSTALL', {
        MODE: 'uninstall',
        RUNTIME: 'docker',
        DOCKER_AVAILABLE: false,
        IMAGE: DEFAULT_IMAGE_TAG,
        NOTE: 'docker not on PATH; nothing to remove',
        STATUS: 'success',
      });
      return 0;
    }
    const { removed, existed } = removeDockerImage(DEFAULT_IMAGE_TAG);
    emitStatus('INSTALL', {
      MODE: 'uninstall',
      RUNTIME: 'docker',
      IMAGE: DEFAULT_IMAGE_TAG,
      IMAGE_EXISTED: existed,
      IMAGE_REMOVED: removed,
      STATUS: 'success',
    });
    return 0;
  }

  // native: nothing to do.
  emitStatus('INSTALL', {
    MODE: 'uninstall',
    RUNTIME: 'native',
    NOTE: 'native install has no runtime artifact; /podium-uninstall clears node_modules if desired',
    STATUS: 'success',
  });
  return 0;
}

// ---------------------------------------------------------------------------
// Step runner entrypoint (§C2)
// ---------------------------------------------------------------------------

export interface InstallRunArgs {
  mode?: string;
  root?: string;
}

export async function run(args: InstallRunArgs = {}): Promise<number> {
  const mode = (args.mode ?? '').trim();
  const root = args.root ?? REPO_ROOT;

  switch (mode) {
    case 'detect':
      return runDetect(root);
    case 'install':
      return runInstall(root);
    case 'uninstall':
      return runUninstall(root);
    case '':
      emitStatus('INSTALL', {
        STATUS: 'mode_missing',
        HINT: 'Pass --mode detect|install|uninstall.',
      });
      return 3;
    default:
      emitStatus('INSTALL', {
        MODE: mode,
        STATUS: 'bad_mode',
        HINT: 'Use --mode detect, install, or uninstall.',
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
  console.log('usage: install --mode <detect|install|uninstall>');
  console.log('');
  console.log('Modes:');
  console.log('  detect     Report which runtime would be used. No side effects.');
  console.log('  install    Build docker image OR run npm install; patch active-role.yaml.');
  console.log('  uninstall  Remove docker image (if applicable). Idempotent.');
  console.log('');
  console.log('Environment:');
  console.log('  PODIUM_RUNTIME=docker|native   Force a runtime choice.');
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
    return path.resolve(entry).endsWith('install.ts');
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
