# Repository responsibilities

## Backend (`learning-platform-backend`)

Owns identity, enrolments, published curriculum keys, assignments, attempts, responses, derived progress, analytics, hub registry, RLS and both API schemas.

Does not own teaching prose, week session copy, or learner-facing renderers.

`api.curriculum_weeks` today is a thin delivery view (course, module, week key, title, number, sort). Sessions, learning outcomes, assignment phases and planner dates are not in that contract. Extending it is a later, reviewed backend change — not a hub migration.

## Core (`learning-platform-core`)

Owns Auth, session restore, onboarding, learner context, named `api` services, theme, account UI, navigation shell, platform state, evidence builders and submission allow-list.

Does not own curriculum, question banks, week logic or subject colours beyond hub token overrides.

Do not move SoL documents or activity JSON into Core.

## Admin (`learning-platform-admin`)

Owns staff presentation of hubs, courses, learners, groups, enrolments, assignments, attempts and analytics.

Curriculum and Activities modules are placeholders: backend 0.2.0 has no authoring mutation RPCs. Admin should become the authoring/publishing UI **after** a content schema and backend write contract exist. It must not start storing curriculum in the portal repository.

## Learner hubs

Own branding, routes, teaching content, subject activities and genuinely subject-specific behaviour.

| Hub | Keep hub-owned | Do not treat as platform |
| --- | --- | --- |
| Unit 3 | Cyber scenarios, exam-command practice, Week 1 Activity API until `markSection` exists | Exam-practice layer, Apps Script collector, per-week duplicated engines |
| T Level | Foundations question content, Task 1–3 IA, multi-language programming diagnostics | Client-authoritative marks, second Auth stack (already removed) |
| Unit 14 | OCR SoL, four assignments, evidence map, project journey, Python-only configuration, Git/GitHub teaching | Per-week hand-written HTML, automatic P/M/D judgement |

## Future `learning-platform-content` (not created yet)

Own schemas, validators, importers and generic render helpers.

Do not own secrets, learner records, or hub-specific question text.

## Trust rules that do not move

- Browser is untrusted. Identity comes from `auth.uid()`.
- Hubs never send learner, enrolment or assignment IDs as authority.
- Formative local feedback is not assessor judgement.
- GitHub is not a learner runtime dependency.
