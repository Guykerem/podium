/**
 * Unit tests for runtime/context.ts.
 *
 * Builds a fixture role tree in a temp dir and asserts the assembled system
 * prompt contains each expected section (identity, style, core skills, base
 * skills, memory frontmatter + body).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import {
  assembleRoleContext,
  listSkills,
  loadMemory,
  splitFrontmatter,
} from "../context";

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, "utf-8");
}

function makeFixtureRoot(role: string = "tester"): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "podium-ctx-"));

  // Shared agent identity
  writeFile(
    path.join(root, "agent", "identity", "constitution.md"),
    "# Shared Constitution\n\nBe honest. Be kind."
  );
  writeFile(
    path.join(root, "agent", "identity", "style.yaml"),
    "tone: warm\nverbosity: medium\n"
  );

  // Core skill with description frontmatter
  writeFile(
    path.join(root, "agent", "skills", "core", "communicate", "SKILL.md"),
    "---\nname: communicate\ndescription: Talk to the user\n---\n\nBody of skill."
  );
  // Core skill without description
  writeFile(
    path.join(root, "agent", "skills", "core", "remember", "SKILL.md"),
    "---\nname: remember\n---\n\nBody."
  );

  // Role overlay
  writeFile(
    path.join(root, "roles", role, "identity", "constitution.md"),
    "# Tester Constitution\n\nYou are a test role."
  );
  writeFile(
    path.join(root, "roles", role, "identity", "style.yaml"),
    "persona: analytical\n"
  );

  // Base skill
  writeFile(
    path.join(root, "roles", role, "skills", "base", "do-thing", "SKILL.md"),
    "---\nname: do-thing\ndescription: Do the thing the tester does\n---\n\nBody."
  );

  return root;
}

describe("splitFrontmatter", () => {
  it("parses YAML frontmatter and returns the body", () => {
    const raw = "---\nname: Guy\npronouns: he/him\n---\n\n# Hello\n\nBody here.";
    const { frontmatter, body } = splitFrontmatter(raw);
    expect(frontmatter.name).toBe("Guy");
    expect(frontmatter.pronouns).toBe("he/him");
    expect(body).toContain("# Hello");
    expect(body).toContain("Body here.");
  });

  it("returns empty frontmatter when no fences are present", () => {
    const raw = "Just a markdown body, no fences.";
    const { frontmatter, body } = splitFrontmatter(raw);
    expect(frontmatter).toEqual({});
    expect(body).toBe(raw);
  });

  it("is tolerant of malformed YAML", () => {
    const raw = "---\n: : :\n---\nbody\n";
    const { frontmatter, body } = splitFrontmatter(raw);
    // frontmatter may parse as empty or error-silenced; body must be recoverable
    expect(typeof frontmatter).toBe("object");
    expect(body).toContain("body");
  });
});

describe("listSkills", () => {
  it("returns sorted [name, description] tuples", () => {
    const root = makeFixtureRoot();
    const core = listSkills(path.join(root, "agent", "skills", "core"));
    expect(core).toEqual([
      ["communicate", "Talk to the user"],
      ["remember", ""],
    ]);
  });

  it("returns empty array when directory missing", () => {
    const result = listSkills(path.join(os.tmpdir(), "does-not-exist-" + Date.now()));
    expect(result).toEqual([]);
  });
});

describe("loadMemory", () => {
  let root: string;
  beforeEach(() => {
    root = makeFixtureRoot();
  });

  it("returns null when memory/context.md is missing", () => {
    const mem = loadMemory("tester", root);
    expect(mem).toBeNull();
  });

  it("parses frontmatter + body when present", () => {
    writeFile(
      path.join(root, "roles", "tester", "memory", "context.md"),
      "---\nname: Ada\npronouns: she/her\nprimary_goal: ship\ntimezone: UTC\n---\n\n# Notes\n\nAda prefers concise replies.\n"
    );
    const mem = loadMemory("tester", root);
    expect(mem).not.toBeNull();
    expect(mem!.frontmatter.name).toBe("Ada");
    expect(mem!.frontmatter.primary_goal).toBe("ship");
    expect(mem!.body).toContain("Ada prefers concise replies.");
  });
});

describe("assembleRoleContext", () => {
  let root: string;
  beforeEach(() => {
    root = makeFixtureRoot();
  });

  it("includes role name header", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("# Agent: Podium (tester)");
  });

  it("includes shared + role constitution", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("Be honest. Be kind.");
    expect(out).toContain("You are a test role.");
  });

  it("includes shared + role style", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("tone: warm");
    expect(out).toContain("persona: analytical");
  });

  it("lists core skills with descriptions", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("### Core (shared across all roles)");
    expect(out).toContain("- **communicate** — Talk to the user");
    expect(out).toContain("- **remember**");
  });

  it("lists base skills under role-specific heading", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("### Base (specific to tester)");
    expect(out).toContain("- **do-thing** — Do the thing the tester does");
  });

  it("appends memory section when context.md exists", () => {
    writeFile(
      path.join(root, "roles", "tester", "memory", "context.md"),
      "---\nname: Ada\npronouns: she/her\nprimary_goal: ship podium\ntimezone: America/New_York\n---\n\n# What I know\n\nAda is a psychology student."
    );
    const out = assembleRoleContext("tester", root);
    expect(out).toContain("## Memory");
    expect(out).toContain("- **name**: Ada");
    expect(out).toContain("- **primary_goal**: ship podium");
    expect(out).toContain("- **timezone**: America/New_York");
    expect(out).toContain("Ada is a psychology student.");
  });

  it("omits memory section when context.md is missing", () => {
    const out = assembleRoleContext("tester", root);
    expect(out).not.toContain("## Memory");
  });
});

// Cleanup of tmp dirs is intentionally best-effort; OS handles /tmp pruning.
afterEach(() => {
  /* no-op */
});
