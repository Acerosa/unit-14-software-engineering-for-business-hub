import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeBlockView } from "./CodeBlockView";

const pythonWorkerClientMock = vi.hoisted(function () {
  return {
    ensurePythonWorker: vi.fn(async () => ({})),
    runPythonCode: vi.fn(async () => ({ stdout: "", stderr: "" })),
    runPythonTests: vi.fn(async () => ({
      stdout: "",
      stderr: "",
      tests: [],
      passedCount: 0,
      totalCount: 0
    })),
    resetPythonWorker: vi.fn(async () => {}),
    stopPythonExecution: vi.fn(async () => {}),
    subscribePythonExecution: vi.fn(function (listener: (active: boolean) => void) {
      listener(false);
      return function () {};
    }),
    isPythonExecutionActive: vi.fn(() => false),
    PythonExecutionBusyError: class PythonExecutionBusyError extends Error {},
    PythonExecutionStoppedError: class PythonExecutionStoppedError extends Error {}
  };
});

vi.mock("./pythonWorkerClient", () => pythonWorkerClientMock);

vi.mock("./MonacoEditorField", () => ({
  MonacoEditorField({ value }: { value: string }) {
    return <textarea aria-label="editor" value={value} readOnly />;
  }
}));

describe("CodeBlockView migration routing", () => {
  afterEach(cleanup);

  it("renders read-only examples without Run controls", () => {
    const { container } = render(
      <CodeBlockView
        block={{
          id: "w2-prob-code",
          type: "code-editor",
          content: {
            questionId: "u14-w2-prob-demo",
            label: "Read this example",
            instructions: "Predict the output.",
            starter: "print(1)"
          }
        } as never}
      />
    );
    expect(container.querySelector("[data-lp-code-mode='read-only']")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Run Python code" })).toBeNull();
    expect(screen.getByText("Read-only example")).toBeTruthy();
  });

  it("renders editable IDE blocks with Run", async () => {
    render(
      <CodeBlockView
        block={{
          id: "w1-io-ex",
          type: "python-exercise",
          content: {
            questionId: "u14-w1-io-code",
            starter: "print(1)",
            instructions: "Complete the program."
          }
        } as never}
      />
    );
    expect(await screen.findByRole("button", { name: "Run Python code" })).toBeEnabled();
  });

  it("renders local-only blocks without browser Run", () => {
    render(
      <CodeBlockView
        block={{
          id: "w6-tk-ex",
          type: "python-exercise",
          content: {
            questionId: "u14-w6-tk-code",
            instructions: "Run app.py locally — browser Run is disabled for tkinter.",
            starter: "import tkinter as tk\nwindow = tk.Tk()\nwindow.mainloop()\n",
            filename: "app.py"
          }
        } as never}
      />
    );
    expect(screen.getByText(/Run locally/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run unavailable for this exercise" })).toBeDisabled();
  });

  it("renders gitignore blocks without browser Run", () => {
    render(
      <CodeBlockView
        block={{
          id: "w2-gi-code",
          type: "code-editor",
          content: {
            questionId: "u14-w2-gi-add",
            instructions: "This is not Python to run.",
            starter: "__pycache__/\n"
          }
        } as never}
      />
    );
    expect(screen.getByText(/Run locally/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run unavailable for this exercise" })).toBeDisabled();
  });
});
