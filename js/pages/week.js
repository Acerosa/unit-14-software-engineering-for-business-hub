(function () {
  "use strict";

  var utils = window.AppUtils;
  var curriculum = window.Unit14Curriculum;
  var assignments = window.Unit14Assignments;

  function renderPlannedWeek(week, root) {
    var assignment = assignments.getAssignment(week.assignment);
    var lo = week.learningOutcomes.join(", ");
    var main = document.getElementById("main-content");
    if (!main) return;

    var weekLinks = '<p><a class="text-link" href="' + utils.createSitePath(root, "weeks/") + '">Back to all weeks</a>';
    if (assignment) {
      weekLinks += ' · <a class="text-link" href="' + utils.createSitePath(root, assignment.route) + '">Open ' +
        utils.escapeHtml(assignment.id) + "</a>";
    }
    weekLinks += "</p>";

    main.insertAdjacentHTML("beforeend",
      '<section class="panel" aria-labelledby="planned-heading">' +
      '<h2 id="planned-heading">Planned teaching week</h2>' +
      "<p>Detailed Session 1 and Session 2 activities for this week have not been added yet. The outline below is taken from the Unit 14 Scheme of Learning and must not be treated as finished teaching content.</p>" +
      '<dl class="meta-list">' +
      "<div><dt>Learning outcome</dt><dd>" + utils.escapeHtml(lo) + "</dd></div>" +
      "<div><dt>Assignment</dt><dd>" + utils.escapeHtml(week.assignment) + "</dd></div>" +
      "<div><dt>Phase</dt><dd>" + utils.escapeHtml(week.phase) + "</dd></div>" +
      "<div><dt>Teaching week commencing</dt><dd>Not yet populated from the curriculum planner</dd></div>" +
      "</dl>" +
      "<p><strong>Professional practice this week:</strong> " + utils.escapeHtml(week.professionalPractice || "") + "</p>" +
      weekLinks +
      "</section>"
    );
  }

  utils.onReady(function () {
    var weekNumber = Number(document.body.dataset.week || "");
    var week = curriculum.getWeek(weekNumber);
    if (!week || week.teachingWeek === 1) return;
    renderPlannedWeek(week, document.body.dataset.root || ".");
  });
})();
