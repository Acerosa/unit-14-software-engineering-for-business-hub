import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PythonCodeExercise } from "./PythonCodeExercise";

vi.mock("./MonacoEditorField", () => ({
  MonacoEditorField({
    value,
    onChange,
    modelId,
    filename
  }: {
    value: string;
    onChange: (next: string) => void;
    modelId: string;
    filename: string;
  }) {
    return (
      <textarea
        data-model-id={modelId}
        data-filename={filename}
        aria-label={`${filename} Python editor`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
}));

const workerMocks = vi.hoisted(function () {
  const base = {
    ensurePythonWorker: vi.fn(async () => ({})),
    runPythonCode: vi.fn(async () => ({ stdout: "Hello\n", stderr: "" })),
    runPythonTests: vi.fn(async () => ({
      stdout: "",
      stderr: "",
      tests: [{ id: "t1", label: "Test 1", passed: true }],
      passedCount: 1,
      totalCount: 1
    })),
    resetPythonWorker: vi.fn(async () => {}),
    stopPythonExecution: vi.fn(async () => {}),
    subscribePythonExecution: vi.fn(function (listener: (active: boolean) => void) {
      listener(false);
      return function () {};
    }),
    isPythonExecutionActive: vi.fn(() => false),
    PythonExecutionBusyError: class PythonExecutionBusyError extends Error {
      constructor() {
        super("Another Python exercise is currently running. Wait for it to finish or stop it.");
        this.name = "PythonExecutionBusyError";
      }
    },
    PythonExecutionStoppedError: class PythonExecutionStoppedError extends Error {
      constructor() {
        super("Execution stopped.");
        this.name = "PythonExecutionStoppedError";
      }
    }
  };
  return base;
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

  it("calls onProgramInputChange when Program input is edited", async () => {
    const onProgramInputChange = vi.fn();
    render(<PythonCodeExercise block={block} onProgramInputChange={onProgramInputChange} />);
    fireEvent.change(screen.getByLabelText("Program input"), { target: { value: "Keyboard\n3" } });
    expect(onProgramInputChange).toHaveBeenCalledWith("Keyboard\n3");
  });

  it("initialises Program input from a draft value instead of sampleInput", () => {
    render(
      <PythonCodeExercise
        block={{
          ...block,
          content: { ...block.content, sampleInput: ["sample"] }
        } as never}
        initialProgramInput="saved draft"
      />
    );
    expect(screen.getByLabelText("Program input")).toHaveValue("saved draft");
  });

  it("shows Stop while running and stops execution", async () => {
    let resolveRun: (value: unknown) => void = () => {};
    workerMocks.runPythonTests.mockReturnValueOnce(new Promise(function (resolve) {
      resolveRun = resolve;
    }));
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    expect(screen.getByRole("button", { name: "Stop Python execution" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Stop Python execution" }));
    expect(workerMocks.stopPythonExecution).toHaveBeenCalled();
    resolveRun({
      stdout: "",
      stderr: "",
      tests: [{ id: "t1", label: "Test 1", passed: true }],
      passedCount: 1,
      totalCount: 1
    });
  });

  it("passes Program input lines to the worker when running", async () => {
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.change(screen.getByLabelText("Program input"), { target: { value: "Keyboard" } });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    await waitFor(function () {
      expect(workerMocks.runPythonTests).toHaveBeenCalled();
    });
    expect(workerMocks.runPythonTests).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.any(Array),
      ["Keyboard"]
    );
  });

  it("keeps Program input independent between exercises", async () => {
    const blockA = {
      id: "stdin-a",
      type: "python-exercise",
      content: {
        questionId: "stdin-a",
        filename: "solution.py",
        starter: "print(1)",
        sampleInput: ["alpha"]
      }
    } as never;
    const blockB = {
      id: "stdin-b",
      type: "python-exercise",
      content: {
        questionId: "stdin-b",
        filename: "solution.py",
        starter: "print(2)",
        sampleInput: ["beta"]
      }
    } as never;

    render(
      <>
        <PythonCodeExercise block={blockA} />
        <PythonCodeExercise block={blockB} />
      </>
    );

    const inputs = screen.getAllByLabelText("Program input");
    expect(inputs[0]).toHaveValue("alpha");
    expect(inputs[1]).toHaveValue("beta");

    fireEvent.change(inputs[0], { target: { value: "changed-a" } });
    expect(inputs[1]).toHaveValue("beta");
  });

  it("restores authored sample input on reset", async () => {
    const sampleBlock = {
      ...block,
      content: {
        ...block.content,
        sampleInput: ["Keyboard", "3"]
      }
    } as never;
    render(<PythonCodeExercise block={sampleBlock} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    const input = screen.getByLabelText("Program input");
    fireEvent.change(input, { target: { value: "temporary" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset code to starter template" }));
    expect(input).toHaveValue("Keyboard\n3");
  });

  it("does not clear Program input when clearing output", async () => {
    render(<PythonCodeExercise block={block} />);
    await waitFor(function () {
      expect(screen.getByRole("button", { name: "Run Python code" })).toBeEnabled();
    });
    fireEvent.change(screen.getByLabelText("Program input"), { target: { value: "Keyboard" } });
    fireEvent.click(screen.getByRole("button", { name: "Run Python code" }));
    await waitFor(function () {
      expect(screen.getByText(/Test 1/)).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear output" }));
    expect(screen.getByLabelText("Program input")).toHaveValue("Keyboard");
  });

  it("keeps multiple exercises with the same filename independent", async () => {
    const onResultA = vi.fn();
    const onResultB = vi.fn();
    const blockA = {
      id: "w2-dbg-1",
      type: "python-exercise",
      content: {
        questionId: "u14-w2-dbg-1",
        filename: "solution.py",
        starter: "print(1)",
        instructions: "Fix program 1."
      }
    } as never;
    const blockB = {
      id: "w2-dbg-2",
      type: "python-exercise",
      content: {
        questionId: "u14-w2-dbg-2",
        filename: "solution.py",
        starter: "print(2)",
        instructions: "Fix program 2."
      }
    } as never;

    render(
      <>
        <PythonCodeExercise block={blockA} onResult={onResultA} />
        <PythonCodeExercise block={blockB} onResult={onResultB} />
      </>
    );

    await waitFor(function () {
      expect(screen.getAllByRole("button", { name: "Run Python code" })).toHaveLength(2);
    });

    const editors = screen.getAllByLabelText("solution.py Python editor");
    expect(editors[0]).toHaveAttribute("data-model-id", "w2-dbg-1");
    expect(editors[1]).toHaveAttribute("data-model-id", "w2-dbg-2");
    expect(editors[0]).toHaveValue("print(1)");
    expect(editors[1]).toHaveValue("print(2)");

    fireEvent.change(editors[0], { target: { value: "print(\"changed-a\")" } });
    expect(editors[1]).toHaveValue("print(2)");
    expect(onResultA.mock.calls.at(-1)?.[0].responses).toBe("print(\"changed-a\")");
    expect(onResultB.mock.calls.at(-1)?.[0].responses).toBe("print(2)");

    fireEvent.click(screen.getAllByRole("button", { name: "Reset code to starter template" })[0]);
    expect(editors[0]).toHaveValue("print(1)");
    expect(editors[1]).toHaveValue("print(2)");
  });
});
