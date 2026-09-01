export type RuntimeState =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "completed"
  | "error"
  | "timeout";

export type RuntimeTestSpec = {
  id: string;
  label: string;
  assertion: string;
};

export type RuntimeTestResult = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type RunCodeResult = {
  stdout: string;
  stderr: string;
  error?: string;
  timedOut?: boolean;
};

export type RunTestsResult = RunCodeResult & {
  tests: RuntimeTestResult[];
  passedCount: number;
  totalCount: number;
};

export type WorkerRequest =
  | { type: "init" }
  | { type: "run"; id: string; code: string }
  | { type: "run-tests"; id: string; code: string; tests: RuntimeTestSpec[] }
  | { type: "reset-namespace" };

export type WorkerResponse =
  | { type: "ready" }
  | { type: "run-result"; id: string; result: RunCodeResult }
  | { type: "run-tests-result"; id: string; result: RunTestsResult }
  | { type: "error"; id?: string; message: string };

export type CodeBlockContent = {
  questionId?: string;
  language?: string;
  label?: string;
  filename?: string;
  instructions?: string;
  starter?: string;
  hints?: string[];
  /** Explicit learner interaction mode when set in authored content. */
  interaction?: "read-only" | "local-only" | "ide";
  readOnly?: boolean;
  checks?: {
    required?: Array<string | { pattern?: string; label?: string; flags?: string }>;
    prohibited?: Array<string | { pattern?: string; label?: string; flags?: string }>;
    passFeedback?: string;
    failFeedback?: string;
    runtimeTests?: Array<{
      id?: string;
      label: string;
      assertion: string;
    }>;
  };
};
