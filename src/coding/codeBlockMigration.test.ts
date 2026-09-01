import { describe, expect, it } from "vitest";
import engine from "../../content/engine/index.js";
import {
  effectiveCodeInteractionMode,
  isCodeBlockType,
  supportsBrowserExecution
} from "./blockConfig";

describe("Unit 14 code block routing audit", () => {
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
            mode: effectiveCodeInteractionMode(block)
          });
        });
      });
    });
  }

  it("finds published code blocks in weeks 1–6", () => {
    expect(codeBlocks.filter((item) => item.week <= 2).length).toBe(22);
    expect(codeBlocks.filter((item) => item.week === 3).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 4).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 5).length).toBeGreaterThanOrEqual(5);
    expect(codeBlocks.filter((item) => item.week === 6).length).toBeGreaterThanOrEqual(3);
  });

  it("routes predict/read examples as read-only", () => {
    const readOnly = codeBlocks.filter((item) => item.mode === "read-only");
    expect(readOnly.length).toBeGreaterThanOrEqual(8);
    expect(readOnly.some((item) => item.blockId === "w3-sel-md")).toBe(true);
    expect(readOnly.some((item) => item.blockId === "w6-tk-win")).toBe(true);
  });

  it("routes gitignore and tkinter editing as local-only", () => {
    const localOnly = codeBlocks.filter((item) => item.mode === "local-only");
    expect(localOnly.map((item) => item.blockId).sort()).toEqual(
      ["w2-gi-code", "w6-tk-ex"].sort()
    );
  });

  it("keeps browser practice exercises on IDE execution", () => {
    const browserBlocks = codeBlocks.filter((item) => item.mode === "ide");
    expect(browserBlocks.length).toBeGreaterThanOrEqual(30);
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
