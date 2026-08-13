(function (root) {
  "use strict";

  var api;

  if (typeof require !== "undefined" && typeof __dirname !== "undefined") {
    var path = require("path");
    var engine = require("../../content/engine/index.js");
    var pkg = engine.loadPackageFromDirectory(path.join(__dirname, "../../content/unit-14"));
    api = engine.adaptAssignments(pkg);
  } else {
    api = root.Unit14Assignments || {
      assignments: [],
      evidenceMap: [],
      getAssignment: function () { return null; }
    };
  }

  root.Unit14Assignments = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
