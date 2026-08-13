(function () {
  "use strict";

  var utils = window.AppUtils;
  var engine = window.LearningPlatformContent;

  function mountWeek(pkg, body) {
    var weekId = body.dataset.lpWeek || ("week-" + body.dataset.week);
    var mount = document.querySelector("[data-lp-mount]") || document.getElementById("main-content");
    var resolved;
    if (!mount || !weekId) return;
    resolved = engine.resolveWeek(pkg, weekId);
    if (!resolved) return;
    mount.innerHTML = engine.renderWeek(resolved, { root: body.dataset.root || "." });
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
