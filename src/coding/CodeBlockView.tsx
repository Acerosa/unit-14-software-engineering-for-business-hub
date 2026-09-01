import type { ActivityBlockDocument, ActivityResult } from "@learning-platform/ui";
import { codeInteractionMode, isCodeBlockType, usesTkinterCode } from "./blockConfig";
import { PythonCodeExercise } from "./PythonCodeExercise";
import { ReadOnlyCodeBlock } from "./ReadOnlyCodeBlock";

export function CodeBlockView({
  block,
  initialCode,
  initialProgramInput,
  onResult,
  onProgramInputChange
}: {
  block: ActivityBlockDocument;
  initialCode?: string;
  initialProgramInput?: string;
  onResult?: (result: ActivityResult) => void;
  onProgramInputChange?: (value: string) => void;
}) {
  if (!isCodeBlockType(block.type)) return null;

  const mode = usesTkinterCode(block) ? "local-only" : codeInteractionMode(block);

  if (mode === "read-only") {
    return <ReadOnlyCodeBlock block={block} />;
  }

  return (
    <PythonCodeExercise
      block={block}
      initialCode={initialCode}
      initialProgramInput={initialProgramInput}
      executionMode={mode === "local-only" ? "local-only" : "browser"}
      onResult={onResult}
      onProgramInputChange={onProgramInputChange}
    />
  );
}
