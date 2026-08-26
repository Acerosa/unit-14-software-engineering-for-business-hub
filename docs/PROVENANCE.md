# Shared package provenance

Unit 14 installs shared packages at **build time** through `file:` siblings. GitHub Pages serves only the Vite `dist/`. There is no runtime GitHub or npm access.

| Package | GitHub repository | Tag | Commit | Version |
| --- | --- | --- | --- | --- |
| `@learning-platform/core` | [Acerosa/learning-platform-core](https://github.com/Acerosa/learning-platform-core) | `v0.2.0` | `f59614ee0d77f43852f02b1eab6dfb176ddfbc40` | 0.2.0 |
| `@learning-platform/content` | [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) | `v0.1.0` | `d794fdef17dcf661570fd4292563835606d4b658` | 0.1.0 |
| `@learning-platform/ui` | [Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui) | `v0.1.4` | `2cdf8c07239f5899be679df178bea63ebabe51b3` | 0.1.4 |

CI also checks out [Acerosa/learning-platform-backend](https://github.com/Acerosa/learning-platform-backend) at `46b0c7d19c41a1e0a79e8b32b8ef27d4784c0bd8` so the hub-manifest validator test can run. Backend is not a `file:` package and is not part of the learner bundle.

The UI GitHub repository is `Acerosa/Acerosa-learning-platform-ui`. CI checks it out to the local folder `learning-platform-ui` so `file:../learning-platform-ui` resolves.

Vendored IIFE copies under `vendor/` remain for Node curriculum tests and provenance of earlier static-hub consumption. The React/Vite production bundle uses the `file:` packages above, not those IIFE globals.

Do not add a second install path (for example npm registry plus `file:`).
