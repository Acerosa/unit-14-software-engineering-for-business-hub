# Reuse map

Classification used here:

- **Core** — already provided by `learning-platform-core`; consumed, not copied.
- **Adapted** — pattern taken from a hub and rewritten against Core tokens/APIs.
- **Hub-owned** — Unit 14 specific.
- **Deferred extract** — useful later as a shared curriculum component; not moved into Core in this task.

| Feature | Source/reference | Reuse type | Reason | Unit 14 adaptation |
| --- | --- | --- | --- | --- |
| Auth, session, onboarding | Core `createPlatform()`, account dialog | Core | Do not duplicate Auth | Direct Core use; no Unit 3 Apps Script account forms |
| Theme light/dark/system | Core theme service + `src/theme-bootstrap.ts` | Adapted | Prevent theme flash on static pages | Shared storage key `learning-platform.theme.v1`; Unit 14 colours `#1e3a5f` / `#2a7a62` |
| Semantic tokens and cards | Core `theme.css` / `tokens.css` | Core | Current visual authority | Hub CSS maps layout onto `--lp-*` tokens instead of copying Unit 3 `main.css` |
| Learner header | Core `createLearnerHeader` | Core | Shared identity display | Mounted under the hub header |
| Static Core vendor layout | T Level `vendor/learning-platform-core/0.1.0` | Adapted | GitHub Pages cannot install npm at runtime | Same commit `f484b2d`, new provenance file |
| Script loading order | T Level routes | Adapted | Proven Core initialisation order | Uses Core `submission.submit` evidence objects; does not copy T Level `awarded_score` / `is_correct` adapters |
| Public/publishable Supabase config | T Level and Unit 3 | Adapted | Same hosted platform | `api` schema declared; no service-role key |
| Week-centred IA | Unit 3 | Adapted | Activities belong in the week journey | Weeks index plus week pages; no dump Activities route; no exam-practice layer |
| Session 1 / Session 2 disclosure | Unit 3 `details`/`summary` | Adapted | Familiar learning-page hierarchy | Used on Week 1; planned weeks stay as outlines |
| Coming-soon cards | Unit 3 | Adapted | Honest unfinished states | Non-linked planned activity cards; colour is not the only status cue |
| Breadcrumbs and skip link | Core `createBreadcrumbs` + shared skip-link CSS | Core | Proven across hubs | Mounted from `data-items` |
| Mobile menu | Core `createNavigationShell` | Core | 0.2.0 ordered navigation | `navigationMode: "as-supplied"` |
| Week / session chrome | Core `createWeekView` / `createSessionSection` | Core | Presentation only | Hub maps Content `resolveWeek()` |
| Activity listing cards | Core `createActivityCard` | Core | Outer presentation | Content still renders activity interiors |
| Programming activities | T Level Foundations `programming-checker.js` | Adapted | Deterministic regex/structure checks, no in-browser execution | Generic `python-exercise` checks in `@learning-platform/content`; Python-only UI; no T Level questions copied |
| Classification items | T Level labelled categories | Adapted | Reusable categories belong in content | Generic `classification` block; Unit 14 supplies integer/float/string/Boolean labels in JSON |
| Browser draft recovery | T Level `activity-state.js` | Adapted | Draft continuity without a second identity store | Prefix `learning-platform.content.draft.v1`; guest vs `auth:{user.id}`; reset is per activity |
| Requirements classification | T Level | Deferred extract | Useful for LO2 | Not copied |
| Assignment workspace | Unit 14 | Hub-owned | Assignment-based unit | Guidance/progress only; no automatic P/M/D |
| Evidence map | Unit 14 | Hub-owned | LO → assignment → criterion → artefact → weeks | Metadata in `assignments.js` |
| Project journey | Unit 14, informed by T Level projects | Hub-owned | Assignments 2–4 are one lifecycle | Navigation/guidance; GitHub stays authentic |
| Curriculum registry | Inspired by backend `curriculum_weeks` plus hub need for LO/assignment metadata | Hub-owned | Backend week view has no LO/assignment/calendar fields yet | Local JS registry; proposed backend fields documented |
| Exam practice | Unit 3 | Not reused | Unit 14 is internally assessed | No OCR exam-practice section |
