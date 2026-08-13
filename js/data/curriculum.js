(function (root) {
  "use strict";

  var api;

  if (typeof require !== "undefined" && typeof __dirname !== "undefined") {
    var path = require("path");
    var engine = require("../../content/engine/index.js");
    var pkg = engine.loadPackageFromDirectory(path.join(__dirname, "../../content/unit-14"));
    api = engine.adaptCurriculum(pkg);
  } else {
    api = root.Unit14Curriculum || {
      learningOutcomes: [],
      weeks: [],
      getWeek: function () { return null; },
      getWeeksByAssignment: function () { return []; }
    };
  }

  root.Unit14Curriculum = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
