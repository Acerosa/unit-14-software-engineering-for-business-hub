# Shared package provenance

Unit 14 installs shared packages at **build time** through `file:` siblings. GitHub Pages serves only the Vite `dist/`. There is no runtime GitHub or npm access.

| Package | GitHub repository | Tag | Commit | Version |
| --- | --- | --- | --- | --- |
| `@learning-platform/core` | [Acerosa/learning-platform-core](https://github.com/Acerosa/learning-platform-core) | `v0.2.0` | `f59614ee0d77f43852f02b1eab6dfb176ddfbc40` | 0.2.0 |
| `@learning-platform/content` | [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) | `v0.1.0` | `d794fdef17dcf661570fd4292563835606d4b658` | 0.1.0 |
| `@learning-platform/ui` | [Acerosa/-learning-platform-ui](https://github.com/Acerosa/-learning-platform-ui) | `v0.1.0` | `e4ba520dabe5c341b62ec88574606fad61810061` | 0.1.0 |

The UI GitHub repository name has a leading hyphen. CI checks it out to the local folder `learning-platform-ui` so `file:../learning-platform-ui` resolves.

Vendored IIFE copies under `vendor/` remain for Node curriculum tests and provenance of earlier static-hub consumption. The React/Vite production bundle uses the `file:` packages above, not those IIFE globals.

Do not add a second install path (for example npm registry plus `file:`).
