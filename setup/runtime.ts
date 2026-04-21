/**
 * Runtime selector (M8).
 *
 * Decides whether the Podium agent should run in Docker or as a native
 * Node process. Consumed by setup/install.ts and, later, by runtime/engine
 * dispatch once we have a runtime-aware invoker.
 *
 * Precedence (documented in spec/podium-setup-v0.2-decomposition.md §M8):
 *   1. Explicit override: PODIUM_RUNTIME=docker|native
 *   2. Docker daemon responsive: `docker info` exit 0 within a short timeout
 *   3. Fall back to native
 *
 * The discrete probes (`isDockerAvailable`, `isDockerRunning`) exist so
 * tests and status blocks can report the two signals independently — a
 * machine that has `docker` on PATH but no daemon running is a common
 * real-world failure mode on laptops, and we want to surface it precisely
 * rather than collapsing "not running" into "not installed."
 */
import { execFileSync, spawnSync } from 'node:child_process';

export type RuntimeChoice = 'docker' | 'native';

/** Timeout for `docker info` probing, in milliseconds. */
const DOCKER_INFO_TIMEOUT_MS = 3000;

/**
 * Is the `docker` binary on PATH? Doesn't care whether the daemon is up.
 * Uses `spawnSync` rather than shelling through a string so we don't have
 * to worry about cross-platform quoting.
 */
export function isDockerAvailable(): boolean {
  const probe = spawnSync('docker', ['--version'], {
    stdio: 'ignore',
    timeout: 2000,
  });
  return probe.status === 0;
}

/**
 * Is the Docker daemon actually responding? We use `docker info` because it
 * requires a live daemon (unlike `--version` which only proves the CLI is
 * installed). Exit 0 within `DOCKER_INFO_TIMEOUT_MS` → true.
 *
 * This returns false if `docker` isn't installed at all — the probe errors
 * with ENOENT and we treat that the same as "no daemon."
 */
export function isDockerRunning(): boolean {
  try {
    execFileSync('docker', ['info'], {
      stdio: 'ignore',
      timeout: DOCKER_INFO_TIMEOUT_MS,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the runtime choice. See module header for precedence rules.
 *
 * PODIUM_RUNTIME accepts `docker` or `native` (case-insensitive, trimmed).
 * Any other value is ignored and we fall through to auto-detection.
 */
export function resolveRuntime(): RuntimeChoice {
  const override = (process.env.PODIUM_RUNTIME ?? '').trim().toLowerCase();
  if (override === 'docker' || override === 'native') {
    return override;
  }
  if (isDockerRunning()) return 'docker';
  return 'native';
}
