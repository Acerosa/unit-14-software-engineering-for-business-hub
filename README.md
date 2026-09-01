# Unit 14 Software Engineering for Business Hub

Learner hub for **OCR Level 3 IT Unit 14 – Software Engineering for Business** (H/507/5017).

This repository is the **current reference** learner hub in the Contract-First
Modular Hub Architecture (`learning-platform-backend` `docs/architecture.md`).
It loads the published teaching package from Supabase at runtime. The bundled
`content/unit-14/` snapshot is fallback only.

## Platform role

The hub is curriculum-specific and platform-first:

| Repository | Responsibility |
| --- | --- |
| `learning-platform-core` | Shared browser auth, session, onboarding, learner context, theme, tokens, DOM factories and learner-safe API services |
| `@learning-platform/ui` | React learner chrome and week/session/activity presentation ([Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui)) |
| `learning-platform-content` | Curriculum schemas, validation and activity-block rendering |
| `learning-platform-backend` | Authoritative identity, enrolments, curriculum delivery, assignments, attempts, progress, RLS and APIs |
| this hub | Unit 14 weeks, assignments, project guidance and subject presentation |
| `learning-platform-admin` | Central staff administration across hubs |

This repository must not own learner identity, RLS, database migrations, administration screens or a second Auth implementation.

This hub conforms to Hub Security Baseline v1. Learner bundles exclude authoritative marking data. See `learning-platform-core` `docs/hub-security-baseline-v1.md`.

## Shared dependencies

Reviewed build-time packages (see [docs/PROVENANCE.md](docs/PROVENANCE.md)):

- `@learning-platform/core` **0.2.5** (`v0.2.5`)
- `@learning-platform/content` **0.1.2** (`v0.1.2`)
- `@learning-platform/ui` **0.1.8** (`v0.1.8`) from [Acerosa/Acerosa-learning-platform-ui](https://github.com/Acerosa/Acerosa-learning-platform-ui)
- Supabase JS **2.112.3**

Vendored IIFE copies under `vendor/` remain for Node curriculum tests. The GitHub Pages bundle is produced by Vite from the `file:` packages.

The hub is registered in the shared backend. Learners load the published teaching package from hosted Supabase at runtime; GitHub Pages hosts the application shell only.

Learner chrome uses `@learning-platform/ui` React components on Core 0.2.5 contracts (`HubShell`, `WeekView`, activity cards). Curriculum JSON and activity-block rendering stay in `@learning-platform/content`. See [docs/shared-hub-ui.md](docs/shared-hub-ui.md) and [docs/react-vite.md](docs/react-vite.md).

Git tag `curriculum-engine-mvp` is the Parts 1–4 baseline. See [docs/curriculum-engine-mvp.md](docs/curriculum-engine-mvp.md) and [docs/publication.md](docs/publication.md).

## Local development

Sibling checkouts and commands: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

```bash
npm install
npm run dev
```

Teaching routes work without hosted credentials. Open the Vite URL shown in the terminal.

## Testing

```bash
npm test
```

Validate the Unit 14 curriculum package:

```bash
node -e "const e=require('./content/engine'); const r=e.validateDirectory('./content/unit-14'); if(!r.valid){console.error(e.formatIssues(r.issues)); process.exit(1)}"
```

Manifest validation against the sibling backend. After Unit 14 is in the reviewed registry, validate that copy (validating this repository's file reports `DUPLICATE_HUB_ID` by design):

```bash
python3 ../learning-platform-backend/scripts/import/validate-hub-manifest.py \
  ../learning-platform-backend/supabase/data/manifests/hubs/unit-14-software-engineering-for-business/learning-platform-hub.json
```

## Deployment

Vite emits a static `dist/` for GitHub Pages. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

```bash
npm run build
```

Nested routes remain real directories. GitHub Actions runs `npm ci`, tests, `vite build`, then publishes `dist/`. Pages must use the GitHub Actions source, not the repository root.

This hub is not LHDS-certified. The Pages site is the static learner hub, not a hosted backend.

## Curriculum ownership

The hub owns the Unit 14 Scheme of Learning sequence, assignment phases and learner-facing guidance as a canonical JSON package (`content/unit-14/`) used as fallback/provenance. At runtime the published Supabase package is authoritative. Authoritative OCR documents remain outside the repository. Calendar dates are stored as metadata and are `null` until taken from the curriculum planner. See [docs/curriculum-engine.md](docs/curriculum-engine.md) and [docs/week-1-activities.md](docs/week-1-activities.md).

The shared backend is the official publication authority. This static hub
loads `api.published_curriculum_package()` and only treats signed-in
submissions as authoritative when that live package is in use. See
[docs/publication-consumption.md](docs/publication-consumption.md).

## Backend trust boundary

- Only the public Supabase URL and publishable key are browser configuration.
- Core queries the `api` schema only.
- The browser never sends learner, enrolment or assignment IDs as authority.
- GitHub is the authentic development environment, not a runtime backend.
