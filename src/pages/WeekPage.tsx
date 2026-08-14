import { LoadingState, StatusBadge, WeekView } from "@learning-platform/ui";
import { useEffect, useMemo, useRef } from "react";
import { APP_CONFIG } from "../config";
import { getContentEngine } from "../content/engine";
import { fromResolvedWeek } from "../content/week-presentation";
import { createSitePath } from "../paths";
import type { CurriculumAdapter } from "../content/engine";

function stageStatus(stage: { week: number; title: string }, pkg: unknown): string {
  const engine = getContentEngine();
  const week = engine.resolveWeek(pkg, `week-${Number(stage.week)}`);
  if (!week || !(week.sessions || []).length) return "Upcoming";
  let practised = false;
  (week.sessions || []).forEach((session) => {
    (session.activities || []).forEach((resolved) => {
      const summary = engine.summariseDraft(resolved.document);
      if (summary.status === "practised" || summary.status === "started") practised = true;
    });
  });
  return practised ? "Started / practised" : "Not started";
}

export function WeekPage({
  root,
  weekId,
  pkg,
  weeks
}: {
  root: string;
  weekId: string;
  pkg: unknown;
  weeks?: CurriculumAdapter["weeks"];
}) {
  const engine = getContentEngine();
  const mountRef = useRef<HTMLDivElement>(null);
  const resolved = pkg ? engine.resolveWeek(pkg, weekId) : null;
  const presentation = useMemo(() => {
    if (!resolved) return null;
    return fromResolvedWeek(resolved, {
      engine,
      root,
      weeks: weeks || [],
      features: APP_CONFIG.ui
    });
  }, [engine, resolved, root, weeks]);

  useEffect(() => {
    if (!pkg || !mountRef.current) return;
    engine.bindInteractive(mountRef.current, pkg, {
      sourcePage: window.location.pathname
    });
  }, [engine, pkg, presentation]);

  if (!pkg) return <LoadingState message="Loading this week's sessions" />;
  if (!resolved || !presentation) {
    return <p>This week is not in the curriculum package.</p>;
  }

  const showAssignmentProgress = Boolean(resolved.assignment && (resolved.sessions || []).length);

  return (
    <div data-lp-mount="" ref={mountRef}>
      <WeekView {...presentation} />
      {showAssignmentProgress ? (
        <section className="panel" aria-labelledby="a1-progress-heading">
          <h2 id="a1-progress-heading">{resolved.assignment!.id} learning progress</h2>
          <p>This tracks preparation for the technical guide. Completing a hub activity is not P1 achieved. The hub does not award Pass, Merit or Distinction.</p>
          <ol className="journey-list">
            {(resolved.assignment!.metadata.stages || []).map((stage) => {
              const label = stageStatus(stage, pkg);
              const tone = label.includes("practised") || label.includes("Started") ? "in-progress" : "planned";
              return (
                <li key={stage.title}>
                  <span>{stage.title}</span>
                  <StatusBadge status={tone} label={label} />
                </li>
              );
            })}
          </ol>
          {resolved.assignment!.metadata.route ? (
            <p>
              <a className="text-link" href={createSitePath(root, resolved.assignment!.metadata.route)}>
                Open the Assignment 1 workspace
              </a>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
