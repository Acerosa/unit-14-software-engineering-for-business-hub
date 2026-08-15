# Unit 14 publication

Canonical curriculum content lives in this hub. The shared backend stores
delivery, submission, progress and identity relationships. It does not become a
second authoring copy of the teaching materials.

## Canonical source

```text
content/unit-14/
  index.json
  hub.json
  curriculum.json
  learning-outcomes.json
  assignments.json
  weeks.json
  sessions.json
  activities.json
```

GitHub is an onboarding and source artefact. The learner runtime never fetches
GitHub. Week HTML is a thin mount over this package.

## Publication pipeline

```text
Canonical curriculum JSON
  → hub engine validation
  → backend generate-content-package-migration.py
  → supabase/data/generated/ review area
  → reviewed timestamped migration
  → local backend catalogue
```

The generator lives in `learning-platform-backend`. It validates before writing
SQL. The same package always produces the same registration artefact and SQL.

Reviewed copies in the backend:

- `supabase/data/manifests/hubs/unit-14-software-engineering-for-business/learning-platform-hub.json`
- `supabase/data/manifests/hubs/unit-14-software-engineering-for-business/content-registration.json`

The Hub Manifest remains LHDS 1.0.0 registration metadata. It still cannot hold
a curriculum pointer (`additionalProperties: false`). A future manifest version
could add that field; 1.0.0 must not be broken to do it.

## Identifier mapping

Activity ids are used unchanged as `learning.activities.stable_key`. They are
globally unique in the backend, so later units should keep a unit prefix rather
than invent a second mapping.

| Content | Backend |
| --- | --- |
| content hub id | `learning.modules.stable_key` |
| LO1–LO4 | `learning.topics.stable_key` `lo1`–`lo4` |
| week-1 … week-19 | `learning.curriculum_weeks.stable_key` |
| activity id | `learning.activities.stable_key` |
| activity version | `learning.activity_versions.version` |
| single-choice / written / reflection `questionId` | `learning.questions.stable_key` |
| classification item | `questionId:itemId` |
| python / code-editor | `question_type = code-editor` plus `activity_version_languages.python` when needed |

OCR Assignments 1–4 remain hub-owned. `learning.activity_assignments` is group
delivery of activity versions, not Programming Constructs Technical Guide or
the other OCR briefs. Criteria are not awarded by publication.

Planner dates stay null. Weeks 3–19 have week metadata only.

## Backend registration

Published for Weeks 1–2:

- hub `unit-14-software-engineering-for-business` (testing, active)
- course `ocr-level-3-it`
- module, four LO topics, 19 weeks
- 11 Week 1 activities at version `0.1.0`
- 13 Week 2 activities at version `0.1.0`
- curriculum package version `0.2.0`
- questions, protected `learning.question_marking` specs, delivery and the
  closed synthetic group `UNIT14-TEST-A`

Provenance stored with the migration: hub id, content id, content version,
source schema version, generated registration version. No local filesystem
paths.

## Learner submission

```text
sign in
  → learner context
  → open Unit 14 Week 1
  → complete every interactive block
  → Core submission.submit (evidence only)
  → api.submit_attempt
  → server marking or completion
  → attempt / responses / progress
```

The hub never sends learner, enrolment or assignment ids, and it never sends
`awarded_score` or `is_correct`. `programmingLanguage` is sent only for
code-editor / python-exercise activities.

Deterministic formative items (single-choice, classification, python patterns)
are marked on the server. Reflection and short-response items are completion
evidence: `is_correct` stays null and they are not pretended to be grades.

## Versioning and rollback

Published `activity_versions`, questions and marking specs are immutable.
Editing a draft in the hub does not change stored attempts.

A compatible content correction publishes a new semantic version. Historical
attempts keep the version that was completed. Re-running the generator does not
overwrite a published version; it skips question inserts where
`published_at` is already set.

To roll back delivery, retire or unassign a version. Do not mutate the row a
learner already completed.

## Future Admin authoring

Admin should edit the same `lp.content.*` objects:

```text
Admin draft
  → canonical content object
  → schema validation
  → preview in the hub renderer
  → reviewed publication
  → backend catalogue registration
  → static hub deployment
```

It must not create a proprietary curriculum model. This phase does not add
Admin mutation RPCs. Existing `admin_api` reads already show the hub, course
link, group activity assignments, attempts and activity performance. They do
not yet expose curriculum weeks, OCR assignment briefs or learning-outcome
authoring. Those are the smallest later read additions if the portal needs
them before authoring.

Learner hubs consume the **published package body** from
`api.published_curriculum_package(hub, course)`. The bundled hub package is
fallback only. See [Publication consumption](publication-consumption.md).

## MVP baseline

Git tag `curriculum-engine-mvp` is the verified Curriculum Engine MVP. It includes
canonical JSON, Week 1 rendering, evidence-only submission and local backend
registration. It does not include Weeks 2–19 activities or hosted deployment.
See [curriculum-engine-mvp.md](curriculum-engine-mvp.md).

## Hub-only content

- OCR A1–A4 criteria and Pass/Merit/Distinction judgement
- session teaching copy and block prose
- planner dates
- Weeks 3–19 activities and sessions
