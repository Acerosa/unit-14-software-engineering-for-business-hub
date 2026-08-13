# Proposed upstream changes

This hub did not modify sibling repositories. The following gaps were recorded for later reviewed work.

## learning-platform-core

1. **Ordered extra navigation** — `createPlatform()` always emits the six standard IDs first. Unit 14 needs Home, Weeks, Assignments, Project, Resources, Help, Account. A Core option to honour supplied order, while still requiring the standard IDs to exist, would let hubs drop custom headers.
2. **Assignment-workspace primitives** — a non-grading milestone list would be reusable by other internally assessed units. Keep it clearly labelled as guidance, not marks.

## learning-platform-backend

1. **Unit 14 module registration** — done locally on `feature/unit14-content-registration`. The hub is testing/active, with module, 19 week metadata rows, LO topics, Week 1 activity versions and a closed `UNIT14-TEST-A` group. Hosted deployment is still not authorised.
2. **Calendar metadata** — `api.curriculum_weeks` currently exposes key, title, week number and sort order. Teaching-week commencing dates, phase and assignment linkage would avoid duplicating planner data in each hub. Do not add this until a reviewed schema exists.
3. **Hub registration migration** — done locally. The reviewed manifest lives in the backend registry; Hub Manifest 1.0.0 still cannot hold a curriculum pointer.
4. **OCR assignment catalogue** — Assignments 1–4 remain hub-owned. `learning.activity_assignments` is group delivery of activity versions, not OCR briefs.
5. **Client-marked `submit_attempt` compatibility** — Unit 14 Core submissions omit scores. Direct RPC still accepts client marks for Unit 3 / T Level compatibility. Tightening that for questions with `learning.question_marking` is later backend work.

## learning-platform-admin

No learner-hub change is required. Once registered, Unit 14 should appear through existing hub/course views.

## Shared curriculum components

T Level programming diagnostics, classification and draft recovery should be extracted only after they can be configured for Python-only Unit 14 use without copying T Level assessment content.
