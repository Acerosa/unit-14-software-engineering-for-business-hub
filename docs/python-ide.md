# Python coding IDE (Unit 14 hub)

This document describes the in-browser Python exercise experience added to the Unit 14 Software Engineering for Business learner hub.

## Overview

Python `code-editor` and `python-exercise` blocks now render as a lightweight IDE in React instead of the legacy HTML textarea fallback. The IDE uses:

- **Monaco Editor** for editing (`@monaco-editor/react`, lazy-loaded)
- **Pyodide** for Python execution (loaded from jsDelivr CDN inside a Web Worker)
- A dedicated **Output / Tests** panel for stdout, errors, and formative test feedback

Legacy HTML rendering in `@learning-platform/content` is unchanged and still used for static page generation and Node tests.

## Architecture

```
WeekPage (React)
  └─ InteractiveActivity.renderFallback
       └─ PythonCodeExercise
            ├─ MonacoEditorField (lazy Monaco, textarea fallback)
            ├─ pythonWorkerClient (singleton manager)
            └─ python.worker.ts (Pyodide runtime)
```

### Monaco integration

- Loaded on demand via `React.lazy(() => import("@monaco-editor/react"))`.
- Python language mode, line numbers, bracket matching, tab size 4, no minimap.
- Theme follows `document.documentElement.dataset.theme` (`vs` / `vs-dark`).
- If Monaco fails to load, a labelled textarea fallback is shown.

### Pyodide loading

- Pyodide **is not bundled** in the main app chunk.
- The worker loads `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs` once on first `init`.
- Run is disabled until the worker reports `ready`.

### Web Worker

File: `src/coding/python.worker.ts`

- Runs on a module worker (`type: "module"`).
- Messages: `init`, `run`, `run-tests`, `reset-namespace`.
- Captures stdout/stderr via Pyodide hooks.
- Clears learner globals between runs to avoid cross-run contamination.
- Returns structured `{ stdout, stderr, error?, timedOut? }` results.

### Execution lifecycle

1. Learner opens a Python block → `ensurePythonWorker()` lazy-starts the worker.
2. Status: **Loading Python environment…** → **Ready**.
3. Learner clicks **Run** → status **Running…**.
4. Worker executes code (and optional tests) → **Completed**, **Python error**, or **Execution timed out**.
5. Output panel shows stdout, traceback-style errors, or test checklist.

### Timeout / reset strategy

- Execution timeout: **8 seconds** per run/test batch.
- On timeout the worker posts `timedOut: true`; the client calls `resetPythonWorker()` (terminate + recreate on next run).
- **Reset** (toolbar) restores starter code after confirmation if edited, clears output, does not submit an attempt by itself.
- **Clear output** clears the panel only.

## Activity JSON / schema

Existing block types are reused — no new block type name was introduced.

### Supported block types

- `code-editor`
- `python-exercise`

### Existing fields (unchanged)

| Field | Purpose |
|-------|---------|
| `content.starter` | Starter source code |
| `content.filename` | Display filename (default `solution.py`) |
| `content.label` | Accessible editor label |
| `content.instructions` | Task text |
| `content.hints` | Optional hint list |
| `content.checks.required` | Pattern labels shown as “Expected constructs” (formative, not executed in React path) |

### Optional extension: runtime tests

`checks.runtimeTests` are **public formative browser tests**:

| | `runtimeTests` | Protected marking specification |
|---|---|---|
| Purpose | In-browser practice feedback | Authoritative assessment |
| Visibility | Learner-visible (labels shown in UI) | Must **not** appear in published learner bundles |
| Scoring | Non-authoritative — never sent as marks | Server-authoritative where configured |
| Content | Safe, learner-facing checks only | Hidden answer keys, private assertions, marking rubrics |

Formative browser tests may be added under:

```json
"checks": {
  "runtimeTests": [
    { "label": "Function exists", "assertion": "callable(calculate_total)" },
    { "label": "Test 1", "assertion": "calculate_total(10, 2) == 20" }
  ]
}
```

- `label` is learner-visible.
- `assertion` is a Python expression evaluated as `bool(<assertion>)` after learner code runs.
- Assertions are **not** hidden marking data — anything in `runtimeTests` is present in the learner bundle and must be safe to expose.
- Assertions must not be treated as authoritative marks (see below).

Do **not** put protected marking specifications, hidden answer keys, or private rubric checks in `runtimeTests`. Keep those server-side or in authoring-only packages. Published learner bundles should contain only public formative checks.

## Learner evidence and submission

### Stored in activity response / draft state

- **Learner source code** (string) keyed by block `questionId`.
- Persisted through the existing `InteractiveActivity` + `lp-block-result` draft mechanism (`localStorage` via content engine draft store).
- `ActivityResult.correct` is always **`null`** for code blocks — browser tests do not set correctness.

### Submitted to Core / backend

Unchanged submission path via `content/engine/submit.js`:

- Evidence type: `LearningPlatformCore.evidence.coding()`
- Includes learner **source code** and `programmingLanguage: "python"` when the activity contains code blocks.
- No client-computed `awarded_score` or authoritative `correct` flag is sent from browser test results.

### Formative vs authoritative marking

Browser-side test results are **formative feedback only**. They help learners debug during practice but must not weaken the platform trust boundary. Server-side or teacher marking remains authoritative where configured.

## Accessibility

- Run and Reset are native `<button>` elements with explicit `aria-label`s.
- Runtime status uses `role="status"` and `aria-live="polite"`.
- Errors use `role="alert"`.
- Output panel is focusable after run for screen-reader review.
- Monaco uses platform defaults; learners can tab out of the editor to reach toolbar and output controls.

## Performance

- Monaco is code-split (lazy chunk).
- Pyodide loads only when a Python exercise is opened.
- One shared worker instance is reused across exercises on the same page.
- Measure after `npm run build` — Pyodide should appear only in the worker asset, not the main bundle.

## Known limitations

- **No tkinter / desktop GUI** in the browser. GUI exercises continue to use local Python.
- Pyodide Python is not identical to CPython (stdlib subset, no arbitrary native extensions).
- Very long-running or infinite loops are stopped by timeout, not pre-emption mid-statement.
- CDN/network failure disables Run but preserves editing via Monaco/textarea fallback.
- Regex `checks.required` from the content package are display-only in the React IDE; execution uses Pyodide instead of the legacy “Check Python” HTML button.

## Content migration (Weeks 1–2)

`CodeBlockView` routes existing blocks without new block types:

| Mode | When | Renderer |
|------|------|----------|
| `ide` | Editable Python practice | `PythonCodeExercise` with Pyodide Run |
| `read-only` | Predict/read examples | `ReadOnlyCodeBlock` (no Run) |
| `local-only` | `.gitignore`, tkinter, non-browser code | Monaco edit, Run disabled |

Routing uses `content.interaction` when set, otherwise a question-id registry in `blockConfig.ts`.

## Files

| File | Role |
|------|------|
| `src/coding/PythonCodeExercise.tsx` | Main IDE UI |
| `src/coding/MonacoEditorField.tsx` | Monaco wrapper + fallback |
| `src/coding/python.worker.ts` | Pyodide worker |
| `src/coding/pythonWorkerClient.ts` | Worker singleton + API |
| `src/coding/blockConfig.ts` | Block helpers |
| `src/coding/types.ts` | Shared types |
| `src/pages/WeekPage.tsx` | React fallback wiring |
| `content/engine/interactive.js` | Skips HTML bind for `data-lp-react-code` |
| `css/hub.css` | IDE layout styles |
