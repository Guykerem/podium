/**
 * Step: service — Install/uninstall/describe the background service that
 * will host v0.3's scheduler executor.
 *
 * Forked and trimmed from NanoClaw's setup/service.ts. Intentional deltas
 * vs. the upstream:
 *   1. Does NOT build anything (no `npm run build` — Podium runs via tsx).
 *   2. Does NOT load/start the service. v0.2 writes the unit file only;
 *      v0.3's scheduler module is responsible for activation.
 *   3. Supports a dedicated --mode uninstall for clean rollback (NanoClaw
 *      has no reversal path).
 *   4. Opt-in at the setup-flow layer (--with-service flag upstream);
 *      this module itself accepts --mode noop so callers can still emit
 *      a SERVICE status block for detection without side effects.
 *
 * Modes:
 *   list      — detect-only; describe what `install` would do. No writes.
 *   install   — write plist/unit to the conventional location. Never loads.
 *   uninstall — remove the plist/unit if present. Idempotent.
 *   noop      — detect only; emit SERVICE block with no side effects.
 *                (Default for v0.2's default setup flow.)
 *
 * Invocation:
 *   npx tsx setup/service.ts --mode list
 *   npx tsx setup/service.ts --mode install
 *   npx tsx setup/service.ts --mode uninstall
 *   npx tsx setup/service.ts --mode noop
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getPlatform,
  getServiceManager,
  hasSystemd,
  isWSL,
  type Platform,
  type ServiceManager,
} from "./platform.js";
import { emitStatus } from "./status.js";

export type ServiceMode = "list" | "install" | "uninstall" | "noop";

const LAUNCHD_LABEL = "com.podium.agent";
const SYSTEMD_UNIT_NAME = "podium.service";

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the Podium repo root. Preference order:
 *   1. PODIUM_REPO_ROOT env var (explicit override)
 *   2. `git rev-parse --show-toplevel` from cwd
 *   3. cwd as a last resort
 */
export function resolveRepoRoot(cwd: string = process.cwd()): string {
  const envRoot = process.env.PODIUM_REPO_ROOT;
  if (envRoot && envRoot.length > 0) return envRoot;
  try {
    const out = execSync("git rev-parse --show-toplevel", {
      cwd,
      encoding: "utf-8",
    }).trim();
    if (out.length > 0) return out;
  } catch {
    // fall through
  }
  return cwd;
}

/**
 * Resolve the on-disk location of the plist / unit file for the current
 * platform. Returns null if the current platform has no supported service
 * manager (Linux without systemd, unknown OS).
 */
export function resolveServiceFile(
  platform: Platform,
  serviceManager: ServiceManager,
  homeDir: string = os.homedir(),
): string | null {
  if (platform === "macos" && serviceManager === "launchd") {
    return path.join(
      homeDir,
      "Library",
      "LaunchAgents",
      `${LAUNCHD_LABEL}.plist`,
    );
  }
  if (platform === "linux" && serviceManager === "systemd") {
    return path.join(
      homeDir,
      ".config",
      "systemd",
      "user",
      SYSTEMD_UNIT_NAME,
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Service definitions
// ---------------------------------------------------------------------------

/**
 * Render the launchd plist with PODIUM_REPO_ROOT substituted.
 * v0.2 intentionally sets RunAtLoad=false and KeepAlive=false so the stub
 * scheduler isn't woken on every install.
 */
export function renderLaunchdPlist(repoRoot: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key><string>${LAUNCHD_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/env</string>
      <string>npx</string>
      <string>tsx</string>
      <string>runtime/scheduler.ts</string>
    </array>
    <key>WorkingDirectory</key><string>${repoRoot}</string>
    <key>RunAtLoad</key><false/>
    <key>KeepAlive</key><false/>
    <key>StandardOutPath</key><string>${repoRoot}/logs/scheduler.out.log</string>
    <key>StandardErrorPath</key><string>${repoRoot}/logs/scheduler.err.log</string>
  </dict>
</plist>
`;
}

/**
 * Render the systemd user unit with PODIUM_REPO_ROOT substituted.
 */
export function renderSystemdUnit(repoRoot: string): string {
  return `[Unit]
Description=Podium Agent Scheduler
After=network.target

[Service]
Type=simple
WorkingDirectory=${repoRoot}
ExecStart=/usr/bin/env npx tsx runtime/scheduler.ts
Restart=on-failure
StandardOutput=append:${repoRoot}/logs/scheduler.out.log
StandardError=append:${repoRoot}/logs/scheduler.err.log

[Install]
WantedBy=default.target
`;
}

// ---------------------------------------------------------------------------
// Mode handlers
// ---------------------------------------------------------------------------

interface DetectionResult {
  platform: Platform;
  serviceManager: ServiceManager;
  serviceFile: string | null;
  repoRoot: string;
  wsl: boolean;
}

function detect(): DetectionResult {
  const platform = getPlatform();
  const serviceManager = getServiceManager();
  const serviceFile = resolveServiceFile(platform, serviceManager);
  const repoRoot = resolveRepoRoot();
  return {
    platform,
    serviceManager,
    serviceFile,
    repoRoot,
    wsl: isWSL(),
  };
}

function serviceLoaded(
  platform: Platform,
  serviceManager: ServiceManager,
): boolean {
  // v0.2 never loads the service; this helper exists so the block stays
  // faithful to the spec's SERVICE_LOADED field once v0.3 wires activation.
  try {
    if (platform === "macos" && serviceManager === "launchd") {
      const out = execSync("launchctl list", { encoding: "utf-8" });
      return out.includes(LAUNCHD_LABEL);
    }
    if (platform === "linux" && serviceManager === "systemd") {
      execSync(`systemctl --user is-active ${SYSTEMD_UNIT_NAME}`, {
        stdio: "ignore",
      });
      return true;
    }
  } catch {
    // not loaded / unavailable
  }
  return false;
}

function runList(d: DetectionResult): number {
  const fields: Record<string, string | number | boolean> = {
    MODE: "list",
    PLATFORM: d.platform,
    SERVICE_MANAGER: d.serviceManager,
    SERVICE_FILE: d.serviceFile ?? "(unsupported)",
    WOULD_WRITE: d.serviceFile !== null,
    REPO_ROOT: d.repoRoot,
  };
  if (d.wsl) fields.WSL = true;
  if (d.serviceFile) fields.EXISTS = fs.existsSync(d.serviceFile);
  fields.STATUS = "success";
  emitStatus("SERVICE", fields);
  return 0;
}

function runInstall(d: DetectionResult): number {
  // Gracefully handle "no service manager available" (e.g. non-systemd WSL).
  if (d.serviceFile === null) {
    emitStatus("SERVICE", {
      MODE: "install",
      PLATFORM: d.platform,
      SERVICE_MANAGER: "none",
      SERVICE_FILE: "(none)",
      SERVICE_LOADED: false,
      REASON: d.platform === "linux" ? "no_systemd_user" : "unsupported_platform",
      STATUS: "success",
    });
    return 0;
  }

  const body =
    d.platform === "macos"
      ? renderLaunchdPlist(d.repoRoot)
      : renderSystemdUnit(d.repoRoot);

  fs.mkdirSync(path.dirname(d.serviceFile), { recursive: true });
  fs.writeFileSync(d.serviceFile, body);

  // Ensure the logs directory exists so the service can write there once
  // v0.3 activates it. Gitignore already excludes `logs/`.
  fs.mkdirSync(path.join(d.repoRoot, "logs"), { recursive: true });

  emitStatus("SERVICE", {
    MODE: "install",
    PLATFORM: d.platform,
    SERVICE_MANAGER: d.serviceManager,
    SERVICE_FILE: d.serviceFile,
    SERVICE_LOADED: false,
    STATUS: "success",
  });
  return 0;
}

function runUninstall(d: DetectionResult): number {
  let removed = false;
  if (d.serviceFile && fs.existsSync(d.serviceFile)) {
    fs.rmSync(d.serviceFile);
    removed = true;
  }
  emitStatus("SERVICE", {
    MODE: "uninstall",
    PLATFORM: d.platform,
    SERVICE_MANAGER: d.serviceManager,
    SERVICE_FILE: d.serviceFile ?? "(none)",
    REMOVED: removed,
    SERVICE_LOADED: false,
    STATUS: "success",
  });
  return 0;
}

function runNoop(d: DetectionResult): number {
  emitStatus("SERVICE", {
    MODE: "noop",
    PLATFORM: d.platform,
    SERVICE_MANAGER: d.serviceManager,
    SERVICE_FILE: d.serviceFile ?? "(none)",
    SERVICE_LOADED: d.serviceFile
      ? serviceLoaded(d.platform, d.serviceManager)
      : false,
    STATUS: "success",
  });
  return 0;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function parseMode(argv: string[]): ServiceMode {
  // Accept `--mode <v>` and `--mode=<v>`; default "noop".
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode" && i + 1 < argv.length) {
      return normalizeMode(argv[i + 1]);
    }
    if (a.startsWith("--mode=")) {
      return normalizeMode(a.slice("--mode=".length));
    }
  }
  return "noop";
}

function normalizeMode(raw: string): ServiceMode {
  const v = raw.trim().toLowerCase();
  if (v === "list" || v === "install" || v === "uninstall" || v === "noop") {
    return v;
  }
  throw new Error(
    `service.ts: unknown --mode "${raw}" (expected list|install|uninstall|noop)`,
  );
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<number> {
  const mode = parseMode(argv);
  const d = detect();
  switch (mode) {
    case "list":
      return runList(d);
    case "install":
      return runInstall(d);
    case "uninstall":
      return runUninstall(d);
    case "noop":
      return runNoop(d);
  }
}

// Ensure hasSystemd remains imported (used in future activation path).
// Referenced here so the linter doesn't flag it; also documents intent.
void hasSystemd;

// Direct-invoke entry point.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err instanceof Error ? err.message : String(err));
      emitStatus("SERVICE", {
        MODE: "error",
        PLATFORM: getPlatform(),
        SERVICE_MANAGER: getServiceManager(),
        SERVICE_FILE: "(none)",
        STATUS: "failed",
        ERROR: err instanceof Error ? err.message : "unknown",
      });
      process.exit(1);
    },
  );
}
