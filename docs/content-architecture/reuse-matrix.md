# Reuse matrix

Strategy labels:

- **Keep** — do not change the current owner.
- **Consume** — Unit 14 (and later hubs) use it as-is.
- **Adapt in hub** — copy the UX/pattern, rewrite against Core tokens/APIs.
- **Genericise later** — prove in a hub, then extract to content or Core.
- **Do not reuse** — subject- or exam-specific.

| Feature | Current repository | Future owner | Reuse strategy |
| --- | --- | --- | --- |
| Auth / session / onboarding | Core | Core | Consume |
| Learner context and account dialog | Core | Core | Consume |
| Theme tokens and light/dark/system | Core | Core | Consume; hub sets `--hub-primary` / `--hub-accent` |
| Evidence builders and submission allow-list | Core | Core | Consume when activities submit |
| Activity / progress **cards** (presentation) | Core | Core | Consume for listing; not a week renderer |
| Standard 6-section navigation order | Core | Core, after a reviewed extension | Adapt in hub until Core supports supplied order |
| Hub Manifest + registration validator | Backend | Backend | Keep; content documents stay out of the hub manifest |
| `api.curriculum_weeks` | Backend | Backend | Keep; later add calendar/LO fields via migration, not hub SQL |
| Activity catalogue import | Backend scripts + hub JSON | Backend + content validators | Genericise later from one schema |
| RLS, attempts, progress | Backend | Backend | Keep |
| Staff hub/course/assignment views | Admin | Admin | Keep |
| Curriculum authoring UI | Admin placeholder | Admin | Keep portal; do not author inside hubs |
| Week-centred learning journey | Unit 3 | Content helpers + hub data | Adapt in hub (sessions, coming-soon, breadcrumbs) |
| Exam practice / command-word exam drills | Unit 3 | Unit 3 only | Do not reuse in Unit 14 |
| Apps Script Activity API / collector | Unit 3 | Unit 3 compatibility only | Do not reuse |
| Foundations activity engine | T Level | Content (generic renderer) | Genericise later; Unit 14 must not import T Level questions |
| Programming editor/checker/drafts | T Level | Content, configured per hub | Genericise later; Unit 14 Python-only |
| Requirements classification pattern | T Level | Content activity type | Genericise later with Unit 14 scenarios |
| Client-side answer keys | T Level | Undecided by contract | Do not make this the default; prefer protected marking where required |
| Submission compatibility adapter | T Level | Remove after backend+Core evidence-only contract | Keep T Level-only until that contract exists |
| 19-week SoL registry | Unit 14 `js/data/curriculum.js` | Hub data + shared schema | Keep data in Unit 14; replace hand-written week HTML with a renderer |
| Assignment workspace / evidence map | Unit 14 | Hub, later Core or content if other assignment units need it | Hub-owned for now; never auto-award P/M/D |
| Project journey | Unit 14 | Hub | Hub-owned; GitHub remains the project system |
| GitHub Classroom teaching | Unit 14 SoL | Hub copy | Hub-owned guidance, not a GitHub clone |
