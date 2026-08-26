# Shared hub UI adoption

Unit 14 is the first consumer of Core 0.2.0 learner UI contracts and of `@learning-platform/ui` React components.

## What moved to Core / UI

- Skip-link, banner, primary navigation, theme control, account slot
- Breadcrumbs
- Week presentation contract (`WeekView` / `createWeekView`)
- Session container with kind variants
- Activity listing cards and status badges
- Assignment/exam/project context panel (data-driven)

React components in `@learning-platform/ui` reimplement that grammar. Core DOM factories remain available and unused by this Vite build. The account dialog remains Core `createAccountDialog`.

Canonical UI package: `@learning-platform/ui` 0.1.4 from [Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui) tag `v0.1.4`.

## What stayed in the hub

- Branding: `#1e3a5f` / `#2a7a62`, short name, qualification
- IA: Weeks, Assignments, Project (no Activities dump)
- Week 1 curriculum JSON
- Content `renderBlock` fallback + `bindInteractive` for HTML code/python drafts; React catalogue results persist through `lp-block-result`
- Assignment workspace, P/M/D disclaimer, A1 journey list (plus optional UI `PracticeProgressPanel` for formative MCQ/classification only)
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
2. Replace duplicated page headers with `HubShell` / `createNavigationShell`.
3. Map week pages to `WeekView` with `contextType: "exam"` and examination-focus items supplied as data.
4. Keep OCR command-word drills, NCSC and Northbank copy in the hub.

## Future T Level adoption

1. Replace injected header with `HubShell`.
2. Use `ActivityCard` for foundations catalogue cards.
3. Do not force week/session presentation onto the phase/task model.
4. Keep the course sidebar until Core has a secondary-nav primitive.
