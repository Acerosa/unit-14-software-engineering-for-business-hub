# Week 1 activities

Week 1 is the first learner-facing vertical slice of the curriculum engine:

Curriculum → Week → Session → Activity → Blocks → interaction → local draft → Core submission boundary.

Teaching copy comes from the Unit 14 Scheme of Learning sequence for **Programming for Business, Variables and Data Types** (LO1, Assignment 1, P1). The SoL `.docx` was not present in this environment; content follows the SoL list supplied for this hub and the existing Unit 14 week registry. It does not invent Week 2 conversion teaching.

Formative `correctOptionId` / `correctCategoryId` values are stored in activity JSON so the browser can give instant feedback. That is **low-stakes formative material**, not secure assessment evidence and not OCR marking.

## Sessions

| Session id | Title | SoL role |
| --- | --- | --- |
| `week-1-session-1` | Session 1 | Theory and demonstration |
| `week-1-session-2` | Session 2 | Practical lab and assignment work |
| `week-1-independent-study` | Directed independent study | Homework extension |

There is no third timetabled classroom session.

## Activities

| Activity id | Session | Purpose | Main blocks |
| --- | --- | --- | --- |
| `week-1-baseline-diagnostic` | 1 | Formative check of starting knowledge (software, types, input). Not a grade. | heading, paragraph, single-choice, short-response, callout |
| `week-1-business-data-explorer` | 1 | Workplace software discussion; classify name, quantity, price, delivery. | paragraph, classification, short-response, reflection, callout |
| `week-1-variables-and-data-types` | 1 | Teach variable, value, integer, floating point, string, Boolean. | paragraph, code-editor, single-choice, short-response |
| `week-1-input-and-output` | 1 | Teach `print`, `input`, storing input in variables. | paragraph, python-exercise, single-choice |
| `week-1-github-classroom-guidance` | 1 | Accept invitation, clone, inspect README/template, Python environment. Not a GitHub client. | paragraph, markdown, single-choice, reflection |
| `week-1-review` | 2 | Retrieval of Week 1 outcomes only. | single-choice, classification |
| `week-1-guided-business-data` | 2 | Guided worksheet: choose types in a small business scenario and justify. | paragraph, classification, short-response |
| `week-1-first-commits` | 2 | Meaningful commits and push; good vs `update`. | paragraph, quote, single-choice, reflection |
| `week-1-first-python-business-program` | 2 | Independent order program: input, variables, typed data, printed summary. | paragraph, python-exercise, reflection |
| `week-1-assignment-1-guide` | 2 | Start P1 notes (definition, four types, worked example, business purpose). Hub completion is not P1. | paragraph, markdown, reflection, reference, callout |
| `week-1-homework-extension` | Independent study | ≥6 business data items, all four types, commit/push, extend the guide. | paragraph, python-exercise, reflection, callout, reference |

Every Week 1 activity has `relationships.learningOutcomes: ["LO1"]`, `assignment: "A1"`, `criteria: ["P1"]`.

## SoL mapping

| SoL item | Where it appears |
| --- | --- |
| Baseline assessment | `week-1-baseline-diagnostic` |
| Software used in business / workplace data | `week-1-business-data-explorer` |
| Unit 14 introduction and Assignment 1 context | Variables activity + Assignment 1 starter |
| Integer, floating point, string, Boolean | Explorer, variables, guided practice, review |
| Selecting an appropriate type | Classification blocks and short-response justifications |
| `print` and `input` | Input/output learning + Python programs |
| Python development environment | GitHub Classroom guidance |
| GitHub Classroom, clone, README/template | `week-1-github-classroom-guidance` |
| Meaningful incremental commits and push | `week-1-first-commits` |
| Guided business-data activity | `week-1-guided-business-data` |
| Independent business-order program | `week-1-first-python-business-program` |
| Assignment 1 glossary / technical-guide start | `week-1-assignment-1-guide` |
| Progress checks | Session 2 retrieval + Check actions on formative blocks |
| Homework extension (six data items, four types, commit/push, extend guide) | `week-1-homework-extension` |

`int()` appears only as a quantity scaffold so a whole number can be stored. It is not a Week 2 conversion lesson.

## Assignment 1 relationship

Week 1 prepares **Assignment 1 – Programming Constructs Technical Guide** for P1.

The Week 1 page and Assignment 1 workspace show learning progress:

- Variables and data types — Started / practised or Not started
- Data conversion, selection, iteration, encapsulation, GUI objects — Upcoming

This is preparation progress. Completing a hub activity is **not** P1 achieved. The hub does not award Pass, Merit or Distinction. Final evidence is submitted through the approved assignment process.

## State and feedback

- Draft key: `learning-platform.content.draft.v1:{learnerKey}:{activityId}`
- Responses restore after reload
- Reset activity clears that activity only
- Reset code restores the starter in that editor only
- Formative single-choice and classification can show “Matched.” / “Review.” plus text feedback
- Short-response and reflection save text and may show model guidance; they never keyword-grade
- Python checks are regex presence/absence only

## Submission

On Check, the hub tries Core `platform.submission.submit` with evidence objects
when every interactive block is complete. Guests and incomplete attempts stay
on the local draft. The hub does not send learner, enrolment or assignment
identifiers, scores or `is_correct`.

Published Week 1 activity keys are registered in the shared backend. See
[Publication](publication.md).

## Known limitations

- Weeks 3–19 still have no authored session activities
- No in-browser Python execution
- No GitHub API / Classroom client
- No Admin authoring UI
- No automatic P1 grading
- Short-response / reflection use UI catalogue minChars defaults (200 / 500); no per-block overrides in this package
- Formative answers are visible in JSON
- OCR Assignments 1–4 remain hub-owned; the backend has no OCR assignment catalogue
