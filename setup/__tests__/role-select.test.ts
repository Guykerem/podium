/**
 * Tests for setup/role-preview.ts and setup/role-select.ts (M4 — role picker).
 *
 * Covers:
 *   - listBaseSkills reads SKILL.md frontmatter correctly
 *   - renderRolePreviews builds a card per role with role.yaml data
 *   - runList emits a PREVIEW status block with valid JSON DATA
 *   - runCommit writes active-role.yaml with the §C3 shape
 *   - Invalid role → status invalid_role, exit 4
 *   - Invalid skill → status invalid_skill, exit 5
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";

import {
  buildRolePreview,
  discoverRoles,
  listBaseSkills,
  loadRoleYaml,
  parseFrontmatter,
  renderRolePreviews,
} from "../role-preview.js";
import { runCommit, runList, validateSkills, writeActiveRole } from "../role-select.js";

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, "utf-8");
}

function makeFixtureRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "podium-m4-"));

  // Role A: assistant-like (2 base skills)
  writeFile(
    path.join(root, "roles", "alpha", "role.yaml"),
    [
      'name: alpha',
      'display_name: "Alpha Role"',
      'blurb: "A role for testing alpha behavior."',
      "example_skills:",
      "  - name: skill-one",
      '    one_liner: "Does thing one"',
      "  - name: skill-two",
      '    one_liner: "Does thing two"',
      "",
    ].join("\n"),
  );
  writeFile(
    path.join(root, "roles", "alpha", "skills", "base", "skill-one", "SKILL.md"),
    "---\nname: skill-one\ndescription: First skill in alpha\n---\n# body\n",
  );
  writeFile(
    path.join(root, "roles", "alpha", "skills", "base", "skill-two", "SKILL.md"),
    "---\nname: skill-two\ndescription: Second skill in alpha\n---\n# body\n",
  );

  // Role B: tutor-like (1 base skill)
  writeFile(
    path.join(root, "roles", "beta", "role.yaml"),
    [
      'name: beta',
      'display_name: "Beta Role"',
      'blurb: "A role for beta testing."',
      "example_skills:",
      "  - name: solo",
      '    one_liner: "The only skill"',
      "",
    ].join("\n"),
  );
  writeFile(
    path.join(root, "roles", "beta", "skills", "base", "solo", "SKILL.md"),
    "---\nname: solo\ndescription: Solo skill in beta\n---\n# body\n",
  );

  // Directory without role.yaml — must be ignored by discoverRoles
  writeFile(path.join(root, "roles", "unlisted", ".keep"), "");

  return root;
}

describe("parseFrontmatter", () => {
  it("returns {} on missing fence", () => {
    expect(parseFrontmatter("# no frontmatter\n")).toEqual({});
  });
  it("parses simple fields", () => {
    const fm = parseFrontmatter("---\nname: x\ndescription: y\n---\nbody\n");
    expect(fm).toEqual({ name: "x", description: "y" });
  });
});

describe("listBaseSkills", () => {
  let root: string;
  beforeEach(() => { root = makeFixtureRoot(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it("returns name+description for every SKILL.md in base/", () => {
    const skills = listBaseSkills("alpha", root);
    expect(skills).toEqual([
      { name: "skill-one", description: "First skill in alpha" },
      { name: "skill-two", description: "Second skill in alpha" },
    ]);
  });

  it("returns [] for a role with no skills dir", () => {
    expect(listBaseSkills("does-not-exist", root)).toEqual([]);
  });
});

describe("discoverRoles + loadRoleYaml", () => {
  let root: string;
  beforeEach(() => { root = makeFixtureRoot(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it("finds only dirs with a role.yaml", () => {
    expect(discoverRoles(root)).toEqual(["alpha", "beta"]);
  });

  it("loadRoleYaml returns null for missing file", () => {
    expect(loadRoleYaml("does-not-exist", root)).toBeNull();
  });

  it("loadRoleYaml parses fields", () => {
    const y = loadRoleYaml("alpha", root);
    expect(y?.display_name).toBe("Alpha Role");
    expect(y?.blurb).toMatch(/alpha/);
    expect(y?.example_skills?.length).toBe(2);
  });
});

describe("buildRolePreview + renderRolePreviews", () => {
  let root: string;
  beforeEach(() => { root = makeFixtureRoot(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it("builds a preview card including all_skills", () => {
    const p = buildRolePreview("alpha", root);
    expect(p.id).toBe("alpha");
    expect(p.display_name).toBe("Alpha Role");
    expect(p.example_skills.length).toBe(2);
    expect(p.all_skills.length).toBe(2);
    expect(p.all_skills[0]).toEqual({ name: "skill-one", description: "First skill in alpha" });
  });

  it("renders every discovered role", () => {
    const ps = renderRolePreviews(root);
    expect(ps.map((p) => p.id)).toEqual(["alpha", "beta"]);
  });
});

describe("runList", () => {
  let root: string;
  let logs: string[];
  beforeEach(() => {
    root = makeFixtureRoot();
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("emits a PREVIEW block with roles + all_skills JSON", () => {
    const code = runList(root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: PREVIEW ===");
    expect(block).toContain("ROLES_SHOWN: 2");
    expect(block).toContain("STATUS: success");
    // Extract DATA line and parse JSON.
    const m = block.match(/^DATA:\s*(.*)$/m);
    expect(m).not.toBeNull();
    const payload = JSON.parse(m![1]);
    expect(payload.roles.length).toBe(2);
    const alpha = payload.roles.find((r: { id: string }) => r.id === "alpha");
    expect(alpha.display_name).toBe("Alpha Role");
    expect(alpha.all_skills.length).toBe(2);
  });
});

describe("validateSkills", () => {
  let root: string;
  beforeEach(() => { root = makeFixtureRoot(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it("passes when every skill resolves", () => {
    const { ok, invalid } = validateSkills("alpha", ["skill-one", "skill-two"], root);
    expect(ok).toBe(true);
    expect(invalid).toEqual([]);
  });
  it("fails and lists invalid names", () => {
    const { ok, invalid } = validateSkills("alpha", ["skill-one", "ghost"], root);
    expect(ok).toBe(false);
    expect(invalid).toEqual(["ghost"]);
  });
});

describe("writeActiveRole", () => {
  let root: string;
  beforeEach(() => { root = makeFixtureRoot(); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  it("writes §C3 shape to agent/memory/active-role.yaml", () => {
    const p = writeActiveRole(
      {
        role: "alpha",
        skills_enabled: ["skill-one"],
        channels: ["cli"],
        timezone: "",
        installed_at: "2026-04-18T12:00:00.000Z",
      },
      root,
    );
    const parsed = parseYaml(fs.readFileSync(p, "utf-8")) as any;
    expect(parsed.role).toBe("alpha");
    expect(parsed.skills_enabled).toEqual(["skill-one"]);
    expect(parsed.channels).toEqual(["cli"]);
    expect(parsed.timezone).toBe("");
    expect(parsed.installed_at).toBe("2026-04-18T12:00:00.000Z");
  });
});

describe("runCommit", () => {
  let root: string;
  let logs: string[];
  beforeEach(() => {
    root = makeFixtureRoot();
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes active-role.yaml and emits success ROLE_CHOICE", () => {
    const code = runCommit({ role: "alpha", skills: "skill-one,skill-two" }, root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: ROLE_CHOICE ===");
    expect(block).toContain("ROLE: alpha");
    expect(block).toContain("SKILLS_ENABLED: skill-one,skill-two");
    expect(block).toContain("STATUS: success");
    // Confirm file exists
    const p = path.join(root, "agent", "memory", "active-role.yaml");
    expect(fs.existsSync(p)).toBe(true);
    const parsed = parseYaml(fs.readFileSync(p, "utf-8")) as any;
    expect(parsed.skills_enabled).toEqual(["skill-one", "skill-two"]);
  });

  it("invalid role → invalid_role, exit 4", () => {
    const code = runCommit({ role: "nonesuch", skills: "skill-one" }, root);
    expect(code).toBe(4);
    const block = logs.join("\n");
    expect(block).toContain("STATUS: invalid_role");
  });

  it("invalid skill → invalid_skill, exit 5, lists offender", () => {
    const code = runCommit({ role: "alpha", skills: "skill-one,ghost" }, root);
    expect(code).toBe(5);
    const block = logs.join("\n");
    expect(block).toContain("STATUS: invalid_skill");
    expect(block).toContain("INVALID_SKILLS: ghost");
  });

  it("empty skills_enabled is valid (zero-skill role)", () => {
    const code = runCommit({ role: "alpha", skills: "" }, root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("STATUS: success");
  });

  it("defaults channels to [cli] when not provided", () => {
    runCommit({ role: "alpha", skills: "skill-one" }, root);
    const p = path.join(root, "agent", "memory", "active-role.yaml");
    const parsed = parseYaml(fs.readFileSync(p, "utf-8")) as any;
    expect(parsed.channels).toEqual(["cli"]);
  });
});

describe("real repo roles", () => {
  const REPO_ROOT = path.resolve(__dirname, "..", "..");

  it("has role.yaml for all 4 shipped roles", () => {
    const roles = discoverRoles(REPO_ROOT);
    for (const r of ["agent-architect", "assistant", "creator", "tutor"]) {
      expect(roles).toContain(r);
    }
  });

  it("every shipped role has display_name, blurb, and ≥3 example_skills", () => {
    for (const r of ["agent-architect", "assistant", "creator", "tutor"]) {
      const y = loadRoleYaml(r, REPO_ROOT);
      expect(y, `role ${r}`).not.toBeNull();
      expect(y!.display_name, `${r} display_name`).toBeTruthy();
      expect(y!.blurb, `${r} blurb`).toBeTruthy();
      expect(Array.isArray(y!.example_skills), `${r} example_skills is array`).toBe(true);
      expect(y!.example_skills!.length, `${r} ≥3 example_skills`).toBeGreaterThanOrEqual(3);
    }
  });

  it("renderRolePreviews for real repo includes every base skill with a description", () => {
    const previews = renderRolePreviews(REPO_ROOT);
    expect(previews.length).toBeGreaterThanOrEqual(4);
    for (const p of previews) {
      expect(p.all_skills.length).toBeGreaterThan(0);
      for (const s of p.all_skills) {
        expect(s.name, `${p.id}/${s.name} has a name`).toBeTruthy();
        expect(s.description, `${p.id}/${s.name} has a description`).toBeTruthy();
      }
    }
  });

  it("every example_skill in role.yaml points at a real base skill", () => {
    const previews = renderRolePreviews(REPO_ROOT);
    for (const p of previews) {
      const allNames = new Set(p.all_skills.map((s) => s.name));
      for (const ex of p.example_skills) {
        expect(allNames.has(ex.name), `${p.id} example_skills.${ex.name} exists as a base skill`).toBe(true);
      }
    }
  });
});
