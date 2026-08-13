# Learner consumption of published curriculum

The backend is the authoritative publication catalogue. This hub remains a
static GitHub Pages application. It renders the vendored Unit 14 curriculum
package and compares that local package version with
`api.published_curriculum()`.

It does not fetch or render a replacement package body from the backend.

```text
Unit 14 static curriculum package
        │
        ├── local content version
        │
        ▼
api.published_curriculum()
        │
        ▼
publication metadata
        │
        ▼
compatibility / delivery decision
        │
        ▼
render existing static package
```

## Responsibilities

| Owner | Responsibility |
| --- | --- |
| Backend | Which curriculum version is officially published |
| Static hub package | Learner rendering source |
| Hub adapter | Lookup, version-state, submission gate, learner-facing status |

There is one publication authority. Matching versions means the teaching copy
is the official published curriculum. Any other state is explicit.

## Lookup

`content/engine/publication.js` posts to the approved learner-safe RPC:

`POST {projectUrl}/rest/v1/rpc/published_curriculum`

with `Content-Profile: api`, `Accept-Profile: api`, the existing publishable
key, and the current access token when signed in. Guests use the publishable
key. The hub does not create a second Supabase client.

This adapter stays in the hub because Core 0.1.0 does not expose a generic
learner-safe RPC helper. `publication.js` starts the lookup itself so it does
not depend on `shell.js` script order. A later Core extraction can own
`fetchPublishedCurriculum` / `lookupPublicationState` once `createPlatform`
has a generic `api` schema read.

## Metadata consumed

| Field | Use |
| --- | --- |
| `hub_code` | Match this hub |
| `course_key` | Match OCR Level 3 IT |
| `package_version` | Compare with local curriculum package version |
| `schema_version` | Compatibility (`0.1.0` only) |
| `source_package_version` | `@learning-platform/content` compatibility (`0.1.0` only) |
| `published_at` | Diagnostics; not shown to learners |

Not consumed: package body, author, reviewer, notes, audit data, content hash,
staff identities.

The RPC already returns only current `published` rows. Superseded versions are
not current.

## Version concepts

These are separate values. Do not treat them as one number.

| Concept | Unit 14 value | Compared with |
| --- | --- | --- |
| Curriculum package version | `content/unit-14/index.json` `0.1.0` (`APP_CONFIG.curriculumVersion`) | backend `package_version` |
| Schema version | `lp.content.*` `0.1.0` | backend `schema_version` |
| `@learning-platform/content` package | vendored `0.1.0` (`APP_CONFIG.contentPackageVersion`) | backend `source_package_version` |
| Activity version | each Week 1 activity `0.1.0` | `learning.activity_versions.version` |
| Hub / manifest version | `0.1.0` | hub registration, not publication match |

Activity ids remain `stable_key` values (`week-1-baseline-diagnostic`, and so
on). This phase does not remap them.

Week 1 activities already exist in the backend catalogue at activity version
`0.1.0`, inside curriculum package `0.1.0`. A later curriculum package can
publish new activity versions without changing this mapping rule.

## Version states

| State | Meaning | Render static package | Authoritative submit |
| --- | --- | --- | --- |
| `MATCHED` | Local package == published backend version | Yes | Yes, when signed in |
| `LOCAL_BEHIND` | Backend published a newer package | Yes (known-safe copy) | No |
| `LOCAL_AHEAD` | Hub package is newer than publication | Yes, as preview | No |
| `NO_PUBLICATION` | No current backend publication for this hub/course | Yes, as preview | No |
| `INCOMPATIBLE` | Unsupported schema or content-package contract | Yes, without interpreting an unknown backend package | No |
| `ERROR` | Lookup failed (network, missing RPC, bad config) | Yes | No |

`INCOMPATIBLE` does not attempt partial rendering from an unknown contract.
The hub never receives a package body, so it continues to show the known-safe
static copy and blocks authoritative submission.

`body[data-publication-state]` records the state for operational diagnostics.

## Submission gate

Before `platform.submission.submit` / `api.submit_attempt`:

1. The learner must be signed in.
2. Publication state must be `MATCHED`.
3. Core still owns assignment/delivery identity. The hub never sends learner,
   enrolment or assignment ids.

If the local package is not the current published version, submission stays
`status: "local"`. Drafts remain in `localStorage`. The hub does not call
`submit_attempt`.

Guests can read and practise. Their drafts stay on the device.

## Historical progress

Existing attempts stay readable. A newer published curriculum version does not
invalidate earlier attempts. Attempts remain tied to the activity version
originally completed.

This hub does not delete or rewrite `my_attempts` when publication state
changes.

## Learner-facing copy

| State | Label | Visibility |
| --- | --- | --- |
| `MATCHED` | Current | Visually hidden `role="status"` |
| `LOCAL_BEHIND` | Update pending | Banner |
| `LOCAL_AHEAD` | Preview | Banner |
| `NO_PUBLICATION` | Preview | Banner |
| `INCOMPATIBLE` | Unavailable to save | Banner |
| `ERROR` | Temporarily unable to save progress | Banner |

Copy does not mention content hash, RLS, RPC or schema validation.

## Public and signed-in behaviour

Unauthenticated learners may view public curriculum as before. Publication
metadata resolution is public (`anon` may execute the RPC). Authoritative
progress and submissions still require a signed-in learner.

A temporary lookup failure must not hide teaching pages. It only withholds
authoritative save.

## Chosen mismatch policy

When the backend is ahead of this static hub (`LOCAL_BEHIND`), keep rendering
the current known-safe package. Do not fetch a replacement from the catalogue.
Learners see “Update pending” and cannot save to the learning record until this
hub is deployed with the matching package.

When this hub is ahead (`LOCAL_AHEAD`) or there is no publication
(`NO_PUBLICATION`), teaching material stays readable as preview. Authenticated
submission is disabled so unpublished material is not recorded as official
evidence.

## Offline / error behaviour

If hosted Supabase does not yet expose `published_curriculum`, lookup returns
`ERROR`. Public pages remain usable. Saving progress is temporarily
unavailable. Pointing the hub at local Supabase after `db reset` without an
Admin “Publish to Platform” row is `NO_PUBLICATION`, which is correct.

## Future GitHub deployment

GitHub Pages remains the static delivery channel. A later phase may automate
deploying a published package into this repository. This phase does not write
learner repositories from Admin and does not add GitHub Actions for curriculum
publication.
