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

- Vendored `@learning-platform/core` **0.1.0** from commit `f484b2d` under `vendor/learning-platform-core/0.1.0/`
- Supabase JS **2.112.3** loaded at the reviewed browser version
- Learner API / submission contracts **0.1.0** through Core
- Hub course key in the manifest: `ocr-level-3-it` (the currently registered OCR Level 3 IT course)

The hub is registered in the local shared backend as testing/active, with Week 1 catalogue publication for delivery, submission and progress. Hosted Supabase deployment is not authorised by this foundation. See [docs/publication.md](docs/publication.md).

## Local development

No install or build is required.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Teaching routes work without hosted credentials or sign-in.

## Testing

```bash
node --test
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

The site is static and GitHub Pages compatible. Publish from the repository root with `.nojekyll` present. Nested routes use repository-relative paths and can be refreshed directly.

This foundation does not authorise a production Pages deployment.

## Curriculum ownership

The hub owns the Unit 14 Scheme of Learning sequence, assignment phases and learner-facing guidance as canonical JSON (`content/unit-14/`). Authoritative OCR documents remain outside the repository. Calendar dates are stored as metadata and are `null` until taken from the curriculum planner. See [docs/curriculum-engine.md](docs/curriculum-engine.md) and [docs/week-1-activities.md](docs/week-1-activities.md).

## Backend trust boundary

- Only the public Supabase URL and publishable key are browser configuration.
- Core queries the `api` schema only.
- The browser never sends learner, enrolment or assignment IDs as authority.
- GitHub is the authentic development environment, not a runtime backend.
