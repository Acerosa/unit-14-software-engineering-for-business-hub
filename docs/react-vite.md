# React + Vite migration

Unit 14 is the reference learner hub for React + TypeScript + Vite.

## Stack

- React 19
- TypeScript
- Vite multi-page static build (`base: './'`)
- `@learning-platform/core` 0.2.0 tag `v0.2.0` (auth, learner context, theme, tokens)
- `@learning-platform/content` 0.1.0 tag `v0.1.0` (curriculum, `renderActivity`, `bindInteractive`)
- `@learning-platform/ui` 0.1.0 tag `v0.1.0` from `Acerosa/-learning-platform-ui` (React chrome and week presentation)

CI checks those repositories out as siblings and installs them through `file:` dependencies. See [PROVENANCE.md](PROVENANCE.md).

## GitHub Pages

`.github/workflows/pages.yml` builds a static `dist/` with Vite. Pages must use the **GitHub Actions** source, not “deploy from a branch”, because source HTML is a Vite entry and is not runnable without the build.

Direct nested URLs remain real directories:

- `/`
- `/weeks/`
- `/weeks/week-1/`
- `/assignments/assignment-1/`

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

Development layout: [DEVELOPMENT.md](DEVELOPMENT.md). Pages pipeline: [DEPLOYMENT.md](DEPLOYMENT.md).

## Tests and production build

```bash
npm test
```

That runs Node curriculum/engine tests, React presentation tests, then `vite build`. Output is static `dist/` with `.nojekyll` and `content/unit-14/`.
