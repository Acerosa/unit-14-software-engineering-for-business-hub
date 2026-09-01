import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ActivityBlockDocument, ActivityResult } from "@learning-platform/ui";
import {
  blockContent,
  editorFilename,
  editorLabel,
  isPythonExercise,
  runtimeTests,
  starterCode,
  structureCheckLabels
} from "./blockConfig";
import { MonacoEditorField } from "./MonacoEditorField";
import { ensurePythonWorker, runPythonCode, runPythonTests } from "./pythonWorkerClient";
import type { RuntimeState, RunCodeResult, RunTestsResult } from "./types";

function emitCodeResult(code: string, attempts: number): ActivityResult {
  const trimmed = code.trim();
  return {
    completed: trimmed.length > 0,
    correct: null,
    attempts,
    responses: code
  };
}

function formatOutput(result: RunCodeResult): string {
  if (result.error) return result.error;
  if (result.stdout) return result.stdout;
  if (result.stderr) return result.stderr;
  return "Program finished with no output.";
}

function runtimeLabel(state: RuntimeState): string {
  if (state === "loading") return "Loading Python environment…";
  if (state === "ready") return "Ready";
  if (state === "running") return "Running…";
  if (state === "completed") return "Completed";
  if (state === "timeout") return "Execution timed out";
  if (state === "error") return "Python environment unavailable";
  return "";
}

export function PythonCodeExercise({
  block,
  initialCode,
  executionMode = "browser",
  onResult
}: {
  block: ActivityBlockDocument;
  initialCode?: string;
  executionMode?: "browser" | "local-only";
  onResult?: (result: ActivityResult) => void;
}) {
  const content = blockContent(block);
  const starter = starterCode(block);
  const localOnly = executionMode === "local-only";
  const [code, setCode] = useState(typeof initialCode === "string" && initialCode.length ? initialCode : starter);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>(localOnly ? "ready" : "idle");
  const [outputMode, setOutputMode] = useState<"idle" | "output" | "error" | "tests">("idle");
  const [outputText, setOutputText] = useState("");
  const [testSummary, setTestSummary] = useState<RunTestsResult | null>(null);
  const [statusMessage, setStatusMessage] = useState(localOnly ? "Edit here. Run locally in your Python environment." : "");
  const [runAttempts, setRunAttempts] = useState(0);
  const [editorFallback, setEditorFallback] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const statusId = useId();
  const outputId = useId();
  const tests = localOnly ? [] : runtimeTests(block);
  const concepts = structureCheckLabels(block);
  const exercise = isPythonExercise(block);

  useEffect(function () {
    if (localOnly) return;
    let cancelled = false;
    setRuntimeState("loading");
    setStatusMessage("Loading Python environment…");
    ensurePythonWorker().then(function () {
      if (cancelled) return;
      setRuntimeState("ready");
      setStatusMessage("Ready");
    }).catch(function () {
      if (cancelled) return;
      setRuntimeState("error");
      setStatusMessage("Python environment unavailable. You can still edit code, but Run is disabled.");
    });
    return function () { cancelled = true; };
  }, [localOnly]);

  useEffect(function () {
    onResult?.(emitCodeResult(code, runAttempts));
  }, [code, onResult, runAttempts]);

  const handleCodeChange = useCallback(function (next: string) {
    setCode(next);
  }, []);

  const handleReset = useCallback(function () {
    const dirty = code !== starter;
    if (dirty && !window.confirm("Reset this exercise back to the starter code?")) return;
    setCode(starter);
    setOutputMode("idle");
    setOutputText("");
    setTestSummary(null);
    setStatusMessage(runtimeState === "ready" ? "Ready" : runtimeLabel(runtimeState));
    onResult?.(emitCodeResult(starter, runAttempts));
  }, [code, onResult, runAttempts, runtimeState, starter]);

  const handleRun = useCallback(async function () {
    if (runtimeState !== "ready" && runtimeState !== "completed") return;
    if (!code.trim()) {
      setOutputMode("error");
      setOutputText("Add some Python before running.");
      setStatusMessage("Add Python code before running.");
      return;
    }
    setRuntimeState("running");
    setStatusMessage("Running…");
    setOutputMode("idle");
    setOutputText("");
    setTestSummary(null);
    setRunAttempts(function (value) { return value + 1; });

    try {
      const result = tests.length
        ? await runPythonTests(code, tests)
        : await runPythonCode(code);

      if (result.timedOut) {
        setRuntimeState("timeout");
        setOutputMode("error");
        setOutputText("Your program took too long to finish. The Python environment was reset.");
        setStatusMessage("Execution timed out");
        onResult?.(emitCodeResult(code, runAttempts + 1));
        return;
      }

      if ("tests" in result && result.tests.length) {
        setTestSummary(result);
        setOutputMode(result.error ? "error" : "tests");
        setOutputText(result.error ? result.error : (result.stdout || ""));
        setStatusMessage(`${result.passedCount} / ${result.totalCount} tests passed`);
      } else {
        setOutputMode(result.error ? "error" : "output");
        setOutputText(formatOutput(result));
        setStatusMessage(result.error ? "Python error" : "Completed");
      }
      setRuntimeState("completed");
      onResult?.(emitCodeResult(code, runAttempts + 1));
      outputRef.current?.focus();
    } catch (error) {
      setRuntimeState("error");
      setOutputMode("error");
      setOutputText(error instanceof Error ? error.message : "Run failed.");
      setStatusMessage("Python environment unavailable");
    }
  }, [code, onResult, runAttempts, runtimeState, tests]);

  const runDisabled = localOnly || runtimeState === "loading" || runtimeState === "running" || runtimeState === "error";

  return (
    <div
      className="lp-block lp-block--interactive lp-python-ide"
      data-lp-block={block.type}
      data-lp-block-id={block.id}
      data-lp-react-code="true"
      data-lp-code-mode={localOnly ? "local-only" : "ide"}
    >
      {content.instructions ? <p className="lp-instructions">{content.instructions}</p> : null}

      <div className="lp-python-ide__toolbar" role="group" aria-label="Python exercise controls">
        <div className="lp-python-ide__meta">
          <span className="lp-language-badge">Python</span>
          <span className="lp-python-ide__filename">{editorFilename(block)}</span>
        </div>
        <div className="lp-python-ide__actions">
          <button
            type="button"
            className="lp-button lp-button--secondary"
            onClick={handleReset}
            aria-label="Reset code to starter template"
          >
            Reset
          </button>
          <button
            type="button"
            className="lp-button"
            onClick={handleRun}
            disabled={runDisabled}
            aria-describedby={statusId}
            aria-label={localOnly ? "Run unavailable for this exercise" : "Run Python code"}
          >
            Run ▶
          </button>
        </div>
      </div>

      <p id={statusId} className="lp-python-ide__status" role="status" aria-live="polite">
        {statusMessage || runtimeLabel(runtimeState)}
        {editorFallback ? " Using basic editor fallback." : ""}
      </p>

      <label className="lp-label" htmlFor={`${block.id}-editor`}>{editorLabel(block)}</label>
      <div id={`${block.id}-editor`} className="lp-python-ide__editor-shell">
        <MonacoEditorField
          value={code}
          filename={editorFilename(block)}
          onChange={handleCodeChange}
          onFallback={() => setEditorFallback(true)}
        />
      </div>

      {concepts.length ? (
        <p className="lp-concepts">Expected constructs: {concepts.join(", ")}.</p>
      ) : null}

      {(content.hints || []).map(function (hint, index) {
        return (
          <details className="lp-hint" key={`${block.id}-hint-${index}`}>
            <summary>Hint {index + 1}</summary>
            <p>{hint}</p>
          </details>
        );
      })}

      {localOnly ? (
        <p className="lp-python-ide__local-note">
          This file is edited here for practice. Run it locally in your repository or Python environment — not in the browser.
        </p>
      ) : null}

      <section className="lp-python-ide__panel" aria-labelledby={outputId}>
        <div className="lp-python-ide__panel-header">
          <h4 id={outputId}>{tests.length && outputMode === "tests" ? "Tests" : "Output"}</h4>
          <button
            type="button"
            className="lp-button lp-button--secondary lp-button--small"
            onClick={function () {
              setOutputMode("idle");
              setOutputText("");
              setTestSummary(null);
              setStatusMessage(runtimeState === "ready" ? "Ready" : runtimeLabel(runtimeState));
            }}
          >
            Clear output
          </button>
        </div>

        {outputMode === "idle" ? (
          <p className="lp-python-ide__placeholder">Run your program to see output{tests.length ? " and test results" : ""}.</p>
        ) : null}

        {outputMode === "tests" && testSummary ? (
          <div ref={outputRef} tabIndex={-1} className="lp-python-ide__tests" role="status" aria-live="polite">
            {outputText ? <pre className="lp-python-ide__output">{outputText}</pre> : null}
            <ul className="lp-python-ide__test-list">
              {testSummary.tests.map(function (test) {
                return (
                  <li key={test.id} data-passed={test.passed ? "true" : "false"}>
                    <span>{test.passed ? "✓" : "✗"} {test.label}</span>
                    {!test.passed && test.detail ? <p>{test.detail}</p> : null}
                  </li>
                );
              })}
            </ul>
            <p className="lp-python-ide__summary">{testSummary.passedCount} / {testSummary.totalCount} passed</p>
            {exercise ? (
              <p className="lp-python-ide__formative-note">
                Browser tests are formative practice only. They are not assignment marks.
              </p>
            ) : null}
          </div>
        ) : null}

        {outputMode === "output" ? (
          <pre ref={outputRef} tabIndex={-1} className="lp-python-ide__output" role="status" aria-live="polite">
            {outputText}
          </pre>
        ) : null}

        {outputMode === "error" ? (
          <div ref={outputRef} tabIndex={-1} className="lp-python-ide__error" role="alert">
            <strong>Python error</strong>
            <pre>{outputText}</pre>
          </div>
        ) : null}
      </section>

      <p className="lp-feedback" data-lp-feedback="" aria-live="polite"></p>
    </div>
  );
}
