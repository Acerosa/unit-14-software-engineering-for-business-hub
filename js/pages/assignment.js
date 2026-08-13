(function () {
  "use strict";

  var utils = window.AppUtils;
  var assignments = window.Unit14Assignments;
  var curriculum = window.Unit14Curriculum;
  var render = window.Unit14Render;

  function stageLabel(status) {
    if (status === "in-progress") return "In progress";
    if (status === "complete") return "Complete";
    return "Not started";
  }

  utils.onContentReady(function () {
    var assignmentId = document.body.dataset.assignment;
    var assignment = assignments.getAssignment(assignmentId);
    var mount = document.querySelector("[data-assignment-workspace]");
    if (!assignment || !mount) return;

    var root = document.body.dataset.root || ".";
    var weeks = curriculum.getWeeksByAssignment(assignment.id);
    var criteria = assignment.criteria.map(function (item) {
      return "<li><strong>" + utils.escapeHtml(item.id) + "</strong> — " + utils.escapeHtml(item.title) +
        "<br>" + utils.escapeHtml(item.summary) + "</li>";
    }).join("");
    var stages = assignment.stages.map(function (stage) {
      return "<li><span>" + utils.escapeHtml(stage.title) + " (Week " + stage.week + ")</span>" +
        '<span class="status-label ' + render.statusClass(stage.status === "in-progress" ? "in-progress" : "planned") + '">' +
        stageLabel(stage.status) + "</span></li>";
    }).join("");
    var weekLinks = weeks.map(function (week) {
      return '<li><a href="' + utils.createSitePath(root, week.route) + '">Week ' +
        week.teachingWeek + ": " + utils.escapeHtml(week.title) + "</a></li>";
    }).join("");

    mount.innerHTML =
      '<section class="panel" aria-labelledby="criteria-heading">' +
      '<h2 id="criteria-heading">Assessment criteria</h2>' +
      "<p>This workspace helps you organise work. It does not award Pass, Merit or Distinction.</p>" +
      "<ul>" + criteria + "</ul>" +
      "<p>" + utils.escapeHtml(assignment.evidenceNote) + "</p>" +
      "</section>" +
      '<section class="panel" aria-labelledby="journey-heading">' +
      '<h2 id="journey-heading">Learning journey</h2>' +
      '<ol class="journey-list">' + stages + "</ol>" +
      "</section>" +
      '<section class="panel" aria-labelledby="weeks-heading">' +
      '<h2 id="weeks-heading">Teaching weeks</h2>' +
      "<ul>" + weekLinks + "</ul>" +
      "</section>";
  });
})();
