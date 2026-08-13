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

`learning-platform-core` 0.1.0 owns authentication, session restoration, onboarding, learner context, assignments/progress services, theme behaviour, account UI, platform state and learner-safe API access.

`js/core/platform.js` is the single composition root. It creates one Core platform per page. Hub code does not call `createClient()` and does not keep a parallel session store.

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

Every route loads:

```text
theme bootstrap
  -> hub and public Supabase configuration
  -> pinned Supabase JS 2.112.3
  -> vendored learning-platform-core 0.1.0 IIFE
  -> platform composition
  -> theme adapter
  -> hub shell (navigation, account dialog, learner header)
  -> optional curriculum page modules
```

Core assets are copied from one reviewed commit into `vendor/learning-platform-core/0.1.0/`. GitHub Pages serves repository files only.

## Navigation exception

Core 0.1.0 always places the six standard navigation IDs first. Unit 14 needs Home, Weeks, Assignments, Project, Resources, Help and Account in that learner order. The hub therefore renders its own header from `APP_CONFIG.navigation` while still passing the same metadata into `createPlatform()` for account/theme/conformance.

This is documented as a proposed Core enhancement, not implemented here.

## Curriculum registry

`js/data/curriculum.js` is the single source for the 19 teaching weeks. UI cards, week outlines and assignment week lists derive from it. Calendar fields exist (`weekCommencing`, `releaseDate`, `dueDate`) and are `null` until planner/assignment data is available.

## Assignments

`js/data/assignments.js` holds the four assignment phases, criteria, teaching weeks and workspace stages. Stage status is learner guidance. The hub never states that a learner has achieved P, M or D.

## Project workflow

`js/data/project-journey.js` describes the Assignments 2–4 lifecycle. GitHub remains the authentic issue/branch/PR/release environment.

## Submission boundary

No activity in this foundation submits evidence. When activities are added, they must use Core evidence builders and `platform.submission`, or a documented compatibility adapter if contract 0.1.0 still requires client formative scores. The browser must not send identity or assignment IDs.
