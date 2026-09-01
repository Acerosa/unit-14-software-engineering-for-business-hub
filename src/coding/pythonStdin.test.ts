import { describe, expect, it } from "vitest";
import {
  INPUT_EXHAUSTED_MESSAGE,
  createStdinReader,
  formatLearnerPythonError,
  inputExhaustedMessage,
  parseProgramInput
} from "./pythonStdin";

describe("pythonStdin", () => {
  it("parses one value per line including empty lines", () => {
    expect(parseProgramInput("Keyboard\n3\n24.99")).toEqual(["Keyboard", "3", "24.99"]);
    expect(parseProgramInput("first\n\nthird")).toEqual(["first", "", "third"]);
    expect(parseProgramInput("")).toEqual([]);
  });

  it("ignores a trailing newline without creating an extra empty input", () => {
    expect(parseProgramInput("Keyboard\n3\n24.99\n")).toEqual(["Keyboard", "3", "24.99"]);
  });

  it("preserves a deliberate blank line before a trailing newline", () => {
    expect(parseProgramInput("Keyboard\n\n24.99\n")).toEqual(["Keyboard", "", "24.99"]);
  });

  it("consumes stdin lines in order", () => {
    const reader = createStdinReader(["Keyboard", "3", "24.99"]);
    expect(reader.readLine()).toBe("Keyboard");
    expect(reader.readLine()).toBe("3");
    expect(reader.readLine()).toBe("24.99");
    expect(reader.readLine()).toBeNull();
    expect(reader.remaining()).toBe(0);
  });

  it("formats input exhaustion with the last prompt when available", () => {
    expect(inputExhaustedMessage("Product name: ", "Product name: ")).toContain(INPUT_EXHAUSTED_MESSAGE);
    expect(inputExhaustedMessage("Product name: ", "Product name: ")).toContain("Product name:");
  });

  it("maps Pyodide IO errors to a learner-facing exhaustion message", () => {
    expect(formatLearnerPythonError("OSError: [Errno 29] I/O error", "Quantity: ")).toContain(INPUT_EXHAUSTED_MESSAGE);
    expect(formatLearnerPythonError("EOFError: EOF when reading a line", "Price: ")).toContain(INPUT_EXHAUSTED_MESSAGE);
  });

  it("strips internal Pyodide frames from tracebacks", () => {
    const raw = [
      "Traceback (most recent call last):",
      '  File "<exec>", line 2, in <module>',
      "ValueError: invalid literal for int() with base 10: 'abc'",
      '  File "/lib/python312.zip/_pyodide/_base.py", line 123, in eval_code'
    ].join("\n");
    const formatted = formatLearnerPythonError(raw);
    expect(formatted).toContain("ValueError");
    expect(formatted).not.toContain("_pyodide/_base.py");
  });
});
