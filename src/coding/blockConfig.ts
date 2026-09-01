import type { ActivityBlockDocument } from "@learning-platform/ui";
import type { CodeBlockContent, RuntimeTestSpec } from "./types";

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

export function editorFilename(block: ActivityBlockDocument): string {
  const content = blockContent(block);
  return String(content.filename || "solution.py");
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
