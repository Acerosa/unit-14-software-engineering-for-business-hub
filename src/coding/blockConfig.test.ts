import { describe, expect, it } from "vitest";
import type { ActivityBlockDocument } from "@learning-platform/ui";
import {
  codeInteractionMode,
  isReadOnlyCodeBlock,
  monacoModelPath,
  programInputDraftKey,
  resolveInitialProgramInput,
  sampleProgramInput,
  supportsBrowserExecution,
  usesTkinterCode
} from "./blockConfig";

function block(partial: Partial<ActivityBlockDocument> & { content?: Record<string, unknown> }): ActivityBlockDocument {
  return {
    id: "demo",
    type: "code-editor",
    content: {},
    ...partial
  } as ActivityBlockDocument;
}

describe("code block interaction modes", () => {
  it("routes predict-the-output examples as read-only", () => {
    const sample = block({
      content: {
        questionId: "u14-w2-prob-demo",
        instructions: "Predict the output, then answer below.",
        starter: "print(1)"
      }
    });
    expect(codeInteractionMode(sample)).toBe("read-only");
    expect(isReadOnlyCodeBlock(sample)).toBe(true);
    expect(supportsBrowserExecution(sample)).toBe(false);
  });

  it("routes gitignore editing as local-only", () => {
    const sample = block({
      content: {
        questionId: "u14-w2-gi-add",
        instructions: "This is not Python to run.",
        starter: "__pycache__/\n"
      }
    });
    expect(codeInteractionMode(sample)).toBe("local-only");
    expect(supportsBrowserExecution(sample)).toBe(false);
  });

  it("keeps editable python exercises on the browser IDE path", () => {
    const sample = block({
      type: "python-exercise",
      content: {
        questionId: "u14-w1-io-code",
        starter: "print(1)",
        instructions: "Complete the program."
      }
    });
    expect(codeInteractionMode(sample)).toBe("ide");
    expect(supportsBrowserExecution(sample)).toBe(true);
  });

  it("detects tkinter code for local-only execution", () => {
    const sample = block({
      type: "python-exercise",
      content: {
        questionId: "demo-tk",
        starter: "import tkinter as tk\nroot = tk.Tk()\n"
      }
    });
    expect(usesTkinterCode(sample)).toBe(true);
  });

  it("honours explicit interaction metadata", () => {
    expect(codeInteractionMode(block({ content: { interaction: "read-only" } }))).toBe("read-only");
    expect(codeInteractionMode(block({ content: { interaction: "local-only" } }))).toBe("local-only");
  });

  it("builds unique Monaco model paths from block id and filename", () => {
    expect(monacoModelPath("w2-dbg-1", "solution.py")).toBe("u14://w2-dbg-1/solution.py");
    expect(monacoModelPath("w2-dbg-2", "solution.py")).toBe("u14://w2-dbg-2/solution.py");
    expect(monacoModelPath("w2-dbg-1", "solution.py")).not.toBe(monacoModelPath("w2-dbg-2", "solution.py"));
  });

  it("reads optional authored sample Program input", () => {
    expect(sampleProgramInput(block({
      content: { sampleInput: ["Keyboard", "3", "24.99"] }
    }))).toEqual(["Keyboard", "3", "24.99"]);
    expect(sampleProgramInput(block({ content: {} }))).toEqual([]);
  });

  it("uses a separate draft key for Program input", () => {
    expect(programInputDraftKey(block({ content: { questionId: "u14-w1-io-code" } })))
      .toBe("u14-w1-io-code__programInput");
    expect(resolveInitialProgramInput(
      block({ content: { sampleInput: ["Keyboard"] } }),
      "saved"
    )).toBe("saved");
    expect(resolveInitialProgramInput(
      block({ content: { sampleInput: ["Keyboard"] } })
    )).toBe("Keyboard");
  });
});
