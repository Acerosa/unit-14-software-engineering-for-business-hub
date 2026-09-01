# Deployment

GitHub Actions builds a static `dist/` and publishes it to GitHub Pages. There is no Node runtime after deploy.

## Pipeline

`.github/workflows/pages.yml`:

1. Check out this hub
2. Check out reviewed siblings into a workspace:
   - `Acerosa/learning-platform-core` @ `v0.2.5` → `learning-platform-core`
   - `Acerosa/learning-platform-content` @ `v0.1.2` → `learning-platform-content`
   - `Acerosa/Acerosa-learning-platform-ui` @ `v0.1.8` → `learning-platform-ui`
   - `Acerosa/learning-platform-backend` @ `46b0c7d` → `learning-platform-backend` (manifest validator only)
3. Node 22, `npm ci`
4. `npm test` (Node tests, Vitest, Vite production build, post-build route checks)
5. Upload `dist/` as a Pages artifact
6. Deploy the artifact (main only)

Pages must use the **GitHub Actions** source. Deploying the git branch root would serve Vite HTML shells without bundled assets.

## Static URLs

`base: './'` keeps relative assets. Direct refresh must work for:

- `/`
- `/weeks/`
- `/weeks/week-1/`
- `/assignments/assignment-1/`

## Provenance

See [PROVENANCE.md](PROVENANCE.md).
