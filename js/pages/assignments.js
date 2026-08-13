(function () {
  "use strict";

  var utils = window.AppUtils;

  utils.onContentReady(function () {
    window.Unit14Render.renderAssignmentCards(
      document.querySelector("[data-assignment-grid]"),
      window.Unit14Assignments.assignments,
      document.body.dataset.root || "."
    );
  });
})();
