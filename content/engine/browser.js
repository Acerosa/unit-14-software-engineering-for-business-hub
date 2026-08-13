(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};

  ns.browserIo = function () {
    return {
      readText: function (filePath) {
        return fetch(filePath).then(function (response) {
          if (!response.ok) {
            throw new Error("Failed to load " + filePath + " (" + response.status + ")");
          }
          return response.text();
        });
      },
      joinPath: function (base, rel) {
        if (!rel) return base;
        return String(base).replace(/\/?$/, "/") + String(rel).replace(/^\//, "");
      }
    };
  };

  ns.packagePathFromPage = function (body, config) {
    var root = (body && body.dataset && body.dataset.root) || ".";
    var relative = (config && config.curriculumPackage) || "content/unit-14";
    return String(root).replace(/\/?$/, "/") + String(relative).replace(/^\//, "");
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
