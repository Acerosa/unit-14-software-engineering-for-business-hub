import { describe, expect, it } from "vitest";
import engine from "../../content/engine/index.js";
import {
  codeInteractionMode,
  effectiveCodeInteractionMode,
  isCodeBlockType,
  isReadOnlyCodeBlock,
  runtimeTests,
  sampleProgramInput,
  supportsBrowserExecution,
  usesTkinterCode
} from "./blockConfig";

describe("Unit 14 weeks 3–6 coding integration", () => {
  const pkg = engine.loadPackageFromDirectory("content/unit-14");
  const codeBlocks: Array<{
    week: number;
    blockId: string;
    questionId: string;
    mode: string;
    hasRuntimeTests: boolean;
    hasSampleInput: boolean;
    usesInput: boolean;
  }> = [];

  for (let week = 3; week <= 6; week++) {
    const resolved = engine.resolveWeek(pkg, `week-${week}`);
    expect(resolved, `week-${week} should resolve`).toBeTruthy();
    expect((resolved?.sessions || []).length).toBeGreaterThan(0);
    (resolved?.sessions || []).forEach(function (session) {
      (session.activities || []).forEach(function (activity) {
        (activity.document.blocks || []).forEach(function (block) {
          if (!isCodeBlockType(block.type)) return;
          const content = block.content || {};
          const starter = String(content.starter || "");
          codeBlocks.push({
            week,
            blockId: block.id,
            questionId: String(content.questionId || block.id),
            mode: effectiveCodeInteractionMode(block),
            hasRuntimeTests: runtimeTests(block).length > 0,
            hasSampleInput: sampleProgramInput(block).length > 0,
            usesInput: /\binput\s*\(/.test(starter)
          });
        });
      });
    });
  }

  it("includes coding blocks in weeks 3–6", () => {
    expect(codeBlocks.filter((item) => item.week === 3).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 4).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 5).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 6).length).toBeGreaterThanOrEqual(3);
  });

  it("routes weeks 3–5 practice exercises to the browser IDE", () => {
    [3, 4, 5].forEach(function (week) {
      const browser = codeBlocks.filter(function (item) {
        return item.week === week && item.mode === "ide";
      });
      expect(browser.length).toBeGreaterThanOrEqual(4);
      browser.forEach(function (item) {
        const block = findBlock(item.blockId);
        expect(block && supportsBrowserExecution(block)).toBe(true);
        expect(block && usesTkinterCode(block)).toBe(false);
      });
    });
  });

  it("routes week 6 tkinter as local-only and examples as read-only", () => {
    const week6 = codeBlocks.filter(function (item) { return item.week === 6; });
    const tkApp = week6.find(function (item) { return item.questionId === "u14-w6-tk-code"; });
    expect(tkApp?.mode).toBe("local-only");
    const readOnly = week6.filter(function (item) { return item.mode === "read-only"; });
    expect(readOnly.length).toBe(2);
    readOnly.forEach(function (item) {
      const block = findBlock(item.blockId);
      expect(block && isReadOnlyCodeBlock(block)).toBe(true);
    });
  });

  it("uses runtimeTests selectively on function-based exercises", () => {
    const withTests = codeBlocks.filter(function (item) { return item.hasRuntimeTests; });
    expect(withTests.length).toBeGreaterThanOrEqual(10);
    expect(withTests.some(function (item) { return item.week === 3; })).toBe(true);
    expect(withTests.some(function (item) { return item.week === 5; })).toBe(true);
    const debugOnly = codeBlocks.filter(function (item) {
      return item.blockId.includes("dbg") && item.hasRuntimeTests;
    });
    expect(debugOnly.length).toBeGreaterThan(0);
  });

  it("does not use input() on week 3–5 function-first exercises with runtimeTests", () => {
    const functionTests = codeBlocks.filter(function (item) {
      return item.hasRuntimeTests && item.week >= 3 && item.week <= 5;
    });
    functionTests.forEach(function (item) {
      expect(item.usesInput).toBe(false);
    });
  });

  function findBlock(blockId: string) {
    for (let week = 3; week <= 6; week++) {
      const resolved = engine.resolveWeek(pkg, `week-${week}`);
      const block = resolved?.sessions
        ?.flatMap((session) => session.activities || [])
        .flatMap((activity) => activity.document.blocks || [])
        .find((candidate) => candidate.id === blockId);
      if (block) return block;
    }
    return null;
  }
});
