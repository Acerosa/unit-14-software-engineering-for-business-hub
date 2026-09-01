import type { ActivityBlockDocument, ActivityResult } from "@learning-platform/ui";
import { codeInteractionMode, isCodeBlockType, usesTkinterCode } from "./blockConfig";
import { PythonCodeExercise } from "./PythonCodeExercise";
import { ReadOnlyCodeBlock } from "./ReadOnlyCodeBlock";

export function CodeBlockView({
  block,
  initialCode,
  onResult
}: {
  block: ActivityBlockDocument;
  initialCode?: string;
  onResult?: (result: ActivityResult) => void;
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
      executionMode={mode === "local-only" ? "local-only" : "browser"}
      onResult={onResult}
    />
  );
}
