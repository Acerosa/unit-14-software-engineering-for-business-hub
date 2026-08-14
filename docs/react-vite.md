# React + Vite migration

Unit 14 is the reference learner hub for React + TypeScript + Vite.

## Stack

- React 19
- TypeScript
- Vite multi-page static build (`base: './'`)
- `@learning-platform/core` 0.2.0 (auth, learner context, theme, tokens)
- `@learning-platform/content` 0.1.0 (curriculum, `renderActivity`, `bindInteractive`)
- `@learning-platform/ui` 0.1.0 (React chrome and week presentation)

## What did not change

- `content/unit-14/`
- assignment/P/M/D copy (hub-owned)
- project journey
- publication comparison
- draft persistence and evidence-only submission
- GitHub Pages directory URLs

## Local development

```bash
npm install
npm run dev
```

## Tests and production build

```bash
npm test
```

That runs Node curriculum/engine tests, React presentation tests, then `vite build`. Output is static `dist/` with `.nojekyll` and `content/unit-14/`.
