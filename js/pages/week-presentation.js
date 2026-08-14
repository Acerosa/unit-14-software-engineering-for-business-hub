(function () {
  "use strict";

  function nodeFromHtml(html) {
    var template = document.createElement("template");
    template.innerHTML = String(html || "").trim();
    return template.content.firstElementChild;
  }

  function outcomeValue(outcomes) {
    if (!outcomes || !outcomes.length) return "Not set";
    return outcomes.map(function (item) {
      return item.id + " " + ((item.metadata && item.metadata.title) || "");
    }).join("; ");
  }

  function neighbour(weeks, teachingWeek, offset) {
    var index = -1;
    (weeks || []).forEach(function (week, position) {
      if (week.teachingWeek === teachingWeek) index = position;
    });
    if (index < 0) return null;
    return weeks[index + offset] || null;
  }

  function weekLink(week, root, utils) {
    if (!week) return null;
    return {
      label: "Week " + week.teachingWeek,
      href: utils.createSitePath(root, week.route)
    };
  }

  window.Unit14WeekPresentation = Object.freeze({
    fromResolvedWeek: function (resolved, options) {
      var engine = options.engine;
      var utils = options.utils;
      var root = options.root || ".";
      var features = options.features || {};
      var week = resolved.document;
      var meta = week.metadata || {};
      var assignment = resolved.assignment;
      var outcomes = resolved.learningOutcomes || [];
      var weeks = options.weeks || [];
      var previous = neighbour(weeks, meta.teachingWeek, -1);
      var next = neighbour(weeks, meta.teachingWeek, 1);
      var context = null;
      if (assignment && features.showAssignmentContext !== false) {
        context = {
          type: "assignment",
          heading: "What you are learning and why",
          items: [
            { label: "Learning outcome", value: outcomeValue(outcomes) },
            { label: "Assignment", value: assignment.id + ": " + assignment.metadata.title },
            { label: "Phase", value: meta.phase || "" },
            { label: "Teaching week commencing", value: meta.weekCommencing || "Not yet populated from the curriculum planner" }
          ],
          description: meta.professionalPractice
            ? "Professional practice this week: " + meta.professionalPractice
            : "",
          action: assignment.metadata.route
            ? {
              label: "Open the " + assignment.id + " workspace",
              href: utils.createSitePath(root, assignment.metadata.route)
            }
            : null
        };
      }
      return {
        week: {
          id: week.id,
          teachingWeek: meta.teachingWeek,
          title: meta.title,
          status: meta.status,
          emptyMessage: "Detailed session activities for this week have not been added yet. The outline below is taken from the curriculum registry and must not be treated as finished teaching content.",
          emptyAction: { label: "Back to all weeks", href: utils.createSitePath(root, "weeks/") }
        },
        learningOutcomes: outcomes.map(function (item) {
          return { id: item.id, title: item.metadata && item.metadata.title };
        }),
        context: context,
        sessions: (resolved.sessions || []).map(function (session) {
          var document = session.document;
          return {
            id: document.id,
            title: document.metadata.title,
            kind: document.metadata.kind,
            summary: document.metadata.summary,
            defaultOpen: document.metadata.defaultOpen,
            activities: (session.activities || []).map(function (activity) {
              return { element: nodeFromHtml(engine.renderActivity(activity, { root: root })) };
            })
          };
        }),
        previousWeek: weekLink(previous, root, utils),
        nextWeek: weekLink(next, root, utils),
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
  });
})();
