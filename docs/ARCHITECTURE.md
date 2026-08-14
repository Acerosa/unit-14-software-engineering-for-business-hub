# Architecture

## Unit 14 responsibility

This repository is the learner-facing curriculum layer for OCR Level 3 IT Unit 14. It owns:

- week routes and Scheme of Learning presentation
- assignment workspace guidance
- project-journey navigation
- Unit 14 branding tokens
- hub-owned CSS that consumes Core semantic tokens
- static GitHub Pages composition

It does not own identity, marks, enrolments, RLS, administration or GitHub itself.

## Core responsibility

`learning-platform-core` 0.2.0 owns authentication, session restoration, onboarding, learner context, assignments/progress services, theme behaviour, account UI, platform state and learner-safe API access.

`src/platform.ts` is the React composition root. It creates one Core platform per page through `createPlatform(..., { createClient })`. Hub code does not keep a parallel session store.

## Backend responsibility

`learning-platform-backend` remains the authority for:

- `api.my_profile`
- `api.my_enrolments`
- `api.my_assignments`
- `api.my_activity_delivery`
- `api.curriculum_weeks`
- `api.my_attempts`
- `api.my_responses`
- `api.my_activity_progress`
- `api.registration_options()`
- `api.complete_learner_onboarding(...)`
- `api.submit_attempt(...)`

This hub is prepared to use those services through Core. It does not submit attempts in the foundation release because Week 1 activities are still planned shells.

## Admin responsibility

`learning-platform-admin` is the only staff interface. Hub-specific names appear there as registry data after a reviewed backend registration. This learner hub contains no admin screens.

## Static runtime composition

Vite builds a multi-page static site (`base: './'`). Each public route is a directory with `index.html` that mounts the same React application. GitHub Actions runs `npm ci`, tests and `vite build`, then publishes `dist/`.

```text
theme bootstrap
  -> hub and public Supabase configuration
  -> @learning-platform/core createPlatform
  -> @learning-platform/ui HubShell
  -> Content loadPackage / resolveWeek / renderActivity / bindInteractive
```

Shared packages are `file:` siblings pinned in CI to reviewed tags. See [PROVENANCE.md](PROVENANCE.md). GitHub Pages serves only the static `dist/` output.

## Shared learner UI

`src/App.tsx` mounts `@learning-platform/ui` `HubShell`, `LearnerHeader`, `WeekView` and `ActivityCard`. Core `createAccountDialog` remains the account modal. Week pages map canonical Content `resolveWeek()` through `src/content/week-presentation.ts`. Activity interiors still come from Content `renderActivity` + `bindInteractive`.

Assignment workspace copy, P/M/D disclaimers and the project journey remain hub-owned.

Hub branding stays in `APP_CONFIG.theme` (`#1e3a5f` / `#2a7a62`) and `shortName` / `qualification`.

## Navigation

Core 0.2.0 honours `navigationMode: "as-supplied"`. Unit 14 keeps Home, Weeks, Assignments, Project, Resources, Help and Account in that order without a custom header implementation.

## Curriculum registry

`js/data/curriculum.js` is the single source for the 19 teaching weeks. UI cards, week outlines and assignment week lists derive from it. Calendar fields exist (`weekCommencing`, `releaseDate`, `dueDate`) and are `null` until planner/assignment data is available.

## Assignments

`js/data/assignments.js` holds the four assignment phases, criteria, teaching weeks and workspace stages. Stage status is learner guidance. The hub never states that a learner has achieved P, M or D.

## Project workflow

`js/data/project-journey.js` describes the Assignments 2–4 lifecycle. GitHub remains the authentic issue/branch/PR/release environment.

## Submission boundary

No activity in this foundation submits evidence. When activities are added, they must use Core evidence builders and `platform.submission`, or a documented compatibility adapter if contract 0.1.0 still requires client formative scores. The browser must not send identity or assignment IDs.

## Content architecture

Week routes are thin mounts. Teaching structure is canonical JSON under `content/unit-14/`, validated and rendered by vendored `@learning-platform/content` 0.1.0 plus hub-local draft/submit adapters in `content/engine/`. See [curriculum-engine.md](curriculum-engine.md). The Part 1 review remains in [content-architecture/](content-architecture/README.md).
