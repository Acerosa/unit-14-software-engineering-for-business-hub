(function () {
  "use strict";

  var utils = window.AppUtils;
  var journey = window.Unit14ProjectJourney;

  utils.onReady(function () {
    var mount = document.querySelector("[data-project-journey]");
    if (!mount || !journey) return;
    var items = journey.stages.map(function (stage, index) {
      var arrow = index === journey.stages.length - 1 ? "" : '<span class="visually-hidden"> then </span>';
      return "<li><span>" + utils.escapeHtml(stage.title) + "</span>" +
        "<span>" + utils.escapeHtml(stage.assignment) + "</span>" + arrow + "</li>";
    }).join("");
    mount.innerHTML =
      "<p>" + utils.escapeHtml(journey.summary) + "</p>" +
      '<ol class="journey-list">' + items + "</ol>" +
      "<p>Use GitHub for issues, branches, pull requests and releases. This page is guidance, not a replacement project board.</p>";
  });
})();
