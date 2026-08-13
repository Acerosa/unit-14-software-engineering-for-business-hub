(function () {
  "use strict";

  window.AppUtils = Object.freeze({
    onReady: function (callback) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
        return;
      }
      callback();
    },

    createSitePath: function (root, path) {
      var cleanRoot = root || ".";
      return path ? cleanRoot + "/" + path : cleanRoot + "/";
    },

    escapeHtml: function (value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    statusLabel: function (status) {
      if (status === "available") return "Available";
      if (status === "in-progress") return "In progress";
      return "Planned";
    }
  });
})();
