# Curriculum engine

The learner hub is becoming a **renderer of structured curriculum**, not a collection of hand-written week pages.

This is the first version of that engine. It lives in this hub so the contract can be proved against Unit 14. It is written so it can later move to `learning-platform-content` without carrying Unit 14 teaching copy with it.

## Design philosophy

Teaching content is data. Presentation is a function of that data.

Authors (and later the Admin portal) should never need to understand HTML. They edit objects: curriculum, weeks, sessions, activities, blocks, questions and assets. The renderer walks the tree. Admin writes the same objects the hub validates.

Activity “types” are not hard-coded engines. A business scenario and a Python exercise are the same renderer with a different sequence of blocks.

The renderer knows the **curriculum contract**. It does not know Unit 14, OCR, or GitHub Classroom. Those names appear only in content documents.

Questions are data. Blocks render them. Question documents must not contain rendering behaviour, and they must not default to putting answers in the browser.

Excel and JSON are authoring formats. Internally everything becomes canonical JSON. The renderer never sees a spreadsheet.

## Content hierarchy

```text
Course
  Curriculum
    Learning outcomes
    Assignments
    Weeks
      Sessions
        Activities
          Blocks
            Assets
            Questions
```

The backend Hub Manifest (`learning-platform-hub.json`) stays the registration contract. Backend schema 1.0.0 forbids extra fields, so it cannot yet hold a curriculum pointer.

The **content hub** document (`content/unit-14/hub.json`) is the engine’s hub object: branding, routes, features, and a pointer at the curriculum id. `APP_CONFIG.curriculumPackage` tells the browser where the package lives.

## Object envelope

Every document uses the same envelope:

- `schema` — for example `lp.content.week`
- `schemaVersion` — semantic version of that schema (`0.1.0`)
- `id` — stable identifier
- `version` — semantic version of this document
- `metadata` — display and planner fields
- `relationships` — ids of other documents, never nested HTML

Blocks may be inlined on an activity. The loader fills the same envelope before validation.

## Renderer

Each renderer knows only its immediate children:

| Renderer | Renders |
| --- | --- |
| Curriculum | weeks |
| Week | sessions (or a planned outline if none exist) |
| Session | activities |
| Activity | blocks |
| Block | one registered type |

Registered block types include prose, media, question forms, Python/code exercises and teacher notes. This version **implements** heading, paragraph, markdown, image, video, callout, accordion, reference, hint, quote, divider and teacher-note. Other registered types render as accessible placeholders so the registry can grow without inventing a new engine.

GitHub Pages has no bundler. The engine is a set of browser scripts plus a Node entry for validation.

## Validation

`content/engine/validate.js` checks:

- schema name and supported `schemaVersion`
- required envelope and typed fields
- duplicate ids (within a schema and globally)
- missing relationship targets
- inverse week ↔ session pointers
- unsupported block types
- cyclic prerequisite graphs

Diagnostics are `{ code, path, message }` so Admin can show them later.

## Import pipeline

```text
JSON or Excel (xlsx / CSV sheets)
        → importer
        → canonical package
        → validator
        → renderer
```

`scripts/import-excel.py` reads a real `.xlsx` with the Python standard library. The JavaScript engine also imports CSV sheets, which is the Excel-compatible path used in tests. Neither path is a learner runtime.

## Unit 14 as first consumer

`content/unit-14/` is hub-owned content:

- curriculum and 19-week registry
- four assignments
- Week 1 sessions and activities expressed as blocks

Weeks 2–19 are structured week objects without sessions. That is intentional: Week 1 proves the architecture; later specifications add teaching activities from the Scheme of Learning.

Week HTML routes are thin mounts (`data-lp-view="week"`). Session markup is generated at runtime from JSON.

## What can later be extracted

Move to `learning-platform-content` when a second hub can share the contract:

- `content/schemas/`
- `content/engine/` (registry, validator, loader, renderer, importer)

Keep in the learner hub:

- `content/unit-14/`
- branding, routes, GitHub Classroom copy, Python-only configuration

Do not extract question banks or assignment briefs into the shared package.
