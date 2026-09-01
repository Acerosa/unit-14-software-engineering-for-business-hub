# Python coding IDE (Unit 14 hub)

This document describes the in-browser Python exercise experience added to the Unit 14 Software Engineering for Business learner hub.

## Overview

Python `code-editor` and `python-exercise` blocks render as a lightweight IDE in React. The IDE uses:

- **Monaco Editor** for editing (`@monaco-editor/react`, lazy-loaded)
- **Pyodide** for Python execution (loaded from jsDelivr CDN inside a Web Worker)
- **Program input** for `input()` — one value per line
- A dedicated **Output / Tests** panel for stdout, errors, and formative test feedback

Legacy HTML rendering in `@learning-platform/content` is unchanged and still used for static page generation and Node tests.

## Architecture

```
WeekPage (React)
  └─ CodeBlockView
       ├─ ReadOnlyCodeBlock (predict/read examples)
       └─ PythonCodeExercise (browser or local-only)
            ├─ MonacoEditorField (lazy Monaco, textarea fallback)
            ├─ Program input (per-exercise stdin lines)
            ├─ pythonWorkerClient (singleton manager)
            └─ python.worker.ts (Pyodide runtime)
```

### Monaco integration

- Loaded on demand via `React.lazy(() => import("@monaco-editor/react"))`.
- Each exercise uses a stable internal model path: `u14://<block.id>/<filename>`.
- The toolbar still shows the friendly filename (for example `solution.py`).
- Python language mode, line numbers, bracket matching, tab size 4, no minimap.
- Theme follows `document.documentElement.dataset.theme` (`vs` / `vs-dark`).
- If Monaco fails to load, a labelled textarea fallback is shown.

### Pyodide loading

- Pyodide **is not bundled** in the main app chunk.
- The worker loads `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs` once on first `init`.
- Run is disabled until the worker reports `ready`.
- Read-only code blocks do not load Pyodide.

### Web Worker

File: `src/coding/python.worker.ts`

- Runs on a module worker (`type: "module"`).
- Messages: `init`, `run`, `run-tests`, `reset-namespace`.
- Run requests include optional `stdin: string[]`.
- Captures stdout/stderr via Pyodide hooks.
- Configures stdin before each run via `pyodide.setStdin()`.
- Clears learner globals between runs to avoid cross-run contamination.
- Returns structured `{ stdout, stderr, error?, timedOut? }` results.

### Program input / stdin

**Batch stdin (supported):** learners supply all input lines in the Program input panel **before** Run. This is the supported model for GitHub Pages deployment.

**Interactive stdin (not supported):** true pause-and-type `input()` during execution would require either `window.prompt()`, main-thread blocking, or `SharedArrayBuffer` with cross-origin isolation headers. Those are not guaranteed on static GitHub Pages hosting, so interactive stdin is intentionally not implemented.

Learners enter **one input value per line**. Each `input()` call consumes the next line in order.

Parsing rules:

- `Keyboard\n3\n24.99` → `["Keyboard", "3", "24.99"]`
- trailing newline only (`Keyboard\n3\n24.99\n`) → same as above (no accidental extra empty line)
- deliberate blank line (`Keyboard\n\n24.99`) → `["Keyboard", "", "24.99"]`

Program input is persisted in the activity draft store under `<questionId>__programInput`. It is **not** submitted as coding evidence.

Example code:

```python
name = input("Product name: ")
quantity = int(input("Quantity: "))
price = float(input("Price: "))
print(name, quantity * price)
```

Program input:

```
Keyboard
3
24.99
```

Behaviour:

- first `input()` receives `Keyboard`
- second receives `3`
- third receives `24.99`
- prompts appear in stdout where Pyodide emits them
- if Python asks for more lines than provided, the learner sees: **Your program requested more input than was provided.** (not `OSError: [Errno 29] I/O error`)

Program input is:

- independent per exercise (like code and output)
- cleared on **Reset** back to optional authored `sampleInput`, or empty
- **not** cleared by **Clear output**
- **not** submitted as assessment evidence — only learner source code is evidence

Optional authored sample lines:

```json
"sampleInput": ["Keyboard", "3", "24.99"]
```

### Execution lifecycle

1. Learner opens a Python block → `ensurePythonWorker()` lazy-starts the worker.
2. Status: **Loading Python environment…** → **Ready**.
3. Learner enters Program input if the code uses `input()`.
4. Learner clicks **Run** → status **Running…**.
5. Worker executes code (and optional tests) → **Completed**, **Python error**, or **Execution timed out**.
6. Output panel shows stdout, traceback-style errors, or test checklist.

### Timeout / reset / stop strategy

- Execution timeout: **8 seconds** per run/test batch.
- On timeout the worker posts `timedOut: true`; the client terminates and recreates the worker.
- **Stop** terminates the shared worker, rejects the active run with “Execution stopped”, and reinitialises Pyodide for the next Run.
- Only **one** Python execution may run at a time across the shared worker. Starting another exercise while one is running shows a learner-friendly busy message.
- **Reset** restores starter code and Program input (to authored `sampleInput` when present), clears output, does not submit.
- **Clear output** clears the panel only — code and Program input are unchanged.

### Supported Python (browser)

Typical Unit 14 constructs work in Pyodide:

- variables, strings, integers, floats, booleans, conversion
- `input()` / `print()`, f-strings
- `if` / `elif` / `else`, `for`, `while`
- functions, parameters, `return`
- lists, dictionaries, simple classes
- exceptions (`try` / `except`)
- common stdlib supported by Pyodide

Not supported in browser:

- **tkinter / desktop GUI** — routed as local-only (Monaco edit, Run disabled)
- arbitrary native CPython extensions
- shell, filesystem, pip UI, backend execution

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
| `content.checks.required` | Pattern labels shown as “Expected constructs” (display-only in React path) |

### Optional extension: sample Program input

| Field | Purpose |
|-------|---------|
| `content.sampleInput` | Optional learner-visible starter lines for Program input |

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
- When code uses `input()`, provide Program input (or `sampleInput`) before Run so tests do not block on stdin.
- Assertions are **not** hidden marking data.
- Assertions must not be treated as authoritative marks.

## Learner evidence and submission

### Stored in activity response / draft state

- **Learner source code** (string) keyed by block `questionId`.
- Persisted through the existing `InteractiveActivity` + draft mechanism.
- Program input is session-local UI state — not submitted as evidence.
- `ActivityResult.correct` is always **`null`** for code blocks.

### Submitted to Core / backend

Unchanged submission path via `content/engine/submit.js`:

- Evidence type: `LearningPlatformCore.evidence.coding()`
- Includes learner **source code** and `programmingLanguage: "python"` when the activity contains code blocks.
- No client-computed `awarded_score` or authoritative `correct` flag from browser test results.

## Content routing

| Mode | When | Renderer |
|------|------|----------|
| `ide` | Editable Python practice | `PythonCodeExercise` with Pyodide Run |
| `read-only` | Predict/read examples | `ReadOnlyCodeBlock` (no Run, no Pyodide) |
| `local-only` | `.gitignore`, tkinter, non-browser code | Monaco edit, Run disabled |

## Accessibility

- Run, Reset, and Clear output are native `<button>` elements with explicit labels.
- Program input has a visible label and help text.
- Runtime status uses `role="status"` and `aria-live="polite"`.
- Errors use `role="alert"`.
- Output panel is focusable after run for screen-reader review.

## Performance

- Monaco is code-split (lazy chunk).
- Pyodide loads only when a browser IDE exercise is opened.
- One shared worker instance is reused across exercises on the same page.
- One Pyodide runtime per worker — not per exercise.
- Per-exercise state: code, Program input, output, Monaco model.

## Known limitations

- Pyodide Python is not identical to CPython (stdlib subset).
- Very long-running or infinite loops are stopped by timeout or Stop, not pre-emption mid-statement.
- CDN/network failure disables Run but preserves editing.
- Interactive mid-run stdin is not supported — supply Program input before Run.
- Stop terminates the shared worker; other exercises wait until recovery completes before running again.

## Files

| File | Role |
|------|------|
| `src/coding/PythonCodeExercise.tsx` | Main IDE UI |
| `src/coding/MonacoEditorField.tsx` | Monaco wrapper + fallback |
| `src/coding/python.worker.ts` | Pyodide worker |
| `src/coding/pythonWorkerClient.ts` | Worker singleton + API |
| `src/coding/pythonStdin.ts` | Program input parsing + error formatting |
| `src/coding/blockConfig.ts` | Block helpers |
| `src/coding/types.ts` | Shared types |
| `src/coding/CodeBlockView.tsx` | IDE / read-only / local-only routing |
