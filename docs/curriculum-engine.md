# Curriculum engine

The learner hub is becoming a **renderer of structured curriculum**, not a collection of hand-written week pages.

This is the first version of that engine. Canonical schemas, validation, block registry, importers and render helpers now live in `@learning-platform/content` **0.1.0**. This hub vendors the reviewed IIFE/CJS build and keeps learner draft/submit adapters plus Unit 14 teaching copy.

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

Registered block types include prose, media, question forms, Python/code exercises and teacher notes.

This version **implements**:

- prose: heading, paragraph, markdown, image, video, callout, accordion, reference, hint, quote, divider, teacher-note
- interactive: single-choice, classification, short-response, reflection, code-editor, python-exercise

Other registered types (for example multiple-choice, matching, debugging-exercise) render as accessible placeholders so later weeks can add types without a new engine.

Interactive blocks stay generic. Categories, prompts, starter code and checks come from content JSON. The renderer never branches on Unit 14, week number, or assignment id.

`python-exercise` extends the generic code editor with instructions, hints, expected constructs and optional regex checks. It does **not** execute Python in the browser. That matches the T Level hub’s deterministic checker: required/prohibited patterns, no `eval`, no remote runner.

## Learner state

`content/engine/state.js` stores drafts in `localStorage` under `learning-platform.content.draft.v1:{learnerKey}:{activityId}`.

- Guest key: `guest`
- Signed-in key: `auth:{user.id}` from Core `platform.auth.getSession()`
- Browser storage is draft continuity only
- Reset activity clears that activity’s key only
- Authoritative progress still belongs to Auth/backend when an activity can be submitted

## Submission boundary

`content/engine/submit.js` maps responses to Core `evidence.*` helpers and calls `platform.submission.submit` with the allowed fields only (`activityKey`, `activityVersion`, `responses`, `sourcePage`, `startedAt`, `completedAt`, `programmingLanguage`).

It never sends learner id, enrolment id, assignment id or attempt number.

Week 1 activities are published in the shared backend catalogue. Signed-in
submit uses Core evidence objects and `api.submit_attempt`. Incomplete
activities stay on the device until every interactive block has a response.
`programmingLanguage` is sent only for Python/code editors.

See [Publication](publication.md) for the catalogue pipeline, id mapping and
version rules.

A local serialised result (`serialiseActivityResult`) is `{ activityId, version, responses: [{ questionId, type, value }] }`. The live submit path uses Core evidence objects, not that shape.

Low-stakes formative answers (for example classification `correctCategoryId`) may live in browser JSON. That is instant teaching feedback, not secure Assignment 1 marking. The hub does not award P1.

See [Week 1 activities](week-1-activities.md) for the first vertical slice.

GitHub Pages has no bundler. The hub vendors `learning-platform-content.iife.js` and loads hub-local `state.js`, `submit.js` and `interactive.js` after it. Node tests require `content/engine/index.js`, which re-exports the vendored CJS build plus those adapters.

## Validation

`@learning-platform/content` `validatePackage` checks:

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
- Week 1 sessions and interactive activities expressed as blocks

Weeks 2–19 are structured week objects without sessions. That is intentional: Week 1 is the interactive vertical slice; later specifications add teaching activities from the Scheme of Learning.

Week HTML routes are thin mounts (`data-lp-view="week"`). Session markup is generated at runtime from JSON.

## Shared package

`@learning-platform/content` 0.1.0 owns:

- `lp.content.*` schemas
- block registry, validator, loader, renderer, importer, sanitisation

Canonical repository: [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) (tag `v0.1.0`).

This hub keeps:

- `content/unit-14/`
- `content/engine/state.js`, `submit.js`, `interactive.js`
- branding, routes, GitHub Classroom copy, Python-only configuration

A reviewed copy of the package schemas lives under `vendor/learning-platform-content/0.1.0/schemas/` for local reading. Do not put question banks or assignment briefs into the shared package.
