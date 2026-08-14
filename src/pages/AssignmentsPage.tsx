import { ActivityCard, LoadingState } from "@learning-platform/ui";
import { createSitePath } from "../paths";
import type { AssignmentsAdapter } from "../content/engine";

export function AssignmentsPage({
  root,
  assignments
}: {
  root: string;
  assignments?: AssignmentsAdapter["assignments"];
}) {
  return (
    <>
      <section className="panel">
        <p>Release and hand-in dates are shown only when they exist in the curriculum planner or approved assignment data. They are currently unset.</p>
      </section>
      <div className="card-grid lp-card-grid" data-assignment-grid="">
        {!assignments ? <LoadingState message="Loading assignments" /> : assignments.map((item) => (
          <ActivityCard
            key={item.id}
            title={`${item.id}: ${item.title}`}
            description={`${item.learningOutcomes.join(", ")} · criteria ${item.criteria.map((criterion) => criterion.id).join(", ")}`}
            activityType="Assignment"
            status={item.status === "available" ? "Available" : "Planned"}
            badge
            badgeStatus={item.status}
            href={createSitePath(root, item.route)}
            actionLabel={`Open ${item.id}`}
            headingLevel={2}
            muted={item.status !== "available"}
          />
        ))}
      </div>
    </>
  );
}
