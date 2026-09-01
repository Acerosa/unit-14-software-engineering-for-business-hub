import { describe, expect, it, vi } from "vitest";
import { runtimeTests, starterCode } from "./blockConfig";
import { __setWorkerForTests, ensurePythonWorker, runPythonCode } from "./pythonWorkerClient";
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
    const result = await runPythonCode("print(37.5)");
    expect(result.stdout).toContain("37.5");
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
