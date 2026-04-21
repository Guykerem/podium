/**
 * Structured status block output for setup steps.
 * Each step emits a block that the SKILL.md LLM can parse.
 *
 * Format (see spec/podium-setup-v0.2-decomposition.md §C1):
 *   === PODIUM SETUP: <STEP_NAME> ===
 *   KEY: value
 *   ...
 *   STATUS: success|<failure_code>
 *   === END ===
 */

export function emitStatus(
  step: string,
  fields: Record<string, string | number | boolean>,
): void {
  const lines = [`=== PODIUM SETUP: ${step} ===`];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push('=== END ===');
  console.log(lines.join('\n'));
}

// When invoked directly (`npx tsx setup/status.ts`), emit a minimal
// self-check block. Useful for M1 smoke verification and for step modules
// that are still being ported — proves the emitter is importable and runs.
import { fileURLToPath } from 'url';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  emitStatus('SELFCHECK', {
    MODULE: 'setup/status.ts',
    IMPORTABLE: true,
    STATUS: 'success',
  });
}
