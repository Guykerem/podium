/**
 * Channel selection step (M6).
 *
 * Modes:
 *   --mode list
 *     Emit a CHANNEL status block listing the channel options this installer
 *     knows how to configure. CLI is always available and always on. Telegram
 *     is opt-in and, if selected, requires `/add-telegram` to complete the
 *     token handshake.
 *
 *   --mode commit --channels "cli,telegram"
 *     Update `agent/memory/active-role.yaml` with a `channels: [...]` field
 *     (creating it if absent), then emit a CHANNEL status block summarizing
 *     the committed selection. Telegram's `enabled` flag in
 *     `runtime/channels.yaml` is left as-is — `/add-telegram` flips it once
 *     the bot token is verified end-to-end.
 *
 * Interface contract: see spec/podium-setup-v0.2-decomposition.md §C1, §C2, §M6.
 *
 * Exit codes:
 *   0 — success
 *   2 — bad arguments (unknown mode, missing --channels on commit, unknown channel)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { emitStatus } from './status.js';

/** Channels this installer knows how to configure. */
export const AVAILABLE_CHANNELS = ['cli', 'telegram'] as const;
export type ChannelName = (typeof AVAILABLE_CHANNELS)[number];

export function isKnownChannel(name: string): name is ChannelName {
  return (AVAILABLE_CHANNELS as readonly string[]).includes(name);
}

/** Root of the repo when this module runs from `setup/channel.ts`. */
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

export interface ChannelRunArgs {
  mode?: string;
  channels?: string;
  root?: string;
}

interface ParsedArgs {
  mode: string | null;
  channels: string | null;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const out: ParsedArgs = { mode: null, channels: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--mode') {
      out.mode = argv[i + 1] ?? '';
      i += 1;
    } else if (arg.startsWith('--mode=')) {
      out.mode = arg.slice('--mode='.length);
    } else if (arg === '--channels') {
      out.channels = argv[i + 1] ?? '';
      i += 1;
    } else if (arg.startsWith('--channels=')) {
      out.channels = arg.slice('--channels='.length);
    } else if (arg === '-h' || arg === '--help') {
      out.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function printHelp(): void {
  console.log('usage: channel --mode <list|commit> [--channels "cli,telegram"]');
  console.log('');
  console.log('Modes:');
  console.log('  list    Emit available channels as a CHANNEL status block.');
  console.log('  commit  Write channels: [...] into agent/memory/active-role.yaml.');
  console.log('');
  console.log('Channels (comma-separated):');
  console.log('  cli        Always on; the interactive terminal.');
  console.log('  telegram   Opt-in; requires /add-telegram to finish the handshake.');
}

function parseChannelList(raw: string): { channels: ChannelName[]; unknown: string[] } {
  const channels: ChannelName[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (seen.has(part)) continue;
    seen.add(part);
    if (isKnownChannel(part)) channels.push(part);
    else unknown.push(part);
  }
  return { channels, unknown };
}

/**
 * Read active-role.yaml if present. Return an empty object if missing/unreadable.
 */
export function readActiveRole(root: string): Record<string, unknown> {
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
 * Write active-role.yaml with a channels: [...] field, preserving any other keys.
 * Creates parent dirs if needed.
 */
export function writeActiveRoleChannels(root: string, channels: ChannelName[]): string {
  const dir = path.join(root, 'agent', 'memory');
  const file = path.join(dir, 'active-role.yaml');
  fs.mkdirSync(dir, { recursive: true });
  const current = readActiveRole(root);
  const next = { ...current, channels };
  const yaml = stringifyYaml(next);
  fs.writeFileSync(file, yaml, 'utf-8');
  return file;
}

/**
 * Run the step. See the module header for mode semantics.
 * Always exits 0 on a well-formed request; uses exit code 2 for malformed args.
 */
export async function run(args: ChannelRunArgs = {}): Promise<number> {
  const root = args.root ?? REPO_ROOT;
  const mode = (args.mode ?? '').trim();

  if (mode === 'list') {
    emitStatus('CHANNEL', {
      MODE: 'list',
      AVAILABLE: AVAILABLE_CHANNELS.join(','),
      CLI_ALWAYS_ON: true,
      TELEGRAM_OPT_IN: true,
      TELEGRAM_REQUIRES_SKILL: '/add-telegram',
      STATUS: 'success',
    });
    return 0;
  }

  if (mode === 'commit') {
    const raw = (args.channels ?? '').trim();
    if (!raw) {
      emitStatus('CHANNEL', {
        MODE: 'commit',
        STATUS: 'channels_missing',
        HINT: 'Pass --channels "cli" or --channels "cli,telegram".',
      });
      return 2;
    }
    const { channels, unknown } = parseChannelList(raw);
    if (unknown.length > 0) {
      emitStatus('CHANNEL', {
        MODE: 'commit',
        STATUS: 'unknown_channel',
        UNKNOWN: unknown.join(','),
        AVAILABLE: AVAILABLE_CHANNELS.join(','),
      });
      return 2;
    }
    // CLI is always on; ensure it is included even if user omitted it.
    if (!channels.includes('cli')) channels.unshift('cli');

    const activeRolePath = writeActiveRoleChannels(root, channels);
    const telegramSelected = channels.includes('telegram');
    const fields: Record<string, string | number | boolean> = {
      MODE: 'commit',
      CHANNELS: channels.join(','),
      ACTIVE_ROLE_PATH: path.relative(root, activeRolePath) || activeRolePath,
      STATUS: 'success',
    };
    if (telegramSelected) {
      fields.TELEGRAM_PENDING = true;
      fields.NEXT = 'Run /add-telegram to collect the bot token and verify.';
    }
    emitStatus('CHANNEL', fields);
    return 0;
  }

  emitStatus('CHANNEL', {
    MODE: mode || '(missing)',
    STATUS: 'bad_mode',
    HINT: 'Use --mode list or --mode commit.',
  });
  return 2;
}

async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error((err as Error).message);
    printHelp();
    return 2;
  }
  if (args.help) {
    printHelp();
    return 0;
  }
  return run({
    mode: args.mode ?? undefined,
    channels: args.channels ?? undefined,
  });
}

// Run when invoked as `tsx setup/channel.ts` (not when imported by tests).
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
    return path.resolve(entry).endsWith('channel.ts');
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
