# Shared package provenance

Unit 14 installs shared packages at **build time** through `file:` siblings. GitHub Pages serves only the Vite `dist/`. There is no runtime GitHub or npm access.

| Package | GitHub repository | Tag | Commit | Version |
| --- | --- | --- | --- | --- |
| `@learning-platform/core` | [Acerosa/learning-platform-core](https://github.com/Acerosa/learning-platform-core) | `v0.2.22` | `767ee749c8de4def0fae12526a367eb2dea81e13` | 0.2.22 |
| `@learning-platform/content` | [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) | `v0.1.2` | `ccf50ee46583ed99f15d8bf01c52498992a6d9f7` | 0.1.2 |
| `@learning-platform/ui` | [Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui) | `v0.1.14` | `70f3b508931fdb647f965855888e2dd5725ac56c` | 0.1.14 |

CI also checks out [Acerosa/learning-platform-backend](https://github.com/Acerosa/learning-platform-backend) at `5e2f386c2e7aeab1b4642359638874c8d1b04c78` so the hub-manifest validator test can run. Backend is not a `file:` package and is not part of the learner bundle.

The UI GitHub repository is `Acerosa/Acerosa-learning-platform-ui`. CI checks it out to the local folder `learning-platform-ui` so `file:../learning-platform-ui` resolves.

Vendored IIFE copies under `vendor/` remain for Node curriculum tests and provenance of earlier static-hub consumption. The React/Vite production bundle uses the `file:` packages above, not those IIFE globals.

Do not add a second install path (for example npm registry plus `file:`).
