# Shared package provenance

Unit 14 installs shared packages at **build time** through `file:` siblings. GitHub Pages serves only the Vite `dist/`. There is no runtime GitHub or npm access.

| Package | GitHub repository | Tag | Commit | Version |
| --- | --- | --- | --- | --- |
| `@learning-platform/core` | [Acerosa/learning-platform-core](https://github.com/Acerosa/learning-platform-core) | `v0.2.5` | `22885fdd475ac4e9fca4c5819d83cf73085830f5` | 0.2.5 |
| `@learning-platform/content` | [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) | `v0.1.2` | `2cf262dcf11ed2bc4bb21ee6074f60bc019d304e` | 0.1.2 |
| `@learning-platform/ui` | [Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui) | `v0.1.8` | `1511fe2ed7a5448522c121fb44636a00e315e09e` | 0.1.8 |

CI also checks out [Acerosa/learning-platform-backend](https://github.com/Acerosa/learning-platform-backend) at `46b0c7d19c41a1e0a79e8b32b8ef27d4784c0bd8` so the hub-manifest validator test can run. Backend is not a `file:` package and is not part of the learner bundle.

The UI GitHub repository is `Acerosa/Acerosa-learning-platform-ui`. CI checks it out to the local folder `learning-platform-ui` so `file:../learning-platform-ui` resolves.

Vendored IIFE copies under `vendor/` remain for Node curriculum tests and provenance of earlier static-hub consumption. The React/Vite production bundle uses the `file:` packages above, not those IIFE globals.

Do not add a second install path (for example npm registry plus `file:`).
