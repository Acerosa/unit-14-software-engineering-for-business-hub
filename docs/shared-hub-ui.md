# Shared hub UI adoption

Unit 14 is the first consumer of Core 0.2.0 learner UI primitives.

## What moved to Core

- Skip-link, banner, primary navigation, theme control, account slot
- Breadcrumbs
- Week presentation contract (`createWeekView`)
- Session container with kind variants
- Activity listing cards and status badges
- Assignment/exam/project context panel (data-driven)

## What stayed in the hub

- Branding: `#1e3a5f` / `#2a7a62`, short name, qualification
- IA: Weeks, Assignments, Project (no Activities dump)
- Week 1 curriculum JSON
- Content `renderActivity` / `bindInteractive` for drafts and checks
- Assignment workspace, P/M/D disclaimer, A1 journey list
- Project journey
- Publication banner adapter
- Interactive block CSS

## Configuration

```js
navigationMode: "as-supplied"
ui: {
  contextType: "assignment",
  showLearningOutcomes: true,
  showAssignmentContext: true,
  showExamContext: false,
  showProjectContext: false,
  showIndependentStudy: true,
  showProgress: false
}
```

Core has no `if (hub === "unit14")` branches.

## Future Unit 3 adoption

Adopt later, do not migrate in this task.

1. Map `--color-*` onto `--lp-*` / `--hub-primary`.
2. Replace duplicated page headers with `createNavigationShell` (static HTML copy-paste is the main cost).
3. Map week pages to `createWeekView` with `contextType: "exam"` and examination-focus items supplied as data.
4. Keep OCR command-word drills, NCSC and Northbank copy in the hub.

Blockers: many static week/activity HTML files; exam pedagogy UI; account widget not in the header.

## Future T Level adoption

1. Replace injected header with `createHubShell` / `createNavigationShell`.
2. Use `createActivityCard` for foundations catalogue cards.
3. Do not force week/session presentation onto the phase/task model.
4. Keep the course sidebar until Core has a secondary-nav primitive.

Blockers: phase IA, dual nav, programming editor chrome, missing banner/contentinfo landmarks.
