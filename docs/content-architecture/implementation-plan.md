# Implementation plan

Implementation of the content architecture is **paused** after this document. The next specification should authorise a phase before code changes.

No sibling repository is modified in this review. `learning-platform-content` is not created yet.

## Phase 0 — already present (transitional)

Unit 14 foundation hub: Core integration, 19-week registry, assignment registry, Week 1 SoL shell, Assignment 1 workspace, project journey.

Treat the 19 week HTML files as a compatibility surface, not the target architecture.

## Phase 1 — schema in Unit 14 (first code after approval)

Define a versioned curriculum document:

- course / unit
- weeks (number, title, LOs, assignment, phase, planner dates, status)
- sessions (id, title, summary, defaultOpen)
- activities (stable key, type, status, href or inline spec, evidence types)
- assignments and evidence map remain hub documents that **reference** week/activity keys

Add a validator (Node, dependency-free, same spirit as the backend hub-manifest validator).

Collapse week presentation to one renderer plus thin stubs. Do not invent Week 2–19 teaching activities.

## Phase 2 — Unit 14 activity types (hub-owned)

Implement only types required by the SoL, starting with Week 1:

- planned/coming-soon listing (already a Unit 3 UX pattern)
- later: diagnostic, Python coding-exercise, classification

Reuse T Level **behaviour** (editor/checker/drafts) only by extracting a configurable component inside Unit 14 or, if already generic, documenting an upstream extract. Do not copy T Level items.

Python only. No exam-practice.

## Phase 3 — extract `learning-platform-content`

Create the repository when:

- Unit 14 week renderer is driven only by validated data
- at least one T Level Foundations activity can validate against the same activity schema
- schemas have a version field and tests

Package contents: schemas, validators, static render helpers. Still no question banks. Hubs vendor or copy a reviewed version the same way they vendor Core (GitHub Pages constraint).

## Phase 4 — backend alignment

Generate catalogue fragments from the same documents the hub renders. Do not duplicate week titles in SQL by hand.

Calendar/LO fields on `api.curriculum_weeks` only via a reviewed migration.

Register the Unit 14 hub/module. Default registration remains planned/inactive.

## Phase 5 — Admin authoring

Once backend write RPCs exist, Admin Curriculum/Activities edit the same schema. Publishing remains a reviewed backend change, not a live GitHub read.

## Phase 6 — T Level then Unit 3 adoption

T Level Foundations first. Unit 3 week overviews second. Exam and Apps Script paths stay Unit 3-specific.

## Out of scope until a later specification

- Creating `learning-platform-content` now
- Changing Core, backend, Admin, Unit 3 or T Level in this hub task
- Automatic P/M/D
- Rebuilding GitHub
- Filling 19 weeks of invented teaching content
- Dates not present in the Curriculum Planner
