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

function postWorkerRequest<T extends WorkerResponse>(
  request: WorkerRequest,
  matcher: (response: WorkerResponse) => response is T
): Promise<T> {
  return ensurePythonWorker().then(function (worker) {
    return new Promise(function (resolve, reject) {
      const requestId = "id" in request ? request.id : String(nextRequestId++);
      const payload = Object.assign({}, request, { id: requestId });

      function onMessage(event: MessageEvent<WorkerResponse>) {
        const response = event.data;
        if ("id" in response && response.id !== requestId) return;
        if (matcher(response)) {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          resolve(response);
        } else if (response.type === "error" && response.id === requestId) {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          reject(new Error(response.message));
        }
      }

      function onError(error: ErrorEvent) {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        reject(error.error || new Error(error.message));
      }

      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.postMessage(payload);
    });
  });
}

export async function runPythonCode(code: string): Promise<RunCodeResult> {
  const id = String(nextRequestId++);
  const response = await postWorkerRequest(
    { type: "run", id, code },
    (payload): payload is Extract<WorkerResponse, { type: "run-result" }> => payload.type === "run-result"
  );
  if (response.result.timedOut) {
    await resetPythonWorker();
  }
  return response.result;
}

export async function runPythonTests(code: string, tests: RuntimeTestSpec[]): Promise<RunTestsResult> {
  const id = String(nextRequestId++);
  const response = await postWorkerRequest(
    { type: "run-tests", id, code, tests },
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
}
