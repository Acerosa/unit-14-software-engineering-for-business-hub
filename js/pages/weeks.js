(function () {
  "use strict";

  var utils = window.AppUtils;
  var render = window.Unit14Render;

  utils.onContentReady(function () {
    var root = document.body.dataset.root || ".";
    render.renderWeekCards(
      document.querySelector("[data-week-grid]"),
      window.Unit14Curriculum.weeks,
      root
    );
  });
})();
