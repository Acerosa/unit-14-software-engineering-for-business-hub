import type {
  RunCodeResult,
  RunTestsResult,
  RuntimeTestSpec,
  WorkerRequest,
  WorkerResponse
} from "./types";

let sharedWorker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let nextRequestId = 1;

type ActiveExecution = {
  requestId: string;
  reject: (error: Error) => void;
  cleanup: () => void;
};

let activeExecution: ActiveExecution | null = null;
const executionListeners = new Set<(active: boolean) => void>();

export class PythonExecutionBusyError extends Error {
  constructor() {
    super("Another Python exercise is currently running. Wait for it to finish or stop it.");
    this.name = "PythonExecutionBusyError";
  }
}

export class PythonExecutionStoppedError extends Error {
  constructor() {
    super("Execution stopped.");
    this.name = "PythonExecutionStoppedError";
  }
}

function notifyExecutionListeners() {
  const active = activeExecution !== null;
  executionListeners.forEach(function (listener) {
    listener(active);
  });
}

export function isPythonExecutionActive(): boolean {
  return activeExecution !== null;
}

export function subscribePythonExecution(listener: (active: boolean) => void): () => void {
  executionListeners.add(listener);
  listener(activeExecution !== null);
  return function () {
    executionListeners.delete(listener);
  };
}

function createWorker(): Worker {
  return new Worker(new URL("./python.worker.ts", import.meta.url), { type: "module" });
}

function attachReadyPromise(worker: Worker): Promise<void> {
  return new Promise(function (resolve, reject) {
    function onMessage(event: MessageEvent<WorkerResponse>) {
      const payload = event.data;
      if (payload.type === "ready") {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        resolve();
      } else if (payload.type === "error" && !payload.id) {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        reject(new Error(payload.message));
      }
    }
    function onError(error: ErrorEvent) {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      reject(error.error || new Error(error.message));
    }
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage({ type: "init" } satisfies WorkerRequest);
  });
}

export async function ensurePythonWorker(): Promise<Worker> {
  if (sharedWorker && readyPromise) {
    await readyPromise;
    return sharedWorker;
  }
  sharedWorker = createWorker();
  readyPromise = attachReadyPromise(sharedWorker);
  await readyPromise;
  return sharedWorker;
}

export async function resetPythonWorker(): Promise<void> {
  if (sharedWorker) {
    sharedWorker.terminate();
  }
  sharedWorker = null;
  readyPromise = null;
}

function beginExecution(requestId: string, reject: (error: Error) => void, cleanup: () => void) {
  if (activeExecution) throw new PythonExecutionBusyError();
  activeExecution = { requestId, reject, cleanup };
  notifyExecutionListeners();
}

function endExecution(requestId: string) {
  if (activeExecution?.requestId === requestId) {
    activeExecution = null;
    notifyExecutionListeners();
  }
}

export async function stopPythonExecution(): Promise<void> {
  if (!activeExecution) return;
  const current = activeExecution;
  activeExecution = null;
  notifyExecutionListeners();
  current.cleanup();
  if (sharedWorker) {
    sharedWorker.terminate();
  }
  sharedWorker = null;
  readyPromise = null;
  current.reject(new PythonExecutionStoppedError());
}

function postWorkerRequest<T extends WorkerResponse>(
  request: WorkerRequest,
  matcher: (response: WorkerResponse) => response is T
): Promise<T> {
  return ensurePythonWorker().then(function (worker) {
    return new Promise(function (resolve, reject) {
      const requestId = "id" in request ? request.id : String(nextRequestId++);
      const payload = Object.assign({}, request, { id: requestId });
      let settled = false;

      function settle(next: () => void) {
        if (settled) return;
        settled = true;
        endExecution(requestId);
        next();
      }

      function cleanup() {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
      }

      try {
        beginExecution(
          requestId,
          function (error) {
            cleanup();
            settle(function () { reject(error); });
          },
          cleanup
        );
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      function onMessage(event: MessageEvent<WorkerResponse>) {
        const response = event.data;
        if ("id" in response && response.id !== requestId) return;
        if (matcher(response)) {
          cleanup();
          settle(function () { resolve(response); });
        } else if (response.type === "error" && response.id === requestId) {
          cleanup();
          settle(function () { reject(new Error(response.message)); });
        }
      }

      function onError(error: ErrorEvent) {
        cleanup();
        void resetPythonWorker();
        settle(function () {
          reject(error.error || new Error(error.message));
        });
      }

      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.postMessage(payload);
    });
  });
}

export async function runPythonCode(code: string, stdin: string[] = []): Promise<RunCodeResult> {
  const id = String(nextRequestId++);
  const response = await postWorkerRequest(
    { type: "run", id, code, stdin },
    (payload): payload is Extract<WorkerResponse, { type: "run-result" }> => payload.type === "run-result"
  );
  if (response.result.timedOut) {
    await resetPythonWorker();
  }
  return response.result;
}

export async function runPythonTests(
  code: string,
  tests: RuntimeTestSpec[],
  stdin: string[] = []
): Promise<RunTestsResult> {
  const id = String(nextRequestId++);
  const response = await postWorkerRequest(
    { type: "run-tests", id, code, tests, stdin },
    (payload): payload is Extract<WorkerResponse, { type: "run-tests-result" }> => payload.type === "run-tests-result"
  );
  if (response.result.timedOut) {
    await resetPythonWorker();
  }
  return response.result;
}

/** Test-only hook to inject a mock worker manager. */
export function __setWorkerForTests(worker: Worker | null, ready: Promise<void> | null) {
  sharedWorker = worker;
  readyPromise = ready;
  activeExecution = null;
  notifyExecutionListeners();
}
