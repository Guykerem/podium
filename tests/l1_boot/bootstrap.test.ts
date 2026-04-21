import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");

function parseStatusBlock(output: string, name: string): Record<string, string> | null {
  const pattern = new RegExp(
    `=== PODIUM SETUP: ${name} ===\\n([\\s\\S]*?)\\n=== END ===`
  );
  const match = output.match(pattern);
  if (!match) return null;
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fields;
}

describe("L1 boot — setup.sh BOOTSTRAP block", () => {
  it("emits a valid BOOTSTRAP status block", () => {
    let stdout = "";
    try {
      stdout = execFileSync("bash", [join(ROOT, "setup.sh")], {
        encoding: "utf8",
        timeout: 15000,
        cwd: ROOT,
      });
    } catch (err: any) {
      stdout = err.stdout ?? "";
    }
    const fields = parseStatusBlock(stdout, "BOOTSTRAP");
    expect(fields, "BOOTSTRAP block not found in stdout").not.toBeNull();
    expect(fields!.PLATFORM).toMatch(/macos|linux|wsl|unknown/);
    expect(fields!.NODE_OK).toMatch(/true|false/);
    expect(fields!.DOCKER_PRESENT).toMatch(/true|false/);
    expect(fields!.TZ).toBeTruthy();
    expect(fields!.STATUS).toBeTruthy();
  });

  it("STATUS is success on a machine with Node ≥20", () => {
    let stdout = "";
    try {
      stdout = execFileSync("bash", [join(ROOT, "setup.sh")], {
        encoding: "utf8",
        timeout: 15000,
        cwd: ROOT,
      });
    } catch (err: any) {
      stdout = err.stdout ?? "";
    }
    const fields = parseStatusBlock(stdout, "BOOTSTRAP");
    expect(fields?.NODE_OK).toBe("true");
    expect(fields?.STATUS).toBe("success");
  });
});
