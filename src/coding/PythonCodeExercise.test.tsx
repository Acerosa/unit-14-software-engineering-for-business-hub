import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PythonCodeExercise } from "./PythonCodeExercise";

vi.mock("./MonacoEditorField", () => ({
  MonacoEditorField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
    return (
      <textarea
        aria-label="solution.py Python editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
}));

const workerMocks = vi.hoisted(function () {
  return {
    ensurePythonWorker: vi.fn(async () => ({})),
    runPythonCode: vi.fn(async () => ({ stdout: "Hello\n", stderr: "" })),
    runPythonTests: vi.fn(async () => ({
      stdout: "",
      stderr: "",
      tests: [{ id: "t1", label: "Test 1", passed: true }],
      passedCount: 1,
      totalCount: 1
    }))
  };
});

vi.mock("./pythonWorkerClient", () => workerMocks);

const block = {
  id: "demo-exercise",
  type: "python-exercise",
  content: {
    questionId: "demo-q",
    filename: "solution.py",
    label: "Python editor",
    instructions: "Write a greeting.",
    starter: "print(\"Hello\")",
    checks: {
      required: [{ label: "print()", pattern: "print\\s*\\(" }],
      runtimeTests: [{ label: "Test 1", assertion: "True" }]
    }
  }
} as never;

describe("PythonCodeExercise", () => {
  beforeEach(function () {
    workerMocks.ensurePythonWorker.mockResolvedValue({});
    workerMocks.runPythonCode.mockResolvedValue({ stdout: "Hello\n", stderr: "" });
    workerMocks.runPythonTests.mockResolvedValue({
      stdout: "",
      stderr: "",
      tests: [{ id: "t1", label: "Test 1", passed: true }],
      passedCount: 1,
      totalCount: 1
    });
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  afterEach(function () {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders starter code and disables Run while Python loads", async () => {
    let resolveReady: (value: unknown) => void = () => {};
    workerMocks.ensurePythonWorker.mockReturnValue(new Promise(function (resolve) {
      resolveReady = resolve;
    }));
    render(<PythonCodeExercise block={block} />);
    expect(screen.getByLabelText("solution.py Python editor")).toHaveValue("print(\"Hello\")");
    expect(screen.getByRole("button", { name: "Run Python code" })).toBeDisabled();
    resolveReady({});
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
  });

  it("shows test results after a successful run", async () => {
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    await waitFor(function () {
      expect(screen.getByText(/Test 1/)).toBeTruthy();
      expect(screen.getByText(/1 \/ 1 passed/)).toBeTruthy();
    });
    expect(workerMocks.runPythonTests).toHaveBeenCalled();
  });

  it("shows stdout when no runtime tests are configured", async () => {
    const outputOnlyBlock = {
      ...block,
      content: {
        ...block.content,
        checks: { required: [{ label: "print()", pattern: "print\\s*\\(" }] }
      }
    } as never;
    render(<PythonCodeExercise block={outputOnlyBlock} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    await waitFor(function () {
      expect(screen.getByText("Hello")).toBeTruthy();
    });
    expect(workerMocks.runPythonCode).toHaveBeenCalled();
  });

  it("restores starter code on reset", async () => {
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    const editor = screen.getByLabelText("solution.py Python editor");
    fireEvent.change(editor, { target: { value: "print(\"Changed\")" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset code to starter template" }));
    expect(editor).toHaveValue("print(\"Hello\")");
  });

  it("emits formative activity results without authoritative marks", async () => {
    const onResult = vi.fn();
    render(<PythonCodeExercise block={block} onResult={onResult} />);
    await waitFor(function () {
      expect(onResult).toHaveBeenCalled();
    });
    const latest = onResult.mock.calls.at(-1)?.[0];
    expect(latest.completed).toBe(true);
    expect(latest.correct).toBeNull();
    expect(latest.responses).toContain("print");
  });

  it("renders Python errors in the output panel", async () => {
    workerMocks.runPythonTests.mockResolvedValueOnce({
      stdout: "",
      stderr: "",
      error: "NameError: name 'price' is not defined",
      tests: [{ id: "t1", label: "Test 1", passed: false, detail: "Fix the Python error before running tests." }],
      passedCount: 0,
      totalCount: 1
    });
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    await waitFor(function () {
      expect(screen.getByText(/NameError/)).toBeTruthy();
    });
  });
});
