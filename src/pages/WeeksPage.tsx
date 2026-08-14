import { ActivityCard, LoadingState } from "@learning-platform/ui";
import { createSitePath } from "../paths";
import type { CurriculumAdapter } from "../content/engine";

export function WeeksPage({
  root,
  weeks
}: {
  root: string;
  weeks?: CurriculumAdapter["weeks"];
}) {
  return (
    <>
      <section className="panel">
        <p>The 19 teaching weeks follow the Unit 14 Scheme of Learning. Calendar dates are left empty until they are taken from the curriculum planner. Teaching breaks are expected; week numbers are not consecutive calendar weeks.</p>
      </section>
      <div className="card-grid lp-card-grid" data-week-grid="">
        {!weeks ? <LoadingState message="Loading weeks" /> : weeks.map((week) => {
          const available = week.status === "available";
          return (
            <ActivityCard
              key={week.route}
              title={`Week ${week.teachingWeek}`}
              description={`${week.title} · ${week.learningOutcomes.join(", ")} · ${week.assignment}`}
              activityType={available ? "Teaching week" : "Planned week"}
              status={available ? "Available" : "Planned"}
              badge
              badgeStatus={week.status}
              href={createSitePath(root, week.route)}
              actionLabel={available
                ? `Open Week ${week.teachingWeek}: ${week.title}`
                : `Open Week ${week.teachingWeek} outline`}
              headingLevel={2}
              muted={!available}
            />
          );
        })}
      </div>
    </>
  );
}
