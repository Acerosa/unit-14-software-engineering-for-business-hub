# Development

Unit 14 is a React + TypeScript + Vite multi-page app. Shared packages are installed from sibling folders at build time.

```text
Projects/
├── unit-14-software-engineering-for-business-hub
├── learning-platform-core          # tag v0.2.0
├── learning-platform-content       # tag v0.1.0
├── learning-platform-ui            # tag v0.1.0 (repo Acerosa/-learning-platform-ui)
└── learning-platform-backend       # CI/local hub-manifest validation only
```

```bash
npm install
npm run dev
npm run typecheck
npm test
```

`npm test` runs Node curriculum tests, Vitest, then `vite build` and post-build static-route checks.

The Vite server prints a local URL. Nested routes such as `/weeks/week-1/` and `/assignments/assignment-1/` are real directories, not hash routes.

Do not add a second install path (npm registry plus `file:`). Provenance for the reviewed tags is in [PROVENANCE.md](PROVENANCE.md). Architecture: [ARCHITECTURE.md](ARCHITECTURE.md). Stack notes: [react-vite.md](react-vite.md).
