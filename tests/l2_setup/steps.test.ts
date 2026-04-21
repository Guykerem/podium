import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");

function runStep(args: string[]): string {
  try {
    return execFileSync("npx", ["tsx", ...args], {
      encoding: "utf8",
      timeout: 20000,
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err: any) {
    return (err.stdout ?? "") + (err.stderr ?? "");
  }
}

function assertBlock(output: string, name: string) {
  expect(output, `${name} block missing in output`).toMatch(
    new RegExp(`=== PODIUM SETUP: ${name} ===[\\s\\S]*?=== END ===`)
  );
}

describe("L2 setup — per-step smoke", () => {
  it("role-select --mode list emits PREVIEW", () => {
    const out = runStep([join(ROOT, "setup/role-select.ts"), "--mode", "list"]);
    assertBlock(out, "PREVIEW");
    expect(out).toMatch(/ROLES_SHOWN: 4/);
  });

  it("onboarding --mode list emits ONBOARDING", () => {
    const out = runStep([join(ROOT, "setup/onboarding.ts"), "--mode", "list"]);
    assertBlock(out, "ONBOARDING");
  });

  it("channel --mode list emits CHANNEL with cli+telegram", () => {
    const out = runStep([join(ROOT, "setup/channel.ts"), "--mode", "list"]);
    assertBlock(out, "CHANNEL");
    expect(out).toMatch(/AVAILABLE: cli,telegram/);
  });

  it("routine --mode list emits ROUTINE with 3 starters", () => {
    const out = runStep([join(ROOT, "setup/routine.ts"), "--mode", "list"]);
    assertBlock(out, "ROUTINE");
    expect(out).toMatch(/STARTER_PROMPTS: 3/);
  });

  it("install --mode detect emits INSTALL", () => {
    const out = runStep([join(ROOT, "setup/install.ts"), "--mode", "detect"]);
    assertBlock(out, "INSTALL");
    expect(out).toMatch(/RUNTIME: (docker|native)/);
  });

  it("service --mode list emits SERVICE", () => {
    const out = runStep([join(ROOT, "setup/service.ts"), "--mode", "list"]);
    assertBlock(out, "SERVICE");
    expect(out).toMatch(/SERVICE_MANAGER: (launchd|systemd|none)/);
  });

  it("verify --mode check emits VERIFY with boot fields", () => {
    const out = runStep([join(ROOT, "setup/verify.ts"), "--mode", "check"]);
    assertBlock(out, "VERIFY");
    expect(out).toMatch(/BOOT_ROLE_DIR: (true|false)/);
    expect(out).toMatch(/BOOT_IDENTITY: (true|false)/);
  });
});
