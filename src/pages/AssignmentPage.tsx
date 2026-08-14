import { LoadingState, StatusBadge } from "@learning-platform/ui";
import { getContentEngine } from "../content/engine";
import { createSitePath } from "../paths";
import type { AssignmentsAdapter, CurriculumAdapter } from "../content/engine";

function week1Label(pkg: unknown): string {
  const engine = getContentEngine();
  const week = engine.resolveWeek(pkg, "week-1");
  let practised = false;
  (week?.sessions || []).forEach((session) => {
    (session.activities || []).forEach((resolved) => {
      const summary = engine.summariseDraft(resolved.document);
      if (summary.status === "practised" || summary.status === "started") practised = true;
    });
  });
  return practised ? "Started / practised" : "Not started";
}

export function AssignmentPage({
  root,
  assignmentId,
  assignments,
  curriculum,
  pkg
}: {
  root: string;
  assignmentId: string;
  assignments: AssignmentsAdapter | null;
  curriculum: CurriculumAdapter | null;
  pkg: unknown;
}) {
  if (!assignments || !curriculum || !pkg) {
    return <LoadingState message="Loading assignment workspace" />;
  }
  const assignment = assignments.getAssignment(assignmentId);
  if (!assignment) return <p>Assignment not found.</p>;
  const weeks = curriculum.weeks.filter((week) => week.assignment === assignment.id);

  return (
    <div data-assignment-workspace="">
      <section className="panel" aria-labelledby="criteria-heading">
        <h2 id="criteria-heading">Assessment criteria</h2>
        <p>This workspace helps you organise work. Completing hub practice is not P1 achieved. The hub does not award Pass, Merit or Distinction.</p>
        <ul>
          {assignment.criteria.map((item) => (
            <li key={item.id}>
              <strong>{item.id}</strong> — {item.title}
              <br />{item.summary}
            </li>
          ))}
        </ul>
        <p>{assignment.evidenceNote}</p>
      </section>
      <section className="panel" aria-labelledby="journey-heading">
        <h2 id="journey-heading">Learning journey</h2>
        <ol className="journey-list">
          {assignment.stages.map((stage) => {
            const label = Number(stage.week) === 1 ? week1Label(pkg) : "Upcoming";
            const tone = label === "Upcoming" || label === "Not started" ? "planned" : "in-progress";
            return (
              <li key={stage.title}>
                <span>{stage.title} (Week {stage.week})</span>
                <StatusBadge status={tone} label={label} />
              </li>
            );
          })}
        </ol>
      </section>
      <section className="panel" aria-labelledby="weeks-heading">
        <h2 id="weeks-heading">Teaching weeks</h2>
        <ul>
          {weeks.map((week) => (
            <li key={week.route}>
              <a href={createSitePath(root, week.route)}>
                Week {week.teachingWeek}: {week.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
