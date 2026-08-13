# Architecture review

Investigation findings from the five existing repositories plus the Unit 14 foundation hub. No code was changed in sibling repositories. No content renderer was implemented.

Sources inspected: `learning-platform-backend`, `learning-platform-core`, `learning-platform-admin`, `unit-3-Cyber-Security-Hub`, `tlevel-software-development-hub`, and this Unit 14 hub.

Authoritative teaching sources remain the OCR specification, Unit 14 Scheme of Learning, Curriculum Planner, assignment briefs, Scrum Guide, Git references and Python documentation. The SoL is the teaching authority. The planner supplies calendar dates. Dates stay unset until that planner is available.

## 1. What should remain exactly as it is

- Backend as the only identity, RLS, enrolment, attempt, progress and analytics authority.
- Learner browsers talking only to the `api` schema through Core.
- Hub Manifest (`learning-platform-hub.json`) as registration metadata, never fetched at learner runtime from GitHub.
- Core Auth, onboarding, learner context, theme, account UI and evidence builders.
- Admin as the only staff portal; no administration screens inside learner hubs.
- Static GitHub Pages hubs with a vendored Core build and no runtime npm.
- GitHub as the real Unit 14 development environment, not a clone inside the hub.
- Public teaching pages; authentication only for learner-specific records.
- T Level’s course-section IA (Foundations, Tasks) and Unit 3’s exam-practice layer, which are hub products rather than platform primitives.

## 2. What can be reused

- Core platform composition (`createPlatform`), theme tokens, account dialog, evidence types.
- Backend hub-manifest validator, catalogue import path and `api` views.
- Unit 3 week-centred UX: Session 1/2 disclosure, coming-soon cards, breadcrumbs, mobile menu, assignment workspaces.
- T Level activity-engine *behaviour*: sectioned activities, coding editor/checker, draft recovery, classification. Reuse the pattern, not the question banks.
- Unit 14’s existing 19-week registry, assignment criteria and project journey as the first structured curriculum documents.

## 3. What should become generic platform functionality

- A versioned curriculum document: curriculum → weeks → sessions → activities.
- A week/session renderer driven by that document (one template, thin route stubs for GitHub Pages).
- Activity-type contracts: diagnostic, classification, coding-exercise (language-configurable), written, planned/coming-soon.
- Validators and importers that emit both hub JSON and backend catalogue fields.
- Later: Admin authoring against the same schema, after backend mutation RPCs exist.
- Later: Core navigation that can accept a hub-supplied order, so hubs stop replacing the header.

These belong in a future `learning-platform-content` package, after Unit 14 proves the contract. They do not belong in Core (no curriculum) or the backend (no teaching prose).

## 4. What should remain unit-specific

| Hub | Stays in the hub |
| --- | --- |
| Unit 3 | Cyber scenarios, exam-command practice, Apps Script Activity API until a reviewed `markSection` exists |
| T Level | Foundations and Task 1–3 content, multi-language diagnostics, submission adapter until evidence-only marking is a backend+Core contract |
| Unit 14 | OCR SoL copy, four internally assessed assignments, evidence map, project journey, Python-only configuration, GitHub Classroom teaching |

Automatic Pass/Merit/Distinction judgement must never become platform behaviour.

## 5. Current technical debt

**Unit 3.** Page-driven week HTML. Two activity runtimes (Week 1 Apps Script `markSection` vs Weeks 2–7 local data + Supabase). Exam-practice mixed with platform chrome. Collector scripts that are not a platform API.

**T Level.** Foundations answers in the browser. Compatibility `submit_attempt` adapter because contract 0.1.0 still wants client `awarded_score` / `is_correct`. A second activity catalogue shape that does not describe SoL sessions.

**Unit 14.** Nineteen committed `weeks/week-N/index.html` files repeating the same shell. No live activities. Hub/module not registered in the backend. Custom header because Core always prepends six standard nav IDs.

**Core.** Navigation order is not hub-configurable. No curriculum model (correct), but also no week renderer helpers. Evidence-only submission cannot yet replace hubs that still satisfy 0.1.0 client scoring.

**Backend.** `api.curriculum_weeks` is a thin delivery view (key, title, week number, sort). Sessions, learning outcomes, assignment phases and planner dates are absent. Hub manifests must not contain activities; catalogues are a separate import.

**Admin.** Curriculum and Activities modules are placeholders. Backend 0.2.0 has no staff mutation RPCs. Authoring cannot start inside the portal repository.

## 6. Architecture conflicts

1. Two “curriculum” sources: backend catalogues vs hub teaching HTML. They do not share a session/activity document.
2. Three activity runtimes: Unit 3 Activity API, T Level Foundations engine, Core evidence types.
3. Submission 0.1.0 client scores vs Core 0.1.0 evidence-only payloads.
4. Core’s fixed six-section navigation vs week/assignment/project IA.
5. Answers in the browser (T Level formative) vs answers off the browser (Unit 3 Week 1). A shared renderer must not force one trust model.
6. GitHub Pages has no build step. A content architecture cannot assume a bundler or server router.

## 7. Recommended improvements

1. Keep the trust split. Do not merge hubs into Core or move RLS into hubs.
2. Do **not** create `learning-platform-content` in this phase. Prove schema + week renderer in Unit 14 first.
3. Collapse Unit 14 week HTML to one renderer plus thin stubs. Keep URLs stable.
4. Treat T Level Foundations as the second consumer of the *activity* schema, not of a 19-week SoL.
5. Migrate Unit 3 week overviews last; leave exam-practice and Apps Script in that hub.
6. Extend `api.curriculum_weeks` only through a reviewed backend migration, after the hub schema exists.
7. Point Admin Curriculum/Activities at that schema once write RPCs exist. Never author by fetching GitHub at runtime.

Full matrices and phasing: [reuse-matrix.md](reuse-matrix.md), [migration-strategy.md](migration-strategy.md), [implementation-plan.md](implementation-plan.md).
