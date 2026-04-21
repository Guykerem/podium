/**
 * Tests for setup/onboarding.ts (M5 — onboarding runner + memory seeding).
 *
 * Coverage:
 *   - normalizeQuestion handles both the new schema and the legacy shapes
 *     that ship in the four roles' questions.yaml files
 *   - loadQuestions pulls and normalizes from a fixture role
 *   - findMissingRequired surfaces missing required answers
 *   - runList emits an ONBOARDING block with a valid DATA JSON payload
 *   - runCommit writes a memory file with valid frontmatter + body and emits
 *     an ONBOARDING success block
 *   - runCommit → STATUS: missing_required (exit 3) when a required answer is
 *     absent
 *   - runCommit → STATUS: malformed_answers (exit 6) when the JSON blob is
 *     unparseable
 *   - runCommit honors nested memory_key ("profile.name") in frontmatter
 *   - Every shipped role has `name` and `primary_goal` in its normalized list
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";

import {
  buildBody,
  buildFrontmatter,
  findMissingRequired,
  loadQuestions,
  normalizeQuestion,
  renderMemoryFile,
  runCommit,
  runList,
  writeMemoryFile,
  type Question,
} from "../onboarding.js";

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, "utf-8");
}

/**
 * Build a self-contained fixture root with one role ("alpha") plus an
 * agent/memory/active-role.yaml pointing at it.
 */
function makeFixtureRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "podium-m5-"));

  writeFile(
    path.join(root, "agent", "memory", "active-role.yaml"),
    "role: alpha\n",
  );

  writeFile(
    path.join(root, "roles", "alpha", "role.yaml"),
    "name: alpha\ndisplay_name: Alpha\n",
  );

  writeFile(
    path.join(root, "roles", "alpha", "onboarding", "questions.yaml"),
    [
      "questions:",
      "  - id: name",
      '    prompt: "What should I call you?"',
      "    type: text",
      "    required: true",
      "    memory_key: name",
      "  - id: primary_goal",
      '    prompt: "What should I help you with?"',
      "    type: text",
      "    required: true",
      "    memory_key: primary_goal",
      "  - id: pronouns",
      '    prompt: "Preferred pronouns?"',
      "    type: choice",
      "    options:",
      '      - "he/him"',
      '      - "she/her"',
      '      - "they/them"',
      "    required: false",
      "    memory_key: pronouns",
      "",
    ].join("\n"),
  );

  return root;
}

/* -------------------------------------------------------------------------- */
/* normalizeQuestion                                                           */
/* -------------------------------------------------------------------------- */

describe("normalizeQuestion", () => {
  it("accepts the new normalized shape as-is", () => {
    const q = normalizeQuestion({
      id: "name",
      prompt: "What should I call you?",
      type: "text",
      required: true,
      memory_key: "name",
    });
    expect(q).toEqual({
      id: "name",
      prompt: "What should I call you?",
      type: "text",
      options: [],
      required: true,
      memory_key: "name",
    });
  });

  it("maps legacy `open` → text", () => {
    const q = normalizeQuestion({ id: "goal", prompt: "Why?", type: "open" });
    expect(q?.type).toBe("text");
    expect(q?.required).toBe(false);
    expect(q?.memory_key).toBe("goal"); // falls back to id when memory_key missing
  });

  it("maps legacy `multiple_choice` → choice and keeps label+description options", () => {
    const q = normalizeQuestion({
      id: "level",
      prompt: "How experienced?",
      type: "multiple_choice",
      options: [
        { label: "beginner", description: "new to it" },
        { label: "advanced", description: "veteran" },
      ],
    });
    expect(q?.type).toBe("choice");
    expect(q?.options).toEqual([
      "beginner — new to it",
      "advanced — veteran",
    ]);
  });

  it("maps legacy `multi_select` → multi", () => {
    const q = normalizeQuestion({
      id: "formats",
      prompt: "Which?",
      type: "multi_select",
      options: ["a", "b"],
    });
    expect(q?.type).toBe("multi");
    expect(q?.options).toEqual(["a", "b"]);
  });

  it("returns null when id or prompt is missing", () => {
    expect(normalizeQuestion({ prompt: "no id" })).toBeNull();
    expect(normalizeQuestion({ id: "no_prompt" })).toBeNull();
    expect(normalizeQuestion(null)).toBeNull();
    expect(normalizeQuestion("string")).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* loadQuestions                                                               */
/* -------------------------------------------------------------------------- */

describe("loadQuestions", () => {
  let root: string;
  beforeEach(() => {
    root = makeFixtureRoot();
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("loads and normalizes every entry", () => {
    const qs = loadQuestions("alpha", root);
    expect(qs.length).toBe(3);
    expect(qs[0].id).toBe("name");
    expect(qs[0].required).toBe(true);
    expect(qs[2].type).toBe("choice");
    expect(qs[2].options).toContain("he/him");
  });

  it("returns [] for a role with no questions.yaml", () => {
    expect(loadQuestions("does-not-exist", root)).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* findMissingRequired                                                         */
/* -------------------------------------------------------------------------- */

describe("findMissingRequired", () => {
  const qs: Question[] = [
    { id: "name", prompt: "", type: "text", options: [], required: true, memory_key: "name" },
    { id: "goal", prompt: "", type: "text", options: [], required: true, memory_key: "goal" },
    { id: "pronouns", prompt: "", type: "choice", options: [], required: false, memory_key: "pronouns" },
  ];

  it("returns [] when all required answers are present", () => {
    const missing = findMissingRequired(qs, { name: "Guy", goal: "ship v0.2" });
    expect(missing).toEqual([]);
  });

  it("flags empty-string answers as missing", () => {
    const missing = findMissingRequired(qs, { name: "Guy", goal: "   " });
    expect(missing).toEqual(["goal"]);
  });

  it("flags entirely absent required keys", () => {
    const missing = findMissingRequired(qs, { name: "Guy" });
    expect(missing).toEqual(["goal"]);
  });

  it("ignores optional fields even when missing", () => {
    const missing = findMissingRequired(qs, { name: "Guy", goal: "ship" });
    expect(missing).not.toContain("pronouns");
  });
});

/* -------------------------------------------------------------------------- */
/* Memory file generation                                                      */
/* -------------------------------------------------------------------------- */

describe("buildFrontmatter + renderMemoryFile", () => {
  const questions: Question[] = [
    { id: "name", prompt: "", type: "text", options: [], required: true, memory_key: "name" },
    { id: "primary_goal", prompt: "", type: "text", options: [], required: true, memory_key: "primary_goal" },
    { id: "pronouns", prompt: "", type: "choice", options: [], required: false, memory_key: "pronouns" },
  ];

  it("includes timezone + captured_at in every frontmatter", () => {
    const fm = buildFrontmatter({
      questions,
      answers: { name: "Guy", primary_goal: "ship v0.2" },
      timezone: "Asia/Jerusalem",
      capturedAt: "2026-04-18T22:15:00.000Z",
    });
    expect(fm.timezone).toBe("Asia/Jerusalem");
    expect(fm.captured_at).toBe("2026-04-18T22:15:00.000Z");
    expect(fm.name).toBe("Guy");
    expect(fm.primary_goal).toBe("ship v0.2");
  });

  it("omits empty or missing answers from frontmatter", () => {
    const fm = buildFrontmatter({
      questions,
      answers: { name: "Guy", primary_goal: "ship", pronouns: "" },
      timezone: "UTC",
      capturedAt: "2026-04-18T00:00:00.000Z",
    });
    expect("pronouns" in fm).toBe(false);
  });

  it("supports nested (dotted) memory_key", () => {
    const nested: Question[] = [
      {
        id: "name",
        prompt: "",
        type: "text",
        options: [],
        required: true,
        memory_key: "profile.name",
      },
      {
        id: "primary_goal",
        prompt: "",
        type: "text",
        options: [],
        required: true,
        memory_key: "profile.goal",
      },
    ];
    const fm = buildFrontmatter({
      questions: nested,
      answers: { name: "Ada", primary_goal: "learn" },
      timezone: "UTC",
      capturedAt: "2026-04-18T00:00:00.000Z",
    });
    expect(fm.profile).toEqual({ name: "Ada", goal: "learn" });
  });

  it("renderMemoryFile produces a --- fenced YAML block followed by body", () => {
    const content = renderMemoryFile({
      frontmatter: { name: "Guy", timezone: "UTC" },
      body: "# Hello\n\nBody here.",
    });
    expect(content.startsWith("---\n")).toBe(true);
    expect(content).toContain("name: Guy");
    expect(content).toContain("timezone: UTC");
    expect(content).toContain("# Hello");
    expect(content.endsWith("\n")).toBe(true);
  });
});

describe("buildBody", () => {
  const questions: Question[] = [
    { id: "name", prompt: "", type: "text", options: [], required: true, memory_key: "name" },
    { id: "primary_goal", prompt: "", type: "text", options: [], required: true, memory_key: "primary_goal" },
    { id: "pronouns", prompt: "", type: "choice", options: [], required: false, memory_key: "pronouns" },
  ];

  it("references name and primary_goal inline when present", () => {
    const body = buildBody({
      role: "assistant",
      questions,
      answers: { name: "Guy", primary_goal: "ship v0.2" },
    });
    expect(body).toContain("Guy");
    expect(body).toContain("ship v0.2");
    expect(body).toContain("## Key goals");
  });

  it("handles missing name gracefully", () => {
    const body = buildBody({
      role: "assistant",
      questions,
      answers: { primary_goal: "ship v0.2" },
    });
    expect(body).toContain("ship v0.2");
    expect(body).not.toContain("undefined");
  });

  it("lists secondary answers in interaction-style section", () => {
    const body = buildBody({
      role: "assistant",
      questions,
      answers: { name: "Guy", primary_goal: "ship", pronouns: "he/him" },
    });
    expect(body).toContain("Preferred interaction style");
    expect(body).toContain("he/him");
  });
});

describe("writeMemoryFile", () => {
  let root: string;
  beforeEach(() => {
    root = makeFixtureRoot();
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("creates roles/<role>/memory/context.md with given content", () => {
    const p = writeMemoryFile("alpha", "---\nname: x\n---\nbody\n", root);
    expect(p).toBe(path.join(root, "roles", "alpha", "memory", "context.md"));
    expect(fs.readFileSync(p, "utf-8")).toContain("name: x");
  });
});

/* -------------------------------------------------------------------------- */
/* runList                                                                     */
/* -------------------------------------------------------------------------- */

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

  it("emits ONBOARDING block with JSON DATA payload", () => {
    const code = runList(root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: ONBOARDING ===");
    expect(block).toContain("MODE: list");
    expect(block).toContain("ROLE: alpha");
    expect(block).toContain("QUESTIONS_COUNT: 3");
    expect(block).toContain("STATUS: success");
    const m = block.match(/^DATA:\s*(.*)$/m);
    expect(m).not.toBeNull();
    const payload = JSON.parse(m![1]) as { questions: Array<{ id: string; required: boolean }> };
    expect(payload.questions.map((q) => q.id)).toEqual(["name", "primary_goal", "pronouns"]);
    expect(payload.questions[0].required).toBe(true);
  });

  it("returns 2 + emits no_active_role when active-role.yaml is missing", () => {
    fs.rmSync(path.join(root, "agent"), { recursive: true, force: true });
    const code = runList(root);
    expect(code).toBe(2);
    const block = logs.join("\n");
    expect(block).toContain("STATUS: no_active_role");
  });
});

/* -------------------------------------------------------------------------- */
/* runCommit                                                                   */
/* -------------------------------------------------------------------------- */

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

  it("writes memory/context.md with frontmatter+body on success", () => {
    const code = runCommit(
      {
        answersJson: JSON.stringify({
          name: "Guy",
          primary_goal: "ship v0.2",
          pronouns: "he/him",
        }),
        timezoneOverride: "Asia/Jerusalem",
        capturedAtOverride: "2026-04-18T22:15:00.000Z",
      },
      root,
    );
    expect(code).toBe(0);

    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: ONBOARDING ===");
    expect(block).toContain("MODE: commit");
    expect(block).toContain("ROLE: alpha");
    expect(block).toContain("ANSWERS: 3");
    expect(block).toContain("MEMORY_PATH: roles/alpha/memory/context.md");
    expect(block).toContain("STATUS: success");

    const memPath = path.join(root, "roles", "alpha", "memory", "context.md");
    expect(fs.existsSync(memPath)).toBe(true);
    const raw = fs.readFileSync(memPath, "utf-8");

    // Validate frontmatter is parseable YAML and contains every answer + tz.
    expect(raw.startsWith("---\n")).toBe(true);
    const fenceEnd = raw.indexOf("\n---", 4);
    const fm = parseYaml(raw.slice(4, fenceEnd)) as Record<string, unknown>;
    expect(fm.name).toBe("Guy");
    expect(fm.primary_goal).toBe("ship v0.2");
    expect(fm.pronouns).toBe("he/him");
    expect(fm.timezone).toBe("Asia/Jerusalem");
    expect(fm.captured_at).toBe("2026-04-18T22:15:00.000Z");

    // Body references the answers.
    expect(raw).toContain("Guy");
    expect(raw).toContain("ship v0.2");
    expect(raw).toContain("## Key goals");
  });

  it("returns 3 + STATUS: missing_required when required field is absent", () => {
    const code = runCommit(
      {
        answersJson: JSON.stringify({ name: "Guy" }), // primary_goal missing
      },
      root,
    );
    expect(code).toBe(3);
    const block = logs.join("\n");
    expect(block).toContain("STATUS: missing_required");
    expect(block).toContain("MISSING_REQUIRED: primary_goal");
    // No memory file should have been written.
    expect(fs.existsSync(path.join(root, "roles", "alpha", "memory", "context.md"))).toBe(
      false,
    );
  });

  it("returns 3 when required field is present but blank", () => {
    const code = runCommit(
      { answersJson: JSON.stringify({ name: "Guy", primary_goal: "   " }) },
      root,
    );
    expect(code).toBe(3);
    expect(logs.join("\n")).toContain("MISSING_REQUIRED: primary_goal");
  });

  it("returns 6 + STATUS: malformed_answers on bad JSON", () => {
    const code = runCommit({ answersJson: "{not json" }, root);
    expect(code).toBe(6);
    expect(logs.join("\n")).toContain("STATUS: malformed_answers");
  });

  it("returns 2 + STATUS: no_active_role when active-role.yaml is missing", () => {
    fs.rmSync(path.join(root, "agent"), { recursive: true, force: true });
    const code = runCommit(
      { answersJson: JSON.stringify({ name: "Guy", primary_goal: "ship" }) },
      root,
    );
    expect(code).toBe(2);
    expect(logs.join("\n")).toContain("STATUS: no_active_role");
  });

  it("accepts array-valued answers for multi-select questions", () => {
    // Swap questions.yaml for one with a multi-select required question.
    writeFile(
      path.join(root, "roles", "alpha", "onboarding", "questions.yaml"),
      [
        "questions:",
        "  - id: name",
        '    prompt: "Your name?"',
        "    type: text",
        "    required: true",
        "    memory_key: name",
        "  - id: primary_goal",
        '    prompt: "Goal?"',
        "    type: text",
        "    required: true",
        "    memory_key: primary_goal",
        "  - id: formats",
        '    prompt: "Formats?"',
        "    type: multi",
        "    options:",
        '      - "short video"',
        '      - "written"',
        "    required: false",
        "    memory_key: primary_formats",
        "",
      ].join("\n"),
    );
    const code = runCommit(
      {
        answersJson: JSON.stringify({
          name: "Ada",
          primary_goal: "ship",
          formats: ["short video", "written"],
        }),
        timezoneOverride: "UTC",
        capturedAtOverride: "2026-04-18T00:00:00.000Z",
      },
      root,
    );
    expect(code).toBe(0);
    const raw = fs.readFileSync(
      path.join(root, "roles", "alpha", "memory", "context.md"),
      "utf-8",
    );
    const fenceEnd = raw.indexOf("\n---", 4);
    const fm = parseYaml(raw.slice(4, fenceEnd)) as Record<string, unknown>;
    expect(fm.primary_formats).toEqual(["short video", "written"]);
  });
});

/* -------------------------------------------------------------------------- */
/* End-to-end: onboarding → runtime context                                    */
/* -------------------------------------------------------------------------- */

describe("end-to-end: commit then runtime context assembly", () => {
  let root: string;

  beforeEach(() => {
    root = makeFixtureRoot();
    // Seed minimal identity files so assembleRoleContext has everything it needs.
    writeFile(
      path.join(root, "agent", "identity", "constitution.md"),
      "# Shared\nBe honest.",
    );
    writeFile(
      path.join(root, "agent", "identity", "style.yaml"),
      "tone: warm\n",
    );
    writeFile(
      path.join(root, "roles", "alpha", "identity", "constitution.md"),
      "# Alpha\nYou are alpha.",
    );
    writeFile(
      path.join(root, "roles", "alpha", "identity", "style.yaml"),
      "persona: helpful\n",
    );
    writeFile(
      path.join(root, "roles", "alpha", "skills", "base", "do-thing", "SKILL.md"),
      "---\nname: do-thing\ndescription: Do it\n---\n",
    );
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("memory file written by commit is visible in assembleRoleContext output", async () => {
    const code = runCommit(
      {
        answersJson: JSON.stringify({
          name: "Guy",
          primary_goal: "ship v0.2",
          pronouns: "he/him",
        }),
        timezoneOverride: "Asia/Jerusalem",
        capturedAtOverride: "2026-04-18T22:15:00.000Z",
      },
      root,
    );
    expect(code).toBe(0);

    // Import here to avoid hoisting the runtime module into the top of the file
    // (keeps setup-only tests independent of the runtime path).
    const { assembleRoleContext } = await import("../../runtime/context.js");
    const ctx = assembleRoleContext("alpha", root);
    expect(ctx).toContain("## Memory");
    expect(ctx).toContain("- **name**: Guy");
    expect(ctx).toContain("- **primary_goal**: ship v0.2");
    expect(ctx).toContain("- **timezone**: Asia/Jerusalem");
    expect(ctx).toContain("## Key goals");
    expect(ctx).toContain("ship v0.2");
  });
});

/* -------------------------------------------------------------------------- */
/* Real-repo shape checks                                                      */
/* -------------------------------------------------------------------------- */

describe("shipped role questions.yaml files", () => {
  const REPO_ROOT = path.resolve(__dirname, "..", "..");

  for (const role of ["agent-architect", "assistant", "creator", "tutor"]) {
    it(`${role}: loads and contains name + primary_goal`, () => {
      const qs = loadQuestions(role, REPO_ROOT);
      expect(qs.length).toBeGreaterThanOrEqual(3);
      expect(qs.length).toBeLessThanOrEqual(6);
      const ids = qs.map((q) => q.id);
      expect(ids).toContain("name");
      expect(ids).toContain("primary_goal");
      // name + primary_goal must both be required.
      const name = qs.find((q) => q.id === "name")!;
      const goal = qs.find((q) => q.id === "primary_goal")!;
      expect(name.required).toBe(true);
      expect(goal.required).toBe(true);
    });

    it(`${role}: every question has a valid memory_key and type`, () => {
      const qs = loadQuestions(role, REPO_ROOT);
      for (const q of qs) {
        expect(q.memory_key, `${role}/${q.id} memory_key`).toBeTruthy();
        expect(["text", "choice", "multi"]).toContain(q.type);
        if (q.type !== "text") {
          expect(q.options.length, `${role}/${q.id} options`).toBeGreaterThan(0);
        }
      }
    });
  }
});
