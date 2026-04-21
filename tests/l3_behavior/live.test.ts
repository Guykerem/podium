import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");
const LIVE = process.env.LIVE === "1";

describe.skipIf(!LIVE)("L3 behavior — live claude probe", () => {
  it("engine --message returns a response", () => {
    const out = execFileSync(
      "npx",
      ["tsx", join(ROOT, "runtime/engine.ts"), "--message", "Say hi in one word."],
      { encoding: "utf8", timeout: 60000, cwd: ROOT }
    );
    expect(out.trim().length).toBeGreaterThan(0);
    expect(out.length).toBeLessThan(2000);
  });

  it("engine --dry-run prints assembled context", () => {
    const out = execFileSync(
      "npx",
      [
        "tsx",
        join(ROOT, "runtime/engine.ts"),
        "--message",
        "hi",
        "--dry-run",
      ],
      { encoding: "utf8", timeout: 10000, cwd: ROOT }
    );
    expect(out).toMatch(/Agent: Podium/i);
    expect(out).toMatch(/Identity/);
  });
});

describe.skipIf(LIVE)("L3 behavior — gated off", () => {
  it("skipped because LIVE is not set to 1", () => {
    expect(true).toBe(true);
  });
});
