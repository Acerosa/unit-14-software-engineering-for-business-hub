import { describe, expect, it } from "vitest";
import engine from "../../content/engine/index.js";
import {
  codeInteractionMode,
  isCodeBlockType,
  supportsBrowserExecution
} from "./blockConfig";

describe("Unit 14 code block migration audit", () => {
  const pkg = engine.loadPackageFromDirectory("content/unit-14");
  const codeBlocks: Array<{ week: number; activityId: string; blockId: string; mode: string }> = [];

  for (let week = 1; week <= 6; week++) {
    const resolved = engine.resolveWeek(pkg, `week-${week}`);
    if (!resolved) continue;
    (resolved.sessions || []).forEach((session) => {
      (session.activities || []).forEach((activity) => {
        (activity.document.blocks || []).forEach((block) => {
          if (!isCodeBlockType(block.type)) return;
          codeBlocks.push({
            week,
            activityId: activity.document.id,
            blockId: block.id,
            mode: codeInteractionMode(block)
          });
        });
      });
    });
  }

  it("finds all published code blocks in weeks 1–2", () => {
    expect(codeBlocks.length).toBe(22);
    expect(codeBlocks.some((item) => item.week === 1)).toBe(true);
    expect(codeBlocks.some((item) => item.week === 2)).toBe(true);
  });

  it("routes predict/read examples as read-only", () => {
    const readOnly = codeBlocks.filter((item) => item.mode === "read-only");
    expect(readOnly.map((item) => item.blockId).sort()).toEqual([
      "w2-cln-md",
      "w2-conv-fail",
      "w2-conv-md",
      "w2-fmt-md",
      "w2-prob-code",
      "w2-sub-md"
    ]);
  });

  it("routes gitignore editing as local-only", () => {
    expect(codeBlocks.filter((item) => item.mode === "local-only")).toEqual([
      expect.objectContaining({ blockId: "w2-gi-code" })
    ]);
  });

  it("keeps practice exercises on browser IDE execution", () => {
    const browserBlocks = codeBlocks.filter((item) => item.mode === "ide");
    expect(browserBlocks.length).toBe(15);
    browserBlocks.forEach((item) => {
      const week = engine.resolveWeek(pkg, `week-${item.week}`);
      const block = week?.sessions
        ?.flatMap((session) => session.activities || [])
        .flatMap((activity) => activity.document.blocks || [])
        .find((candidate) => candidate.id === item.blockId);
      expect(block && supportsBrowserExecution(block)).toBe(true);
    });
  });
});
