import type { WeekViewProps } from "@learning-platform/ui";
import type { ContentEngine, ResolvedWeek } from "./engine";
import { createSitePath } from "../paths";

type WeekSummary = {
  teachingWeek: number;
  title: string;
  route: string;
};

function outcomeValue(outcomes: ResolvedWeek["learningOutcomes"]): string {
  if (!outcomes?.length) return "Not set";
  return outcomes.map((item) => `${item.id} ${item.metadata?.title || ""}`.trim()).join("; ");
}

function neighbour(weeks: WeekSummary[], teachingWeek: number, offset: number): WeekSummary | null {
  const index = weeks.findIndex((week) => week.teachingWeek === teachingWeek);
  if (index < 0) return null;
  return weeks[index + offset] || null;
}

function weekLink(week: WeekSummary | null, root: string) {
  if (!week) return null;
  return {
    label: `Week ${week.teachingWeek}`,
    href: createSitePath(root, week.route)
  };
}

export function fromResolvedWeek(
  resolved: ResolvedWeek,
  options: {
    engine: ContentEngine;
    root: string;
    weeks?: WeekSummary[];
    features?: {
      showLearningOutcomes?: boolean;
      showAssignmentContext?: boolean;
      showIndependentStudy?: boolean;
    };
  }
): WeekViewProps {
  const week = resolved.document;
  const meta = week.metadata;
  const assignment = resolved.assignment;
  const outcomes = resolved.learningOutcomes || [];
  const weeks = options.weeks || [];
  const features = options.features || {};
  const context = assignment && features.showAssignmentContext !== false
    ? {
      type: "assignment" as const,
      heading: "What you are learning and why",
      items: [
        { label: "Learning outcome", value: outcomeValue(outcomes) },
        { label: "Assignment", value: `${assignment.id}: ${assignment.metadata.title}` },
        { label: "Phase", value: meta.phase || "" },
        { label: "Teaching week commencing", value: meta.weekCommencing || "Not yet populated from the curriculum planner" }
      ],
      description: meta.professionalPractice
        ? `Professional practice this week: ${meta.professionalPractice}`
        : "",
      action: assignment.metadata.route
        ? {
          label: `Open the ${assignment.id} workspace`,
          href: createSitePath(options.root, assignment.metadata.route)
        }
        : null
    }
    : null;

  return {
    week: {
      id: week.id,
      teachingWeek: meta.teachingWeek,
      title: meta.title,
      status: meta.status,
      emptyMessage: "Detailed session activities for this week have not been added yet. The outline below is taken from the curriculum registry and must not be treated as finished teaching content.",
      emptyAction: { label: "Back to all weeks", href: createSitePath(options.root, "weeks/") }
    },
    learningOutcomes: outcomes.map((item) => ({ id: item.id, title: item.metadata?.title })),
    context,
    sessions: (resolved.sessions || []).map((session) => ({
      id: session.document.id,
      title: session.document.metadata.title,
      kind: session.document.metadata.kind,
      summary: session.document.metadata.summary,
      defaultOpen: session.document.metadata.defaultOpen,
      activities: (session.activities || []).map((activity) => ({
        html: options.engine.renderActivity(activity, { root: options.root })
      }))
    })),
    previousWeek: weekLink(neighbour(weeks, meta.teachingWeek, -1), options.root),
    nextWeek: weekLink(neighbour(weeks, meta.teachingWeek, 1), options.root),
    features: {
      showTitle: false,
      showLearningOutcomes: features.showLearningOutcomes !== false,
      showAssignmentContext: features.showAssignmentContext !== false,
      showExamContext: false,
      showProjectContext: false,
      showIndependentStudy: features.showIndependentStudy !== false,
      showProgress: false
    }
  };
}
