/// <reference lib="webworker" />

import type {
  RunCodeResult,
  RunTestsResult,
  RuntimeTestResult,
  RuntimeTestSpec,
  WorkerRequest,
  WorkerResponse
} from "./types";
import {
  createStdinReader,
  formatLearnerPythonError
} from "./pythonStdin";

const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const EXECUTION_TIMEOUT_MS = 8000;

type PyodideRuntime = {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  setStdin: (options: { stdin?: () => string | null; error?: boolean }) => void;
};

type PyodideModule = {
  loadPyodide: (config: { indexURL: string }) => Promise<PyodideRuntime>;
};

let pyodide: PyodideRuntime | null = null;
let initPromise: Promise<void> | null = null;
let stdoutBuffer = "";
let stderrBuffer = "";

function resetBuffers() {
  stdoutBuffer = "";
  stderrBuffer = "";
}

function attachIO(runtime: PyodideRuntime) {
  runtime.setStdout({ batched: (msg) => { stdoutBuffer += msg; } });
  runtime.setStderr({ batched: (msg) => { stderrBuffer += msg; } });
}

function configureStdin(runtime: PyodideRuntime, stdinLines: string[]) {
  const reader = createStdinReader(stdinLines);
  runtime.setStdin({
    stdin: function () {
      const line = reader.readLine();
      if (line === null) return null;
      return `${line}\n`;
    },
    error: false
  });
}

async function ensurePyodide(): Promise<PyodideRuntime> {
  if (pyodide) return pyodide;
  if (!initPromise) {
    initPromise = (async () => {
      const module = await import(/* @vite-ignore */ `${PYODIDE_INDEX}pyodide.mjs`) as PyodideModule;
      pyodide = await module.loadPyodide({ indexURL: PYODIDE_INDEX });
      attachIO(pyodide);
    })();
  }
  await initPromise;
  if (!pyodide) throw new Error("Python environment failed to initialise.");
  return pyodide;
}

async function resetLearnerNamespace(runtime: PyodideRuntime) {
  await runtime.runPythonAsync(`
import sys
for name in list(globals().keys()):
    if not name.startswith("_") and name not in {"sys"}:
        del globals()[name]
`);
}

function formatPythonError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return formatLearnerPythonError(message.replace(/^PythonError:\s*/i, "").trim(), stdoutBuffer);
}

async function executeLearnerCode(code: string, stdinLines: string[] = []): Promise<RunCodeResult> {
  const runtime = await ensurePyodide();
  resetBuffers();
  await resetLearnerNamespace(runtime);
  configureStdin(runtime, stdinLines);
  try {
    await runtime.loadPackagesFromImports(code);
    await runtime.runPythonAsync(code);
    return {
      stdout: stdoutBuffer.trim(),
      stderr: stderrBuffer.trim()
    };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const formatted = formatLearnerPythonError(raw, stdoutBuffer);
    return {
      stdout: stdoutBuffer.trim(),
      stderr: stderrBuffer.trim(),
      error: formatted
    };
  }
}

async function evaluateAssertion(runtime: PyodideRuntime, assertion: string): Promise<{ passed: boolean; detail?: string }> {
  try {
    const value = await runtime.runPythonAsync(`bool(${assertion})`);
    const passed = Boolean(value);
    if (passed) return { passed: true };
    let received = "False";
    try {
      const evaluated = await runtime.runPythonAsync(String(assertion));
      received = String(evaluated);
    } catch {
      received = "False";
    }
    return {
      passed: false,
      detail: `Expected true, received ${received}`
    };
  } catch (error) {
    return {
      passed: false,
      detail: formatPythonError(error)
    };
  }
}

async function runTests(code: string, tests: RuntimeTestSpec[], stdinLines: string[] = []): Promise<RunTestsResult> {
  const runResult = await executeLearnerCode(code, stdinLines);
  const runtime = await ensurePyodide();
  const results: RuntimeTestResult[] = [];

  if (runResult.error) {
    tests.forEach(function (test) {
      results.push({
        id: test.id,
        label: test.label,
        passed: false,
        detail: "Fix the Python error before running tests."
      });
    });
    return Object.assign({}, runResult, {
      tests: results,
      passedCount: 0,
      totalCount: tests.length
    });
  }

  for (const test of tests) {
    const outcome = await evaluateAssertion(runtime, test.assertion);
    results.push({
      id: test.id,
      label: test.label,
      passed: outcome.passed,
      detail: outcome.detail
    });
  }

  const passedCount = results.filter(function (item) { return item.passed; }).length;
  return Object.assign({}, runResult, {
    tests: results,
    passedCount,
    totalCount: tests.length
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise(function (resolve, reject) {
    const timer = setTimeout(function () {
      reject(new Error("EXECUTION_TIMEOUT"));
    }, ms);
    promise.then(function (value) {
      clearTimeout(timer);
      resolve(value);
    }).catch(function (error) {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function handleRequest(request: WorkerRequest): Promise<WorkerResponse | null> {
  if (request.type === "init") {
    await ensurePyodide();
    return { type: "ready" };
  }

  if (request.type === "reset-namespace") {
    if (pyodide) await resetLearnerNamespace(pyodide);
    return null;
  }

  if (request.type === "run") {
    const stdin = Array.isArray(request.stdin) ? request.stdin : [];
    const result = await withTimeout(executeLearnerCode(request.code, stdin), EXECUTION_TIMEOUT_MS);
    return { type: "run-result", id: request.id, result };
  }

  if (request.type === "run-tests") {
    const stdin = Array.isArray(request.stdin) ? request.stdin : [];
    const result = await withTimeout(runTests(request.code, request.tests, stdin), EXECUTION_TIMEOUT_MS);
    return { type: "run-tests-result", id: request.id, result };
  }

  return { type: "error", message: "Unknown worker request." };
}

self.addEventListener("message", function (event: MessageEvent<WorkerRequest>) {
  const request = event.data;
  handleRequest(request).then(function (response) {
    if (response) self.postMessage(response);
  }).catch(function (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "EXECUTION_TIMEOUT") {
      const timedOut: RunCodeResult = {
        stdout: stdoutBuffer.trim(),
        stderr: stderrBuffer.trim(),
        error: "Your program took too long to finish.",
        timedOut: true
      };
      if (request.type === "run") {
        self.postMessage({ type: "run-result", id: request.id, result: timedOut } satisfies WorkerResponse);
        return;
      }
      if (request.type === "run-tests") {
        self.postMessage({
          type: "run-tests-result",
          id: request.id,
          result: Object.assign({}, timedOut, {
            tests: request.tests.map(function (test) {
              return { id: test.id, label: test.label, passed: false, detail: "Execution timed out." };
            }),
            passedCount: 0,
            totalCount: request.tests.length
          })
        } satisfies WorkerResponse);
        return;
      }
    }
    self.postMessage({
      type: "error",
      id: "id" in request ? request.id : undefined,
      message
    } satisfies WorkerResponse);
  });
});

export {};
