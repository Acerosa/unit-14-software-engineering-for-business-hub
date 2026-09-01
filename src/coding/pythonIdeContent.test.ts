import { describe, expect, it } from "vitest";
import engine from "../../content/engine/index.js";
import { codeInteractionMode, isCodeBlockType } from "./blockConfig";

const OUTDATED_IDE_PHRASES = [
  /does not execute/i,
  /check only looks for/i,
  /check looks for those calls/i,
  /the hub only checks structure/i,
  /check looks for conversion/i
];

describe("Unit 14 IDE instruction wording", () => {
  const pkg = engine.loadPackageFromDirectory("content/unit-14");
  const ideBlocks: Array<{ blockId: string; instructions: string }> = [];

  for (let week = 1; week <= 6; week++) {
    const resolved = engine.resolveWeek(pkg, `week-${week}`);
    if (!resolved) continue;
    (resolved.sessions || []).forEach(function (session) {
      (session.activities || []).forEach(function (activity) {
        (activity.document.blocks || []).forEach(function (block) {
          if (!isCodeBlockType(block.type)) return;
          if (codeInteractionMode(block) !== "ide") return;
          const instructions = String((block.content || {}).instructions || "");
          if (instructions) {
            ideBlocks.push({ blockId: block.id, instructions });
          }
        });
      });
    });
  }

  it("does not use legacy non-execution wording on browser IDE blocks", () => {
    const outdated = ideBlocks.filter(function (item) {
      return OUTDATED_IDE_PHRASES.some(function (pattern) {
        return pattern.test(item.instructions);
      });
    });
    expect(outdated).toEqual([]);
  });
});
