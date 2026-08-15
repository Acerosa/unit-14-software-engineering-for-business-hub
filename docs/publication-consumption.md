# Learner consumption of published curriculum

Supabase is the authoritative source for published Unit 14 curriculum. The
static GitHub Pages app is the shell. It fetches the current published
canonical package, validates it with `@learning-platform/content`, and renders
it. The bundled `content/unit-14/` package is fallback and provenance only.

```text
Hub starts
  → hub/course identity
  → api.published_curriculum_package(hub, course)
  → validate with @learning-platform/content
  → render the published package

If the live package is unavailable or invalid:
  → namespaced cache, then bundled snapshot
  → non-blocking fallback banner
  → no mixing of package versions
```

## Responsibilities

| Owner | Responsibility |
| --- | --- |
| Admin | Author, review, approve, publish |
| Backend | Immutable published package, learner-safe read API, catalogue projection |
| Static hub shell | Fetch, validate, render, fallback banner, drafts |
| Bundled package | Offline/invalid fallback and reviewed provenance |

A GitHub Pages redeploy is not required for normal curriculum publication.

## Lookup

`content/engine/publication.js` posts to:

`POST {projectUrl}/rest/v1/rpc/published_curriculum_package`

with `Content-Profile: api`, `Accept-Profile: api`, the publishable key, and
`p_hub_code` / `p_course_key`. Guests use the publishable key. Signed-in
learners may send their access token. The hub never uses a service-role key
and never queries `learning` or `platform` schemas.

## Package consumed

| Field | Use |
| --- | --- |
| `hub_code` / `course_key` | Confirm this hub |
| `package_version` | Curriculum package version |
| `schema_version` | Compatibility (`0.1.0` only) |
| `source_package_version` | `@learning-platform/content` compatibility (`0.1.0` only) |
| `content_hash` | Cache integrity |
| `published_at` | Diagnostics |
| `package` | Canonical teaching package for render |

Not consumed: author, reviewer, notes, audit data, staff identities,
`learning.question_marking`.

The RPC returns only the current `published` row. Drafts, in-review snapshots
and superseded versions are not returned.

## Version concepts

These are separate values.

| Concept | Unit 14 value |
| --- | --- |
| Curriculum package version | published `package_version`, currently `0.2.0` |
| Activity version | each activity document, currently `0.1.0` |
| Schema version | `lp.content.*` `0.1.0` |
| `@learning-platform/content` | `0.1.0` |

Do not rewrite historical activity versions or attempts when the curriculum
package advances.

## Runtime states

| State | Meaning | Render | Authoritative submit |
| --- | --- | --- | --- |
| `PUBLISHED` | Live DB package validated | Published package | Yes, when signed in |
| `FALLBACK` | Network/API/validation failure | Bundled or namespaced cache | No |
| `NO_PUBLICATION` | No current published row | Bundled fallback | No |
| `INCOMPATIBLE` | Unsupported schema/package | Bundled fallback | No |
| `ERROR` | Lookup failed before fallback | Bundled fallback | No |

`MATCHED` / `LOCAL_BEHIND` / `LOCAL_AHEAD` are retired. The published database
package is authoritative. A bundled copy that is behind does not block
rendering.

## Fallback and cache

Fallback conditions: network unavailable, API unavailable, incompatible
backend response, or validation failure.

Cache key: `lp.curriculum.cache.v1:{hubId}:{courseKey}`.

Do not use generic keys that collide with other hubs under
`acerosa.github.io`. Draft keys remain
`learning-platform.content.draft.v1:{learnerKey}:{activityId}`.

Cached packages are validated before use. Learner drafts are never stored in
the curriculum cache.

## Submission

Authoritative submission requires:

1. The learner is signed in.
2. Publication state is `PUBLISHED`.
3. The activity/version comes from the DB-loaded package.

Fallback rendering still allows local practise. Drafts are unchanged.
Historical attempts are never rewritten by publication state.

## Security

- Publishable key only in the browser
- Published teaching package only
- No drafts, no review content, no marking specs
- Progress/attempts remain RLS-protected and authenticated
