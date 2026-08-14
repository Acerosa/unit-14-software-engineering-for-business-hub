# Unit 14 Software Engineering for Business Hub

Learner hub for **OCR Level 3 IT Unit 14 – Software Engineering for Business** (H/507/5017).

This is a new, unverified Learning Platform hub. It is not LHDS-certified and is not a production release.

## Platform role

The hub is curriculum-specific and platform-first:

| Repository | Responsibility |
| --- | --- |
| `learning-platform-core` | Shared browser auth, session, onboarding, learner context, theme, UI primitives and learner-safe API services |
| `learning-platform-backend` | Authoritative identity, enrolments, curriculum delivery, assignments, attempts, progress, RLS and APIs |
| this hub | Unit 14 weeks, assignments, project guidance and subject presentation |
| `learning-platform-admin` | Central staff administration across hubs |

This repository must not own learner identity, RLS, database migrations, administration screens or a second Auth implementation.

## Shared dependencies

- Vendored `@learning-platform/core` **0.2.0** (`feature/shared-hub-ui`) under `vendor/learning-platform-core/0.2.0/`
- Vendored `@learning-platform/content` **0.1.0** (`v0.1.0`) from [Acerosa/learning-platform-content](https://github.com/Acerosa/learning-platform-content) under `vendor/learning-platform-content/0.1.0/`
- Supabase JS **2.112.3** loaded at the reviewed browser version
- Learner API / submission contracts **0.1.0** through Core
- Hub course key in the manifest: `ocr-level-3-it` (the currently registered OCR Level 3 IT course)

The hub is registered in the local shared backend as testing/active, with Week 1 catalogue publication for delivery, submission and progress. Hosted Supabase deployment is not authorised by this foundation.

Learner chrome uses `@learning-platform/ui` React components on Core 0.2.0 contracts (`HubShell`, `WeekView`, activity cards). Curriculum JSON and activity-block rendering stay in `@learning-platform/content`. See [docs/shared-hub-ui.md](docs/shared-hub-ui.md) and [docs/react-vite.md](docs/react-vite.md).

Git tag `curriculum-engine-mvp` is the Parts 1–4 baseline. See [docs/curriculum-engine-mvp.md](docs/curriculum-engine-mvp.md) and [docs/publication.md](docs/publication.md).

## Local development

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

Vite emits a static `dist/` for GitHub Pages:

```bash
npm run build
```

Nested routes remain real directories. GitHub Actions runs `npm ci`, tests, `vite build`, then publishes `dist/`.

This foundation does not authorise a production Pages deployment.

## Curriculum ownership

The hub owns the Unit 14 Scheme of Learning sequence, assignment phases and learner-facing guidance as canonical JSON (`content/unit-14/`). Authoritative OCR documents remain outside the repository. Calendar dates are stored as metadata and are `null` until taken from the curriculum planner. See [docs/curriculum-engine.md](docs/curriculum-engine.md) and [docs/week-1-activities.md](docs/week-1-activities.md).

The shared backend is the official publication authority. This static hub
compares its local curriculum package version with
`api.published_curriculum()` and only treats signed-in submissions as
authoritative when the versions match. See
[docs/publication-consumption.md](docs/publication-consumption.md).

## Backend trust boundary

- Only the public Supabase URL and publishable key are browser configuration.
- Core queries the `api` schema only.
- The browser never sends learner, enrolment or assignment IDs as authority.
- GitHub is the authentic development environment, not a runtime backend.
