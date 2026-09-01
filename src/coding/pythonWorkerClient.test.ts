import { describe, expect, it, vi } from "vitest";
import { runtimeTests, starterCode } from "./blockConfig";
import {
  PythonExecutionBusyError,
  PythonExecutionStoppedError,
  __setWorkerForTests,
  ensurePythonWorker,
  isPythonExecutionActive,
  runPythonCode,
  stopPythonExecution
} from "./pythonWorkerClient";
import type { WorkerResponse } from "./types";

describe("pythonWorkerClient", () => {
  it("waits for ready before accepting run requests", async () => {
    const listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
    const worker = {
      postMessage(payload: unknown) {
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          listeners.message?.forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "run") {
          listeners.message?.forEach(function (handler) {
            handler({
              data: {
                type: "run-result",
                id: (payload as { id: string }).id,
                result: { stdout: "37.5\n", stderr: "" }
              }
            } as MessageEvent<WorkerResponse>);
          });
        }
      },
      addEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== handler; });
      },
      terminate: vi.fn()
    } as unknown as Worker;

    __setWorkerForTests(worker, Promise.resolve());
    const result = await runPythonCode("print(37.5)", ["ignored"]);
    expect(result.stdout).toContain("37.5");
  });

  it("forwards stdin lines on run requests", async () => {
    const posted: unknown[] = [];
    const listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
    const worker = {
      postMessage(payload: unknown) {
        posted.push(payload);
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          listeners.message?.forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "run") {
          listeners.message?.forEach(function (handler) {
            handler({
              data: {
                type: "run-result",
                id: (payload as { id: string }).id,
                result: { stdout: "ok", stderr: "" }
              }
            } as MessageEvent<WorkerResponse>);
          });
        }
      },
      addEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== handler; });
      },
      terminate: vi.fn()
    } as unknown as Worker;

    __setWorkerForTests(worker, Promise.resolve());
    await runPythonCode("print(1)", ["Keyboard", "3"]);
    const runPayload = posted.find(function (item) {
      return item && typeof item === "object" && (item as { type?: string }).type === "run";
    }) as { stdin?: string[] } | undefined;
    expect(runPayload?.stdin).toEqual(["Keyboard", "3"]);
    __setWorkerForTests(null, null);
  });

  it("resets the worker after a timeout", async () => {
    const listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
    const worker = {
      postMessage(payload: unknown) {
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          listeners.message?.forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "run") {
          listeners.message?.forEach(function (handler) {
            handler({
              data: {
                type: "run-result",
                id: (payload as { id: string }).id,
                result: { stdout: "", stderr: "", error: "Your program took too long to finish.", timedOut: true }
              }
            } as MessageEvent<WorkerResponse>);
          });
        }
      },
      addEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== handler; });
      },
      terminate: vi.fn()
    } as unknown as Worker;

    __setWorkerForTests(worker, Promise.resolve());
    const result = await runPythonCode("while True: pass");
    expect(result.timedOut).toBe(true);
    expect(worker.terminate).toHaveBeenCalled();
    __setWorkerForTests(null, null);
  });

  it("rejects concurrent runs while one execution is active", async () => {
    const listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
    const worker = {
      postMessage(payload: unknown) {
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          listeners.message?.forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
      },
      addEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== handler; });
      },
      terminate: vi.fn()
    } as unknown as Worker;

    __setWorkerForTests(worker, Promise.resolve());
    const first = runPythonCode("while True: pass");
    await vi.waitUntil(function () { return isPythonExecutionActive(); });
    await expect(runPythonCode("print(2)")).rejects.toBeInstanceOf(PythonExecutionBusyError);
    await stopPythonExecution();
    await expect(first).rejects.toBeInstanceOf(PythonExecutionStoppedError);
    __setWorkerForTests(null, null);
  });

  it("stops an active execution and rejects the pending run", async () => {
    const listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
    const worker = {
      postMessage(payload: unknown) {
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          listeners.message?.forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
      },
      addEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener(type: string, handler: (event: MessageEvent) => void) {
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== handler; });
      },
      terminate: vi.fn()
    } as unknown as Worker;

    __setWorkerForTests(worker, Promise.resolve());
    const pending = runPythonCode("while True: pass");
    await vi.waitUntil(function () { return isPythonExecutionActive(); });
    await stopPythonExecution();
    await expect(pending).rejects.toBeInstanceOf(PythonExecutionStoppedError);
    expect(worker.terminate).toHaveBeenCalled();
    __setWorkerForTests(null, null);
  });

  it("creates a worker on first ensure call", async () => {
    __setWorkerForTests(null, null);
    const originalWorker = globalThis.Worker;
    const created: Array<Worker> = [];
    class MockWorker {
      private listeners: Record<string, Array<(event: MessageEvent) => void>> = {};
      constructor(_url: URL, _options?: WorkerOptions) {
        created.push(this as unknown as Worker);
      }
      postMessage = vi.fn((payload: unknown) => {
        if (payload && typeof payload === "object" && (payload as { type?: string }).type === "init") {
          (this.listeners.message || []).forEach(function (handler) {
            handler({ data: { type: "ready" } } as MessageEvent<WorkerResponse>);
          });
        }
      });
      addEventListener = vi.fn((type: string, handler: (event: MessageEvent) => void) => {
        this.listeners[type] = this.listeners[type] || [];
        this.listeners[type].push(handler);
      });
      removeEventListener = vi.fn();
      terminate = vi.fn();
    }
    globalThis.Worker = MockWorker as unknown as typeof Worker;
    try {
      await ensurePythonWorker();
      expect(created.length).toBe(1);
    } finally {
      globalThis.Worker = originalWorker;
      __setWorkerForTests(null, null);
    }
  });
});

describe("blockConfig", () => {
  it("reads runtime tests from block checks without exposing them in HTML", () => {
    const tests = runtimeTests({
      id: "demo",
      type: "python-exercise",
      content: {
        starter: "def calculate_total(price, quantity):\n    return price * quantity\n",
        checks: {
          runtimeTests: [
            { label: "Function exists", assertion: "callable(calculate_total)" },
            { label: "Test 1", assertion: "calculate_total(10, 2) == 20" }
          ]
        }
      }
    } as never);
    expect(tests).toHaveLength(2);
    expect(starterCode({
      id: "demo",
      type: "python-exercise",
      content: { starter: "print(1)" }
    } as never)).toBe("print(1)");
  });
});
