import type { ActivityBlockDocument } from "@learning-platform/ui";
import type { CodeBlockContent, RuntimeTestSpec } from "./types";

export type CodeInteractionMode = "ide" | "read-only" | "local-only";

/** Learner-facing blocks that are predict/read tasks, not editable programs. */
const READ_ONLY_QUESTION_IDS = new Set([
  "u14-w2-prob-demo",
  "u14-w2-conv-examples",
  "u14-w2-conv-fail",
  "u14-w2-sub-examples",
  "u14-w2-fmt-example",
  "u14-w2-cln-sample",
  "u14-w3-sel-example",
  "u14-w4-loop-example",
  "u14-w5-fn-example",
  "u14-w6-tk-window",
  "u14-w6-tk-widgets"
]);

/** Editable snippets that are not executed in the browser (for example .gitignore). */
const LOCAL_ONLY_QUESTION_IDS = new Set([
  "u14-w2-gi-add"
]);

export function normaliseBlockType(value: string | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

export function isCodeBlockType(type: string | undefined): boolean {
  const normalised = normaliseBlockType(type);
  return normalised === "code-editor" || normalised === "python-exercise";
}

export function blockContent(block: ActivityBlockDocument): CodeBlockContent {
  return (block.content || {}) as CodeBlockContent;
}

export function starterCode(block: ActivityBlockDocument): string {
  const content = blockContent(block);
  return String(content.starter || "");
}

export function sampleProgramInput(block: ActivityBlockDocument): string[] {
  const sample = blockContent(block).sampleInput;
  if (!Array.isArray(sample)) return [];
  return sample.map(function (line) { return String(line); });
}

export function initialProgramInputText(block: ActivityBlockDocument): string {
  const lines = sampleProgramInput(block);
  return lines.join("\n");
}

/** Draft-store key for Program input — not submitted as coding evidence. */
export function programInputDraftKey(block: ActivityBlockDocument): string {
  const content = blockContent(block);
  const questionId = String(content.questionId || block.id).trim();
  return `${questionId}__programInput`;
}

export function resolveInitialProgramInput(
  block: ActivityBlockDocument,
  draftValue?: string
): string {
  if (typeof draftValue === "string") return draftValue;
  return initialProgramInputText(block);
}

export function editorFilename(block: ActivityBlockDocument): string {
  const content = blockContent(block);
  if (content.filename) return String(content.filename);
  if (LOCAL_ONLY_QUESTION_IDS.has(String(content.questionId || ""))) return ".gitignore";
  return "solution.py";
}

/** Stable Monaco model URI — internal only; displayed filename stays separate. */
export function monacoModelPath(modelId: string, filename: string): string {
  const id = String(modelId || "block").trim();
  const name = String(filename || "solution.py").trim();
  return `u14://${id}/${name}`;
}

export function codeInteractionMode(block: ActivityBlockDocument): CodeInteractionMode {
  const content = blockContent(block);
  if (content.interaction === "read-only" || content.readOnly === true) return "read-only";
  if (content.interaction === "local-only") return "local-only";
  if (content.interaction === "ide") return "ide";
  const questionId = String(content.questionId || "");
  if (READ_ONLY_QUESTION_IDS.has(questionId)) return "read-only";
  if (LOCAL_ONLY_QUESTION_IDS.has(questionId)) return "local-only";
  if (/not python to run/i.test(content.instructions || "")) return "local-only";
  return "ide";
}

export function isReadOnlyCodeBlock(block: ActivityBlockDocument): boolean {
  return codeInteractionMode(block) === "read-only";
}

export function supportsBrowserExecution(block: ActivityBlockDocument): boolean {
  return effectiveCodeInteractionMode(block) === "ide";
}

export function usesTkinterCode(block: ActivityBlockDocument): boolean {
  const starter = starterCode(block);
  return /\bimport\s+tkinter\b|\bfrom\s+tkinter\b|\btkinter\./i.test(starter);
}

/** Mode used at render time — read-only wins; editable tkinter routes local-only. */
export function effectiveCodeInteractionMode(block: ActivityBlockDocument): CodeInteractionMode {
  const base = codeInteractionMode(block);
  if (base === "read-only") return "read-only";
  if (usesTkinterCode(block)) return "local-only";
  return base;
}

export function editorLabel(block: ActivityBlockDocument): string {
  const content = blockContent(block);
  return String(content.label || "Python editor");
}

export function isPythonExercise(block: ActivityBlockDocument): boolean {
  return normaliseBlockType(block.type) === "python-exercise";
}

export function runtimeTests(block: ActivityBlockDocument): RuntimeTestSpec[] {
  const tests = blockContent(block).checks?.runtimeTests;
  if (!Array.isArray(tests)) return [];
  return tests.map(function (test, index) {
    return {
      id: String(test.id || `test-${index + 1}`),
      label: String(test.label || `Test ${index + 1}`),
      assertion: String(test.assertion || "")
    };
  }).filter(function (test) {
    return test.assertion.length > 0;
  });
}

export function structureCheckLabels(block: ActivityBlockDocument): string[] {
  const required = blockContent(block).checks?.required || [];
  return required.map(function (rule) {
    if (typeof rule === "string") return rule;
    return String(rule.label || rule.pattern || "");
  }).filter(Boolean);
}
