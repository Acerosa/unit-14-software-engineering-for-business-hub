# Curriculum Engine MVP baseline

Git tag `curriculum-engine-mvp` marks the verified Parts 1–4 baseline. Later
Week 2–19 work starts from `main` at this tag.

## In this baseline

- Canonical curriculum JSON under `content/unit-14/`
- Schemas, validator, loader and week renderer
- Week 1 interactive activities and Assignment 1 progress (not P1 awarded)
- Core evidence-only submission (`submission.submit` → `api.submit_attempt`)
- Hub Manifest 1.0.0 registration metadata (no curriculum pointer)
- Local backend catalogue for hub, 19 week metadata rows, LO topics and Week 1
  activity versions `0.1.0`

## Out of this baseline

- Weeks 2–19 session and activity authoring
- Hosted Supabase deployment
- Admin authoring or mutation RPCs
- OCR assignment catalogue tables in the backend
- Closing the legacy client-marked `submit_attempt` path

See [publication.md](publication.md) and [curriculum-engine.md](curriculum-engine.md).
