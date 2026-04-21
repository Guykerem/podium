import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const ROOT = join(__dirname, "..", "..");
const ROLES = ["agent-architect", "assistant", "tutor", "creator"];

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    const parsed = parseYaml(match[1]) as Record<string, unknown> | null;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fall through to line-based fallback for SKILL.md files whose values
    // contain backtick-quoted `key: value` snippets that confuse strict YAML
  }
  const out: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (key && val) out[key] = val;
  }
  return out;
}

describe.each(ROLES)("RoleContract: %s", (role) => {
  const roleDir = join(ROOT, "roles", role);

  it("role directory exists", () => {
    expect(existsSync(roleDir)).toBe(true);
  });

  it("identity/constitution.md exists", () => {
    expect(existsSync(join(roleDir, "identity", "constitution.md"))).toBe(true);
  });

  it("identity/style.yaml exists", () => {
    expect(existsSync(join(roleDir, "identity", "style.yaml"))).toBe(true);
  });

  it("role.yaml has display_name, blurb, example_skills (≥3)", () => {
    const yamlPath = join(roleDir, "role.yaml");
    expect(existsSync(yamlPath)).toBe(true);
    const data = parseYaml(readFileSync(yamlPath, "utf8")) as Record<string, unknown>;
    expect(data.display_name).toBeTruthy();
    expect(data.blurb).toBeTruthy();
    expect(Array.isArray(data.example_skills)).toBe(true);
    expect((data.example_skills as unknown[]).length).toBeGreaterThanOrEqual(3);
  });

  it("skills/base has at least one skill directory", () => {
    const baseDir = join(roleDir, "skills", "base");
    expect(existsSync(baseDir)).toBe(true);
    const entries = readdirSync(baseDir).filter((e) => {
      const p = join(baseDir, e);
      return !e.startsWith(".") && statSync(p).isDirectory();
    });
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it("each base skill has a SKILL.md with name + description", () => {
    const baseDir = join(roleDir, "skills", "base");
    const skills = readdirSync(baseDir).filter((e) => {
      const p = join(baseDir, e);
      return !e.startsWith(".") && statSync(p).isDirectory();
    });
    for (const skill of skills) {
      const skillFile = join(baseDir, skill, "SKILL.md");
      expect(existsSync(skillFile), `${skill}/SKILL.md missing`).toBe(true);
      const fm = parseFrontmatter(readFileSync(skillFile, "utf8"));
      expect(fm.name, `${skill}: name frontmatter missing`).toBeTruthy();
      expect(fm.description, `${skill}: description frontmatter missing`).toBeTruthy();
    }
  });

  it("onboarding/questions.yaml has name + primary_goal required", () => {
    const path = join(roleDir, "onboarding", "questions.yaml");
    expect(existsSync(path)).toBe(true);
    const data = parseYaml(readFileSync(path, "utf8")) as { questions: Array<Record<string, unknown>> };
    expect(Array.isArray(data.questions)).toBe(true);
    const byId = new Map(data.questions.map((q) => [q.id as string, q]));
    expect(byId.has("name"), "name question missing").toBe(true);
    expect(byId.has("primary_goal"), "primary_goal question missing").toBe(true);
    expect(byId.get("name")!.required).toBe(true);
    expect(byId.get("primary_goal")!.required).toBe(true);
  });

  it("schedule.yaml exists (shipped template; M7 overwrites)", () => {
    expect(existsSync(join(roleDir, "schedule.yaml"))).toBe(true);
  });

  it("identity/ directory exists", () => {
    expect(existsSync(join(roleDir, "identity"))).toBe(true);
  });
});
