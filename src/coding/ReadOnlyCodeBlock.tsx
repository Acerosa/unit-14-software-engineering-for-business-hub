import type { ActivityBlockDocument } from "@learning-platform/ui";
import { blockContent, editorFilename, editorLabel, starterCode } from "./blockConfig";

export function ReadOnlyCodeBlock({ block }: { block: ActivityBlockDocument }) {
  const content = blockContent(block);
  const code = starterCode(block);
  const filename = editorFilename(block);
  const language = String(content.language || "python");

  return (
    <div
      className="lp-block lp-block--static lp-code-readonly"
      data-lp-block={block.type}
      data-lp-block-id={block.id}
      data-lp-react-code="true"
      data-lp-code-mode="read-only"
    >
      {content.instructions ? <p className="lp-instructions">{content.instructions}</p> : null}
      <div className="lp-code-readonly__header">
        <span className="lp-language-badge">{language === "python" ? "Python" : language}</span>
        <span className="lp-code-readonly__filename">{filename}</span>
        <span className="lp-code-readonly__badge">Read-only example</span>
      </div>
      <p className="lp-label">{editorLabel(block)}</p>
      <pre className="lp-code lp-code--readonly" aria-label={`${filename} read-only example`}><code>{code}</code></pre>
      <p className="lp-code-readonly__note">This example is for reading and prediction. Use Run only on editable practice exercises.</p>
    </div>
  );
}
