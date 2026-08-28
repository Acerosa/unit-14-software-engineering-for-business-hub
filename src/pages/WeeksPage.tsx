import { ActivityCard, LoadingState, WeekAccessLink } from "@learning-platform/ui";
import type { ContentPackage } from "../curriculum/from-package";
import { unit14RuntimeWeeks } from "../curriculum/runtime-weeks";
import { createSitePath } from "../paths";
import type { CurriculumAdapter } from "../content/engine";

export function WeeksPage({
  root,
  weeks,
  livePackage
}: {
  root: string;
  weeks?: CurriculumAdapter["weeks"];
  livePackage?: ContentPackage | null;
}) {
  const runtimeWeeks = unit14RuntimeWeeks(livePackage);
  const curriculumByWeek = new Map((weeks || []).map((week) => [week.teachingWeek, week]));

  return (
    <>
      <section className="panel">
        <p>The 19 teaching weeks follow the Unit 14 Scheme of Learning. Calendar dates are left empty until they are taken from the curriculum planner. Teaching breaks are expected; week numbers are not consecutive calendar weeks.</p>
      </section>
      <div className="card-grid lp-card-grid" data-week-grid="">
        {!runtimeWeeks.length ? <LoadingState message="Loading weeks" /> : runtimeWeeks.map((runtimeWeek) => {
          const week = curriculumByWeek.get(runtimeWeek.teachingWeek);
          const href = createSitePath(root, `weeks/${runtimeWeek.id}/`);
          return (
            <div key={runtimeWeek.id}>
              <ActivityCard
                title={`Week ${runtimeWeek.teachingWeek}`}
                description={week
                  ? `${week.title} · ${week.learningOutcomes.join(", ")} · ${week.assignment}`
                  : runtimeWeek.title}
                activityType={runtimeWeek.available ? "Teaching week" : "Planned week"}
                status={runtimeWeek.available ? "Available" : "Planned"}
                badge
                badgeStatus={runtimeWeek.status}
                headingLevel={2}
                muted={!runtimeWeek.available}
              />
              <div className="lp-card__actions">
                <WeekAccessLink
                  week={runtimeWeek}
                  href={href}
                  className="lp-button"
                  lockedClassName="lp-button lp-button--secondary"
                  renderLink={({ href: linkHref, children, className }) => (
                    <a className={className} href={linkHref}>{children}</a>
                  )}
                >
                  {runtimeWeek.available
                    ? `Open Week ${runtimeWeek.teachingWeek}${week ? `: ${week.title}` : ""}`
                    : `Week ${runtimeWeek.teachingWeek} not available yet`}
                </WeekAccessLink>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
