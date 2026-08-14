(function () {
  "use strict";

  var utils = window.AppUtils;
  var engine = window.LearningPlatformContent;
  var core = window.LearningPlatformCore;

  function mountWeek(pkg, body) {
    var weekId = body.dataset.lpWeek || ("week-" + body.dataset.week);
    var mount = document.querySelector("[data-lp-mount]") || document.getElementById("main-content");
    var resolved;
    var presentation;
    if (!mount || !weekId || !core || !window.Unit14WeekPresentation) return;
    resolved = engine.resolveWeek(pkg, weekId);
    if (!resolved) return;
    presentation = window.Unit14WeekPresentation.fromResolvedWeek(resolved, {
      engine: engine,
      utils: utils,
      root: body.dataset.root || ".",
      weeks: window.Unit14Curriculum && window.Unit14Curriculum.weeks,
      features: (window.APP_CONFIG && window.APP_CONFIG.ui) || {}
    });
    mount.replaceChildren(core.createWeekView(presentation));
  }

  function stageStatus(stage, pkg) {
    if (Number(stage.week) !== 1) return "Upcoming";
    var week = engine.resolveWeek(pkg, "week-1");
    var practised = false;
    (week && week.sessions || []).forEach(function (session) {
      (session.activities || []).forEach(function (resolved) {
        var summary = engine.summariseDraft(resolved.document);
        if (summary.status === "practised" || summary.status === "started") practised = true;
      });
    });
    return practised ? "Started / practised" : "Not started";
  }

  function renderAssignmentProgress(pkg, body) {
    var mount = document.querySelector("[data-lp-mount]") || document.getElementById("main-content");
    var week = engine.resolveWeek(pkg, body.dataset.lpWeek || "week-1");
    var assignment;
    var html;
    if (!mount || !week || !week.assignment || (week.document && week.document.metadata.teachingWeek !== 1)) return;
    assignment = week.assignment;
    html =
      '<section class="panel" aria-labelledby="a1-progress-heading">' +
      '<h2 id="a1-progress-heading">' + utils.escapeHtml(assignment.id) + " learning progress</h2>" +
      "<p>This tracks preparation for the technical guide. Completing a hub activity is not P1 achieved. The hub does not award Pass, Merit or Distinction.</p>" +
      '<ol class="journey-list">' +
      (assignment.metadata.stages || []).map(function (stage) {
        var label = stageStatus(stage, pkg);
        var tone = label.indexOf("practised") !== -1 || label.indexOf("Started") !== -1 ? "in-progress" : "planned";
        return "<li><span>" + utils.escapeHtml(stage.title) + "</span>" +
          '<span class="status-label ' + window.Unit14Render.statusClass(tone) + '">' +
          utils.escapeHtml(label) + "</span></li>";
      }).join("") +
      "</ol>" +
      (assignment.metadata.route
        ? '<p><a class="text-link" href="' + utils.createSitePath(body.dataset.root || ".", assignment.metadata.route) +
          '">Open the Assignment 1 workspace</a></p>'
        : "") +
      "</section>";
    mount.insertAdjacentHTML("beforeend", html);
  }

  function applyAdapters(pkg) {
    window.Unit14Curriculum = engine.adaptCurriculum(pkg);
    window.Unit14Assignments = engine.adaptAssignments(pkg);
  }

  function afterLoad(pkg) {
    var body = document.body;
    var validation = engine.validatePackage(pkg);
    var root = body.dataset.root || ".";
    applyAdapters(pkg);
    if (!validation.valid && window.console && console.warn) {
      console.warn(engine.formatIssues(validation.issues));
    }
    if (body.dataset.lpView === "week") {
      mountWeek(pkg, body);
      engine.bindInteractive(document.querySelector("[data-lp-mount]") || document.getElementById("main-content"), pkg, {
        sourcePage: window.location && window.location.pathname
      });
      renderAssignmentProgress(pkg, body);
    }
    if (window.Unit14Render) {
      window.Unit14Render.renderWeekCards(
        document.querySelector("[data-week-grid]"),
        window.Unit14Curriculum.weeks,
        root
      );
      window.Unit14Render.renderAssignmentCards(
        document.querySelector("[data-assignment-grid]"),
        window.Unit14Assignments.assignments,
        root
      );
    }
    window.__lpPackage = pkg;
    document.dispatchEvent(new CustomEvent("lp:content-ready", { detail: { package: pkg } }));
  }

  utils.onReady(function () {
    if (!engine || !engine.loadPackage) return;
    engine.loadPackage(
      engine.packagePathFromPage(document.body, window.APP_CONFIG),
      engine.browserIo()
    ).then(afterLoad).catch(function (error) {
      if (window.console && console.error) console.error(error);
    });
  });
})();
