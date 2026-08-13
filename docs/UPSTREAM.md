# Proposed upstream changes

This hub did not modify sibling repositories. The following gaps were recorded for later reviewed work.

## learning-platform-core

1. **Ordered extra navigation** — `createPlatform()` always emits the six standard IDs first. Unit 14 needs Home, Weeks, Assignments, Project, Resources, Help, Account. A Core option to honour supplied order, while still requiring the standard IDs to exist, would let hubs drop custom headers.
2. **Assignment-workspace primitives** — a non-grading milestone list would be reusable by other internally assessed units. Keep it clearly labelled as guidance, not marks.

## learning-platform-backend

1. **Unit 14 module registration** — the hub manifest currently links to course `ocr-level-3-it`. A dedicated module/catalogue for Unit 14 is still required before hosted assignments and `api.curriculum_weeks` can describe this unit.
2. **Calendar metadata** — `api.curriculum_weeks` currently exposes key, title, week number and sort order. Teaching-week commencing dates, phase and assignment linkage would avoid duplicating planner data in each hub. Do not add this until a reviewed schema exists.
3. **Hub registration migration** — after this repository's `learning-platform-hub.json` is reviewed, generate the registration SQL with the backend scripts. Default status should remain planned/inactive.

## learning-platform-admin

No learner-hub change is required. Once registered, Unit 14 should appear through existing hub/course views.

## Shared curriculum components

T Level programming diagnostics, classification and draft recovery should be extracted only after they can be configured for Python-only Unit 14 use without copying T Level assessment content.
