import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { EditorProps } from "@monaco-editor/react";
import { monacoModelPath } from "./blockConfig";

const Monaco = lazy(function () {
  return import("@monaco-editor/react").catch(function () {
    return { default: FallbackEditor };
  });
});

function FallbackEditor({
  value,
  onChange
}: {
  value?: string;
  onChange?: (value: string | undefined) => void;
}) {
  return (
    <textarea
      className="lp-code lp-code--fallback"
      value={value || ""}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      aria-label="Python editor"
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

function readTheme(): "vs-dark" | "vs" {
  if (typeof document === "undefined") return "vs";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "vs-dark" : "vs";
}

export function MonacoEditorField({
  value,
  onChange,
  filename,
  modelId,
  onFallback
}: {
  value: string;
  onChange: (next: string) => void;
  filename: string;
  modelId: string;
  onFallback?: () => void;
}) {
  const [theme, setTheme] = useState(readTheme);
  const [useFallback, setUseFallback] = useState(false);
  const modelPath = useMemo(function () {
    return monacoModelPath(modelId, filename);
  }, [filename, modelId]);

  useEffect(function () {
    import("@monaco-editor/react").catch(function () {
      setUseFallback(true);
      onFallback?.();
    });
  }, [onFallback]);

  useEffect(function () {
    const root = document.documentElement;
    const observer = new MutationObserver(function () {
      setTheme(readTheme());
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return function () { observer.disconnect(); };
  }, []);

  const options = useMemo(function (): EditorProps["options"] {
    return {
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
      renderLineHighlight: "line",
      padding: { top: 8, bottom: 8 },
      ariaLabel: `${filename} Python editor`,
      quickSuggestions: false,
      folding: false,
      glyphMargin: false
    };
  }, [filename]);

  if (useFallback) {
    return (
      <textarea
        className="lp-code lp-code--fallback"
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label={`${filename} Python editor`}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Suspense
      fallback={(
        <textarea
          className="lp-code lp-code--fallback"
          value={value}
          readOnly
          aria-label={`${filename} Python editor loading`}
        />
      )}
    >
      <Monaco
        height="16rem"
        language="python"
        theme={theme}
        path={modelPath}
        value={value}
        options={options}
        onChange={(next) => onChange(next || "")}
        wrapperProps={{ "data-lp-monaco": "true", "data-lp-monaco-path": modelPath }}
      />
    </Suspense>
  );
}
