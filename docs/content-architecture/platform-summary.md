# Platform architecture summary

## Current shape

The Learning Platform is already split by trust boundary, not by website:

```text
learning-platform-backend     identity, RLS, published curriculum keys, attempts, progress
        ▲
        │  api / admin_api
        │
learning-platform-core        Auth, onboarding, learner context, theme, evidence, UI primitives
        ▲
        │  vendored 0.1.0 browser build
        │
learner hubs                  curriculum presentation and subject activities
  Unit 3 / T Level / Unit 14
        │
learning-platform-admin       staff inspection; authoring writes are still pending
```

That split is sound and should not be reopened.

What is missing is a **curriculum/content contract** above the hubs. Today each hub invents its own week pages, activity JSON, engines and draft keys. Backend catalogues published activity keys; it does not describe Session 1/2 teaching structure, assignment phases or planner dates. Core explicitly contains no curriculum.

## What should remain exactly as it is

- Backend as the only data/security authority; hubs never own migrations or RLS.
- Learner browsers using only the `api` schema through Core.
- Hub Manifest `learning-platform-hub.json` as descriptive registration metadata, not a runtime GitHub fetch.
- Core Auth, session, onboarding, learner context, theme tokens and evidence builders.
- Admin as the only staff UI; no admin screens inside learner hubs.
- Static GitHub Pages for learner hubs, with vendored Core and no runtime npm.
- GitHub as the authentic Unit 14 development environment, not a hub-built clone.
- Public teaching pages; authentication only for learner-specific records.

## What the hubs actually do today

| Hub | Curriculum model | Activity runtime |
| --- | --- | --- |
| Unit 3 | One HTML tree per week; activities listed inside the week | Mixed: Week 1 Activity API (Apps Script `markSection`); Weeks 2–7 local data + Supabase submit |
| T Level | Course-section routes (Foundations, Tasks), not a 19-week SoL | One Foundations engine over `js/data/foundations/*`; client formative answers in the browser; compatibility `submit_attempt` adapter |
| Unit 14 foundation | `js/data/curriculum.js` plus **19 committed week HTML files** | No live activities yet; Week 1 is a SoL shell |

Unit 14 already has a structured week registry, but still emits one HTML file per week. That is the page-driven pattern this architecture must replace.

## Conflicts

1. **Two sources of “curriculum”.** Backend `learning.curriculum_weeks` / activity manifests are delivery and marking catalogues. Hub HTML is the teaching experience. They do not share a session/activity document.
2. **Three activity runtimes.** Unit 3 Activity API, T Level Foundations engine, Core evidence types. Question keys and payload shapes differ.
3. **Submission contract 0.1.0** still expects client `awarded_score` / `is_correct`. Core 0.1.0 evidence-only submission cannot replace T Level’s adapter yet.
4. **Core navigation** always prepends six standard IDs. Week/assignment/project IA does not fit, so every hub keeps a custom header.
5. **Answers in the browser** (T Level formative marking) vs **answers off the browser** (Unit 3 Week 1 Activity API). A shared renderer must not force one trust model.
6. **GitHub Pages has no build step.** A content architecture cannot assume a bundler or server router. Data-driven rendering with thin, generated route stubs is compatible; a framework SPA is not.

## Should `learning-platform-content` exist?

**Yes, as a future shared package. Do not create the repository in this phase.**

It should own:

- JSON Schema for curriculum → weeks → sessions → activities
- validators and importer helpers (SoL/planner → hub JSON; hub JSON → backend catalogue fields)
- generic week/session/activity **presentation** helpers for static hubs
- generic activity-type contracts (classification, diagnostic, coding-exercise, written) with no question banks

It must not own:

- OCR/T Level question content
- Auth, RLS, progress authority
- Admin write RPCs
- Hub branding or GitHub Classroom workflows

Until a second hub consumes the same schema, those artefacts should live in Unit 14 (first consumer) so the contract can change without a premature package.

## Recommended target model

```text
Authoritative teaching sources (SoL, planner, assignment briefs)
        │
        ▼
Hub-owned curriculum documents (JSON), validated by a shared schema
        │
        ├─► static renderer: Week page from data (one template, not 19 hand-written pages)
        ├─► activity renderer selected by type (hub or later content package)
        └─► reviewed backend import: published keys, versions, questions, delivery weeks
                    │
                    ▼
              Core submission / progress (api schema)
                    │
                    ▼
              Admin inspect / later author and publish
```

Learner runtime never reads GitHub. Admin never becomes a learner renderer.
