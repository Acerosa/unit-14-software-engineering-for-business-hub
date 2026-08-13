# Content architecture review

Part 1 of the Learning Platform content-architecture work.

This folder records investigation only. It does not implement a shared content system, create `learning-platform-content`, or change sibling repositories.

| Document | Contents |
| --- | --- |
| [platform-summary.md](platform-summary.md) | Current platform shape, what to keep, conflicts and recommendation on a content repository |
| [architecture-review.md](architecture-review.md) | Seven investigation findings: keep, reuse, genericise, unit-specific, debt, conflicts, improvements |
| [responsibilities.md](responsibilities.md) | Backend, Core, Admin, hub and future content-layer ownership |
| [reuse-matrix.md](reuse-matrix.md) | Feature-by-feature current owner, future owner and reuse strategy |
| [migration-strategy.md](migration-strategy.md) | How Unit 3, T Level and Unit 14 would consume one content architecture |
| [implementation-plan.md](implementation-plan.md) | Phased plan. Implementation waits for the next specification |

**Decision in this review:** a shared content layer should exist, but not yet as a new repository. Unit 14 should prove the schema and week renderer first. Extract `learning-platform-content` only after a second hub can consume the same contract.
