/**
 * Tests for setup/routine.ts (M7 — routine designer).
 *
 * Coverage:
 *   - validateRoutine: valid + several invalid shapes
 *   - validateRoutines: duplicate id detection, per-entry error surfacing
 *   - cron / interval grammar helpers
 *   - runList emits ROUTINE block with 3 starter prompts, role-appropriate
 *   - runList interpolates <primary_goal> from memory/context.md if present
 *   - runGenerate uses an injected LLM mock, validates output, prints block
 *   - runGenerate surfaces LLM failure vs schema failure with distinct codes
 *   - runCommit writes schedule.yaml with header + restore hint
 *   - runCommit is byte-idempotent on identical input
 *   - runCommit returns 4 on schema invalid, 5 on malformed JSON
 *   - runSkip writes empty-routines YAML, emits ROUTINES_CREATED: 0
 *   - Schema validation exercised on every shipped role (sanity check)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parse as parseYaml } from "yaml";

import {
  buildStarterPrompts,
  generateRoutine,
  isCronExpression,
  isIntervalExpression,
  isValidWhen,
  parseGeneratedYaml,
  renderScheduleYaml,
  runCommit,
  runGenerate,
  runList,
  runSkip,
  stripYamlFences,
  validateRoutine,
  validateRoutines,
  type Routine,
  type RoutineLLM,
} from "../routine.js";

/* -------------------------------------------------------------------------- */
/* Fixture helpers                                                             */
/* -------------------------------------------------------------------------- */

function mkdirp(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}
function writeFile(p: string, content: string): void {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, "utf-8");
}

function makeFixtureRoot(role = "alpha", extraMemory?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "podium-m7-"));
  writeFile(
    path.join(root, "agent", "memory", "active-role.yaml"),
    `role: ${role}\n`,
  );
  writeFile(
    path.join(root, "roles", role, "role.yaml"),
    `name: ${role}\n`,
  );
  if (extraMemory) {
    writeFile(
      path.join(root, "roles", role, "memory", "context.md"),
      extraMemory,
    );
  }
  return root;
}

/** Good routine used as a baseline for validation tests. */
const VALID: Routine = {
  id: "morning-inbox",
  name: "Morning inbox summary",
  when: "0 8 * * *",
  what: "Summarize my unread email from the last 24 hours, group by sender, flag anything time-sensitive.",
  inputs: ["gmail"],
  enabled: true,
};

/* -------------------------------------------------------------------------- */
/* when grammar                                                                */
/* -------------------------------------------------------------------------- */

describe("cron / interval helpers", () => {
  it("accepts 5-field cron", () => {
    expect(isCronExpression("0 8 * * *")).toBe(true);
    expect(isCronExpression("*/15 * * * *")).toBe(true);
    expect(isCronExpression("0 9 * * MON")).toBe(true);
  });
  it("accepts 6-field cron (with seconds)", () => {
    expect(isCronExpression("0 0 8 * * *")).toBe(true);
  });
  it("rejects empty, too short, and too long", () => {
    expect(isCronExpression("")).toBe(false);
    expect(isCronExpression("0 8 *")).toBe(false);
    expect(isCronExpression("0 0 0 0 0 0 0")).toBe(false);
  });
  it("accepts interval form", () => {
    expect(isIntervalExpression("every 30 minutes")).toBe(true);
    expect(isIntervalExpression("every 2 hours")).toBe(true);
    expect(isIntervalExpression("every 1 day")).toBe(true);
  });
  it("rejects bogus intervals", () => {
    expect(isIntervalExpression("every day")).toBe(false);
    expect(isIntervalExpression("every 5 fortnights")).toBe(false);
  });
  it("isValidWhen accepts either form, rejects nonsense", () => {
    expect(isValidWhen("0 8 * * *")).toBe(true);
    expect(isValidWhen("every 15 minutes")).toBe(true);
    expect(isValidWhen("soon")).toBe(false);
    expect(isValidWhen("")).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* validateRoutine                                                             */
/* -------------------------------------------------------------------------- */

describe("validateRoutine", () => {
  it("accepts a well-formed routine unchanged", () => {
    const r = validateRoutine(VALID);
    expect(r.ok).toBe(true);
    expect(r.routine).toEqual(VALID);
  });

  it("defaults enabled=true when omitted", () => {
    const { enabled: _omit, ...rest } = VALID;
    const r = validateRoutine(rest);
    expect(r.ok).toBe(true);
    expect(r.routine?.enabled).toBe(true);
  });

  it("normalizes missing inputs to []", () => {
    const { inputs: _omit, ...rest } = VALID;
    const r = validateRoutine(rest);
    expect(r.ok).toBe(true);
    expect(r.routine?.inputs).toEqual([]);
  });

  it("deduplicates + lowercases inputs", () => {
    const r = validateRoutine({ ...VALID, inputs: ["Gmail", "gmail", "calendar"] });
    expect(r.ok).toBe(true);
    expect(r.routine?.inputs).toEqual(["gmail", "calendar"]);
  });

  it("rejects missing required fields", () => {
    const r = validateRoutine({ id: "x" });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("name"))).toBe(true);
    expect(r.errors.some((e) => e.includes("when"))).toBe(true);
    expect(r.errors.some((e) => e.includes("what"))).toBe(true);
  });

  it("rejects invalid id slug (uppercase, symbols)", () => {
    expect(validateRoutine({ ...VALID, id: "NotASlug" }).ok).toBe(false);
    expect(validateRoutine({ ...VALID, id: "with space" }).ok).toBe(false);
    expect(validateRoutine({ ...VALID, id: "-leading-dash" }).ok).toBe(false);
  });

  it("rejects invalid when (not cron, not interval)", () => {
    const r = validateRoutine({ ...VALID, when: "whenever" });
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toContain("when");
  });

  it("rejects a too-short `what`", () => {
    const r = validateRoutine({ ...VALID, what: "x" });
    expect(r.ok).toBe(false);
  });

  it("rejects non-array inputs", () => {
    const r = validateRoutine({ ...VALID, inputs: "gmail" });
    expect(r.ok).toBe(false);
  });

  it("rejects non-boolean enabled", () => {
    const r = validateRoutine({ ...VALID, enabled: "yes" });
    expect(r.ok).toBe(false);
  });
});

describe("validateRoutines (array)", () => {
  it("accepts two distinct routines", () => {
    const r = validateRoutines([
      VALID,
      { ...VALID, id: "evening-shutdown", name: "Evening shutdown" },
    ]);
    expect(r.ok).toBe(true);
    expect(r.routines.length).toBe(2);
  });

  it("flags duplicate ids", () => {
    const r = validateRoutines([VALID, VALID]);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("surfaces per-entry errors with index prefix", () => {
    const r = validateRoutines([VALID, { ...VALID, id: "" }]);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.startsWith("routines[1]:"))).toBe(true);
  });

  it("rejects non-array input", () => {
    const r = validateRoutines({ id: "x" });
    expect(r.ok).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* YAML helpers                                                                */
/* -------------------------------------------------------------------------- */

describe("stripYamlFences + parseGeneratedYaml", () => {
  it("strips ```yaml fences", () => {
    const raw = "```yaml\nid: x\nname: y\n```";
    expect(stripYamlFences(raw)).toBe("id: x\nname: y");
  });

  it("passes through unfenced YAML", () => {
    const raw = "id: x\nname: y";
    expect(stripYamlFences(raw)).toBe(raw);
  });

  it("parseGeneratedYaml handles fenced + unfenced", () => {
    expect(parseGeneratedYaml("```yaml\nid: a\n```")).toEqual({ id: "a" });
    expect(parseGeneratedYaml("id: b")).toEqual({ id: "b" });
  });
});

/* -------------------------------------------------------------------------- */
/* renderScheduleYaml                                                          */
/* -------------------------------------------------------------------------- */

describe("renderScheduleYaml", () => {
  it("empty routines → header + routines: []", () => {
    const out = renderScheduleYaml("assistant", []);
    expect(out).toContain("# Podium schedule for assistant role.");
    expect(out).toContain("# Restore template: git checkout HEAD -- roles/assistant/schedule.yaml");
    expect(out).toContain("routines: []");
    expect(out).toContain("# No routines configured.");
  });

  it("one routine → valid YAML body with all keys in canonical order", () => {
    const out = renderScheduleYaml("assistant", [VALID]);
    expect(out).toContain("# Podium schedule for assistant role.");
    const afterHeader = out.split("\n").filter((l) => !l.startsWith("#") && l.trim() !== "").join("\n");
    const parsed = parseYaml(afterHeader) as { routines: Routine[] };
    expect(parsed.routines[0]).toEqual(VALID);
  });

  it("serialized output is byte-idempotent across calls with same input", () => {
    const a = renderScheduleYaml("assistant", [VALID]);
    const b = renderScheduleYaml("assistant", [VALID]);
    expect(a).toBe(b);
  });
});

/* -------------------------------------------------------------------------- */
/* runList                                                                     */
/* -------------------------------------------------------------------------- */

describe("runList", () => {
  let root: string;
  let logs: string[];

  beforeEach(() => {
    root = makeFixtureRoot("assistant");
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("emits ROUTINE block with 3 starter prompts", () => {
    const code = runList(root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: ROUTINE ===");
    expect(block).toContain("MODE: list");
    expect(block).toContain("ROLE: assistant");
    expect(block).toContain("STARTER_PROMPTS: 3");
    expect(block).toContain("STATUS: success");
    const m = block.match(/^DATA:\s*(.*)$/m);
    expect(m).not.toBeNull();
    const payload = JSON.parse(m![1]) as { starters: string[] };
    expect(payload.starters.length).toBe(3);
    expect(payload.starters[0]).toMatch(/inbox/i);
  });

  it("returns 2 and emits no_active_role when active-role.yaml is missing", () => {
    fs.rmSync(path.join(root, "agent"), { recursive: true, force: true });
    const code = runList(root);
    expect(code).toBe(2);
    expect(logs.join("\n")).toContain("STATUS: no_active_role");
  });

  it("interpolates <primary_goal> from memory/context.md for tutor", () => {
    fs.rmSync(root, { recursive: true, force: true });
    const tutorRoot = makeFixtureRoot(
      "tutor",
      [
        "---",
        "name: Guy",
        "primary_goal: Bayesian statistics",
        "timezone: Asia/Jerusalem",
        "---",
        "# Notes",
        "",
      ].join("\n"),
    );
    try {
      const prompts = buildStarterPrompts("tutor", tutorRoot);
      const joined = prompts.join("\n");
      expect(joined).toContain("Bayesian statistics");
      expect(joined).not.toContain("<primary_goal>");
    } finally {
      fs.rmSync(tutorRoot, { recursive: true, force: true });
    }
  });

  it("leaves <primary_goal> placeholder visible when memory is absent", () => {
    fs.rmSync(root, { recursive: true, force: true });
    const tutorRoot = makeFixtureRoot("tutor");
    try {
      const prompts = buildStarterPrompts("tutor", tutorRoot);
      expect(prompts.join("\n")).toContain("<primary_goal>");
    } finally {
      fs.rmSync(tutorRoot, { recursive: true, force: true });
    }
  });
});

/* -------------------------------------------------------------------------- */
/* runGenerate (mocked LLM)                                                    */
/* -------------------------------------------------------------------------- */

describe("runGenerate", () => {
  let logs: string[];

  beforeEach(() => {
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Mock LLM that returns a canned YAML string. */
  function mockLLM(out: string): RoutineLLM {
    return { complete: () => out };
  }

  it("happy path — valid YAML from LLM → structured routine", async () => {
    const llm = mockLLM(
      [
        "id: morning-inbox",
        'name: "Morning inbox summary"',
        'when: "0 8 * * *"',
        'what: "Summarize my unread email from the last 24 hours, group by sender."',
        "inputs: [gmail]",
        "enabled: true",
      ].join("\n"),
    );
    const result = await generateRoutine({
      description: "summarize my inbox each morning at 8am",
      llm,
    });
    expect(result.routine).toBeTruthy();
    expect(result.routine?.id).toBe("morning-inbox");
    expect(result.routine?.when).toBe("0 8 * * *");
    expect(result.routine?.inputs).toEqual(["gmail"]);
  });

  it("accepts ```yaml fenced output from the LLM", async () => {
    const llm = mockLLM(
      [
        "```yaml",
        "id: evening-shutdown",
        'name: "Evening shutdown"',
        'when: "0 18 * * 1-5"',
        'what: "End-of-day review — tomorrow\'s 3 priorities and unresolved threads."',
        "inputs: []",
        "enabled: true",
        "```",
      ].join("\n"),
    );
    const result = await generateRoutine({ description: "daily shutdown", llm });
    expect(result.routine?.id).toBe("evening-shutdown");
  });

  it("returns schema errors when LLM output is valid YAML but invalid routine", async () => {
    const llm = mockLLM("id: x\nname: y\nwhen: whenever\nwhat: too short\n");
    const result = await generateRoutine({ description: "x", llm });
    expect(result.routine).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.llmFailed).toBe(false);
  });

  it("returns llmFailed=true when the LLM throws", async () => {
    const llm: RoutineLLM = {
      complete: () => {
        throw new Error("claude CLI timed out");
      },
    };
    const result = await generateRoutine({ description: "x", llm });
    expect(result.llmFailed).toBe(true);
    expect(result.errors.join(" ")).toContain("timed out");
  });

  it("runGenerate → exit 0 + STATUS: success on happy path", async () => {
    const llm = mockLLM(
      [
        "id: morning-inbox",
        'name: "Morning inbox summary"',
        'when: "0 8 * * *"',
        'what: "Summarize my unread email from the last 24 hours."',
        "inputs: [gmail]",
        "enabled: true",
      ].join("\n"),
    );
    const code = await runGenerate({
      description: "summarize my inbox each morning",
      llm,
    });
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("MODE: generate");
    expect(block).toContain("VALIDATED: true");
    expect(block).toContain("STATUS: success");
    const m = block.match(/^DATA:\s*(.*)$/m);
    expect(m).not.toBeNull();
    const payload = JSON.parse(m![1]) as { routine: Routine };
    expect(payload.routine.id).toBe("morning-inbox");
  });

  it("runGenerate → exit 3 + STATUS: generation_failed when LLM throws", async () => {
    const llm: RoutineLLM = {
      complete: () => {
        throw new Error("boom");
      },
    };
    const code = await runGenerate({ description: "anything", llm });
    expect(code).toBe(3);
    expect(logs.join("\n")).toContain("STATUS: generation_failed");
  });

  it("runGenerate → exit 4 + STATUS: invalid_schema on schema failure", async () => {
    const llm: RoutineLLM = { complete: () => "id: NotASlug\nname: y\nwhen: whenever\nwhat: x" };
    const code = await runGenerate({ description: "x", llm });
    expect(code).toBe(4);
    expect(logs.join("\n")).toContain("STATUS: invalid_schema");
  });
});

/* -------------------------------------------------------------------------- */
/* runCommit                                                                   */
/* -------------------------------------------------------------------------- */

describe("runCommit", () => {
  let root: string;
  let logs: string[];

  beforeEach(() => {
    root = makeFixtureRoot("assistant");
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes schedule.yaml with header + routines and emits success block", () => {
    const code = runCommit(
      { routinesJson: JSON.stringify([VALID]) },
      root,
    );
    expect(code).toBe(0);

    const block = logs.join("\n");
    expect(block).toContain("=== PODIUM SETUP: ROUTINE ===");
    expect(block).toContain("MODE: commit");
    expect(block).toContain("ROLE: assistant");
    expect(block).toContain("ROUTINES_CREATED: 1");
    expect(block).toContain("SCHEDULE_PATH: roles/assistant/schedule.yaml");
    expect(block).toContain("STATUS: success");

    const p = path.join(root, "roles", "assistant", "schedule.yaml");
    expect(fs.existsSync(p)).toBe(true);
    const raw = fs.readFileSync(p, "utf-8");
    expect(raw).toContain("# Podium schedule for assistant role.");
    expect(raw).toContain("# Restore template: git checkout HEAD -- roles/assistant/schedule.yaml");
    // Strip header, parse body.
    const afterComments = raw.split("\n").filter((l) => !l.startsWith("#") && l.trim() !== "").join("\n");
    const parsed = parseYaml(afterComments) as { routines: Routine[] };
    expect(parsed.routines[0]).toEqual(VALID);
  });

  it("is byte-idempotent on identical input", () => {
    runCommit({ routinesJson: JSON.stringify([VALID]) }, root);
    const p = path.join(root, "roles", "assistant", "schedule.yaml");
    const first = fs.readFileSync(p, "utf-8");
    runCommit({ routinesJson: JSON.stringify([VALID]) }, root);
    const second = fs.readFileSync(p, "utf-8");
    expect(second).toBe(first);
  });

  it("returns 4 + STATUS: invalid_schema on schema violation", () => {
    const code = runCommit(
      { routinesJson: JSON.stringify([{ ...VALID, id: "BadSlug" }]) },
      root,
    );
    expect(code).toBe(4);
    expect(logs.join("\n")).toContain("STATUS: invalid_schema");
    // File not written
    expect(
      fs.existsSync(path.join(root, "roles", "assistant", "schedule.yaml")),
    ).toBe(false);
  });

  it("returns 5 + STATUS: malformed_routines on bad JSON", () => {
    const code = runCommit({ routinesJson: "{not json" }, root);
    expect(code).toBe(5);
    expect(logs.join("\n")).toContain("STATUS: malformed_routines");
  });

  it("returns 2 + STATUS: no_active_role when active-role.yaml is missing", () => {
    fs.rmSync(path.join(root, "agent"), { recursive: true, force: true });
    const code = runCommit(
      { routinesJson: JSON.stringify([VALID]) },
      root,
    );
    expect(code).toBe(2);
    expect(logs.join("\n")).toContain("STATUS: no_active_role");
  });

  it("overwrites an existing schedule.yaml (template replacement)", () => {
    // Seed the shipped template first.
    const p = path.join(root, "roles", "assistant", "schedule.yaml");
    writeFile(p, "# SHIPPED TEMPLATE\njobs: []\n");
    const code = runCommit(
      { routinesJson: JSON.stringify([VALID]) },
      root,
    );
    expect(code).toBe(0);
    const raw = fs.readFileSync(p, "utf-8");
    expect(raw).not.toContain("SHIPPED TEMPLATE");
    expect(raw).toContain("morning-inbox");
  });
});

/* -------------------------------------------------------------------------- */
/* runSkip                                                                     */
/* -------------------------------------------------------------------------- */

describe("runSkip", () => {
  let root: string;
  let logs: string[];

  beforeEach(() => {
    root = makeFixtureRoot("assistant");
    logs = [];
    vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes an empty-routines schedule.yaml, exits 0", () => {
    const code = runSkip(root);
    expect(code).toBe(0);
    const block = logs.join("\n");
    expect(block).toContain("MODE: skip");
    expect(block).toContain("ROUTINES_CREATED: 0");
    expect(block).toContain("STATUS: success");

    const p = path.join(root, "roles", "assistant", "schedule.yaml");
    expect(fs.existsSync(p)).toBe(true);
    const raw = fs.readFileSync(p, "utf-8");
    expect(raw).toContain("# No routines configured.");
    expect(raw).toContain("routines: []");
    // Parses as YAML cleanly (just comments + empty array).
    const afterComments = raw
      .split("\n")
      .filter((l) => !l.startsWith("#") && l.trim() !== "")
      .join("\n");
    const parsed = parseYaml(afterComments) as { routines: unknown[] };
    expect(parsed.routines).toEqual([]);
  });

  it("returns 2 + no_active_role when active-role.yaml is missing", () => {
    fs.rmSync(path.join(root, "agent"), { recursive: true, force: true });
    const code = runSkip(root);
    expect(code).toBe(2);
    expect(logs.join("\n")).toContain("STATUS: no_active_role");
  });
});

/* -------------------------------------------------------------------------- */
/* Shipped roles — starter prompts render for every role                       */
/* -------------------------------------------------------------------------- */

describe("shipped roles — starter prompts", () => {
  const REPO_ROOT = path.resolve(__dirname, "..", "..");
  for (const role of ["agent-architect", "assistant", "creator", "tutor"]) {
    it(`${role}: buildStarterPrompts returns exactly 3 non-empty strings`, () => {
      const prompts = buildStarterPrompts(role, REPO_ROOT);
      expect(prompts.length).toBe(3);
      for (const p of prompts) {
        expect(p.length).toBeGreaterThan(10);
      }
    });
  }
});
