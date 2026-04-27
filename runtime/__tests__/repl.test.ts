/**
 * Unit tests for runtime/repl.ts pure functions.
 *
 * Only exercises parseInput + formatTranscript — the readline loop itself
 * needs an integration harness and is covered by the manual smoke test
 * (`npm run chat`).
 */
import { describe, expect, it } from "vitest";

import { formatTranscript, parseInput, type Turn } from "../repl.js";

describe("parseInput", () => {
  it("classifies empty and whitespace-only input as noop", () => {
    expect(parseInput("")).toEqual({ kind: "noop" });
    expect(parseInput("   ")).toEqual({ kind: "noop" });
    expect(parseInput("\t\n")).toEqual({ kind: "noop" });
  });

  it("recognizes /quit, /exit, :q as exit", () => {
    expect(parseInput("/quit")).toEqual({ kind: "exit" });
    expect(parseInput("/exit")).toEqual({ kind: "exit" });
    expect(parseInput(":q")).toEqual({ kind: "exit" });
    expect(parseInput("  /quit  ")).toEqual({ kind: "exit" });
  });

  it("recognizes /clear as clear", () => {
    expect(parseInput("/clear")).toEqual({ kind: "clear" });
  });

  it("recognizes /help and /? as help", () => {
    expect(parseInput("/help")).toEqual({ kind: "help" });
    expect(parseInput("/?")).toEqual({ kind: "help" });
  });

  it("treats anything else as a message to send (trimmed)", () => {
    expect(parseInput("hello there")).toEqual({ kind: "send", text: "hello there" });
    expect(parseInput("  hi  ")).toEqual({ kind: "send", text: "hi" });
  });

  it("does not treat unknown slash strings as commands", () => {
    expect(parseInput("/unknown")).toEqual({ kind: "send", text: "/unknown" });
    expect(parseInput("/help me please")).toEqual({ kind: "send", text: "/help me please" });
  });
});

describe("formatTranscript", () => {
  it("returns the current message untouched on an empty transcript", () => {
    expect(formatTranscript([], "hello")).toBe("hello");
  });

  it("prefixes prior turns under labelled headers", () => {
    const transcript: Turn[] = [
      { role: "user", text: "what's 2+2?" },
      { role: "assistant", text: "4" },
    ];
    const out = formatTranscript(transcript, "and 3+3?");
    expect(out).toContain("[Conversation so far]");
    expect(out).toContain("You: what's 2+2?");
    expect(out).toContain("Me: 4");
    expect(out).toContain("[Current message]");
    expect(out).toContain("and 3+3?");
  });

  it("preserves transcript ordering", () => {
    const transcript: Turn[] = [
      { role: "user", text: "first" },
      { role: "assistant", text: "ack first" },
      { role: "user", text: "second" },
      { role: "assistant", text: "ack second" },
    ];
    const out = formatTranscript(transcript, "third");
    const idxFirst = out.indexOf("first");
    const idxSecond = out.indexOf("second");
    const idxThird = out.indexOf("third");
    expect(idxFirst).toBeGreaterThan(-1);
    expect(idxSecond).toBeGreaterThan(idxFirst);
    expect(idxThird).toBeGreaterThan(idxSecond);
  });
});
