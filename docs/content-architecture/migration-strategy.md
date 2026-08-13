# Migration strategy

All three hubs keep their repositories. None is rewritten in one step. The shared contract is a **curriculum document + renderer**, not a merger of sites.

## Common sequence for every hub

1. Describe weeks, sessions and activities as data that validates against the shared schema.
2. Render week pages from that data (thin route stubs allowed for GitHub Pages).
3. Keep activity **content** in the hub. Point each activity at a type (`classification`, `coding-exercise`, `diagnostic`, `written`, …).
4. Publish marking/delivery keys through the existing backend import path. Do not let the browser become the catalogue.
5. Submit through Core when the submission contract allows; keep documented adapters only where 0.1.0 still requires client scores.

Runtime still never fetches GitHub for curriculum.

## Unit 14 (first consumer)

Unit 14 is the proving ground because it is new and assignment-based.

- Already has a 19-week registry, four assignments and a project journey.
- Technical debt to retire: committed `weeks/week-N/index.html` files that repeat the same shell.
- Next implementation (after this review is approved) should make **one week renderer** driven by `js/data/curriculum.js` (or JSON derived from it). Week 1 session lists already live in that registry.
- Do not port T Level question banks. Configure reusable activity **types** for Python when those activities are written.
- Do not add an exam-practice layer.

Calendar dates stay `null` until the Curriculum Planner is available.

## T Level (second consumer, selective)

T Level should adopt the schema for **Foundations catalogue → activity → sections → questions** first, because that data is already structured.

- Do not force a 19-week SoL onto Task 1–3.
- Map Foundations activities as a module with optional “week” empty or a synthetic foundations week.
- Keep multi-language programming diagnostics; the shared coding type must accept a language list so Unit 14 can pass `["python"]` only.
- Leave the submission adapter until backend and Core share evidence-only marking.
- Course-section navigation (Foundations, Tasks) remains hub IA.

## Unit 3 (last, week-shaped but historically page-driven)

Unit 3 already matches the learner UX (week → session → activity cards) but stores that structure in HTML and `course-context.js`.

- Migrate week overviews to data without moving exam-practice content into the shared layer.
- Week 1 stays on the Activity API until a reviewed `markSection` equivalent exists. Shared rendering can still list those activities.
- Weeks 2–7 already have local `data/` files; those are the nearest existing “activity documents”.
- Do not genericise Apps Script collectors.

## Backend and Admin (parallel, not blocking Unit 14 renderer)

- Backend continues to receive **reviewed** activity catalogues. A content schema should emit the fields `generate-curriculum-migration.py` already understands, then grow.
- Admin Curriculum/Activities modules remain read-only until mutation RPCs exist. Authoring targets the same schema hubs validate.

## Rollback

Each hub keeps its previous routes until its data renderer is proven. Unit 14 can keep week stubs that only set `data-week` so old URLs still resolve.
