(function () {
  "use strict";

  var utils = window.AppUtils;
  var render = window.Unit14Render;
  var engine = window.LearningPlatformContent;

  function week1Label() {
    var practised = false;
    var week;
    if (engine && engine.summariseDraft && engine.resolveWeek && window.__lpPackage) {
      week = engine.resolveWeek(window.__lpPackage, "week-1");
      (week && week.sessions || []).forEach(function (session) {
        (session.activities || []).forEach(function (resolved) {
          var summary = engine.summariseDraft(resolved.document);
          if (summary.status === "practised" || summary.status === "started") practised = true;
        });
      });
    }
    return practised ? "Started / practised" : "Not started";
  }

  utils.onContentReady(function () {
    var assignments = window.Unit14Assignments;
    var curriculum = window.Unit14Curriculum;
    var assignmentId = document.body.dataset.assignment;
    var assignment = assignments && assignments.getAssignment(assignmentId);
    var mount = document.querySelector("[data-assignment-workspace]");
    if (!assignment || !mount) return;

    var root = document.body.dataset.root || ".";
    var weeks = curriculum.getWeeksByAssignment(assignment.id);
    var criteria = assignment.criteria.map(function (item) {
      return "<li><strong>" + utils.escapeHtml(item.id) + "</strong> — " + utils.escapeHtml(item.title) +
        "<br>" + utils.escapeHtml(item.summary) + "</li>";
    }).join("");
    var stages = assignment.stages.map(function (stage) {
      var label = Number(stage.week) === 1 ? week1Label() : "Upcoming";
      var tone = label === "Upcoming" || label === "Not started" ? "planned" : "in-progress";
      return "<li><span>" + utils.escapeHtml(stage.title) + " (Week " + stage.week + ")</span>" +
        '<span class="status-label ' + render.statusClass(tone) + '">' +
        utils.escapeHtml(label) + "</span></li>";
    }).join("");
    var weekLinks = weeks.map(function (week) {
      return '<li><a href="' + utils.createSitePath(root, week.route) + '">Week ' +
        week.teachingWeek + ": " + utils.escapeHtml(week.title) + "</a></li>";
    }).join("");

    mount.innerHTML =
      '<section class="panel" aria-labelledby="criteria-heading">' +
      '<h2 id="criteria-heading">Assessment criteria</h2>' +
      "<p>This workspace helps you organise work. Completing hub practice is not P1 achieved. The hub does not award Pass, Merit or Distinction.</p>" +
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
